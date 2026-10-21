import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin-login",
        "/api",
        "/auth",
        "/bookings",
        "/dashboard",
        "/favorites",
        "/forgot-password",
        "/login",
        "/owner",
        "/profile",
        "/reset-password",
        "/signup",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
