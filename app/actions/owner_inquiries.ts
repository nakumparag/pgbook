"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function updateInquiryStatus(inquiryId: string, status: "CONTACTED" | "INTERESTED" | "CLOSED") {
  const parsed = z.object({ inquiryId: z.string().uuid(), status: z.enum(["CONTACTED", "INTERESTED", "CLOSED"]) }).safeParse({ inquiryId, status });
  if (!parsed.success) return { success: false, error: "Choose a valid inquiry status." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to update inquiries." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) return { success: false, error: "Only the listing owner can update this inquiry." };

  const { data, error } = await supabase.from("inquiries")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.inquiryId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !data) return { success: false, error: "Inquiry not found or the status change is not allowed." };

  revalidatePath("/owner/dashboard");
  revalidatePath("/owner/inquiries");
  revalidatePath("/admin/inquiries");
  revalidatePath("/dashboard");
  return { success: true };
}
