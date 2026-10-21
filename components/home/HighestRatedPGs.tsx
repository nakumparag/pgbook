"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function HighestRatedPGs({ pgs = [] }: { pgs?: any[] }) {
  if (!pgs || pgs.length === 0) return null;

  const rated = [...pgs]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  return (
    <section className="section-padding bg-section-alt" aria-labelledby="rated-pgs-heading">
      <div className="container-custom">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-label" aria-hidden="true">Top Reviewed</span>
            <h2 id="rated-pgs-heading" className="section-heading">
              Highest Rated PGs
            </h2>
            <p className="section-subtext">Rated by real tenants — no fake reviews</p>
          </div>
          <Link
            href="/explore?sort=rating"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            See all top rated <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {rated.map((pg, index) => {
            const primaryImage =
              pg.pg_images?.find((img: any) => img.is_primary)?.url ||
              pg.pg_images?.[0]?.url ||
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80";

            const rentMin = pg.rooms?.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
            const cityName = pg.cities?.name || "";
            const areaName = pg.localities?.name || "";

            return (
              <Link
                key={pg.id}
                href={`/pg/${pg.slug}`}
                className="group flex items-center gap-4 bg-card rounded-2xl p-4 border border-border/50 card-hover shadow-sm"
                aria-label={`View ${pg.name}, rated ${pg.rating}`}
              >
                {/* Rank */}
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-muted items-center justify-center shrink-0">
                  <span className="font-bold text-muted-foreground text-sm">#{index + 1}</span>
                </div>

                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                  <Image
                    src={primaryImage}
                    alt={pg.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="96px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {pg.name}
                    </h3>
                    {pg.is_verified && (
                      <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" aria-label="PGBook reviewed" />
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs mb-2">
                    <MapPin className="w-3 h-3 mr-1 shrink-0 text-primary" aria-hidden="true" />
                    <span className="line-clamp-1">{areaName}, {cityName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= Math.round(pg.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      {pg.rating || 0} ({pg.review_count || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Rent + CTA */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground mb-0.5">From</p>
                  <p className="font-bold text-foreground text-sm">
                    {rentMin > 0 ? formatCurrency(rentMin) : "TBD"}
                    <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                  </p>
                  <span className="text-xs font-semibold text-primary mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
