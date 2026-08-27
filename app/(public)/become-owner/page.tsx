"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function AccountStepContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-border shadow-sm text-center max-w-lg mx-auto py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mb-2">Account Confirmed</h2>
        <p className="text-muted-foreground mb-8">
          You are signed in as <span className="font-bold text-foreground">{user.email}</span>. Let's continue to set up your owner profile.
        </p>
        <Button onClick={() => router.push("/become-owner/verification")} size="lg" className="rounded-xl w-full py-6 text-base font-bold">
          Continue to Verification <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  // Not signed in
  return (
    <div className="bg-card rounded-3xl p-8 border border-border shadow-sm max-w-lg mx-auto text-center py-12">
      <h2 className="text-3xl font-black mb-4">Join as a PG Owner</h2>
      <p className="text-muted-foreground mb-8">
        Create an account to list your property and start receiving bookings from verified tenants.
      </p>
      
      <div className="space-y-4">
        <Button asChild size="lg" className="rounded-xl w-full py-6 text-base font-bold bg-primary hover:bg-primary/90">
          <Link href="/signup?redirect=/become-owner">Create Account</Link>
        </Button>
        
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold text-muted-foreground">
            <span className="bg-card px-2">Already have an account?</span>
          </div>
        </div>

        <Button asChild variant="outline" size="lg" className="rounded-xl w-full py-6 text-base font-bold border-2">
          <Link href="/login?redirect=/become-owner">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

// Ensure Check is imported or redefined if needed for the UI
import { Check } from "lucide-react";

export default function AccountStepPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <AccountStepContent />
    </Suspense>
  );
}
