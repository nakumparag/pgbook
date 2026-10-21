"use client";

import Link from "next/link";

const AHMEDABAD_LOCALITIES = [
  { name: "Sola", slug: "sola" },
  { name: "Thaltej", slug: "thaltej" },
  { name: "Vastrapur", slug: "vastrapur" },
  { name: "Navrangpura", slug: "navrangpura" },
  { name: "Prahlad Nagar", slug: "prahlad-nagar" },
  { name: "Satellite", slug: "satellite" },
  { name: "Bodakdev", slug: "bodakdev" },
  { name: "SG Highway", slug: "sg-highway" },
  { name: "Chandkheda", slug: "chandkheda" },
  { name: "Maninagar", slug: "maninagar" },
  { name: "Naranpura", slug: "naranpura" },
  { name: "Gota", slug: "gota" },
];

const CITIES = [
  { name: "Ahmedabad", slug: "ahmedabad" },
  { name: "Surat", slug: "surat" },
  { name: "Vadodara", slug: "vadodara" },
  { name: "Rajkot", slug: "rajkot" },
  { name: "Gandhinagar", slug: "gandhinagar" },
];

export function SEOContent() {
  return (
    <section className="section-padding-sm bg-muted/30 border-t border-border" aria-label="SEO location links">
      <div className="container-custom">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Ahmedabad localities */}
          <div>
            <h2 className="text-base font-bold text-foreground mb-4">
              Find PGs Across Ahmedabad
            </h2>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Explore PG listings in popular Ahmedabad locations. Filter by budget, room type, gender and amenities.
            </p>
            <div className="flex flex-wrap gap-2">
              {AHMEDABAD_LOCALITIES.map((locality) => (
                <Link
                  key={locality.slug}
                  href={`/explore?city=ahmedabad&area=${locality.slug}`}
                  className="text-sm text-primary hover:underline font-medium px-3 py-1.5 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                >
                  PG in {locality.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <h2 className="text-base font-bold text-foreground mb-4">
              PGs Across Gujarat
            </h2>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Discover PGs in Gujarat&apos;s top cities for students and working professionals.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/explore?city=${city.slug}`}
                  className="text-sm text-primary hover:underline font-medium px-3 py-1.5 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                >
                  PG in {city.name}
                </Link>
              ))}
            </div>

            {/* Quick links for SEO */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Girls PG in Ahmedabad", href: "/explore?city=ahmedabad&gender=girls" },
                { label: "Boys PG in Ahmedabad", href: "/explore?city=ahmedabad&gender=boys" },
                { label: "PG under ₹7,000 in Ahmedabad", href: "/explore?city=ahmedabad&budget=under-7000" },
                { label: "Co-Living in Ahmedabad", href: "/explore?city=ahmedabad&gender=unisex" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-primary hover:underline font-medium px-2.5 py-1 bg-card border border-border/50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
