import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  BedDouble,
  Wallet,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OwnerOnboardingForm } from "./OwnerOnboardingForm";

export const metadata: Metadata = {
  title: "List Your PG & Become an Owner | PGBook",
  description:
    "Manage your PG accommodations, beds, tenants, and collections with PG Business Manager. Optionally list on PGBook.",
};

export const dynamic = "force-dynamic";

export default async function BecomeOwnerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAlreadyOwner = false;
  let profileData: any = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, phone, full_name")
      .eq("id", user.id)
      .maybeSingle();

    profileData = profile;

    const { count: pgCount } = await supabase
      .from("pgs")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    if (profile?.role === "OWNER" || (pgCount && pgCount > 0)) {
      isAlreadyOwner = true;
    }
  }

  return (
    <div className="min-h-screen py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PG Business Operating System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-foreground">
            Manage Your PG Like a Pro
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            One platform for floors, rooms, beds, tenants, automated rent collections, and digital KYC.
            Manage privately or optionally list on PGBook with a single toggle.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto font-bold">
              <BedDouble className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">Bed Allocation</h3>
            <p className="text-[11px] text-muted-foreground">Floors, rooms, and live bed occupancy</p>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">Rent & Dues</h3>
            <p className="text-[11px] text-muted-foreground">Automated rent invoices and ledger</p>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">Digital KYC</h3>
            <p className="text-[11px] text-muted-foreground">Tenant profiles, check-in & check-out</p>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mx-auto font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">Real-time P&L</h3>
            <p className="text-[11px] text-muted-foreground">Revenue, expenses, and net profit</p>
          </div>
        </div>

        {/* State 1: Not Logged In */}
        {!user && (
          <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-12 shadow-xl text-center max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                Sign in to manage your PG
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Use your existing PGBook account or create a new one. The same account works on both PGBook and PG Manager.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg" className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                <Link href="/login?next=/become-owner">
                  Sign In to Continue
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold">
                <Link href="/signup?next=/become-owner">
                  Create Free Account
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* State 2: Already an Owner */}
        {user && isAlreadyOwner && (
          <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-12 shadow-xl text-center max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                You are an authorized PG Owner
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your account is fully activated. You can manage your properties, rooms, beds, and finances in PG Manager.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg" className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md gap-2">
                <Link href="/owner/dashboard">
                  <span>Open PG Manager Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold">
                <Link href="/owner/add-pg">
                  Add New Property
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* State 3: Logged In as Normal User -> Show Quick Onboarding Form */}
        {user && !isAlreadyOwner && (
          <OwnerOnboardingForm
            initialPhone={profileData?.phone || ""}
            initialName={profileData?.full_name || ""}
          />
        )}
      </div>
    </div>
  );
}
