// The stable pgbook.vercel.app alias is indexable by Vercel. Generated
// deployment aliases are intentionally marked noindex by Vercel.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://pgbook.vercel.app").replace(/\/$/, "");

// PG Manager separate website / subdomain URL
// When NEXT_PUBLIC_PG_MANAGER_URL is set (e.g. "https://manager.pgbook.in"), use it.
// In development or when unconfigured, falls back cleanly to the /manager route.
export function getPgManagerUrl(path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  if (process.env.NEXT_PUBLIC_PG_MANAGER_URL) {
    return `${process.env.NEXT_PUBLIC_PG_MANAGER_URL.replace(/\/$/, "")}${cleanPath}`;
  }

  if (typeof window !== "undefined" && window.location) {
    const host = window.location.host;
    // If already on manager subdomain, just return path
    if (host.startsWith("manager.")) {
      return cleanPath || "/";
    }
    return `${window.location.origin}/manager${cleanPath}`;
  }

  return `${siteUrl}/manager${cleanPath}`;
}

export function getPGBookUrl(path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  if (typeof window !== "undefined" && window.location) {
    const host = window.location.host;
    if (host.startsWith("manager.")) {
      // Point back to the main domain
      const mainHost = host.replace(/^manager\./, "");
      return `${window.location.protocol}//${mainHost}${cleanPath}`;
    }
    return `${window.location.origin}${cleanPath}`;
  }

  return `${siteUrl}${cleanPath}`;
}
