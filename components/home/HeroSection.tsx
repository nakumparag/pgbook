"use client";

import { motion } from "framer-motion";
import { SearchBar } from "./SearchBar";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[88vh]">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-50/60 to-background dark:from-[#0d0d18] dark:to-background" />
        <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-500/8 rounded-full blur-[140px] blob" />
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-violet-500/8 rounded-full blur-[140px] blob" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 hero-grid opacity-[0.03] dark:opacity-[0.02]" />
      </div>

      <div className="container relative z-10 text-center">
        <div className="max-w-3xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-8 border border-indigo-100 dark:border-indigo-500/20"
          >
            <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: "16px", lineHeight: 1, fontVariationSettings: "'FILL' 1" }}>verified</span>
            10,000+ Verified PGs across Gujarat
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-[68px] font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Find Your{" "}
            <span className="text-indigo-600 dark:text-indigo-400">Perfect PG</span>
            <br />
            <span className="text-foreground/80">Without the Hassle</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Discover verified PGs, hostels, and co-living spaces tailored for students and working professionals.
            Zero brokerage. 100% peace of mind.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-12"
          >
            <SearchBar />
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground font-medium"
          >
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: "20px", lineHeight: 1, fontVariationSettings: "'FILL' 1", color: "var(--color-success, #16A34A)" }}>verified_user</span>
              <span>Verified Properties</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: "20px", lineHeight: 1, fontVariationSettings: "'FILL' 1" }} className="text-indigo-500">location_city</span>
              <span>8+ Top Cities</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: "20px", lineHeight: 1, fontVariationSettings: "'FILL' 1" }} className="text-amber-500">bolt</span>
              <span>Instant Booking</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Material Symbols Rounded'", fontSize: "20px", lineHeight: 1, fontVariationSettings: "'FILL' 1" }} className="text-rose-500">favorite</span>
              <span>Zero Brokerage</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
