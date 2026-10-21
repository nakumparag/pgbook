"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, authorized: false };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, authorized: profile?.role === "ADMIN" };
}

export async function moderateReview(reviewId: string, status: "PUBLISHED" | "HIDDEN", note: string) {
  const parsed = z.object({ reviewId: z.string().uuid(), status: z.enum(["PUBLISHED", "HIDDEN"]), note: z.string().trim().max(1000) }).safeParse({ reviewId, status, note });
  if (!parsed.success) return { success: false, error: "Check the moderation details." };
  const { supabase, authorized } = await getAdminClient();
  if (!authorized) return { success: false, error: "Administrator access required." };
  const { error } = await supabase.rpc("admin_set_review_status", {
    target_review_id: parsed.data.reviewId,
    target_status: parsed.data.status,
    note: parsed.data.note || null,
  });
  if (error) return { success: false, error: "Review moderation failed." };
  revalidatePath("/admin/reviews");
  revalidatePath("/explore");
  return { success: true };
}

export async function resolveReviewReport(reportId: string, status: "REVIEWED" | "DISMISSED") {
  const parsed = z.object({ reportId: z.string().uuid(), status: z.enum(["REVIEWED", "DISMISSED"]) }).safeParse({ reportId, status });
  if (!parsed.success) return { success: false, error: "Choose a valid report status." };
  const { supabase, authorized } = await getAdminClient();
  if (!authorized) return { success: false, error: "Administrator access required." };
  const { data, error } = await supabase.from("review_reports")
    .update({ status: parsed.data.status, resolved_at: new Date().toISOString() })
    .eq("id", parsed.data.reportId)
    .select("id")
    .maybeSingle();
  if (error || !data) return { success: false, error: "Report could not be updated." };
  revalidatePath("/admin/reviews");
  return { success: true };
}
