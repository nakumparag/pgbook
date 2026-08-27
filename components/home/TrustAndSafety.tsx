"use client";

import Link from "next/link";
import { ShieldCheck, MapPin, IndianRupee, Eye, Star, Flag } from "lucide-react";

const SAFETY_TIPS = [
  {
    icon: ShieldCheck,
    title: "Verify Property Details",
    description: "Cross-check the address, owner info, and property photos before visiting.",
  },
  {
    icon: MapPin,
    title: "Visit Before Paying",
    description: "Always inspect the property in person. Never pay a deposit without seeing the PG.",
  },
  {
    icon: IndianRupee,
    title: "Understand All Costs",
    description: "Ask about rent, security deposit, maintenance charges, and any additional fees upfront.",
  },
  {
    icon: Eye,
    title: "Check Reviews",
    description: "Read reviews from previous tenants to get an honest picture of the PG experience.",
  },
  {
    icon: Star,
    title: "Verified Badge Matters",
    description: "Properties with our Verified badge have been reviewed by the PGBook team.",
  },
  {
    icon: Flag,
    title: "Report Suspicious Listings",
    description: "Found something wrong? Report it so we can investigate and protect others.",
  },
];

export function TrustAndSafety() {
  return (
    <section className="section-padding bg-foreground text-background" aria-labelledby="trust-heading">
      <div className="container-custom">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Header */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
              Safety First
            </span>
            <h2 id="trust-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Search with<br />
              <span className="text-primary">Confidence</span>
            </h2>
            <p className="text-white/65 text-base leading-relaxed mb-6 max-w-md">
              Your safety matters. PGBook is designed to help you make informed decisions — every step of the way.
            </p>
            <Link
              href="/safety"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
              aria-label="Read our safety guide"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Safety Guide
            </Link>
          </div>

          {/* Right: Safety tips grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAFETY_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="flex gap-3 p-4 bg-white/8 rounded-xl border border-white/10 hover:bg-white/12 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <tip.icon className="w-4.5 h-4.5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{tip.title}</h3>
                  <p className="text-white/55 text-xs leading-relaxed">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
