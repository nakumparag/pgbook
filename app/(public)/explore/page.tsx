 
import { Suspense } from "react";
import type { Metadata } from "next";
import ExploreContent from "./ExploreContent";
import { siteUrl } from "@/lib/site";

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "";
  const gender = typeof params.gender === "string" ? params.gender : "";
  const budget = typeof params.budget === "string" ? params.budget : "";
  const roomType = typeof params.roomType === "string" ? params.roomType : "";

  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : "Gujarat";

  const parts: string[] = [];
  if (gender === "girls") parts.push("Girls PG");
  else if (gender === "boys") parts.push("Boys PG");
  else parts.push("PG");
  if (city) parts.push(`in ${cityName}`);
  else parts.push("across Gujarat");
  if (budget === "under-7000") parts.push("under ₹7,000");
  if (roomType === "personal") parts.push("Private Room");

  const title = `${parts.join(" ")} | PGBook`;
  const description = `Find ${gender === "girls" ? "girls'" : gender === "boys" ? "boys'" : ""} PG listings${city ? ` in ${cityName}` : " across Gujarat"}${budget ? ` within budget` : ""}. Filter rooms, amenities and food options. Contact owners directly.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/explore${city ? `?city=${encodeURIComponent(city)}` : ""}`,
      siteName: "PGBook",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/explore${city ? `?city=${encodeURIComponent(city)}` : ""}`,
    },
  };
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-16 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading PGs...</div>
        </div>
      }
    >
      <ExploreContent searchParams={searchParams} />
    </Suspense>
  );
}
