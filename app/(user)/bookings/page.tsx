"use client";

import Link from "next/link";
import { Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
  return (
    <div className="flex flex-col min-h-[60vh] py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-heading font-black mb-8 text-foreground">
          My Bookings
        </h1>
        
        <div className="bg-card rounded-3xl border border-border flex flex-col items-center justify-center p-12 text-center min-h-100">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No bookings yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            You haven&apos;t made any visit requests or bookings. Start exploring properties to find your next stay.
          </p>
          <Link href="/explore">
            <Button size="lg" className="font-bold">
              <Search className="w-5 h-5 mr-2" />
              Find a PG
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
