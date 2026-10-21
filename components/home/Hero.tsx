"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HeroSearch } from "@/components/home/HeroSearch";

export function Hero() {
  return (
    <section
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
      aria-label="Find your perfect PG"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=90"
          alt="Premium PG interior with modern furnishings"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay — dark at top/bottom for text, lighter in center */}
        <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/55 to-black/80" />
        {/* Subtle orange tint at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-primary/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom w-full py-32 md:py-40">
        <div className="max-w-4xl mx-auto text-center">

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold uppercase tracking-widest mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            PG Discovery Platform for Gujarat
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6"
          >
            Find a PG that<br />
            <span className="bg-linear-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent [-webkit-background-clip:text]">
              feels like home.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Search PG listings by location, budget, room type and lifestyle.
            Contact owners directly. No brokerage.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <HeroSearch />
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-10"
          >
            {[
              { icon: "⌕", text: "Easy Search" },
              { icon: "★", text: "Guest Reviews" },
              { icon: "⚡", text: "Direct Owner Contact" },
              { icon: "₹", text: "Zero Brokerage" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
                <span className="text-primary font-bold text-base" aria-hidden="true">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,60 L0,30 Q360,0 720,30 Q1080,60 1440,30 L1440,60 Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </section>
  );
}
