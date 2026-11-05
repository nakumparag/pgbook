"use client";

import Link from "next/link";
import { PlusCircle, BedDouble, ListChecks, MessageCircle, LayoutDashboard, ArrowRight, Building, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPgManagerUrl } from "@/lib/site";

const OWNER_BENEFITS = [
  { icon: PlusCircle, text: "List your property to receive student inquiries directly" },
  { icon: BedDouble, text: "Multi-property floor & bed vacancy tracking on PG Manager" },
  { icon: ListChecks, text: "Automated monthly rent invoicing & UPI receipts" },
  { icon: MessageCircle, text: "Staff attendance, maintenance tickets & visitor desk" },
  { icon: LayoutDashboard, text: "Live profit & loss statement with 1-click CSV exports" },
];

export function BecomeOwner() {
  const pgManagerUrl = getPgManagerUrl();

  return (
    <section className="section-padding bg-section-alt" aria-labelledby="become-owner-heading">
      <div className="container-custom">
        <div className="bg-gradient-to-br from-primary via-orange-600 to-amber-600 rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden relative shadow-xl">

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 translate-x-1/3 -translate-y-1/3" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/10 -translate-x-1/3 translate-y-1/3" aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left: Content */}
            <div>
              <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                For PG & Hostel Owners
              </span>
              <h2 id="become-owner-heading" className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4 font-heading">
                List on PGBook. Run on PG Manager.
              </h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                Get discovered by thousands of students across Gujarat on PGBook, while running your complete operations on the separate PG Manager SaaS.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  asChild
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 h-13 px-6 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                  aria-label="Launch PG Manager"
                >
                  <a href={pgManagerUrl} target="_blank" rel="noopener noreferrer">
                    <Building className="mr-2 w-4 h-4 text-primary" />
                    Launch PG Manager <ArrowUpRight className="ml-1.5 w-4 h-4" />
                  </a>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 h-13 px-6 rounded-xl font-bold text-sm shadow-md transition-all"
                  aria-label="List your PG now"
                >
                  <Link href="/become-owner">
                    List PG on PGBook <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Benefits list */}
            <div>
              <ul className="flex flex-col gap-3" aria-label="Owner benefits">
                {OWNER_BENEFITS.map((benefit) => (
                  <li key={benefit.text} className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 border border-white/20 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-4.5 h-4.5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-white font-semibold text-sm">{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
