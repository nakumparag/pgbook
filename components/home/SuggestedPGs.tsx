"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, MapPin, ShieldCheck, Wifi, Utensils } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function SuggestedPGs({ pgs = [] }: { pgs?: any[] }) {
  if (!pgs || pgs.length === 0) return null;
  // Suggested PGs - showing up to 4 items
  const suggested = pgs.slice(0, 4);

  return (
    <section className="section-padding bg-background" aria-labelledby="suggested-pgs-heading">
      <div className="container-custom">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-label" aria-hidden="true">Just for You</span>
            <h2 id="suggested-pgs-heading" className="section-heading">
              Suggested Accommodations
            </h2>
            <p className="section-subtext">
              Top-rated PGs searched by others like you
            </p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            View all suggestions <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {suggested.map((pg) => {
            const primaryImage =
              pg.pg_images?.find((img: any) => img.is_primary)?.url ||
              pg.pg_images?.[0]?.url ||
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80";
              
            const flatAmenities = pg.pg_amenities?.map((pa: any) => pa.amenities?.name?.toLowerCase() || "") || [];
            const hasFood = flatAmenities.some((a: string) => a.includes("meal") || a.includes("food"));
            const hasWifi = flatAmenities.some((a: string) => a.includes("wifi"));

            const rentMin = pg.rooms?.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
            const cityName = pg.cities?.name || "";
            const areaName = pg.localities?.name || "";

            return (
              <Link
                key={pg.id}
                href={`/pg/${pg.slug}`}
                className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50 card-hover shadow-sm"
                aria-label={`View ${pg.name}`}
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                  <Image
                    src={primaryImage}
                    alt={pg.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {pg.is_verified && (
                    <div className="absolute top-3 left-3">
                      <span className="badge-verified text-[10px]">
                        <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Reviewed
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {pg.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span className="text-xs font-bold text-foreground">{pg.rating || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs mb-3">
                    <MapPin className="w-3 h-3 mr-1 shrink-0 text-primary" aria-hidden="true" />
                    <span className="line-clamp-1">{areaName}, {cityName}</span>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {hasFood && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <Utensils className="w-2.5 h-2.5" aria-hidden="true" /> Food
                      </span>
                    )}
                    {hasWifi && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        <Wifi className="w-2.5 h-2.5" aria-hidden="true" /> WiFi
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <p className="font-bold text-foreground text-sm">
                      {rentMin > 0 ? formatCurrency(rentMin) : "TBD"}
                      <span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </p>
                    <span className="text-xs font-semibold text-primary">View →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
