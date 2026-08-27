"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateOwnerVerification(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const ownerType = formData.get("ownerType") as string;
    const idType = formData.get("idType") as string;
    const idNumber = formData.get("idNumber") as string;
    const idDocument = formData.get("idDocument") as File | null;

    let idDocumentUrl = undefined;

    if (idDocument) {
      const fileExt = idDocument.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('owner-documents')
        .upload(filePath, idDocument);

      if (uploadError) {
        console.error("Document upload error:", uploadError);
        return { success: false, error: "Failed to upload document" };
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
      return { success: false, error: "Failed to save verification details" };
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
