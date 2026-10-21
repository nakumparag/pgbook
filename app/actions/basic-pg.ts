"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface SubmitBasicPgResult {
  success: boolean;
  message?: string;
  error?: string;
  pgId?: string;
  slug?: string;
}

export async function submitBasicPg(formData: FormData): Promise<SubmitBasicPgResult> {
  try {
    const supabase = await createClient();

    // 1. Verify User Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required. Please log in to submit your PG."
      };
    }

    const { data: profile } = await supabase.from("profiles").select("role, id_verified").eq("id", user.id).maybeSingle();
    if (!profile || (profile.role !== "ADMIN" && (profile.role !== "OWNER" || !profile.id_verified))) {
      return { success: false, error: "Complete owner verification before submitting a PG." };
    }

    // 2. Extract and Validate Form Data
    const name = (formData.get("name") as string || "").trim();
    const cityIdInput = (formData.get("cityId") as string || "").trim();
    const localityIdInput = (formData.get("localityId") as string || "").trim();
    const cityNameInput = (formData.get("cityName") as string || formData.get("city") as string || "").trim();
    const localityNameInput = (formData.get("localityName") as string || formData.get("area") as string || "").trim();
    const address = (formData.get("address") as string || "").trim();
    const rentRaw = formData.get("rent") as string || "";
    const rent = parseInt(rentRaw, 10);
    const roomType = (formData.get("roomType") as string || "Single").trim();
    const foodAvailableRaw = formData.get("foodAvailable") as string || "No";
    const foodAvailable = foodAvailableRaw === "Yes";
    const description = (formData.get("description") as string || "").trim();
    const contactPhone = (formData.get("contactPhone") as string || "").trim();
    
    // Parse amenities from JSON string or form entries
    let amenities: string[] = [];
    const amenitiesRaw = formData.get("amenities") as string;
    if (amenitiesRaw) {
      try {
        amenities = JSON.parse(amenitiesRaw);
      } catch {
        amenities = [amenitiesRaw];
      }
    }

    // Validation checks
    if (!name || name.length < 3) {
      return { success: false, error: "PG Name must be at least 3 characters long." };
    }
    if (!address || address.length < 5) {
      return { success: false, error: "Full Address is required." };
    }
    if (isNaN(rent) || rent <= 0) {
      return { success: false, error: "Please enter a valid monthly rent amount." };
    }
    if (!contactPhone || !/^[6-9]\d{9}$/.test(contactPhone.replace(/\D/g, ""))) {
      return { success: false, error: "Please enter a valid 10-digit Indian contact phone number." };
    }

    // 3. Ensure User Profile & Owner Profile
    try {
      await supabase
        .from("profiles")
        .update({ phone: contactPhone })
        .eq("id", user.id)
        .is("phone", null);
    } catch {
      // Ignored if column doesn't match
    }

    try {
      const { data: existingOwnerProfile } = await supabase
        .from("owner_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingOwnerProfile) {
        await supabase
          .from("owner_profiles")
          .insert({
            user_id: user.id,
            status: "PENDING",
            owner_type: "PG Owner",
          });
      }
    } catch (ownerErr) {
      console.warn("Owner profile setup note:", ownerErr);
    }

    // 4. Resolve City and Locality (Use actual database UUIDs directly)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let cityId: string | null = UUID_REGEX.test(cityIdInput) ? cityIdInput : null;
    let localityId: string | null = UUID_REGEX.test(localityIdInput) ? localityIdInput : null;

    // Fallback: If not passed as valid UUID, lookup by name or pick active default
    if (!cityId) {
      if (cityNameInput) {
        const { data: matchedCity } = await supabase
          .from("cities")
          .select("id")
          .ilike("name", `%${cityNameInput}%`)
          .limit(1)
          .maybeSingle();
        cityId = matchedCity?.id || null;
      }
      if (!cityId) {
        const { data: defaultCity } = await supabase
          .from("cities")
          .select("id")
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();
        cityId = defaultCity?.id || null;
      }
    }

    if (!localityId && cityId) {
      if (localityNameInput) {
        const { data: matchedLoc } = await supabase
          .from("localities")
          .select("id")
          .eq("city_id", cityId)
          .ilike("name", `%${localityNameInput}%`)
          .limit(1)
          .maybeSingle();
        localityId = matchedLoc?.id || null;
      }
      if (!localityId) {
        const { data: defaultLoc } = await supabase
          .from("localities")
          .select("id")
          .eq("city_id", cityId)
          .limit(1)
          .maybeSingle();
        localityId = defaultLoc?.id || null;
      }
    }

    if (!localityId) {
      const { data: anyLoc } = await supabase
        .from("localities")
        .select("id, city_id")
        .limit(1)
        .maybeSingle();
      if (anyLoc) {
        localityId = anyLoc.id;
        if (!cityId) cityId = anyLoc.city_id;
      }
    }

    // Verify valid database UUIDs exist
    if (!cityId || !localityId) {
      console.error("Location resolution failed:", { cityId, localityId, cityNameInput, localityNameInput });
      return {
        success: false,
        error: "Unable to find a valid city or locality in the system. Please select a supported city or contact support."
      };
    }

    // 5. Generate unique slug
    const baseSlug = slugify(name);
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    // Create the listing as a draft; the checked database transition below
    // moves it to PENDING after all of the submitted data has been saved.
    const { data: pg, error: pgError } = await supabase
      .from("pgs")
      .insert({
        owner_id: user.id, // Real authenticated Supabase user UUID
        city_id: cityId,   // Real UUID from cities
        locality_id: localityId, // Real UUID from localities
        name,
        slug,
        address: `${localityNameInput ? localityNameInput + ", " : ""}${address}`,
        gender: "CO_LIVING", // Valid enum value
        food_status: foodAvailable ? "AVAILABLE" : "NOT_AVAILABLE",
        status: "DRAFT",
        monthly_rent_from: rent,
        monthly_rent_to: rent,
        description: description || null
      })
      .select("id, slug")
      .single();

    if (pgError || !pg) {
      console.error("Failed to insert PG:", pgError);
      return {
        success: false,
        error: "Unable to submit your PG. Please try again."
      };
    }

    // 7. Insert Room Configuration
    const roomTypeEnumMap: Record<string, "PERSONAL" | "2_SHARING" | "3_SHARING" | "4_SHARING"> = {
      "Single": "PERSONAL",
      "2 Sharing": "2_SHARING",
      "3 Sharing": "3_SHARING",
      "4 Sharing": "4_SHARING",
      "Other": "PERSONAL"
    };

    const mappedRoomType = roomTypeEnumMap[roomType] || "PERSONAL";
    const bedsCount = roomType === "Single" ? 1 : roomType === "2 Sharing" ? 2 : roomType === "3 Sharing" ? 3 : 4;

    try {
      await supabase.from("rooms").insert({
        pg_id: pg.id,
        room_type: mappedRoomType,
        rent,
        security_deposit: null,
        total_beds: bedsCount,
        occupied_beds: 0,
        food_available: foodAvailable,
        availability_status: "AVAILABLE"
      });
    } catch (roomErr) {
      console.error("Non-fatal: failed to create room record:", roomErr);
    }

    // 8. Link Selected Amenities
    if (amenities.length > 0) {
      try {
        const { data: existingAmenities } = await supabase
          .from("amenities")
          .select("id, name");

        if (existingAmenities && existingAmenities.length > 0) {
          const linksToInsert = [];
          for (const aName of amenities) {
            const found = existingAmenities.find(
              (ea) => ea.name.toLowerCase() === aName.toLowerCase()
            );
            if (found) {
              linksToInsert.push({ pg_id: pg.id, amenity_id: found.id });
            }
          }
          if (linksToInsert.length > 0) {
            await supabase.from("pg_amenities").insert(linksToInsert);
          }
        }
      } catch (amenityErr) {
        console.error("Non-fatal: failed to link amenities:", amenityErr);
      }
    }

    // 9. Handle Uploaded Photos
    const photoFiles = formData.getAll("photos") as File[];
    let hasUploadedImage = false;

    if (photoFiles && photoFiles.length > 0) {
      for (let i = 0; i < Math.min(photoFiles.length, 5); i++) {
        const file = photoFiles[i];
        if (!file || file.size === 0) continue;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
          return { success: false, error: "Photos must be JPG, PNG, or WEBP files under 5 MB." };
        }

        try {
          const fileExt = file.name.split(".").pop() || "jpg";
          const fileName = `${pg.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("pg-images")
            .upload(fileName, file, {
              cacheControl: "3600",
              contentType: file.type,
              upsert: true
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from("pg-images")
              .getPublicUrl(fileName);

            if (publicUrlData?.publicUrl) {
              await supabase.from("pg_images").insert({
                pg_id: pg.id,
                url: publicUrlData.publicUrl,
                storage_path: fileName,
                is_primary: i === 0,
                display_order: i
              });
              hasUploadedImage = true;
            }
          }
        } catch (uploadErr) {
          console.error("Photo upload error:", uploadErr);
        }
      }
    }

    // If no custom photos were uploaded, add a high-quality default PG image
    if (!hasUploadedImage) {
      try {
        await supabase.from("pg_images").insert({
          pg_id: pg.id,
          url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
          is_primary: true,
          display_order: 0
        });
      } catch {
        // Ignored
      }
    }

    // 10. Submit the completed draft through the server-checked status change.
    const { error: submitError } = await supabase.rpc("owner_set_pg_status", {
      target_pg_id: pg.id,
      target_status: "PENDING" as const,
    });
    if (submitError) {
      console.error("Failed to submit PG for review:", submitError.code);
      return { success: false, error: "Your PG was saved as a draft, but could not be submitted for review. Please contact support." };
    }

    // 11. Register Approval Request for Admin Moderation
    try {
      await supabase.from("approval_requests").insert({
        owner_id: user.id,
        pg_id: pg.id,
        request_type: "PG",
        status: "PENDING",
        admin_notes: `New PG submitted: ${name} (${cityNameInput || "Unknown city"})`
      });
    } catch {
      // Ignored if table not active
    }

    revalidatePath("/explore");
    revalidatePath("/owner/dashboard");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Your PG has been submitted successfully.",
      pgId: pg.id,
      slug: pg.slug
    };
  } catch (err: any) {
    console.error("Unexpected error in submitBasicPg:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while saving your PG. Please try again."
    };
  }
}
