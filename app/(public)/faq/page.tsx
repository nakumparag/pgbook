import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is PGBook?",
        a: "PGBook is a specialized discovery platform designed to help students and working professionals find suitable Paying Guest (PG) accommodations, Hostels, and Co-living spaces based on their preferences like budget, location, and amenities."
      },
      {
        q: "Who can use PGBook?",
        a: "Anyone looking for temporary or long-term accommodation can use PGBook. This includes students moving to a new city, working professionals, and property owners looking to list their spaces."
      },
      {
        q: "Is PGBook free?",
        a: "Yes! Searching for PGs and contacting owners on PGBook is completely free for users looking for accommodation."
      }
    ]
  },
  {
    category: "PG Owners",
    questions: [
      {
        q: "How can I list my PG?",
        a: "You can click on 'Become a PG Owner' in the navigation bar, sign up as a property owner, and follow the simple 4-step wizard to add your property details, location, amenities, and photos."
      },
      {
        q: "How does PG verification work?",
        a: "Once you submit a listing, our team reviews the details and photos. A 'Verified' badge is added once we authenticate the property information."
      },
      {
        q: "Can I add multiple PGs?",
        a: "Yes, property owners can manage multiple listings from a single dashboard."
      }
    ]
  },
  {
    category: "Users",
    questions: [
      {
        q: "How do I search for a PG?",
        a: "You can use the search bar on our homepage to look for specific cities, or visit the 'Explore PGs' page to use detailed filters for budget, sharing type, gender, and amenities."
      },
      {
        q: "Can I save PGs?",
        a: "Yes, authenticated users can click the heart icon on any PG card to save it to their 'Favorites' for easy access later."
      },
      {
        q: "How do I arrange a visit?",
        a: "Open a PG listing and contact the owner by WhatsApp or phone to ask questions and arrange a visit directly."
      },
      {
        q: "How do I contact an owner?",
        a: "Open the PG listing and choose Contact Owner to reach them by WhatsApp or phone."
      }
    ]
  },
  {
    category: "Trust & Safety",
    questions: [
      {
        q: "How are listings verified?",
        a: "Listings are cross-checked by our internal team through documentation and sometimes physical verification to ensure safety and authenticity."
      },
      {
        q: "How can I report a listing?",
        a: "If you find inappropriate content or a fake listing, you can click the 'Report' button at the bottom of the PG details page."
      }
    ]
  },
  {
    category: "Payments",
    questions: [
      {
        q: "Does PGBook handle rent payments?",
        a: "Currently, PGBook operates purely as a discovery platform. All financial transactions, including rent and security deposits, are handled directly between you and the property owner. In the future, we plan to introduce secure online rent payments."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-16 bg-muted/30">
        <div className="container-custom text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-6 text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Everything you need to know about PGBook.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container-custom max-w-3xl">
          {faqs.map((group, idx) => (
            <div key={idx} className="mb-12 last:mb-0">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border pb-2">
                {group.category}
              </h2>
              <Accordion type="multiple" className="space-y-4">
                {group.questions.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${idx}-${i}`} className="bg-card border border-border rounded-xl px-6">
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-4 text-base">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <div className="mt-16 bg-primary/10 rounded-3xl p-8 text-center border border-primary/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <Link href="/contact">
              <Button size="lg" className="font-bold">
                Get in touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
