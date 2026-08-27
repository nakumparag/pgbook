"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function upgradeToOwner(formData?: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Call the secure RPC function to upgrade the role
  let { error } = await supabase.rpc("upgrade_to_owner");

  if (error) {
    // Fallback if RPC fails or is not available
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "OWNER" })
      .eq("id", user.id);
    
    if (updateError) {
      error = updateError;
    } else {
      error = null;
    }
  }

  if (error) {
    console.error("Failed to upgrade to owner:", error);
    return { success: false, error: "Failed to upgrade account." };
  }

  revalidatePath("/", "layout");
  redirect("/owner/add-pg");
}
