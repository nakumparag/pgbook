"use server";

import { createClient } from "@/lib/supabase/server";

export async function exportTenantsCSV(propertyId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("tenants")
      .select(`
        full_name, phone, email, monthly_rent, security_deposit, move_in_date, status,
        pgs ( name ),
        rooms ( room_number, room_type ),
        beds ( bed_number )
      `);

    if (propertyId && propertyId !== "all") {
      query = query.eq("pg_id", propertyId);
    }

    const { data: tenants } = await query;
    if (!tenants || tenants.length === 0) return { csv: "" };

    const headers = ["Full Name", "Phone", "Email", "Property", "Room", "Bed", "Monthly Rent", "Deposit", "Move In Date", "Status"];
    const rows = tenants.map((t: any) => [
      `"${t.full_name || ""}"`,
      `"${t.phone || ""}"`,
      `"${t.email || ""}"`,
      `"${t.pgs?.name || ""}"`,
      `"${t.rooms?.room_number || t.rooms?.room_type || ""}"`,
      `"${t.beds?.bed_number || ""}"`,
      t.monthly_rent || 0,
      t.security_deposit || 0,
      `"${t.move_in_date || ""}"`,
      `"${t.status || ""}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return { csv };
  } catch (err: any) {
    return { csv: "", error: err.message };
  }
}

export async function exportPaymentsCSV(propertyId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("payments")
      .select(`
        receipt_number, amount, payment_mode, transaction_ref, payment_date, notes,
        tenants ( full_name, phone ),
        pgs ( name )
      `);

    if (propertyId && propertyId !== "all") {
      query = query.eq("pg_id", propertyId);
    }

    const { data: payments } = await query;
    if (!payments || payments.length === 0) return { csv: "" };

    const headers = ["Receipt No", "Property", "Tenant Name", "Phone", "Amount", "Mode", "Transaction Ref", "Date", "Notes"];
    const rows = payments.map((p: any) => [
      `"${p.receipt_number || ""}"`,
      `"${p.pgs?.name || ""}"`,
      `"${p.tenants?.full_name || ""}"`,
      `"${p.tenants?.phone || ""}"`,
      p.amount || 0,
      `"${p.payment_mode || ""}"`,
      `"${p.transaction_ref || ""}"`,
      `"${p.payment_date || ""}"`,
      `"${p.notes || ""}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return { csv };
  } catch (err: any) {
    return { csv: "", error: err.message };
  }
}

