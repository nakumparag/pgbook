"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function upgradeToOwner(formData?: FormData) {
  void formData;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "OWNER" || profile?.role === "ADMIN") redirect("/owner/add-pg");

  // Owner access is granted only after the admin approves the submitted ID.
  redirect("/become-owner/verification");
}
