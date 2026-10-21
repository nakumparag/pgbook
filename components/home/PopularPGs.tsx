"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, ShieldCheck, Star, ArrowRight, Utensils, Wifi } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

function PGCarouselCard({ pg, index }: { pg: any; index: number }) {
  const primaryImage =
    pg.pg_images?.find((img: any) => img.is_primary)?.url ||
    pg.pg_images?.[0]?.url ||
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80";

  const flatAmenities = pg.pg_amenities?.map((pa: any) => pa.amenities?.name?.toLowerCase() || "") || [];
  const hasFood = flatAmenities.some((a: string) => a.includes("meal") || a.includes("food"));
  const hasWifi = flatAmenities.some((a: string) => a.includes("wifi"));

  const rentMin = pg.rooms?.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
  const cityName = pg.cities?.name || "";
  const areaName = pg.localities?.name || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="scroll-item w-72 md:w-80"
    >
      <Link
        href={`/pg/${pg.slug}`}
        className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50 card-hover shadow-sm h-full"
        aria-label={`View ${pg.name}`}
      >
        {/* Image */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          <Image
            src={primaryImage}
            alt={pg.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="320px"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {pg.is_verified && (
              <span className="badge-verified text-[10px]">
                <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                PGBook Reviewed
              </span>
            )}
          </div>

          {/* Favorite */}
          <button
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
              pg.isFavorited
                ? "bg-primary/20 text-primary"
                : "bg-black/25 text-white hover:bg-black/40"
            }`}
            onClick={(e) => { e.preventDefault(); }}
            aria-label={pg.isFavorited ? "Remove from saved" : "Save PG"}
          >
            <Heart className={`w-4 h-4 ${pg.isFavorited ? "fill-primary" : ""}`} aria-hidden="true" />
          </button>

          {/* Gender tag */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 text-foreground text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
              {pg.gender === "FEMALE" || pg.gender === "GIRLS" ? "Girls" : pg.gender === "MALE" || pg.gender === "BOYS" ? "Boys" : "Unisex"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Name & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {pg.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-bold text-amber-700">{pg.rating || 0}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-muted-foreground text-xs mb-3">
            <MapPin className="w-3 h-3 mr-1 shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-1">{areaName}, {cityName}</span>
          </div>

          {/* Amenity pills */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {hasFood && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <Utensils className="w-2.5 h-2.5" aria-hidden="true" /> Food
              </span>
            )}
            {hasWifi && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                <Wifi className="w-2.5 h-2.5" aria-hidden="true" /> WiFi
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              PG
            </span>
          </div>

          {/* Rent */}
          <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Starting from</p>
              <p className="font-bold text-foreground text-lg">
                {rentMin > 0 ? formatCurrency(rentMin) : "TBD"}
                <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
              </p>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 bg-primary/10 px-4 py-2 rounded-xl">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PopularPGs({ pgs = [] }: { pgs?: any[] }) {
  if (!pgs || pgs.length === 0) return null;
  return (
    <section className="section-padding bg-section-alt" aria-labelledby="popular-pgs-heading">
      <div className="container-custom">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-label" aria-hidden="true">Trending Now</span>
            <h2 id="popular-pgs-heading" className="section-heading">
              Popular PGs
            </h2>
            <p className="section-subtext">Most searched and highly rated accommodations</p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all shrink-0"
          >
            View all PGs
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Horizontal Carousel */}
        <div className="scroll-container hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {pgs.map((pg, index) => (
            <PGCarouselCard key={pg.id} pg={pg} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}
