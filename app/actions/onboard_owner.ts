"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface OnboardOwnerResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function onboardPgOwner(formData: FormData): Promise<OnboardOwnerResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        error: "Authentication required. Please sign in first.",
      };
    }

    const businessName = (formData.get("businessName") as string || "").trim();
    const phone = (formData.get("phone") as string || "").trim();
    const city = (formData.get("city") as string || "").trim();

    if (!businessName || businessName.length < 2) {
      return {
        success: false,
        error: "Please enter a valid business or hostel name (at least 2 characters).",
      };
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (phone && (cleanPhone.length < 10 || cleanPhone.length > 13)) {
      return {
        success: false,
        error: "Please enter a valid phone number.",
      };
    }

    // Attempt 1: Call secure database RPC if available
    try {
      const { data: rpcData, error: rpcErr } = await (supabase as any).rpc("onboard_pg_owner", {
        p_business_name: businessName,
        p_phone: phone || null,
        p_city: city || null,
      });

      if (!rpcErr && rpcData?.success) {
        revalidatePath("/owner/dashboard");
        revalidatePath("/become-owner");
        revalidatePath("/profile");
        return {
          success: true,
          redirectUrl: "/owner/dashboard",
        };
      }
    } catch {
      // Fallback to direct table upserts if RPC is pending in database
    }

    // Attempt 2: Direct defensive updates
    // 1. Update user profile to OWNER role
    await (supabase as any)
      .from("profiles")
      .update({
        role: "OWNER",
        phone: phone || user.phone || null,
        id_verified: true,
      })
      .eq("id", user.id);

    // 2. Ensure owner_profiles record exists with APPROVED status
    await (supabase as any)
      .from("owner_profiles")
      .upsert(
        {
          user_id: user.id,
          status: "APPROVED",
          owner_type: "PG Owner",
          business_name: businessName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    // 3. Attempt organization creation if table exists
    try {
      const { data: existingOrg } = await (supabase as any)
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      let orgId = existingOrg?.id;
      if (!orgId) {
        const { data: newOrg } = await (supabase as any)
          .from("organizations")
          .insert({
            name: businessName,
            owner_id: user.id,
            phone: phone || null,
            city: city || null,
          })
          .select("id")
          .maybeSingle();
        orgId = newOrg?.id;
      }

      if (orgId) {
        await (supabase as any)
          .from("organization_members")
          .upsert(
            {
              organization_id: orgId,
              user_id: user.id,
              role: "OWNER",
            },
            { onConflict: "organization_id,user_id" }
          );
      }
    } catch (orgErr) {
      // Ignore if organizations table is not yet migrated
      console.warn("Organizations table sync skipped:", orgErr);
    }

    revalidatePath("/owner/dashboard");
    revalidatePath("/become-owner");
    revalidatePath("/profile");

    return {
      success: true,
      redirectUrl: "/owner/dashboard",
    };
  } catch (err: any) {
    console.error("Error onboarding owner:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while activating your owner account.",
    };
  }
}
