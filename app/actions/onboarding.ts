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

    const updateData: any = {
      full_name: fullName,
      phone,
      owner_type: ownerType,
      id_type: idType,
      id_number: idNumber,
      verification_status: "PENDING"
    };

    if (idDocumentUrl) {
      updateData.id_document_url = idDocumentUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return { success: false, error: "Failed to save verification details" };
    }

    // Insert an approval request for the owner verification
    const { error: requestError } = await supabase
      .from('approval_requests')
      .insert({
        owner_id: user.id,
        request_type: 'OWNER',
        status: 'PENDING'
      });
      
    if (requestError) {
       console.error("Failed to create approval request:", requestError);
       // We don't fail the whole function here, but we could
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateOwnerVerification:", error);
    return { success: false, error: error.message };
  }
}
