"use client";

import Link from "next/link";
import { PlusCircle, BedDouble, ListChecks, MessageCircle, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const OWNER_BENEFITS = [
  { icon: PlusCircle, text: "Create your listing in minutes" },
  { icon: BedDouble, text: "Add multiple room types & pricing" },
  { icon: ListChecks, text: "Showcase all amenities & rules" },
  { icon: MessageCircle, text: "Receive inquiries directly" },
  { icon: LayoutDashboard, text: "Manage listings from your dashboard" },
];

export function BecomeOwner() {
  return (
    <section className="section-padding bg-section-alt" aria-labelledby="become-owner-heading">
      <div className="container-custom">
        <div className="bg-linear-to-br from-primary to-amber-500 rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden relative">

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 translate-x-1/3 -translate-y-1/3" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/10 -translate-x-1/3 translate-y-1/3" aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left: Content */}
            <div>
              <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                For PG Owners
              </span>
              <h2 id="become-owner-heading" className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                List Your PG on PGBook
              </h2>
              <p className="text-white/80 text-base leading-relaxed mb-6 max-w-md">
                Reach thousands of people actively searching for accommodation in your area. Free to list. No commission.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  asChild
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 h-14 px-8 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                  aria-label="Become a PG owner on PGBook"
                >
                  <Link href="/become-owner">
                    Become a PG Owner <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  className="bg-background text-foreground hover:bg-muted h-14 px-8 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                  aria-label="List your PG now"
                >
                  <Link href="/owner/add-pg">
                    List Your PG Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Benefits list */}
            <div>
              <ul className="flex flex-col gap-3" aria-label="Owner benefits">
                {OWNER_BENEFITS.map((benefit) => (
                  <li key={benefit.text} className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 border border-white/20">
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
