import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";

const publicRoutes = [
  "",
  "/explore",
  "/about",
  "/become-owner",
  "/contact",
  "/cookies",
  "/faq",
  "/how-it-works",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("pgs")
    .select("slug")
    .eq("status", "APPROVED");

  return [
    ...publicRoutes.map((path) => ({ url: `${siteUrl}${path}` })),
    ...(listings || []).map(({ slug }) => ({ url: `${siteUrl}/pg/${slug}` })),
  ];
}
