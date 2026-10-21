"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const inquirySchema = z.object({
  pgId: z.string().uuid("Choose a valid PG."),
  message: z.string().trim().min(10, "Add a short message of at least 10 characters.").max(1000, "Message must be 1,000 characters or fewer."),
});

export async function submitInquiry(pgId: string, message: string) {
  const parsed = inquirySchema.safeParse({ pgId, message });
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message || "Check your inquiry." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Sign in before sending an inquiry.", loginRequired: true };

  const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle();
  if (!profile?.phone || profile.phone.replace(/\D/g, "").length < 10) {
    return { success: false as const, error: "Add a valid phone number to your profile before sending an inquiry.", profileRequired: true };
  }

  const { error } = await supabase.from("inquiries").insert({
    user_id: user.id,
    pg_id: parsed.data.pgId,
    message: parsed.data.message,
  });

  if (error?.code === "23505") {
    return { success: false as const, error: "You already have an open inquiry for this PG. You can find it in your dashboard." };
  }
  if (error) {
    console.error("Inquiry submission failed:", error.code);
    return { success: false as const, error: "We couldn't send your inquiry. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/owner/inquiries");
  revalidatePath("/admin/inquiries");
  return { success: true as const };
}
