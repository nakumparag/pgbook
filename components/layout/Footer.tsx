"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  explore: [
    { label: "All PGs", href: "/explore" },
    { label: "Popular Cities", href: "/explore" },
    { label: "Popular Areas", href: "/explore#localities" },
    { label: "Room Types", href: "/explore?roomType=personal" },
    { label: "Budget PGs", href: "/explore?budget=under-5000" },
    { label: "Girls PG", href: "/explore?gender=girls" },
    { label: "Boys PG", href: "/explore?gender=boys" },
    { label: "Co-Living", href: "/explore?gender=unisex" },
  ],
  users: [
    { label: "Saved PGs", href: "/favorites" },
  ],
  owners: [
    { label: "List Your PG", href: "/become-owner" },
    { label: "Owner Dashboard", href: "/owner/dashboard" },
  ],
  company: [
    { label: "About PGBook", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const CITIES = [
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Anand",
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
                <span className="text-[10px] text-white/50 font-medium">Discover. Connect. Stay.</span>
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Discover PG listings across Gujarat by location, budget, room type and lifestyle.
            </p>

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
        </div>

      </div>
    </footer>
  );
}
