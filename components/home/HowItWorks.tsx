"use client";

import { Search, SlidersHorizontal, Phone } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Search",
    description: "Enter a city or area. Set your budget, room type and food preference.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Filter & Save",
    description: "Refine by amenities, gender preference and room type, then save your favorites.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    number: "03",
    icon: Phone,
    title: "Contact the Owner",
    description: "Ask questions directly by WhatsApp or phone and arrange a visit with the owner.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

export function HowItWorks() {
  return (
    <section className="section-padding bg-section-alt" aria-labelledby="how-it-works-heading">
      <div className="container-custom">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label" aria-hidden="true">Simple Process</span>
          <h2 id="how-it-works-heading" className="section-heading mb-3">
            How PGBook Works
          </h2>
          <p className="section-subtext">
            Search, save listings, and contact the owner directly.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">

          {/* Connecting line (desktop only) */}
          <div
            className="hidden lg:block absolute top-11 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-border z-0"
            aria-hidden="true"
          />

          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              {/* Step circle */}
              <div className={`w-22 h-22 rounded-2xl ${step.bg} flex items-center justify-center mb-5 relative shadow-sm`}>
                <step.icon className={`w-8 h-8 ${step.color}`} aria-hidden="true" />
                <span className={`absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-foreground text-background text-xs font-extrabold flex items-center justify-center`}>
                  {step.number}
                </span>
              </div>

              <h3 className="font-bold text-foreground text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-48">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
