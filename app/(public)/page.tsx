import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { PopularCities } from "@/components/home/PopularCities";
import { PopularPGs } from "@/components/home/PopularPGs";
import { WhyPGBook } from "@/components/home/WhyChooseUs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustAndSafety } from "@/components/home/TrustAndSafety";
import { BecomeOwner } from "@/components/home/BecomeOwner";
import { FAQ } from "@/components/home/FAQ";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "PGBook — Find PGs in Ahmedabad, Surat & Gujarat | Discover. Connect. Stay.",
  description:
    "Discover PG listings in Ahmedabad, Surat, Vadodara, Rajkot and across Gujarat. Search by location, budget, room type and amenities on PGBook.",
  openGraph: {
    title: "PGBook — Find PGs in Gujarat | Discover. Connect. Stay.",
    description:
      "Search PG listings across Gujarat by location, budget, room type and amenities. Contact owners directly.",
    url: siteUrl,
    siteName: "PGBook",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PGBook — Find PGs in Gujarat",
    description: "Search PG listings across Gujarat by location, budget, room type and amenities.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  let pgs: any[] = [];
  try {
    const { data, error } = await supabase
      .from("pgs")
      .select(`
        id, slug, name, description, address, gender, rating, review_count, status, is_publicly_listed, is_verified,
        cities ( name ), localities ( name ),
        rooms ( id, room_type, rent, total_beds, occupied_beds ),
        pg_images ( url, is_primary ),
        pg_amenities ( amenities ( id, name, icon, category ) )
      `)
      .eq("status", "APPROVED")
      .eq("is_publicly_listed", true);

    if (error) {
      const { data: fallbackData } = await supabase
        .from("pgs")
        .select(`
          id, slug, name, description, address, gender, rating, review_count, status, is_verified,
          cities ( name ), localities ( name ),
          rooms ( id, room_type, rent, total_beds, occupied_beds ),
          pg_images ( url, is_primary ),
          pg_amenities ( amenities ( id, name, icon, category ) )
        `)
        .eq("status", "APPROVED");
      pgs = (fallbackData || []).filter((p: any) => p.is_publicly_listed !== false);
    } else {
      pgs = data || [];
    }
  } catch {
    pgs = [];
  }

  return (
    <div className="flex flex-col min-h-screen gap-y-8 md:gap-y-12 pb-16">
      {/* 1. Hero with search */}
      <Hero />

      {/* 2. Popular Cities */}
      <PopularCities />

      {/* Current listings, shown once so thin inventory never repeats across empty categories. */}
      <PopularPGs pgs={pgs || []} />

      {/* 18. Why PGBook */}
      <WhyPGBook />

      {/* 19. How It Works */}
      <HowItWorks />

      {/* 20. Trust & Safety */}
      <TrustAndSafety />

      {/* 22. Become an Owner */}
      <BecomeOwner />

      {/* 23. FAQ */}
      <FAQ />

    </div>
  );
}
