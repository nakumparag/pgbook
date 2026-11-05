"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Floor, Bed, Room } from "@/types/database.types";

export interface PropertyOverview {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  locality?: string;
  floorsCount: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  monthlyRevenue: number;
  status: string;
  isPubliclyListed: boolean;
  wifiSsid?: string | null;
  rules?: string | null;
  managerName?: string | null;
  managerPhone?: string | null;
}

// Fetch all properties owned by current user
export async function getOwnerProperties(): Promise<{ properties: PropertyOverview[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { properties: [], error: "Not authenticated" };
    }

    const { data: pgs, error } = await supabase
      .from("pgs")
      .select(`
        id, name, slug, address, status, is_publicly_listed, floors_count, total_rooms, rules, wifi_ssid, manager_name, manager_phone,
        cities ( name ), localities ( name ),
        rooms ( id, room_type, rent, total_beds, occupied_beds )
      `)
      .eq("owner_id", user.id)
      .neq("status", "ARCHIVED")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching owner properties:", error.message);
      return { properties: [], error: error.message };
    }

    const properties: PropertyOverview[] = (pgs || []).map((pg: any) => {
      const rooms: Room[] = pg.rooms || [];
      let totalBeds = 0;
      let occupiedBeds = 0;
      let monthlyRevenue = 0;

      rooms.forEach((r) => {
        totalBeds += r.total_beds || 0;
        occupiedBeds += r.occupied_beds || 0;
        monthlyRevenue += (r.rent || 0) * (r.occupied_beds || 0);
      });

      return {
        id: pg.id,
        name: pg.name,
        slug: pg.slug,
        address: pg.address,
        city: pg.cities?.name || "Gujarat",
        locality: pg.localities?.name,
        floorsCount: pg.floors_count || 1,
        totalRooms: rooms.length,
        totalBeds,
        occupiedBeds,
        vacantBeds: Math.max(0, totalBeds - occupiedBeds),
        monthlyRevenue,
        status: pg.status,
        isPubliclyListed: !!pg.is_publicly_listed,
        wifiSsid: pg.wifi_ssid,
        rules: pg.rules,
        managerName: pg.manager_name,
        managerPhone: pg.manager_phone,
      };
    });

    return { properties };
  } catch (err: any) {
    console.error("getOwnerProperties exception:", err);
    return { properties: [], error: err.message };
  }
}

// Fetch floors, rooms and beds for a property
export async function getPropertyInventory(propertyId: string) {
  try {
    const supabase = await createClient();

    // 1. Fetch Floors
    let floors: Floor[] = [];
    const { data: floorData, error: floorErr } = await supabase
      .from("floors")
      .select("*")
      .eq("pg_id", propertyId)
      .order("floor_number", { ascending: true });

    if (!floorErr && floorData) {
      floors = floorData;
    }

    // 2. Fetch Rooms
    const { data: rooms, error: roomErr } = await supabase
      .from("rooms")
      .select("*")
      .eq("pg_id", propertyId)
      .order("created_at", { ascending: true });

    if (roomErr) {
      console.error("Error fetching rooms:", roomErr.message);
    }

    // 3. Fetch Beds
    let beds: Bed[] = [];
    const { data: bedData, error: bedErr } = await supabase
      .from("beds")
      .select("*")
      .eq("pg_id", propertyId)
      .order("bed_number", { ascending: true });

    if (!bedErr && bedData) {
      beds = bedData;
    }

    return {
      floors,
      rooms: rooms || [],
      beds,
    };
  } catch (err: any) {
    console.error("getPropertyInventory exception:", err);
    return { floors: [], rooms: [], beds: [] };
  }
}

// Create a floor
export async function createFloor(propertyId: string, floorNumber: number, name: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("floors")
      .insert({
        pg_id: propertyId,
        floor_number: floorNumber,
        name: name.trim() || `Floor ${floorNumber}`,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update floors_count on property
    try {
      await supabase.from("pgs").update({ floors_count: floorNumber + 1 }).eq("id", propertyId);
    } catch {
      // Non-critical metric increment
    }
    revalidatePath("/owner/rooms");
    revalidatePath(`/owner/properties/${propertyId}`);
    return { success: true, floor: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Create a bed
export async function createBed(propertyId: string, roomId: string, bedNumber: string, rent: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
      .from("beds")
      .insert({
        pg_id: propertyId,
        room_id: roomId,
        bed_number: bedNumber.trim(),
        monthly_rent: rent,
        status: "VACANT",
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/owner/rooms");
    revalidatePath("/owner/dashboard");
    return { success: true, bed: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Update property operational details
export async function updatePropertyOperations(propertyId: string, payload: {
  rules?: string;
  wifi_ssid?: string;
  wifi_password?: string;
  manager_name?: string;
  manager_phone?: string;
  checkin_time?: string;
  checkout_time?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("pgs")
      .update(payload)
      .eq("id", propertyId)
      .eq("owner_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/owner/properties/${propertyId}`);
    revalidatePath("/owner/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Toggle public listing on PGBook (Scenario C & D)
export async function togglePropertyPublicListing(
  propertyId: string,
  shouldList: boolean
): Promise<{ success: boolean; isPubliclyListed?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Try secure RPC first
    try {
      const { data: rpcData, error: rpcErr } = await (supabase as any).rpc(
        "toggle_pg_public_listing",
        {
          target_pg_id: propertyId,
          should_list: shouldList,
        }
      );

      if (!rpcErr && rpcData?.success) {
        revalidatePath("/owner/properties");
        revalidatePath("/explore");
        revalidatePath("/owner/dashboard");
        return { success: true, isPubliclyListed: shouldList };
      }
    } catch {
      // Fallback to direct query
    }

    // Direct update
    const { data: pg, error: fetchErr } = await (supabase as any)
      .from("pgs")
      .select("id, slug, owner_id")
      .eq("id", propertyId)
      .single();

    if (fetchErr || !pg || pg.owner_id !== user.id) {
      return { success: false, error: "Property not found or unauthorized" };
    }

    const { error: updateErr } = await (supabase as any)
      .from("pgs")
      .update({
        is_publicly_listed: shouldList,
        ...(shouldList ? { status: "APPROVED" } : {}),
      })
      .eq("id", propertyId)
      .eq("owner_id", user.id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath("/owner/properties");
    revalidatePath("/explore");
    revalidatePath("/owner/dashboard");
    if (pg.slug) {
      revalidatePath(`/pg/${pg.slug}`);
    }

    return { success: true, isPubliclyListed: shouldList };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to toggle public listing" };
  }
}


