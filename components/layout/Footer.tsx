"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  explore: [
    { label: "All PGs", href: "/explore" },
    { label: "Popular Cities", href: "/cities" },
    { label: "Popular Areas", href: "/explore#localities" },
    { label: "Room Types", href: "/explore?roomType=personal" },
    { label: "Budget PGs", href: "/explore?budget=5000" },
    { label: "Girls PG", href: "/explore?gender=girls" },
    { label: "Boys PG", href: "/explore?gender=boys" },
    { label: "Co-Living", href: "/explore?type=co-living" },
  ],
  users: [
    { label: "Saved PGs", href: "/favorites" },
    { label: "Compare PGs", href: "/compare" },
    { label: "My Bookings", href: "/bookings" },
    { label: "Safety Guide", href: "/safety" },
    { label: "PG Guides", href: "/guides" },
  ],
  owners: [
    { label: "List Your PG", href: "/become-owner" },
    { label: "Owner Dashboard", href: "/owner/dashboard" },
    { label: "Host Guidelines", href: "/owner/guidelines" },
  ],
  company: [
    { label: "About PGBook", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
};

const CITIES = [
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Anand",
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/>
      </svg>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background mt-auto" aria-label="Site footer">
      <div className="container-custom pt-16 pb-8">

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">

          {/* Brand Column — spans 2 cols on lg */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group" aria-label="PGBook Home">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="white" fillOpacity="0.9"/>
                  <path d="M9 22V12H15V22" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-lg text-white">PGBook</span>
                <span className="text-[10px] text-white/50 font-medium">Discover. Compare. Stay.</span>
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              India&apos;s trusted PG discovery platform. Find your perfect accommodation by location, budget, room type and lifestyle.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-primary hover:text-white transition-all duration-200"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            {/* Cities Quick Links */}
            <div className="mt-6">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">PGs in Cities</p>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <Link
                    key={city}
                    href={`/explore?city=${city.toLowerCase()}`}
                    className="text-xs text-white/60 hover:text-primary transition-colors bg-white/8 px-2.5 py-1 rounded-md"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Explore</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-white/55 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">For Users</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.users.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-white/55 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-white font-semibold mb-4 mt-6 text-sm">For Owners</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.owners.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-white/55 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 mb-6">
              {FOOTER_LINKS.company.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-white/55 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-white/55 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center sm:text-left">
            © {currentYear} PGBook. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true"></div>
            <span className="text-white/40 text-xs">All systems operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
