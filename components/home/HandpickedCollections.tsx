"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const COLLECTIONS = [
  {
    title: "Budget Friendly",
    description: "Quality stays under ₹6,000",
    href: "/explore?budget=under-5000",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    tag: "Under ₹6K",
    wide: true,
  },
  {
    title: "WiFi Included",
    description: "High-speed internet guaranteed",
    href: "/explore?amenity=wifi",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
    tag: "Stay Connected",
    wide: false,
  },
  {
    title: "Private Rooms",
    description: "Your own space, your own rules",
    href: "/explore?roomType=personal",
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80",
    tag: "Personal",
    wide: false,
  },
  {
    title: "Food Included",
    description: "Home-cooked meals daily",
    href: "/explore?food=included",
    image: "https://images.unsplash.com/photo-1585325701954-d43c7e62e58c?w=600&q=80",
    tag: "Meals Included",
    wide: false,
  },
  {
    title: "Premium PGs",
    description: "Top-rated luxury PGs",
    href: "/explore?premium=true",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    tag: "Top Rated",
    wide: false,
  },
  {
    title: "Near Colleges",
    description: "Short commute, more study time",
    href: "/explore?near=college",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
    tag: "Student Favourite",
    wide: false,
  },
  {
    title: "Near Offices",
    description: "Walk to work every day",
    href: "/explore?near=office",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    tag: "Work Friendly",
    wide: false,
  },
  {
    title: "For Students",
    description: "Affordable, safe, study-friendly",
    href: "/explore?type=student",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
    tag: "Student PG",
    wide: true,
  },
];

export function HandpickedCollections() {
  return (
    <section className="section-padding bg-background" aria-labelledby="collections-heading">
      <div className="container-custom">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="section-label" aria-hidden="true">Curated For You</span>
            <h2 id="collections-heading" className="section-heading">
              Handpicked Collections
            </h2>
            <p className="section-subtext max-w-md">
              Thoughtfully grouped PGs to help you find your perfect fit faster
            </p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            Explore all
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COLLECTIONS.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group relative rounded-2xl overflow-hidden bg-muted isolate card-hover ${
                item.wide ? "col-span-2" : "col-span-1"
              } ${i === 0 ? "md:row-span-2" : ""}`}
              aria-label={item.title}
            >
              <div className={`relative w-full ${item.wide ? "aspect-16/7" : "aspect-4/3"}`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent z-10" aria-hidden="true" />

                {/* Tag */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="bg-white/90 text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {item.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                  <h3 className="text-white font-bold text-base leading-tight mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-white/75 text-xs">{item.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-white/80 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
