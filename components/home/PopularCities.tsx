"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CITIES = [
  {
    name: "Ahmedabad",
    slug: "ahmedabad",
    image: "https://images.unsplash.com/photo-1588613253579-2d1840810793?w=600&q=80",
    highlight: "Most Popular",
  },
  {
    name: "Surat",
    slug: "surat",
    image: "https://images.unsplash.com/photo-1587311100591-9a7000e30d7f?w=600&q=80",
    highlight: null,
  },
  {
    name: "Vadodara",
    slug: "vadodara",
    image: "https://images.unsplash.com/photo-1594921904791-561b3636fdbd?w=600&q=80",
    highlight: null,
  },
  {
    name: "Rajkot",
    slug: "rajkot",
    image: "https://images.unsplash.com/photo-1562979314-bee7453e911c?w=600&q=80",
    highlight: null,
  },
  {
    name: "Gandhinagar",
    slug: "gandhinagar",
    image: "https://images.unsplash.com/photo-1593348123696-2b4f9f4f411b?w=600&q=80",
    highlight: "Near GIFT City",
  },
  {
    name: "Anand",
    slug: "anand",
    image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=600&q=80",
    highlight: null,
  },
];

export function PopularCities() {
  return (
    <section className="section-padding bg-background" aria-labelledby="cities-heading">
      <div className="container-custom">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="section-label" aria-hidden="true">Top Destinations</span>
            <h2 id="cities-heading" className="section-heading">
              Popular Cities
            </h2>
            <p className="section-subtext max-w-md">
              Find PGs across Gujarat&apos;s most sought-after cities
            </p>
          </div>
          <Link
            href="/cities"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            View all cities
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* City Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/explore?city=${city.slug}`}
              className="group relative block rounded-2xl overflow-hidden aspect-3/4 bg-muted isolate card-hover"
              aria-label={`Find PGs in ${city.name}`}
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110 z-0"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 img-overlay z-10" aria-hidden="true" />

              {/* Highlight badge */}
              {city.highlight && (
                <div className="absolute top-3 left-3 z-20">
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                    {city.highlight}
                  </span>
                </div>
              )}

              {/* Arrow icon on hover */}
              <div className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              </div>

              {/* City Info */}
              <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                <h3 className="text-white font-bold text-lg leading-none mb-1">
                  {city.name}
                </h3>
                <p className="text-white/75 text-xs font-medium">
                  Explore PGs →
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
