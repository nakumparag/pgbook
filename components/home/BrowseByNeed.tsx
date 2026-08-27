"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    title: "Girls PG",
    description: "Safe & comfortable spaces for women",
    href: "/explore?gender=girls",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    color: "from-pink-500/80 to-rose-600/80",
  },
  {
    title: "Boys PG",
    description: "Modern rooms for men",
    href: "/explore?gender=boys",
    image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&q=80",
    color: "from-blue-500/80 to-indigo-600/80",
  },
  {
    title: "Co-Living",
    description: "Community living spaces",
    href: "/explore?type=co-living",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    color: "from-violet-500/80 to-purple-600/80",
  },
  {
    title: "Student PG",
    description: "Near colleges & universities",
    href: "/explore?type=student",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
    color: "from-emerald-500/80 to-teal-600/80",
  },
  {
    title: "Working Professionals",
    description: "Near offices & business hubs",
    href: "/explore?type=professional",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    color: "from-amber-500/80 to-orange-600/80",
  },
  {
    title: "Private Room",
    description: "Entire room to yourself",
    href: "/explore?roomType=personal",
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80",
    color: "from-slate-600/80 to-gray-700/80",
  },
];

export function BrowseByNeed() {
  return (
    <section className="section-padding bg-section-alt" aria-labelledby="browse-need-heading">
      <div className="container-custom">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-label" aria-hidden="true">Find Your Match</span>
          <h2 id="browse-need-heading" className="section-heading">
            Browse by Need
          </h2>
          <p className="section-subtext max-w-lg mx-auto">
            Tell us who you are — we&apos;ll show you PGs that fit your lifestyle
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group relative block rounded-2xl overflow-hidden bg-muted isolate card-hover"
              aria-label={category.title}
            >
              {/* Image */}
              <div className="aspect-3/4">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              </div>

              {/* Color Gradient Overlay */}
              <div className={`absolute inset-0 bg-linear-to-t ${category.color} opacity-75 group-hover:opacity-85 transition-opacity z-10`} aria-hidden="true" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 z-20">
                <h3 className="text-white font-bold text-sm md:text-base text-center leading-tight mb-1">
                  {category.title}
                </h3>
                <p className="text-white/80 text-xs text-center leading-snug hidden md:block">
                  {category.description}
                </p>
                <div className="mt-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                  <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
