"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatus(inquiryId: string, status: "NEW" | "CONTACTED" | "CLOSED") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Only update if the owner_id matches the current user
  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Update inquiry error:", error);
    return { success: false, error: "Failed to update inquiry status." };
  }

  revalidatePath("/owner/dashboard");
  revalidatePath("/owner/inquiries");
  
  return { success: true };
}
