"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePgStatus(pgId: string, status: "APPROVED" | "REJECTED" | "DRAFT" | "ARCHIVED") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Ensure user is an ADMIN
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("profiles").update({ id_verified: verify }).eq("id", ownerId);
  if (error) return { success: false, error: "Failed to update owner." };

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function verifyProperty(pgId: string, verify: boolean = true) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const { error } = await supabase.from("pgs").update({ is_verified: verify }).eq("id", pgId);
  if (error) return { success: false, error: "Failed to update property." };

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function resolveApprovalRequest(requestId: string, approve: boolean, notes: string = "") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (adminProfile?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const { data: rawReq } = await supabase.from("approval_requests").select("*").eq("id", requestId).single();
  const req = rawReq as any;
  if (!req) return { success: false, error: "Request not found" };

  const newStatus = approve ? "APPROVED" : "REJECTED";
  await supabase.from("approval_requests").update({
    status: newStatus,
    admin_notes: notes,
    resolved_at: new Date().toISOString()
  }).eq("id", requestId);

  if (approve) {
    if (req.request_type === 'OWNER') {
      await supabase.from("profiles").update({ verification_status: "APPROVED", id_verified: true }).eq("id", req.owner_id);
    } else if (req.request_type === 'PG' && req.pg_id) {
      await supabase.from("pgs").update({ status: "APPROVED", is_verified: true, verified_at: new Date().toISOString() }).eq("id", req.pg_id);
    }
  } else {
    if (req.request_type === 'OWNER') {
      await supabase.from("profiles").update({ verification_status: "REJECTED" }).eq("id", req.owner_id);
    } else if (req.request_type === 'PG' && req.pg_id) {
      await supabase.from("pgs").update({ status: "DRAFT" }).eq("id", req.pg_id);
    }
  }

  revalidatePath("/admin/dashboard");
  return { success: true };
}
