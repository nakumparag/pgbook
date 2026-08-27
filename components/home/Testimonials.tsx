"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// DEMO DATA — replace with real Supabase reviews in production
const TESTIMONIALS = [
  {
    name: "Rahul Sharma",
    role: "Software Engineer",
    city: "Ahmedabad",
    userType: "Working Professional",
    initials: "RS",
    rating: 5,
    review:
      "Found a great co-living space near my office within 2 days of using PGBook. The filters made it really easy to narrow down by budget and amenities. Highly recommend.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    name: "Priya Patel",
    role: "Student at Nirma University",
    city: "Ahmedabad",
    userType: "Student",
    initials: "PP",
    rating: 5,
    review:
      "As a girl moving to a new city for college, I was worried about finding a safe PG. The verified listings gave me so much confidence. Found an amazing girls PG near campus.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    name: "Amit Kumar",
    role: "Sales Manager",
    city: "Surat",
    userType: "Working Professional",
    initials: "AK",
    rating: 4,
    review:
      "Very smooth experience. Browsed options in the morning, called the owner directly, visited in the afternoon, and confirmed by evening. No broker hassle at all.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Sneha Joshi",
    role: "Student at Gujarat University",
    city: "Ahmedabad",
    userType: "Student",
    initials: "SJ",
    rating: 5,
    review:
      "The area search is super helpful. I found multiple PG options within 10 minutes of my college. The food-included filter saved me a lot of time.",
    gradient: "from-amber-500 to-orange-600",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? TESTIMONIALS.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1));

  return (
    <section className="section-padding bg-background" aria-labelledby="testimonials-heading">
      <div className="container-custom">

        <div className="text-center mb-10">
          <span className="section-label" aria-hidden="true">Real Stories</span>
          {/* DEMO DATA notice for dev */}
          <p className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded inline-block mb-2">
            [DEMO DATA — replace with real reviews]
          </p>
          <h2 id="testimonials-heading" className="section-heading">
            What Our Users Say
          </h2>
          <p className="section-subtext max-w-lg mx-auto">
            Real experiences from students and professionals who found their home on PGBook
          </p>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3" aria-label={`${t.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="text-sm text-foreground leading-relaxed flex-1 mb-4">
                &ldquo;{t.review}&rdquo;
              </p>

              {/* User */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className={`w-10 h-10 rounded-full bg-linear-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col bg-card rounded-2xl p-5 border border-border/50 shadow-sm"
              >
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= TESTIMONIALS[current].rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  &ldquo;{TESTIMONIALS[current].review}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${TESTIMONIALS[current].gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {TESTIMONIALS[current].initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{TESTIMONIALS[current].name}</p>
                    <p className="text-xs text-muted-foreground">{TESTIMONIALS[current].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary w-5" : "bg-border"}`}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
