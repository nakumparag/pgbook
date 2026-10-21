"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ownerVerificationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  ownerType: z.enum(["PG Owner", "Property Owner", "Broker/Agent"]),
  idType: z.enum(["Aadhaar", "PAN", "Voter ID", "Driving License"]),
  idNumber: z.string().min(4, "ID Number is too short"),
});

export async function updateOwnerVerification(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const rawData = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      ownerType: formData.get("ownerType"),
      idType: formData.get("idType"),
      idNumber: formData.get("idNumber"),
    };

    const validatedData = ownerVerificationSchema.safeParse(rawData);

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0].message;
      return { success: false, error: firstError };
    }

    const { fullName, phone, ownerType, idType, idNumber } = validatedData.data;
    
    // Additional format checks based on ID Type
    if (idType === "Aadhaar" && !/^\d{12}$/.test(idNumber)) {
      return { success: false, error: "Aadhaar number must be exactly 12 digits" };
    }
    if (idType === "PAN" && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idNumber)) {
      return { success: false, error: "Invalid PAN format (e.g. ABCDE1234F)" };
    }

    const idDocument = formData.get("idDocument") as File | null;

    let idDocumentUrl = undefined;

    if (idDocument && idDocument.size > 0) {
      if (idDocument.size > 10 * 1024 * 1024) {
        return { success: false, error: "Document size exceeds 10MB limit" };
      }

      const fileExt = idDocument.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('owner-documents')
        .upload(filePath, idDocument, { upsert: true });

      if (uploadError) {
        console.error("Document upload error:", uploadError);
        return { success: false, error: "Failed to upload document securely" };
      }

      idDocumentUrl = filePath;
    }

    // Update basic user profile
    const profileUpdateData: any = {
      full_name: fullName,
      phone,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return { success: false, error: "Failed to update profile details" };
    }

    // Upsert owner profile
    const ownerProfileData: any = {
      user_id: user.id,
      status: "PENDING",
      owner_type: ownerType,
      id_type: idType,
      id_number: idNumber,
      updated_at: new Date().toISOString()
    };
    
    if (idDocumentUrl) {
      ownerProfileData.id_document_url = idDocumentUrl;
    }

    const { error: ownerError } = await supabase
      .from('owner_profiles')
      .upsert(ownerProfileData, { onConflict: 'user_id' });

    if (ownerError) {
      console.error("Owner profile update error:", ownerError);
      // Let's pass the real error if it's related to cache or constraints so we know
      return { success: false, error: ownerError.message || "Failed to save verification details" };
    }

    // Insert an approval request for the owner verification
    // Check if one already exists
    const { data: existingRequest } = await supabase
      .from('approval_requests')
      .select('id')
      .eq('owner_id', user.id)
      .eq('request_type', 'OWNER')
      .eq('status', 'PENDING')
      .single();

    if (!existingRequest) {
      const { error: requestError } = await supabase
        .from('approval_requests')
        .insert({
          owner_id: user.id,
          request_type: 'OWNER',
          status: 'PENDING'
        });
        
      if (requestError) {
         console.error("Failed to create approval request:", requestError);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateOwnerVerification:", error);
    return { success: false, error: error.message };
  }
}
