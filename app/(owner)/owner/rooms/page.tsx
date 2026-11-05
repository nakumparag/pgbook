import { getOwnerProperties, getPropertyInventory } from "@/app/actions/business_properties";
import { RoomBedManagerClient } from "@/components/owner/RoomBedManagerClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ property?: string }>;
}

export default async function OwnerRoomsPage({ searchParams }: PageProps) {
  const { property: queryPropertyId } = await searchParams;
  const { properties } = await getOwnerProperties();

  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
        <h3 className="font-bold text-base text-foreground">No properties found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Add your first property before configuring floors, rooms, and beds.
        </p>
        <Button asChild className="mt-4 rounded-xl font-bold gap-2">
          <Link href="/owner/add-pg">
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </Button>
      </div>
    );
  }

  // Active property (either query or first property)
  const activeProperty = properties.find((p) => p.id === queryPropertyId) || properties[0];
  const { floors, rooms, beds } = await getPropertyInventory(activeProperty.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
          Floors, Rooms & Beds
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Managing: <strong className="text-foreground">{activeProperty.name}</strong> • Real-time bed occupancy with duplicate booking prevention.
        </p>
      </div>

      <RoomBedManagerClient
        propertyId={activeProperty.id}
        propertyName={activeProperty.name}
        floors={floors}
        rooms={rooms}
        beds={beds}
      />
    </div>
  );
}

