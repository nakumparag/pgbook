"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // DEVELOPMENT ONLY BYPASS
  if (
    process.env.NODE_ENV !== "production" &&
    email === process.env.ADMIN_DEV_EMAIL &&
    password === process.env.ADMIN_DEV_PASSWORD
  ) {
    const cookieStore = await cookies();
    cookieStore.set("pgbook_dev_admin_session", "true", {
      path: "/",
      httpOnly: true,
      secure: false,
    });
    revalidatePath("/", "layout");
    redirect("/admin/dashboard");
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: "Invalid login credentials." };
  }

  // 2. Verify ADMIN role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    // Log them out immediately if they are not an admin
    await supabase.auth.signOut();
    return { error: "Access Denied: You do not have administrator privileges." };
  }

  // Success
  revalidatePath("/", "layout");
  redirect("/admin/dashboard");
}
