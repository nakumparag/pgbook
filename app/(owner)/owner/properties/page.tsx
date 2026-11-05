import Link from "next/link";

export const dynamic = "force-dynamic";
import { Plus, Building2, MapPin, BedDouble, Users, Wifi, UserCheck, ExternalLink, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PropertyListingToggle } from "@/components/owner/PropertyListingToggle";
import { getOwnerProperties } from "@/app/actions/business_properties";
import { formatCurrency } from "@/lib/utils";

export default async function OwnerPropertiesPage() {
  const { properties } = await getOwnerProperties();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
            Property Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your PG buildings, operational credentials, and capacity.
          </p>
        </div>
        <Button asChild className="rounded-xl font-bold gap-2">
          <Link href="/owner/add-pg">
            <Plus className="w-4 h-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      {/* Property Cards Grid */}
      {properties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-base text-foreground">No properties registered yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Add your first PG property to start managing floors, rooms, beds, tenants, and collections.
          </p>
          <Button asChild className="mt-4 rounded-xl font-bold gap-2">
            <Link href="/owner/add-pg">
              <Plus className="w-4 h-4" />
              Add First PG
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-border transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Status & Name */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-foreground line-clamp-1">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{prop.locality ? `${prop.locality}, ` : ""}{prop.city}</span>
                    </p>
                  </div>
                  <StatusBadge status={prop.status} />
                </div>

                {/* Optional PGBook Public Listing Toggle */}
                <div className="pt-1 pb-1">
                  <PropertyListingToggle
                    propertyId={prop.id}
                    initialListed={prop.isPubliclyListed}
                    propertyName={prop.name}
                  />
                </div>

                {/* Capacity & Occupancy Badges */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-muted/40 border border-border/40 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Floors</span>
                    <p className="font-extrabold text-sm text-foreground">{prop.floorsCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Rooms</span>
                    <p className="font-extrabold text-sm text-foreground">{prop.totalRooms}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Beds</span>
                    <p className="font-extrabold text-sm text-primary font-bold">
                      {prop.occupiedBeds}/{prop.totalBeds}
                    </p>
                  </div>
                </div>

                {/* Operational Details (WiFi, Manager) */}
                <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-primary" />
                      WiFi Network:
                    </span>
                    <span className="font-medium text-foreground">{prop.wifiSsid || "Not configured"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Manager:
                    </span>
                    <span className="font-medium text-foreground">{prop.managerName || "Self-managed"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-border/60 flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl text-xs font-semibold">
                  <Link href={`/owner/rooms?property=${prop.id}`}>
                    <BedDouble className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    Floors & Beds
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1 rounded-xl text-xs font-semibold">
                  <Link href={`/owner/dashboard?property=${prop.id}`}>
                    Dashboard
                  </Link>
                </Button>
                {prop.isPubliclyListed ? (
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700">
                    <Link href={`/pg/${prop.slug}`} target="_blank" title="View Public Listing on PGBook">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" disabled className="h-8 w-8 rounded-lg text-muted-foreground/40" title="Private management (not listed publicly on PGBook)">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

