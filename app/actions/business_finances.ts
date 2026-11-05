"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { RentInvoice, Payment, Expense, UtilityBill, Deposit } from "@/types/database.types";

// ==========================================
// 1. INVOICE ACTIONS
// ==========================================

export async function getInvoices(filters?: {
  propertyId?: string;
  status?: string;
  tenantId?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { invoices: [], error: "Unauthorized" };

    let query = supabase
      .from("rent_invoices")
      .select(`
        *,
        tenants ( id, full_name, phone, room_id ),
        pgs ( id, name )
      `)
      .order("created_at", { ascending: false });

    if (filters?.propertyId && filters.propertyId !== "all") {
      query = query.eq("pg_id", filters.propertyId);
    }
    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status as any);
    }
    if (filters?.tenantId) {
      query = query.eq("tenant_id", filters.tenantId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("getInvoices error:", error.message);
      return { invoices: [], error: error.message };
    }

    return { invoices: data || [] };
  } catch (err: any) {
    console.error("getInvoices exception:", err);
    return { invoices: [], error: err.message };
  }
}

export async function generateInvoice(payload: {
  tenantId: string;
  propertyId: string;
  monthYear: string;
  rentAmount: number;
  utilityAmount?: number;
  discountAmount?: number;
  lateFee?: number;
  dueDate: string;
  notes?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const rent = payload.rentAmount || 0;
    const utility = payload.utilityAmount || 0;
    const discount = payload.discountAmount || 0;
    const late = payload.lateFee || 0;
    const total = Math.max(0, rent + utility + late - discount);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabase
      .from("rent_invoices")
      .insert({
        invoice_number: invoiceNumber,
        pg_id: payload.propertyId,
        tenant_id: payload.tenantId,
        month_year: payload.monthYear,
        rent_amount: rent,
        utility_amount: utility,
        discount_amount: discount,
        late_fee: late,
        total_amount: total,
        paid_amount: 0,
        balance_due: total,
        due_date: payload.dueDate,
        status: "PENDING",
        notes: payload.notes || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/finance");
    revalidatePath("/owner/dashboard");
    return { success: true, invoice: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Bulk generate rent invoices for all active tenants in a property
export async function generateBulkMonthlyInvoices(propertyId: string, monthYear: string, dueDate: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    let tenantQuery = supabase
      .from("tenants")
      .select("id, pg_id, monthly_rent, bed_id")
      .eq("status", "ACTIVE");

    if (propertyId && propertyId !== "all") {
      tenantQuery = tenantQuery.eq("pg_id", propertyId);
    }

    const { data: activeTenants, error: tenantErr } = await tenantQuery;
    if (tenantErr || !activeTenants || activeTenants.length === 0) {
      return { success: false, count: 0, message: "No active tenants found to bill." };
    }

    // Check which tenants already have an invoice for this monthYear
    const { data: existingInvoices } = await supabase
      .from("rent_invoices")
      .select("tenant_id")
      .eq("month_year", monthYear);

    const billedTenantIds = new Set((existingInvoices || []).map((i) => i.tenant_id));
    const toBill = activeTenants.filter((t) => !billedTenantIds.has(t.id));

    if (toBill.length === 0) {
      return { success: true, count: 0, message: `All active tenants are already billed for ${monthYear}.` };
    }

    const records = toBill.map((t, idx) => ({
      invoice_number: `INV-${Date.now().toString().slice(-5)}${idx}`,
      pg_id: t.pg_id,
      tenant_id: t.id,
      bed_id: t.bed_id || null,
      month_year: monthYear,
      rent_amount: t.monthly_rent,
      utility_amount: 0,
      discount_amount: 0,
      late_fee: 0,
      total_amount: t.monthly_rent,
      paid_amount: 0,
      balance_due: t.monthly_rent,
      due_date: dueDate,
      status: "PENDING" as const,
      notes: `Bulk generated for ${monthYear}`,
    }));

    const { error: insertErr } = await supabase.from("rent_invoices").insert(records);
    if (insertErr) return { success: false, error: insertErr.message };

    revalidatePath("/owner/finance");
    revalidatePath("/owner/dashboard");
    return { success: true, count: toBill.length, message: `Successfully generated ${toBill.length} invoices.` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 2. PAYMENT RECORDING
// ==========================================

export async function recordPayment(payload: {
  invoiceId?: string | null;
  tenantId: string;
  propertyId: string;
  amount: number;
  paymentMode: "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE";
  transactionRef?: string;
  paymentDate: string;
  notes?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

    // 1. Insert payment record
    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .insert({
        receipt_number: receiptNumber,
        pg_id: payload.propertyId,
        tenant_id: payload.tenantId,
        invoice_id: payload.invoiceId || null,
        amount: payload.amount,
        payment_mode: payload.paymentMode,
        transaction_ref: payload.transactionRef || null,
        payment_date: payload.paymentDate,
        notes: payload.notes || null,
      })
      .select()
      .single();

    if (payErr || !payment) {
      return { success: false, error: payErr?.message || "Failed to record payment" };
    }

    // 2. If attached to an invoice, update invoice paid amount and status
    if (payload.invoiceId) {
      const { data: inv } = await supabase
        .from("rent_invoices")
        .select("total_amount, paid_amount")
        .eq("id", payload.invoiceId)
        .single();

      if (inv) {
        const newPaid = (inv.paid_amount || 0) + payload.amount;
        const newBalance = Math.max(0, inv.total_amount - newPaid);
        const newStatus = newBalance === 0 ? "PAID" : "PARTIAL";

        await supabase
          .from("rent_invoices")
          .update({
            paid_amount: newPaid,
            balance_due: newBalance,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payload.invoiceId);
      }
    }

    revalidatePath("/owner/finance");
    revalidatePath("/owner/dashboard");
    return { success: true, payment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getPayments(filters?: { propertyId?: string; tenantId?: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { payments: [], error: "Unauthorized" };

    let query = supabase
      .from("payments")
      .select(`
        *,
        tenants ( id, full_name, phone ),
        pgs ( id, name )
      `)
      .order("payment_date", { ascending: false });

    if (filters?.propertyId && filters.propertyId !== "all") {
      query = query.eq("pg_id", filters.propertyId);
    }
    if (filters?.tenantId) {
      query = query.eq("tenant_id", filters.tenantId);
    }

    const { data, error } = await query;
    if (error) return { payments: [], error: error.message };

    return { payments: data || [] };
  } catch (err: any) {
    return { payments: [], error: err.message };
  }
}

// ==========================================
// 3. EXPENSES & UTILITIES
// ==========================================

export async function createExpense(payload: {
  propertyId: string;
  category: string;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  vendorName?: string;
  vendorPhone?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        pg_id: payload.propertyId,
        owner_id: user.id,
        category: payload.category,
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        amount: payload.amount,
        expense_date: payload.expenseDate,
        vendor_name: payload.vendorName?.trim() || null,
        vendor_phone: payload.vendorPhone?.trim() || null,
        receipt_url: payload.receiptUrl || null,
        is_recurring: payload.isRecurring || false,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/finance");
    revalidatePath("/owner/dashboard");
    return { success: true, expense: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getExpenses(filters?: { propertyId?: string; category?: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { expenses: [], error: "Unauthorized" };

    let query = supabase
      .from("expenses")
      .select(`
        *,
        pgs ( id, name )
      `)
      .order("expense_date", { ascending: false });

    if (filters?.propertyId && filters.propertyId !== "all") {
      query = query.eq("pg_id", filters.propertyId);
    }
    if (filters?.category && filters.category !== "ALL") {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query;
    if (error) return { expenses: [], error: error.message };

    return { expenses: data || [] };
  } catch (err: any) {
    return { expenses: [], error: err.message };
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/finance");
    revalidatePath("/owner/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getUtilityBills(propertyId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("utility_bills")
      .select(`
        *,
        pgs ( id, name )
      `)
      .order("due_date", { ascending: false });

    if (propertyId && propertyId !== "all") {
      query = query.eq("pg_id", propertyId);
    }

    const { data, error } = await query;
    if (error) return { utilityBills: [], error: error.message };
    return { utilityBills: data || [] };
  } catch (err: any) {
    return { utilityBills: [], error: err.message };
  }
}

export async function createUtilityBill(payload: {
  propertyId: string;
  utilityType: "ELECTRICITY" | "WATER" | "INTERNET" | "GAS" | "MAINTENANCE" | "OTHER";
  billingPeriod: string;
  amount: number;
  dueDate: string;
  notes?: string;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("utility_bills")
      .insert({
        pg_id: payload.propertyId,
        utility_type: payload.utilityType,
        billing_period: payload.billingPeriod,
        amount: payload.amount,
        paid_amount: 0,
        due_date: payload.dueDate,
        status: "PENDING",
        notes: payload.notes || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/finance");
    return { success: true, bill: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

