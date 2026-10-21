import { Search, SlidersHorizontal, Map, Home, UserPlus, CheckCircle2, Building, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-16 bg-muted/30">
        <div className="container-custom text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-6 text-foreground">
            How It Works
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Whether you're looking for a PG or renting out your property, we make the process simple and transparent.
          </p>
        </div>
      </section>

      {/* For Users */}
      <section className="py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold mb-4">For Users</h2>
            <p className="text-muted-foreground">Find your perfect stay in 4 simple steps.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-border border-dashed border-2 -z-10" />
            
            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm relative z-10">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Search</h3>
              <p className="text-muted-foreground text-sm">
                Enter your desired city or location to discover a wide range of verified PGs, hostels, and co-living spaces.
              </p>
              <div className="mt-6 text-primary flex justify-center">
                <Search className="w-8 h-8 opacity-50" />
              </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm relative z-10">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Compare</h3>
              <p className="text-muted-foreground text-sm">
                Use smart filters like budget, amenities, sharing type, and food preferences to narrow down your options.
              </p>
              <div className="mt-6 text-primary flex justify-center">
                <SlidersHorizontal className="w-8 h-8 opacity-50" />
              </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm relative z-10">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Visit</h3>
              <p className="text-muted-foreground text-sm">
                Contact the PG owner by WhatsApp or phone to ask questions and arrange a visit.
              </p>
              <div className="mt-6 text-primary flex justify-center">
                <Map className="w-8 h-8 opacity-50" />
              </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm relative z-10">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                4
              </div>
              <h3 className="text-xl font-bold mb-3">Choose</h3>
              <p className="text-muted-foreground text-sm">
                Finalize the deal with the owner and move into your new home seamlessly.
              </p>
              <div className="mt-6 text-primary flex justify-center">
                <Home className="w-8 h-8 opacity-50" />
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/explore">
              <Button size="lg" className="font-bold">Start Exploring</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold mb-4">For PG Owners</h2>
            <p className="text-muted-foreground">List your property and reach thousands of verified tenants.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-border border-dashed border-2 -z-10" />
            
            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm relative z-10">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Register</h3>
              <p className="text-muted-foreground text-sm">
                Create an owner account on PGBook. It takes less than two minutes.
              </p>
              <div className="mt-6 text-accent flex justify-center">
                <UserPlus className="w-8 h-8 opacity-50" />
              </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm relative z-10">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Add PG</h3>
              <p className="text-muted-foreground text-sm">
                Use our simple wizard to add details about your PG, amenities, rooms, rules, and high-quality photos.
              </p>
              <div className="mt-6 text-accent flex justify-center">
                <Building className="w-8 h-8 opacity-50" />
              </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm relative z-10">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Get Verified</h3>
              <p className="text-muted-foreground text-sm">
                Our team reviews your listing to add a 'Verified' badge, building trust with potential tenants.
              </p>
              <div className="mt-6 text-accent flex justify-center">
                <CheckCircle2 className="w-8 h-8 opacity-50" />
              </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm relative z-10">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg">
                4
              </div>
              <h3 className="text-xl font-bold mb-3">Connect</h3>
              <p className="text-muted-foreground text-sm">
                Receive direct inquiries from interested tenants by phone or WhatsApp.
              </p>
              <div className="mt-6 text-accent flex justify-center">
                <MessageSquare className="w-8 h-8 opacity-50" />
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/owner/add-pg">
              <Button size="lg" className="font-bold">Add Your Property</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
