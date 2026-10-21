import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Target, Eye } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero */}
      <section className="pt-24 pb-16 bg-muted/30">
        <div className="container-custom text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-6 text-foreground">
            Making PG Hunting Simple.
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            PGBook helps students and working professionals discover PGs that match their location, budget, lifestyle and preferences.
          </p>
        </div>
      </section>

      {/* 2. Our Story */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">The Problem:</strong> Finding a suitable PG is often difficult because users have to search through multiple sources, verify information manually and contact multiple owners.
                </p>
                <p>
                  <strong className="text-foreground">The Solution:</strong> PGBook brings PG discovery into one organized platform, making the entire process seamless, transparent, and hassle-free.
                </p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                alt="Team working together" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 & 4. Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col items-start text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground">
                Make finding a comfortable and suitable place to stay simple, transparent and accessible.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col items-start text-left">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                Build India's trusted accommodation discovery platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. What We Offer & 6. Why PGBook */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-heading font-bold mb-4">Why PGBook?</h2>
            <p className="text-muted-foreground">
              We provide a comprehensive suite of features to ensure you find exactly what you're looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                "Admin-reviewed PG listings",
              "Smart search & Budget filtering",
              "Room sharing options",
              "Food / Non-Food filtering",
              "Location-based discovery",
              "Owner listings & direct contact",
              "Reviews and ratings",
              "Trusted & Transparent Information",
              "User Friendly Experience",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Who We Serve & 8. Future Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold mb-12">Who We Serve</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Students</h3>
              <p className="text-muted-foreground text-sm">Finding safe and comfortable environments near colleges.</p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Professionals</h3>
              <p className="text-muted-foreground text-sm">Convenient stays with great connectivity to workspaces.</p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">PG Owners</h3>
              <p className="text-muted-foreground text-sm">Helping PG owners connect with people looking for accommodation.</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto p-8 bg-card rounded-3xl border border-border shadow-sm">
            <h3 className="text-2xl font-bold mb-4">Our Future Vision</h3>
            <p className="text-muted-foreground mb-6">
              In the future, we plan to implement PG Booking, Online Payments, Rent Management, Tenant Management, AI Recommendations, and Property Management tools to create a complete ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-8">
            Looking for your next PG?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-primary font-bold">
                Explore PGs
              </Button>
            </Link>
            <Link href="/owner/add-pg">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold">
                Become a PG Owner
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-primary-foreground/80 font-medium">
            Own a PG? Submit a listing for admin review.
          </p>
        </div>
      </section>
    </div>
  );
}
