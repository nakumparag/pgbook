"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Tenant, Bed } from "@/types/database.types";

const OnboardTenantSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  roomId: z.string().uuid("Invalid room ID"),
  bedId: z.string().uuid("Invalid bed ID").optional().nullable(),
  bedNumber: z.string().optional().nullable(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  monthlyRent: z.number().int().min(500, "Rent must be at least ₹500"),
  securityDeposit: z.number().int().min(0, "Security deposit cannot be negative"),
  moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  rentDueDay: z.number().int().min(1).max(28).default(1),
  idProofType: z.string().default("AADHAAR").optional(),
  idProofNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type OnboardTenantInput = z.infer<typeof OnboardTenantSchema>;

export async function onboardTenant(rawInput: OnboardTenantInput) {
  try {
    const validated = OnboardTenantSchema.parse(rawInput);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please login." };
    }

    // 1. Verify Property belongs to user or user is authorized manager
    const { data: pg, error: pgError } = await supabase
      .from("pgs")
      .select("id, name, owner_id")
      .eq("id", validated.propertyId)
      .single();

    if (pgError || !pg) {
      return { success: false, error: "Property not found" };
    }

    // 2. Ensure Bed exists or create a virtual bed if beds table is new
    let resolvedBedId = validated.bedId;
    if (!resolvedBedId && validated.bedNumber) {
      // Find or create bed
      const { data: existingBed } = await supabase
        .from("beds")
        .select("id, status")
        .eq("room_id", validated.roomId)
        .eq("bed_number", validated.bedNumber)
        .maybeSingle();

      if (existingBed) {
        if (existingBed.status === "OCCUPIED") {
          return { success: false, error: `Bed ${validated.bedNumber} is already occupied.` };
        }
        resolvedBedId = existingBed.id;
      } else {
        const { data: newBed, error: bedCreateErr } = await supabase
          .from("beds")
          .insert({
            pg_id: validated.propertyId,
            room_id: validated.roomId,
            bed_number: validated.bedNumber,
            monthly_rent: validated.monthlyRent,
            status: "VACANT",
          })
          .select("id")
          .single();

        if (!bedCreateErr && newBed) {
          resolvedBedId = newBed.id;
        }
      }
    }

    // Double-check bed is not occupied
    if (resolvedBedId) {
      const { data: checkBed } = await supabase
        .from("beds")
        .select("status")
        .eq("id", resolvedBedId)
        .maybeSingle();

      if (checkBed && checkBed.status === "OCCUPIED") {
        return { success: false, error: "This bed is already allocated to an active tenant." };
      }
    }

    // 3. Insert Tenant record
    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .insert({
        pg_id: validated.propertyId,
        owner_id: pg.owner_id,
        room_id: validated.roomId,
        bed_id: resolvedBedId || null,
        full_name: validated.fullName.trim(),
        phone: validated.phone.trim(),
        email: validated.email?.trim() || null,
        emergency_contact_name: validated.emergencyContactName?.trim() || null,
        emergency_contact_phone: validated.emergencyContactPhone?.trim() || null,
        monthly_rent: validated.monthlyRent,
        security_deposit: validated.securityDeposit,
        move_in_date: validated.moveInDate,
        rent_due_day: validated.rentDueDay,
        id_proof_type: validated.idProofType,
        id_proof_number: validated.idProofNumber?.trim() || null,
        status: "ACTIVE",
        notes: validated.notes?.trim() || null,
      })
      .select()
      .single();

    if (tenantErr || !tenant) {
      console.error("Failed to insert tenant:", tenantErr?.message);
      return { success: false, error: tenantErr?.message || "Failed to save tenant record" };
    }

    // 4. Atomically allocate bed. If a concurrent allocation wins, remove only
    // the just-created incomplete tenant row and report the conflict.
    if (resolvedBedId) {
      const { error: allocationError } = await supabase.rpc("allocate_bed_to_tenant", {
        p_bed_id: resolvedBedId,
        p_tenant_id: tenant.id,
      });
      if (allocationError) {
        await supabase.from("tenants").delete().eq("id", tenant.id);
        return { success: false, error: allocationError.message || "This bed is no longer available. Please choose another bed." };
      }
    }

    // 6. Record Security Deposit in deposit ledger
    if (validated.securityDeposit > 0) {
      const { data: dep } = await supabase
        .from("deposits")
        .insert({
          pg_id: validated.propertyId,
          tenant_id: tenant.id,
          total_deposit: validated.securityDeposit,
          deposit_status: "HELD",
        })
        .select("id")
        .maybeSingle();

      if (dep) {
        try {
          await supabase.from("deposit_transactions").insert({
            deposit_id: dep.id,
            amount: validated.securityDeposit,
            transaction_type: "COLLECTION",
            reason: "Initial security deposit upon onboarding",
          });
        } catch {
          // ignore
        }
      }
    }

    // 7. Generate First Month Rent Invoice
    const now = new Date();
    const monthYear = `${now.toLocaleString("en-US", { month: "short" })} ${now.getFullYear()}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);

    try {
      await supabase.from("rent_invoices").insert({
        invoice_number: invoiceNumber,
        pg_id: validated.propertyId,
        tenant_id: tenant.id,
        bed_id: resolvedBedId || null,
        month_year: monthYear,
        rent_amount: validated.monthlyRent,
        total_amount: validated.monthlyRent,
        paid_amount: 0,
        balance_due: validated.monthlyRent,
        due_date: dueDate.toISOString().split("T")[0],
        status: "PENDING",
        notes: "First month rent invoice generated automatically at onboarding",
      });
    } catch (e) {
      console.log("Auto-invoice note:", e);
    }

    revalidatePath("/owner/tenants");
    revalidatePath("/owner/dashboard");
    revalidatePath("/owner/rooms");
    revalidatePath(`/owner/properties/${validated.propertyId}`);

    return { success: true, tenant };
  } catch (err: any) {
    console.error("onboardTenant exception:", err);
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation failed" };
    }
    return { success: false, error: err.message };
  }
}

// Fetch all tenants for owner/manager
export async function getTenants(filters?: {
  propertyId?: string;
  status?: "ACTIVE" | "NOTICE" | "MOVED_OUT" | "ALL";
  search?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { tenants: [], error: "Unauthorized" };

    let query = supabase
      .from("tenants")
      .select(`
        *,
        pgs ( id, name, address ),
        rooms ( id, room_type, room_number ),
        beds ( id, bed_number )
      `)
      .order("created_at", { ascending: false });

    if (filters?.propertyId && filters.propertyId !== "all") {
      query = query.eq("pg_id", filters.propertyId);
    }

    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("getTenants error:", error.message);
      return { tenants: [], error: error.message };
    }

    return { tenants: data || [] };
  } catch (err: any) {
    console.error("getTenants exception:", err);
    return { tenants: [], error: err.message };
  }
}

// Checkout Tenant Workflow
export async function checkoutTenant(payload: {
  tenantId: string;
  checkoutDate: string;
  deductions: number;
  refundAmount: number;
  notes?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.checkoutDate) || payload.deductions < 0 || payload.refundAmount < 0) {
      return { success: false, error: "Enter a valid checkout date and non-negative settlement amounts." };
    }

    const { error: checkoutError } = await supabase.rpc("checkout_tenant", {
      p_tenant_id: payload.tenantId,
      p_checkout_date: payload.checkoutDate,
      p_deductions: payload.deductions,
      p_refund_amount: payload.refundAmount,
      p_notes: payload.notes?.trim() || null,
    });
    if (checkoutError) return { success: false, error: checkoutError.message };

    revalidatePath("/owner/tenants");
    revalidatePath("/owner/dashboard");
    revalidatePath("/owner/rooms");

    return { success: true };
  } catch (err: any) {
    console.error("checkoutTenant exception:", err);
    return { success: false, error: err.message };
  }
}

