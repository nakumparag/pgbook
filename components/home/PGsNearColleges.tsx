"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

const COLLEGES = [
  { name: "Silver Oak University", slug: "silver-oak-university", city: "Ahmedabad" },
  { name: "Gujarat University", slug: "gujarat-university", city: "Ahmedabad" },
  { name: "CEPT University", slug: "cept-university", city: "Ahmedabad" },
  { name: "Nirma University", slug: "nirma-university", city: "Ahmedabad" },
  { name: "PDEU (Gandhinagar)", slug: "pdeu-gandhinagar", city: "Gandhinagar" },
  { name: "MSU Baroda", slug: "msu-baroda", city: "Vadodara" },
  { name: "Surat Municipal University", slug: "smu-surat", city: "Surat" },
  { name: "Veer Narmad South Gujarat University", slug: "vnsgu-surat", city: "Surat" },
];

export function PGsNearColleges() {
  const [query, setQuery] = useState("");

  const filtered = COLLEGES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="section-padding bg-section-alt" aria-labelledby="colleges-heading">
      <div className="container-custom">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Content */}
          <div>
            <span className="section-label" aria-hidden="true">Campus Life</span>
            <h2 id="colleges-heading" className="section-heading mb-4">
              Find PGs Near<br />
              <span className="text-primary">Your College</span>
            </h2>
            <p className="section-subtext mb-6">
              Shorten your commute and focus more on studies. Search PGs within walking distance of your campus.
            </p>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search your college..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                aria-label="Search college"
              />
            </div>

            {/* College chips */}
            <div className="flex flex-wrap gap-2">
              {(query ? filtered : COLLEGES).slice(0, 8).map((college) => (
                <Link
                  key={college.slug}
                  href={`/explore?near=${college.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                  aria-label={`Find PGs near ${college.name}`}
                >
                  🎓 {college.name}
                  <span className="text-xs text-muted-foreground">· {college.city}</span>
                </Link>
              ))}
            </div>

            {query && filtered.length === 0 && (
              <p className="text-muted-foreground text-sm mt-3">
                No results found. Try a different search or{" "}
                <Link href="/explore" className="text-primary underline">browse all PGs</Link>.
              </p>
            )}
          </div>

          {/* Right: Illustration / CTA card */}
          <div className="bg-linear-to-br from-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/20 flex flex-col items-center text-center">
            <div className="text-6xl mb-4" aria-hidden="true">🏫</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Can&apos;t find your college?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Browse PG listings across Gujarat and filter by location or landmark.
            </p>
            <Link
              href="/explore"
              className="btn-primary"
              aria-label="Browse all PGs near colleges"
            >
              Browse All PGs
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
