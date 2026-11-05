"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Staff, Attendance } from "@/types/database.types";

export async function getStaffList(propertyId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { staff: [], error: "Unauthorized" };

    let query = supabase
      .from("staff")
      .select(`
        *,
        pgs ( id, name )
      `)
      .order("created_at", { ascending: false });

    if (propertyId && propertyId !== "all") {
      query = query.eq("pg_id", propertyId);
    }

    const { data, error } = await query;
    if (error) return { staff: [], error: error.message };

    return { staff: data || [] };
  } catch (err: any) {
    return { staff: [], error: err.message };
  }
}

export async function createStaffMember(payload: {
  propertyId: string;
  name: string;
  phone: string;
  email?: string;
  role: "WARDEN" | "COOK" | "CLEANER" | "SECURITY" | "MAINTENANCE" | "MANAGER" | "OTHER";
  salary: number;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("staff")
      .insert({
        pg_id: payload.propertyId,
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        email: payload.email?.trim() || null,
        role: payload.role,
        salary: payload.salary,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/staff");
    revalidatePath("/manager/operations");
    return { success: true, staff: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function recordAttendance(payload: {
  propertyId: string;
  staffId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("attendance")
      .upsert(
        {
          pg_id: payload.propertyId,
          staff_id: payload.staffId,
          date: payload.date,
          status: payload.status,
          check_in_time: payload.checkInTime || null,
          check_out_time: payload.checkOutTime || null,
          notes: payload.notes || null,
        },
        { onConflict: "staff_id,date" }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/staff");
    return { success: true, attendance: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAttendanceList(propertyId?: string, date?: string) {
  try {
    const supabase = await createClient();
    const targetDate = date || new Date().toISOString().split("T")[0];

    let query = supabase
      .from("attendance")
      .select(`
        *,
        staff ( id, name, role ),
        pgs ( id, name )
      `)
      .eq("date", targetDate);

    if (propertyId && propertyId !== "all") {
      query = query.eq("pg_id", propertyId);
    }

    const { data, error } = await query;
    if (error) return { attendance: [], error: error.message };
    return { attendance: data || [] };
  } catch (err: any) {
    return { attendance: [], error: err.message };
  }
}

