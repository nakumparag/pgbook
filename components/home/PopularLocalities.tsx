"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

const LOCALITIES = [
  { name: "Sola", slug: "sola", city: "Ahmedabad", popular: true },
  { name: "Thaltej", slug: "thaltej", city: "Ahmedabad", popular: true },
  { name: "Vastrapur", slug: "vastrapur", city: "Ahmedabad", popular: false },
  { name: "Navrangpura", slug: "navrangpura", city: "Ahmedabad", popular: false },
  { name: "Satellite", slug: "satellite", city: "Ahmedabad", popular: false },
  { name: "Bodakdev", slug: "bodakdev", city: "Ahmedabad", popular: false },
  { name: "Prahlad Nagar", slug: "prahlad-nagar", city: "Ahmedabad", popular: true },
  { name: "SG Highway", slug: "sg-highway", city: "Ahmedabad", popular: false },
  { name: "Maninagar", slug: "maninagar", city: "Ahmedabad", popular: false },
  { name: "Chandkheda", slug: "chandkheda", city: "Ahmedabad", popular: false },
  { name: "Naranpura", slug: "naranpura", city: "Ahmedabad", popular: false },
  { name: "Gota", slug: "gota", city: "Ahmedabad", popular: false },
];

export function PopularLocalities() {
  return (
    <section className="section-padding bg-section-alt" aria-labelledby="localities-heading">
      <div className="container-custom">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="section-label" aria-hidden="true">By Area</span>
            <h2 id="localities-heading" className="section-heading">
              Popular Areas in Ahmedabad
            </h2>
            <p className="section-subtext max-w-md">
              Explore PGs in Ahmedabad&apos;s most popular neighbourhoods
            </p>
          </div>
          <Link
            href="/explore?city=ahmedabad"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            All areas <MapPin className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {LOCALITIES.map((locality) => (
            <Link
              key={locality.slug}
              href={`/explore?city=ahmedabad&area=${locality.slug}`}
              className="group flex items-center gap-2 p-3.5 bg-card rounded-xl border border-border/50 hover:border-primary hover:shadow-md transition-all"
              aria-label={`Find PGs in ${locality.name}, ${locality.city}`}
            >
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                  {locality.name}
                </span>
                {locality.popular && (
                  <span className="text-[10px] text-primary font-medium">Popular</span>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
