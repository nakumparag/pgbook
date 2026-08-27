"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PGCard } from "@/components/pg/PGCard";

export function FeaturedPGs({ pgs = [] }: { pgs?: any[] }) {
  if (!pgs || pgs.length === 0) return null;
  // Use first 4 items for featured
  const featured = pgs.slice(0, 4);

  return (
    <section className="section-padding bg-muted/30 border-y border-border/50">
      <div className="container-custom">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="mb-2 text-2xl font-bold">Featured PGs</h2>
            <p className="text-muted-foreground">Handpicked premium accommodations for you</p>
          </div>
          <Link href="/explore" className="flex items-center gap-2 text-primary font-medium hover:underline">
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((pg, index) => (
            <PGCard key={pg.id || index} pg={pg as any} />
          ))}
        </div>

      </div>
    </section>
  );
}
