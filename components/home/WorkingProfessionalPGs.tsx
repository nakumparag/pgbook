"use client";

import Image from "next/image";
import Link from "next/link";
import { Wifi, Car, Utensils, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PROFESSIONAL_FEATURES = [
  { icon: Wifi, text: "High-Speed WiFi" },
  { icon: Zap, text: "Power Backup" },
  { icon: Utensils, text: "Food Options" },
  { icon: Car, text: "Parking" },
  { icon: ShieldCheck, text: "24/7 Security" },
  { icon: Car, text: "Near Business Hubs" },
];

export function WorkingProfessionalPGs({ pgs = [] }: { pgs?: any[] }) {
  if (!pgs || pgs.length === 0) return null;
  // Pick PGs that have rooms with rent >= 8000 or just first 3 if none
  let professionalPGs = pgs.filter((pg) => {
    const minRent = pg.rooms?.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
    return minRent >= 8000;
  }).slice(0, 3);
  
  if (professionalPGs.length === 0) {
    professionalPGs = pgs.slice(0, 3);
  }

  return (
    <section className="section-padding bg-section-alt" aria-labelledby="professional-pgs-heading">
      <div className="container-custom">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Property Cards (reversed order for visual variety) */}
          <div className="flex flex-col gap-3 lg:order-first order-last">
            {professionalPGs.map((pg) => {
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
                  className="group flex items-center gap-4 bg-card rounded-2xl p-3 border border-border/50 card-hover shadow-sm"
                  aria-label={`View ${pg.name}`}
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    <Image
                      src={primaryImage}
                      alt={pg.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {pg.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{areaName}, {cityName}</p>
                    <p className="font-bold text-primary text-sm mt-1">
                      {rentMin > 0 ? formatCurrency(rentMin) : "TBD"}
                      {rentMin > 0 && <span className="text-xs font-normal text-muted-foreground">/mo</span>}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              );
            })}
          </div>

          {/* Right: Content */}
          <div className="lg:order-last order-first">
            <span className="section-label" aria-hidden="true">For Professionals</span>
            <h2 id="professional-pgs-heading" className="section-heading mb-4">
              PGs Built for<br />
              <span className="text-primary">Working Professionals</span>
            </h2>
            <p className="section-subtext mb-6">
              Comfortable, professional, and strategically located PGs near Ahmedabad&apos;s top business districts. Come home to comfort after a long day.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {PROFESSIONAL_FEATURES.map((feature) => (
                <span
                  key={feature.text}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground"
                >
                  <feature.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                  {feature.text}
                </span>
              ))}
            </div>

            <Link
              href="/explore"
              className="btn-primary inline-flex"
              aria-label="Explore professional PGs"
            >
              Explore Professional PGs
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
