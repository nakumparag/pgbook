"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Visitor, MaintenanceRequest, Notice } from "@/types/database.types";

// ==========================================
// 1. VISITOR MANAGEMENT
// ==========================================

export async function getVisitors(propertyId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("visitors")
      .select(`
        *,
        tenants ( id, full_name, room_id ),
        pgs ( id, name )
      `)
      .order("check_in_time", { ascending: false });

    if (propertyId && propertyId !== "all") {
      query = query.eq("pg_id", propertyId);
    }

    const { data, error } = await query;
    if (error) return { visitors: [], error: error.message };
    return { visitors: data || [] };
  } catch (err: any) {
    return { visitors: [], error: err.message };
  }
}

export async function recordVisitorEntry(payload: {
  propertyId: string;
  tenantId?: string;
  visitorName: string;
  visitorPhone: string;
  purpose?: string;
  idType?: string;
  idNumber?: string;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visitors")
      .insert({
        pg_id: payload.propertyId,
        tenant_id: payload.tenantId || null,
        visitor_name: payload.visitorName.trim(),
        visitor_phone: payload.visitorPhone.trim(),
        purpose: payload.purpose?.trim() || null,
        id_type: payload.idType || null,
        id_number: payload.idNumber?.trim() || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/operations");
    revalidatePath("/manager/operations");
    return { success: true, visitor: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function recordVisitorExit(visitorId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("visitors")
      .update({
        check_out_time: new Date().toISOString(),
      })
      .eq("id", visitorId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/operations");
    revalidatePath("/manager/operations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 2. MAINTENANCE REQUESTS & COMPLAINTS
// ==========================================

export async function getMaintenanceRequests(filters?: {
  propertyId?: string;
  status?: string;
  tenantId?: string;
}) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("maintenance_requests")
      .select(`
        *,
        tenants ( id, full_name, phone ),
        rooms ( id, room_number, room_type ),
        staff ( id, name, role ),
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
    if (error) return { requests: [], error: error.message };
    return { requests: data || [] };
  } catch (err: any) {
    return { requests: [], error: err.message };
  }
}

export async function createMaintenanceRequest(payload: {
  propertyId: string;
  roomId?: string;
  tenantId?: string;
  title: string;
  description: string;
  category: "PLUMBING" | "ELECTRICAL" | "FURNITURE" | "CLEANING" | "AC" | "WIFI" | "SECURITY" | "GENERAL" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert({
        pg_id: payload.propertyId,
        room_id: payload.roomId || null,
        tenant_id: payload.tenantId || null,
        title: payload.title.trim(),
        description: payload.description.trim(),
        category: payload.category,
        priority: payload.priority,
        status: "OPEN",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/operations");
    revalidatePath("/tenant/maintenance");
    revalidatePath("/manager/operations");
    return { success: true, request: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateMaintenanceStatus(payload: {
  requestId: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
  assignedStaffId?: string | null;
  resolutionNotes?: string;
}) {
  try {
    const supabase = await createClient();
    const updatePayload: any = {
      status: payload.status,
      assigned_staff_id: payload.assignedStaffId || null,
      resolution_notes: payload.resolutionNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (payload.status === "RESOLVED") {
      updatePayload.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("maintenance_requests")
      .update(updatePayload)
      .eq("id", payload.requestId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/operations");
    revalidatePath("/tenant/maintenance");
    revalidatePath("/manager/operations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 3. NOTICES & ANNOUNCEMENTS
// ==========================================

export async function getNotices(propertyId?: string, targetRole?: "ALL" | "TENANTS" | "STAFF") {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("notices")
      .select(`
        *,
        pgs ( id, name )
      `)
      .eq("is_active", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (propertyId && propertyId !== "all") {
      query = query.or(`pg_id.eq.${propertyId},pg_id.is.null`);
    }

    if (targetRole && targetRole !== "ALL") {
      query = query.or(`target_role.eq.${targetRole},target_role.eq.ALL`);
    }

    const { data, error } = await query;
    if (error) return { notices: [], error: error.message };
    return { notices: data || [] };
  } catch (err: any) {
    return { notices: [], error: err.message };
  }
}

export async function createNotice(payload: {
  propertyId?: string | null;
  title: string;
  content: string;
  targetRole: "ALL" | "TENANTS" | "STAFF";
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  isPinned?: boolean;
  expiresAt?: string;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notices")
      .insert({
        pg_id: payload.propertyId || null,
        title: payload.title.trim(),
        content: payload.content.trim(),
        target_role: payload.targetRole,
        priority: payload.priority,
        is_pinned: payload.isPinned || false,
        expires_at: payload.expiresAt || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/operations");
    revalidatePath("/tenant/notices");
    return { success: true, notice: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteNotice(noticeId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notices")
      .update({ is_active: false })
      .eq("id", noticeId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/owner/operations");
    revalidatePath("/tenant/notices");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

