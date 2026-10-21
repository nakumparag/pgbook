"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function isDevAdmin() {
  if (process.env.NODE_ENV !== "production") {
    const cookieStore = await cookies();
    return cookieStore.get("pgbook_dev_admin_session")?.value === "true";
  }
  return false;
}

export async function updatePgStatus(pgId: string, status: "APPROVED" | "REJECTED" | "DRAFT" | "ARCHIVED") {
  const supabase = await createClient();
  if (!(await isDevAdmin())) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "ADMIN") return { success: false, error: "Unauthorized" };
  }

  const updateData: any = { status };
  if (status === "APPROVED") {
    updateData.is_verified = true;
    updateData.verified_at = new Date().toISOString();
  }

  const { error } = await supabase.from("pgs").update(updateData).eq("id", pgId);

  if (error) {
    console.error("Failed to update PG status:", error);
    return { success: false, error: "Failed to update PG status." };
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function verifyOwnerId(ownerId: string, verify: boolean = true) {
  const supabase = await createClient();
  if (!(await isDevAdmin())) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "ADMIN") return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.from("profiles").update({ id_verified: verify }).eq("id", ownerId);
  if (error) return { success: false, error: "Failed to update owner." };

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function verifyProperty(pgId: string, verify: boolean = true) {
  const supabase = await createClient();
  if (!(await isDevAdmin())) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "ADMIN") return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.from("pgs").update({ is_verified: verify }).eq("id", pgId);
  if (error) return { success: false, error: "Failed to update property." };

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function resolveApprovalRequest(requestId: string, approve: boolean, notes: string = "") {
  const supabase = await createClient();
  if (!(await isDevAdmin())) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (adminProfile?.role !== "ADMIN") return { success: false, error: "Unauthorized" };
  }

  const { data: rawReq, error: requestError } = await supabase.from("approval_requests").select("*").eq("id", requestId).single();
  const req = rawReq as any;
  if (requestError || !req) return { success: false, error: "Request not found" };
  if (req.status !== "PENDING") return { success: false, error: "This request has already been reviewed. Refresh the page." };

  const newStatus = approve ? "APPROVED" : "REJECTED";
  if (approve) {
    if (req.request_type === 'OWNER') {
      const { error: ownerError } = await supabase.from("owner_profiles").update({ status: "APPROVED" }).eq("user_id", req.owner_id);
      if (ownerError) return { success: false, error: "Could not approve the owner. Please retry." };
      const { error: profileError } = await supabase.from("profiles").update({ id_verified: true }).eq("id", req.owner_id);
      if (profileError) return { success: false, error: "Owner approval was saved, but ID verification did not update. Please retry." };
    } else if (req.request_type === 'PG' && req.pg_id) {
      const { error: pgError } = await supabase.from("pgs").update({ status: "APPROVED", is_verified: true, verified_at: new Date().toISOString() }).eq("id", req.pg_id);
      if (pgError) return { success: false, error: "Could not approve this PG. Please retry." };
    } else {
      return { success: false, error: "This request is missing its owner or PG record." };
    }
  } else {
    if (req.request_type === 'OWNER') {
      const { error: ownerError } = await supabase.from("owner_profiles").update({ status: "REJECTED" }).eq("user_id", req.owner_id);
      if (ownerError) return { success: false, error: "Could not reject the owner request. Please retry." };
    } else if (req.request_type === 'PG' && req.pg_id) {
      const { error: pgError } = await supabase.from("pgs").update({ status: "DRAFT" }).eq("id", req.pg_id);
      if (pgError) return { success: false, error: "Could not return this PG to draft. Please retry." };
    } else {
      return { success: false, error: "This request is missing its owner or PG record." };
    }
  }

  const { error: approvalError } = await supabase.from("approval_requests").update({
    status: newStatus,
    admin_notes: notes,
    resolved_at: new Date().toISOString()
  }).eq("id", requestId).eq("status", "PENDING");
  if (approvalError) return { success: false, error: "The listing changed, but the request status could not be saved. Refresh and review it." };

  revalidatePath("/admin/dashboard");
  return { success: true };
}
