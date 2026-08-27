"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "What is PGBook?",
    answer:
      "PGBook is a PG discovery platform for Gujarat. It helps students, working professionals, and new-city residents find verified PGs based on location, budget, room type, food, and amenities — without any broker or middleman.",
  },
  {
    question: "How do I find a PG on PGBook?",
    answer:
      "Use the search bar on the homepage. Enter your city or locality, select your budget and room type preference, and click 'Search PGs'. You can further refine results using filters on the explore page.",
  },
  {
    question: "Can I filter PGs by budget?",
    answer:
      "Yes. You can search by budget range using the Budget filter on the hero search or on the explore page. You can also browse the 'Browse by Budget' section on the homepage for pre-set ranges.",
  },
  {
    question: "Can I find girls-only or boys-only PGs?",
    answer:
      "Absolutely. Use the Gender filter on the explore page to filter for Girls PG, Boys PG, or Unisex PGs. You can also browse directly from the 'Girls PG' and 'Boys PG' sections on the homepage.",
  },
  {
    question: "Can I search for PGs near my college?",
    answer:
      "Yes. Use the 'Find PGs Near Your College' section on the homepage to search by college name. You can also use the 'Looking Near' field in the hero search bar.",
  },
  {
    question: "Can I compare PGs?",
    answer:
      "You can save PGs to your favorites list using the heart icon on any property card. A full side-by-side comparison feature is coming soon.",
  },
  {
    question: "How do I contact a PG owner?",
    answer:
      "On any PG detail page, you'll find a 'Contact Owner' button. You can message or call the owner directly — no broker or intermediary is involved.",
  },
  {
    question: "How can I list my PG on PGBook?",
    answer:
      "Click on 'List Your PG' in the navbar or visit the 'Become an Owner' page. Create a free account, submit your PG details, and your listing will be reviewed and published.",
  },
  {
    question: "How are listings verified?",
    answer:
      "Listings that display the 'Verified' badge have been reviewed by our team. Verification may include photo validation, address confirmation, and owner contact verification. Unverified listings are still shown but clearly labelled.",
  },
  {
    question: "Is PGBook free to use?",
    answer:
      "Yes, PGBook is completely free for users searching for PGs. There is no brokerage, no subscription, and no hidden charges. Listing fees for owners may apply in the future but will be clearly communicated.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section-padding bg-background" aria-labelledby="faq-heading">
      <div className="container-custom max-w-3xl">

        <div className="text-center mb-10">
          <span className="section-label" aria-hidden="true">Got Questions?</span>
          <h2 id="faq-heading" className="section-heading mb-3">
            Frequently Asked Questions
          </h2>
          <p className="section-subtext max-w-lg mx-auto">
            Everything you need to know about finding a PG on PGBook
          </p>
        </div>

        <div className="flex flex-col gap-3" role="list">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className={`bg-card rounded-2xl border transition-all duration-200 ${open === idx ? "border-primary/30 shadow-md" : "border-border/50"}`}
              role="listitem"
            >
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                aria-expanded={open === idx}
                aria-controls={`faq-answer-${idx}`}
                id={`faq-question-${idx}`}
              >
                <span className="font-semibold text-foreground text-sm md:text-base leading-snug">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: open === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <ChevronDown className={`w-5 h-5 transition-colors ${open === idx ? "text-primary" : "text-muted-foreground"}`} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === idx && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
