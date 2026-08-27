"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BUDGET_BANDS = [
  {
    label: "Under ₹5,000",
    sublabel: "Budget-friendly stays",
    range: "₹3,000 – ₹5,000",
    href: "/explore?budget=under-5000",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "💚",
  },
  {
    label: "₹5,000 – ₹7,000",
    sublabel: "Value for money",
    range: "₹5,000 – ₹7,000",
    href: "/explore?budget=5000-7000",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    icon: "💙",
  },
  {
    label: "₹7,000 – ₹10,000",
    sublabel: "Comfortable & modern",
    range: "₹7,000 – ₹10,000",
    href: "/explore?budget=7000-10000",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-400",
    icon: "💜",
  },
  {
    label: "Above ₹10,000",
    sublabel: "Premium & luxury PGs",
    range: "₹10,000+",
    href: "/explore?budget=above-10000",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    icon: "🧡",
  },
];

export function BrowseByBudget() {
  return (
    <section className="section-padding bg-background" aria-labelledby="budget-heading">
      <div className="container-custom">

        <div className="text-center mb-10">
          <span className="section-label" aria-hidden="true">Find Your Range</span>
          <h2 id="budget-heading" className="section-heading">
            Browse by Budget
          </h2>
          <p className="section-subtext max-w-lg mx-auto">
            Every budget has a great PG — find yours
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BUDGET_BANDS.map((band) => (
            <Link
              key={band.label}
              href={band.href}
              className={`group flex flex-col p-6 rounded-2xl border-2 ${band.bg} ${band.border} card-hover`}
              aria-label={`PGs ${band.label}`}
            >
              <span className="text-3xl mb-4" aria-hidden="true">{band.icon}</span>
              <h3 className={`font-bold text-lg mb-1 ${band.text}`}>{band.label}</h3>
              <p className="text-muted-foreground text-sm mb-4">{band.sublabel}</p>
              <div className={`flex items-center gap-1 text-sm font-semibold mt-auto ${band.text}`}>
                Explore PGs
                <ArrowRight
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
