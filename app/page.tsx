import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { PopularCities } from "@/components/home/PopularCities";
import { PopularPGs } from "@/components/home/PopularPGs";
import { SuggestedPGs } from "@/components/home/SuggestedPGs";
import { HighestRatedPGs } from "@/components/home/HighestRatedPGs";

import { BrowseByRoomType } from "@/components/home/BrowseByRoomType";
import { StudentPGs } from "@/components/home/StudentPGs";
import { WorkingProfessionalPGs } from "@/components/home/WorkingProfessionalPGs";
import { GenderAndCoLiving } from "@/components/home/GenderAndCoLiving";
import { PGsNearColleges } from "@/components/home/PGsNearColleges";

import { PopularLocalities } from "@/components/home/PopularLocalities";
import { WhyPGBook } from "@/components/home/WhyChooseUs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustAndSafety } from "@/components/home/TrustAndSafety";
import { Testimonials } from "@/components/home/Testimonials";
import { BecomeOwner } from "@/components/home/BecomeOwner";
import { FAQ } from "@/components/home/FAQ";
import { SEOContent } from "@/components/home/SEOContent";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "PGBook — Find PGs in Ahmedabad, Surat & Gujarat | Discover. Compare. Stay.",
  description:
    "Find verified PGs in Ahmedabad, Surat, Vadodara, Rajkot and across Gujarat. Search by location, budget, room type and amenities. Girls PG, Boys PG, Co-Living, Student PG and Working Professional PG on PGBook.",
  openGraph: {
    title: "PGBook — Find PGs in Gujarat | Discover. Compare. Stay.",
    description:
      "Search verified PGs across Gujarat by location, budget, room type and amenities. No broker, no commission.",
    url: "https://pgbook.in",
    siteName: "PGBook",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PGBook — Find PGs in Gujarat",
    description: "Search verified PGs across Gujarat by location, budget, room type and amenities.",
  },
  alternates: {
    canonical: "https://pgbook.in",
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: pgs } = await supabase
    .from("pgs")
    .select(`
      id, slug, name, description, address, gender, rating, review_count, status, is_verified,
      cities ( name ), localities ( name ),
      rooms ( id, room_type, rent, total_beds, occupied_beds ),
      pg_images ( url, is_primary ),
      pg_amenities ( amenities ( id, name, icon, category ) )
    `)
    .eq("status", "APPROVED");

  return (
    <div className="flex flex-col min-h-screen gap-y-8 md:gap-y-12 pb-16">
      {/* 1. Hero with search */}
      <Hero />

      {/* 2. Popular Cities */}
      <PopularCities />

      {/* 17. Popular Localities */}
      <PopularLocalities />


      {/* 9. Browse By Room Type */}
      <BrowseByRoomType />

      {/* 12–14. Girls / Boys / Co-Living */}
      <GenderAndCoLiving pgs={pgs || []} />

      {/* 5. Popular PGs Carousel */}
      <PopularPGs pgs={pgs || []} />

      {/* 7. Highest Rated PGs */}
      <HighestRatedPGs pgs={pgs || []} />

      {/* 6. Suggested PGs */}
      <SuggestedPGs pgs={pgs || []} />

      {/* 10. Student PGs */}
      <StudentPGs pgs={pgs || []} />

      {/* 11. Working Professional PGs */}
      <WorkingProfessionalPGs pgs={pgs || []} />

      {/* 15. PGs Near Colleges */}
      <PGsNearColleges />


      {/* 18. Why PGBook */}
      <WhyPGBook />

      {/* 19. How It Works */}
      <HowItWorks />

      {/* 20. Trust & Safety */}
      <TrustAndSafety />

      {/* 21. Testimonials */}
      <Testimonials />

      {/* 22. Become an Owner */}
      <BecomeOwner />

      {/* 23. FAQ */}
      <FAQ />

      {/* 24. SEO Content */}
      <SEOContent />
    </div>
  );
}
