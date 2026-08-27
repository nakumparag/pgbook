"use client";

import Image from "next/image";
import Link from "next/link";
import { Wifi, Utensils, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const STUDENT_FEATURES = [
  { icon: Wifi, text: "High-Speed WiFi" },
  { icon: Utensils, text: "Wholesome Meals" },
  { icon: BookOpen, text: "Quiet Study Hours" },
  { icon: CheckCircle, text: "Near Campuses" },
];

export function StudentPGs({ pgs = [] }: { pgs?: any[] }) {
  if (!pgs || pgs.length === 0) return null;
  // Pick PGs that have rooms with rent <= 10000 or just first 3 if none
  let studentPGs = pgs.filter((pg) => {
    const minRent = pg.rooms?.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
    return minRent > 0 && minRent <= 10000;
  }).slice(0, 3);
  
  if (studentPGs.length === 0) {
    studentPGs = pgs.slice(0, 3);
  }

  return (
    <section className="section-padding bg-background" aria-labelledby="student-pgs-heading">
      <div className="container-custom">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Content */}
          <div>
            <span className="section-label" aria-hidden="true">For Students</span>
            <h2 id="student-pgs-heading" className="section-heading mb-4">
              PGs Made for<br />
              <span className="text-primary">Student Life</span>
            </h2>
            <p className="section-subtext mb-6">
              Affordable, safe, and study-friendly PGs near top colleges and universities across Gujarat. Focus on studies — we handle the rest.
            </p>

            {/* Feature list */}
            <ul className="grid grid-cols-2 gap-3 mb-8" aria-label="Student PG features">
              {STUDENT_FEATURES.map((feature) => (
                <li key={feature.text} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-4.5 h-4.5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/explore"
              className="btn-primary inline-flex"
              aria-label="Explore student PGs"
            >
              Explore Student PGs
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Right: Property Cards */}
          <div className="flex flex-col gap-3">
            {studentPGs.map((pg) => {
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

        </div>
      </div>
    </section>
  );
}
