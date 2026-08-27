"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function GenderSection({
  title,
  subtitle,
  label,
  gender,
  bgClass,
  accentClass,
  image,
  pgs,
}: {
  title: string;
  subtitle: string;
  label: string;
  gender: string;
  bgClass: string;
  accentClass: string;
  image: string;
  pgs: any[];
}) {
  return (
    <div className={`rounded-3xl overflow-hidden ${bgClass} p-6 md:p-8`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className={`text-xs font-bold uppercase tracking-widest ${accentClass} mb-1 block`}>
            {label}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        </div>
        <Link
          href={`/explore?gender=${gender}`}
          className={`flex items-center gap-1.5 text-sm font-semibold ${accentClass} hover:gap-2.5 transition-all shrink-0`}
        >
          View all <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Horizontal scroll mini cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {/* Large feature card */}
        <Link
          href={`/explore?gender=${gender}`}
          className="group relative w-48 md:w-56 shrink-0 rounded-2xl overflow-hidden aspect-3/4 bg-muted"
          aria-label={`Browse all ${title}`}
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="224px"
          />
          <div className="absolute inset-0 img-overlay" aria-hidden="true" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-bold text-sm">{title}</p>
            <p className="text-white/70 text-xs mt-0.5">Explore all →</p>
          </div>
        </Link>

        {/* PG mini cards */}
        {pgs.map((pg) => {
          const primaryImage =
            pg.pg_images?.find((img: any) => img.is_primary)?.url ||
            pg.pg_images?.[0]?.url ||
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80";

          const rentMin = pg.rooms?.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
          const areaName = pg.localities?.name || "";

          return (
            <Link
              key={pg.id}
              href={`/pg/${pg.slug}`}
              className="group w-44 shrink-0 bg-card rounded-2xl border border-border/50 overflow-hidden card-hover shadow-sm flex flex-col"
              aria-label={`View ${pg.name}`}
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                <Image
                  src={primaryImage}
                  alt={pg.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="176px"
                />
                {pg.is_verified && (
                  <div className="absolute top-2 left-2">
                    <span className="badge-verified text-[9px] px-1.5 py-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" aria-hidden="true" /> Verified
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h4 className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
                  {pg.name}
                </h4>
                <div className="flex items-center text-muted-foreground text-[10px] mb-1">
                  <MapPin className="w-2.5 h-2.5 mr-0.5 shrink-0" aria-hidden="true" />
                  <span className="line-clamp-1">{areaName}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span className="text-[10px] font-bold text-foreground">{pg.rating || 0}</span>
                </div>
                <p className="font-bold text-primary text-xs mt-auto">
                  {rentMin > 0 ? formatCurrency(rentMin) : "TBD"}
                  {rentMin > 0 && <span className="text-[9px] font-normal text-muted-foreground">/mo</span>}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function GenderAndCoLiving({ pgs = [] }: { pgs?: any[] }) {
  if (!pgs || pgs.length === 0) return null;
  const girlsPGs = pgs.filter((pg) => pg.gender === "FEMALE" || pg.gender === "GIRLS").slice(0, 3);
  const boysPGs = pgs.filter((pg) => pg.gender === "MALE" || pg.gender === "BOYS").slice(0, 3);
  // Assuming CO_LIVING is a gender preference in the updated schema
  const coLivingPGs = pgs.filter((pg) => pg.gender === "CO_LIVING").slice(0, 3);

  return (
    <section className="section-padding bg-background" aria-labelledby="gender-coliving-heading">
      <div className="container-custom">

        <div className="text-center mb-10">
          <span className="section-label" aria-hidden="true">By Preference</span>
          <h2 id="gender-coliving-heading" className="section-heading">
            Girls, Boys &amp; Co-Living
          </h2>
          <p className="section-subtext max-w-lg mx-auto">
            Find PGs that match your gender preference or join a vibrant co-living community
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <GenderSection
            title="Girls PG"
            subtitle="Safe, secure, and women-friendly spaces"
            label="For Women"
            gender="girls"
            bgClass="bg-rose-50 dark:bg-rose-950/20"
            accentClass="text-rose-600 dark:text-rose-400"
            image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"
            pgs={girlsPGs.length > 0 ? girlsPGs : pgs.slice(0, 3)}
          />

          <GenderSection
            title="Boys PG"
            subtitle="Modern and comfortable spaces for men"
            label="For Men"
            gender="boys"
            bgClass="bg-blue-50 dark:bg-blue-950/20"
            accentClass="text-blue-600 dark:text-blue-400"
            image="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&q=80"
            pgs={boysPGs.length > 0 ? boysPGs : pgs.slice(0, 3)}
          />

          <GenderSection
            title="Co-Living Spaces"
            subtitle="Community, comfort, and professional networking"
            label="Co-Living"
            gender="co-living"
            bgClass="bg-violet-50 dark:bg-violet-950/20"
            accentClass="text-violet-600 dark:text-violet-400"
            image="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
            pgs={coLivingPGs.length > 0 ? coLivingPGs : pgs.slice(0, 3)}
          />
        </div>

      </div>
    </section>
  );
}
