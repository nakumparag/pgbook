"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Helper: verify owner ──────────────────────────────────────
async function verifyOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, user: null, error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "OWNER" && profile.role !== "ADMIN")) {
    return { supabase: null, user: null, error: "Unauthorized" };
  }
  return { supabase, user, error: null };
}

// ── Helper: verify PG ownership ──────────────────────────────
async function verifyPgOwnership(supabase: any, userId: string, pgId: string) {
  const { data: pg } = await supabase
    .from("pgs")
    .select("id, owner_id, status")
    .eq("id", pgId)
    .single();
  if (!pg || pg.owner_id !== userId) return null;
  return pg;
}

// ── 1. Create a DRAFT PG ─────────────────────────────────────
export async function createDraftPg() {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error", pgId: null };

  const slug = "draft-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8);

  // We need valid city_id and locality_id for the NOT NULL constraint.
  // Fetch the first available city and locality as temporary placeholders.
  const { data: city } = await supabase.from("cities").select("id").eq("is_active", true).limit(1).single();
  const { data: locality } = await supabase.from("localities").select("id").limit(1).single();

  if (!city || !locality) {
    return { success: false, error: "No cities/localities configured. Contact admin.", pgId: null };
  }

  const { data: pg, error: insertError } = await supabase.from("pgs").insert({
    owner_id: user.id,
    name: "Untitled PG",
    slug,
    description: "",
    address: "",
    city_id: city.id,
    locality_id: locality.id,
    gender: "BOYS",
    food_status: "NOT_AVAILABLE",
    status: "DRAFT",
  }).select("id").single();

  if (insertError || !pg) {
    console.error("Failed to create draft:", insertError);
    return { success: false, error: "Failed to create draft.", pgId: null };
  }

  return { success: true, error: null, pgId: pg.id };
}

// ── 2. Save Rooms ────────────────────────────────────────────
export async function saveRooms(pgId: string, rooms: Array<{
  room_type: string;
  rent: number;
  security_deposit: number;
  total_beds: number;
  electricity_charges: number;
  maintenance_charges: number;
  other_charges: number;
}>) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  // Delete existing rooms for this PG, then insert new ones
  await supabase.from("rooms").delete().eq("pg_id", pgId);

  if (rooms.length > 0) {
    const { error: roomError } = await supabase.from("rooms").insert(
      rooms.map(r => ({
        pg_id: pgId,
        room_type: r.room_type as any,
        rent: r.rent,
        security_deposit: r.security_deposit,
        total_beds: r.total_beds,
        electricity_charges: r.electricity_charges,
        maintenance_charges: r.maintenance_charges,
        other_charges: r.other_charges,
      }))
    );
    if (roomError) {
      console.error("Failed to save rooms:", roomError);
      return { success: false, error: "Failed to save room details." };
    }
  }

  revalidatePath("/owner/add-pg");
  return { success: true, error: null };
}

// ── 3. Save Location ─────────────────────────────────────────
export async function saveLocation(pgId: string, data: {
  city_id: string;
  locality_id: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  const { error: updateError } = await supabase.from("pgs").update({
    city_id: data.city_id,
    locality_id: data.locality_id,
    address: data.address,
    lat: data.lat || null,
    lng: data.lng || null,
  }).eq("id", pgId);

  if (updateError) {
    console.error("Failed to save location:", updateError);
    return { success: false, error: "Failed to save location." };
  }

  revalidatePath("/owner/add-pg");
  return { success: true, error: null };
}

// ── 4. Save PG Details ───────────────────────────────────────
export async function savePgDetails(pgId: string, data: {
  name: string;
  description: string;
  gender: string;
  food_status: string;
  available_from?: string | null;
  rules?: string[];
}) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  // Generate proper slug from name
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") 
    + "-" + Math.random().toString(36).substring(2, 8);

  const { error: updateError } = await supabase.from("pgs").update({
    name: data.name,
    slug,
    description: data.description,
    gender: data.gender as any,
    food_status: data.food_status as any,
    available_from: data.available_from || null,
    rules: data.rules || [],
  }).eq("id", pgId);

  if (updateError) {
    console.error("Failed to save PG details:", updateError);
    return { success: false, error: "Failed to save PG details." };
  }

  revalidatePath("/owner/add-pg");
  return { success: true, error: null };
}

// ── 5. Save Amenities ────────────────────────────────────────
export async function saveAmenities(pgId: string, amenityIds: string[]) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  // Delete existing amenity links
  await supabase.from("pg_amenities").delete().eq("pg_id", pgId);

  if (amenityIds.length > 0) {
    const { error: amenityError } = await supabase.from("pg_amenities").insert(
      amenityIds.map(aid => ({ pg_id: pgId, amenity_id: aid }))
    );
    if (amenityError) {
      console.error("Failed to save amenities:", amenityError);
      return { success: false, error: "Failed to save amenities." };
    }
  }

  revalidatePath("/owner/add-pg");
  return { success: true, error: null };
}

// ── 6. Upload PG Image ───────────────────────────────────────
export async function uploadPgImage(pgId: string, formData: FormData) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error", imageId: null, url: null };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized", imageId: null, url: null };

  const file = formData.get("file") as File;
  const category = formData.get("category") as string || "Property";
  if (!file) return { success: false, error: "No file provided", imageId: null, url: null };

  // Validate file type
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { success: false, error: "Invalid file type. Use JPG, PNG, or WEBP.", imageId: null, url: null };
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File too large. Maximum 5MB.", imageId: null, url: null };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${pgId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("pg-images")
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("Failed to upload image:", uploadError);
    return { success: false, error: "Failed to upload image.", imageId: null, url: null };
  }

  const { data: publicUrl } = supabase.storage.from("pg-images").getPublicUrl(fileName);

  // Check if this is the first image
  const { count } = await supabase.from("pg_images").select("*", { count: "exact", head: true }).eq("pg_id", pgId);
  const isPrimary = (count || 0) === 0;

  const { data: image, error: insertError } = await supabase.from("pg_images").insert({
    pg_id: pgId,
    url: publicUrl.publicUrl,
    is_primary: isPrimary,
    display_order: (count || 0),
    category: category,
  }).select("id, url, is_primary, display_order, category").single();

  if (insertError) {
    console.error("Failed to save image record:", insertError);
    return { success: false, error: "Image uploaded but failed to save reference.", imageId: null, url: null };
  }

  revalidatePath("/owner/add-pg");
  return { success: true, error: null, imageId: image.id, url: image.url };
}

// ── 7. Delete PG Image ───────────────────────────────────────
export async function deletePgImage(pgId: string, imageId: string) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  // Get image URL to delete from storage
  const { data: image } = await supabase.from("pg_images").select("url").eq("id", imageId).single();
  if (image?.url) {
    // Extract path from URL
    const urlParts = image.url.split("/pg-images/");
    if (urlParts[1]) {
      await supabase.storage.from("pg-images").remove([urlParts[1]]);
    }
  }

  await supabase.from("pg_images").delete().eq("id", imageId);

  revalidatePath("/owner/add-pg");
  return { success: true, error: null };
}

// ── 8. Set Primary Image ─────────────────────────────────────
export async function setPrimaryImage(pgId: string, imageId: string) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  // Unset all primary flags for this PG
  await supabase.from("pg_images").update({ is_primary: false }).eq("pg_id", pgId);
  // Set the chosen one
  await supabase.from("pg_images").update({ is_primary: true }).eq("id", imageId);

  revalidatePath("/owner/add-pg");
  return { success: true, error: null };
}

// ── 9. Update Image Category ──────────────────────────────────
export async function updateImageCategory(pgId: string, imageId: string, category: string) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  const { error: updateError } = await supabase.from("pg_images").update({ category }).eq("id", imageId);
  if (updateError) {
    console.error("Failed to update image category:", updateError);
    return { success: false, error: "Failed to update category." };
  }

  revalidatePath("/owner/add-pg");
  return { success: true, error: null };
}

// ── 10. Submit for Verification ───────────────────────────────
export async function submitForVerification(pgId: string) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };
  if (pg.status !== "DRAFT") return { success: false, error: "Only draft PGs can be submitted." };

  // Validate minimum requirements
  const { data: pgFull } = await supabase.from("pgs").select("name, address, city_id, locality_id").eq("id", pgId).single();
  if (!pgFull?.name || pgFull.name === "Untitled PG") return { success: false, error: "PG name is required." };
  if (!pgFull?.address) return { success: false, error: "Address is required." };

  const { count: roomCount } = await supabase.from("rooms").select("*", { count: "exact", head: true }).eq("pg_id", pgId);
  if (!roomCount || roomCount === 0) return { success: false, error: "At least one room configuration is required." };

  const { error: updateError } = await supabase.from("pgs").update({ status: "PENDING" }).eq("id", pgId);
  if (updateError) {
    console.error("Failed to submit:", updateError);
    return { success: false, error: "Failed to submit for verification." };
  }

  // Also create an approval request record
  const { error: reqError } = await supabase.from("approval_requests").insert({
    owner_id: user.id,
    pg_id: pgId,
    request_type: "PG",
    status: "PENDING"
  });

  if (reqError) {
    console.error("Failed to create approval request:", reqError);
    // Don't fail the whole process if this fails, but it's good to log
  }

  revalidatePath("/owner/dashboard");
  return { success: true, error: null };
}

// ── 11. Pause Listing ─────────────────────────────────────────
export async function pausePgListing(pgId: string) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  const { error: updateError } = await supabase.from("pgs").update({ status: "SUSPENDED" }).eq("id", pgId);
  if (updateError) return { success: false, error: "Failed to pause listing." };

  revalidatePath("/owner/dashboard");
  return { success: true, error: null };
}

// ── 12. Delete Listing ────────────────────────────────────────
export async function deletePgListing(pgId: string) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return { success: false, error: error || "Auth error" };

  const pg = await verifyPgOwnership(supabase, user.id, pgId);
  if (!pg) return { success: false, error: "PG not found or unauthorized" };

  // Soft delete by archiving
  const { error: updateError } = await supabase.from("pgs").update({ status: "ARCHIVED" }).eq("id", pgId);
  if (updateError) return { success: false, error: "Failed to delete listing." };

  revalidatePath("/owner/dashboard");
  return { success: true, error: null };
}

// ── 13. Fetch Draft PG Data (for wizard) ─────────────────────
export async function fetchDraftPg(pgId: string) {
  const { supabase, user, error } = await verifyOwner();
  if (error || !supabase || !user) return null;

  const { data: pg } = await supabase
    .from("pgs")
    .select(`
      id, name, slug, description, address, lat, lng, gender, food_status, status,
      available_from, rules, city_id, locality_id,
      cities ( id, name ),
      localities ( id, name ),
      rooms ( id, room_type, rent, security_deposit, total_beds, occupied_beds, electricity_charges, maintenance_charges, other_charges ),
      pg_images ( id, url, is_primary, display_order, category ),
      pg_amenities ( amenity_id )
    `)
    .eq("id", pgId)
    .eq("owner_id", user.id)
    .single();

  return pg;
}
