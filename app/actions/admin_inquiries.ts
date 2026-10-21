"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, authorized: false };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, authorized: profile?.role === "ADMIN" };
}

export async function adminUpdateInquiryStatus(inquiryId: string, status: "NEW" | "CONTACTED" | "INTERESTED" | "CLOSED" | "CANCELLED") {
  const input = z.object({ inquiryId: z.string().uuid(), status: z.enum(["NEW", "CONTACTED", "INTERESTED", "CLOSED", "CANCELLED"]) }).safeParse({ inquiryId, status });
  if (!input.success) return { success: false, error: "Choose a valid inquiry status." };
  const { supabase, authorized } = await isAdmin();
  if (!authorized) return { success: false, error: "Administrator access required." };
  const { data, error } = await supabase.from("inquiries").update({ status: input.data.status }).eq("id", input.data.inquiryId).select("id").maybeSingle();
  if (error || !data) return { success: false, error: "Inquiry could not be updated." };
  revalidatePath("/admin/inquiries");
  revalidatePath("/owner/inquiries");
  revalidatePath("/dashboard");
  return { success: true };
}
