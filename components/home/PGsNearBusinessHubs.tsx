"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BUSINESS_HUBS = [
  { name: "SG Highway", slug: "sg-highway", icon: "🏢", desc: "IT & Corporate Hub" },
  { name: "Prahlad Nagar", slug: "prahlad-nagar", icon: "💼", desc: "Business District" },
  { name: "GIFT City", slug: "gift-city-gandhinagar", icon: "🏦", desc: "Financial Hub" },
  { name: "Sanand", slug: "sanand", icon: "🏭", desc: "Industrial Zone" },
  { name: "Navrangpura", slug: "navrangpura", icon: "🏙️", desc: "City Centre" },
  { name: "Bodakdev", slug: "bodakdev", icon: "🌐", desc: "Tech & Startups" },
  { name: "Prahladnagar", slug: "prahladnagar", icon: "📊", desc: "Finance & Banking" },
  { name: "Thaltej", slug: "thaltej", icon: "🏗️", desc: "Real Estate Hub" },
];

export function PGsNearBusinessHubs() {
  return (
    <section className="section-padding bg-background" aria-labelledby="hubs-heading">
      <div className="container-custom">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="section-label" aria-hidden="true">Near Work</span>
            <h2 id="hubs-heading" className="section-heading">
              PGs Near Business Hubs
            </h2>
            <p className="section-subtext max-w-lg">
              Walk or take a quick commute to work. Find PGs strategically located near Ahmedabad&apos;s top business districts.
            </p>
          </div>
          <Link
            href="/explore?near=business"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            Browse all hubs <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {BUSINESS_HUBS.map((hub) => (
            <Link
              key={hub.slug}
              href={`/explore?location=${hub.slug}`}
              className="group flex flex-col items-center text-center p-4 bg-card rounded-2xl border border-border/50 card-hover shadow-sm"
              aria-label={`Find PGs near ${hub.name}`}
            >
              <span className="text-2xl mb-2" aria-hidden="true">{hub.icon}</span>
              <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                {hub.name}
              </h3>
              <p className="text-[10px] text-muted-foreground">{hub.desc}</p>
              <span className="text-[10px] font-semibold text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Find PGs →
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
