"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const inquirySchema = z.object({
  pg_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  preferred_time: z.string().min(1, "Preferred time is required"),
  message: z.string().optional(),
});

export async function submitCallbackInquiry(formData: FormData) {
  const supabase = await createClient();

  try {
    const rawData = {
      pg_id: formData.get("pg_id") as string,
      owner_id: formData.get("owner_id") as string,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      preferred_time: formData.get("preferred_time") as string,
      message: formData.get("message") as string,
    };

    const validatedData = inquirySchema.parse(rawData);

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("inquiries")
      .insert({
        pg_id: validatedData.pg_id,
        user_id: user?.id || null, // Allow null for guests
        owner_id: validatedData.owner_id,
        name: validatedData.name,
        phone: validatedData.phone,
        contact_type: "CALLBACK",
        preferred_time: validatedData.preferred_time,
        message: validatedData.message,
      });

    if (error) {
      console.error("Inquiry insert error:", error);
      return { success: false, error: "Failed to submit request. Please try again." };
    }

    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation failed" };
    }
    console.error("Inquiry submission error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function logContactClick(pgId: string, ownerId: string, type: "WHATSAPP" | "CALL") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Create a minimal inquiry record to log the contact click
  await supabase
    .from("inquiries")
    .insert({
      pg_id: pgId,
      user_id: user?.id || null,
      owner_id: ownerId,
      name: user?.user_metadata?.full_name || "Guest User",
      phone: "Not provided (Direct Link)",
      contact_type: type,
      status: "CONTACTED", // Automatically mark as contacted since they clicked the link
    });
}
