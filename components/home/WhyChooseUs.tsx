"use client";

import { Search, SlidersHorizontal, ShieldCheck, BarChart3, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

const BENEFITS = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Search by city, area or landmark. Filters help you narrow down the listings that fit.",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  },
  {
    icon: ShieldCheck,
    title: "Admin-reviewed listings",
    description: "Listings marked PGBook Reviewed have passed an admin review. Please contact the owner and inspect a property before paying.",
    color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
  },
  {
    icon: SlidersHorizontal,
    title: "Transparent Info",
    description: "Compare listed rent, available deposit details, amenities, house rules and room options.",
    color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
  },
  {
    icon: Users,
    title: "Direct Owner Contact",
    description: "Send an in-app inquiry to the owner. No broker, no middleman, no commission.",
    color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  },
  {
    icon: BarChart3,
    title: "Save PGs",
    description: "Save listings you like and find them later in your favorites.",
    color: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
  },
  {
    icon: MapPin,
    title: "Location Discovery",
    description: "Browse by city and area to find listings in places that work for you.",
    color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  },
];

export function WhyPGBook() {
  return (
    <section className="section-padding bg-background" aria-labelledby="why-pgbook-heading">
      <div className="container-custom">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label" aria-hidden="true">Our Promise</span>
          <h2 id="why-pgbook-heading" className="section-heading mb-3">
            Why Choose PGBook?
          </h2>
          <p className="section-subtext">
            We&apos;re building the most complete and honest PG discovery platform in Gujarat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: idx * 0.07, duration: 0.4 }}
              className="flex gap-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${benefit.color}`}>
                <benefit.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base mb-1.5">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
