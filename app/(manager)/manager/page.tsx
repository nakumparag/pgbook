import Link from "next/link";
import {
  Building2,
  BedDouble,
  Users,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Receipt,
  UserCheck,
  ClipboardList,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManagerHeader } from "@/components/manager/ManagerHeader";
import { ManagerFooter } from "@/components/manager/ManagerFooter";

export default function PGManagerLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ManagerHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/60">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen PG Business Operating System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-heading leading-tight max-w-4xl mx-auto">
              Manage multiple PGs with{" "}
              <span className="text-primary underline decoration-primary/30 underline-offset-8">
                zero chaos.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Consolidated multi-property dashboard, real-time bed inventory, automated rent invoicing, staff attendance, and profit & loss analytics.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl font-bold px-8 h-12 text-sm shadow-md gap-2 w-full sm:w-auto">
                <Link href="/manager/signup">
                  Start 14-Day Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold px-6 h-12 text-sm w-full sm:w-auto">
                <Link href="/manager/login">
                  Sign In to Dashboard
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Instant Property Setup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Supabase Cloud Security
              </span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE KPI STRIP PREVIEW */}
        <section className="py-12 bg-muted/20 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bed Allocation</span>
                <p className="text-2xl font-black text-foreground mt-1">100% Atomic</p>
                <p className="text-xs text-muted-foreground mt-0.5">Zero double-booking guarantee</p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rent Invoicing</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">1-Click Bulk</p>
                <p className="text-xs text-muted-foreground mt-0.5">Automated UPI payment receipts</p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Staff & Attendance</span>
                <p className="text-2xl font-black text-primary mt-1">Real-Time</p>
                <p className="text-xs text-muted-foreground mt-0.5">Wardens, cooks, security logs</p>
              </div>
              <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">P&L Financials</span>
                <p className="text-2xl font-black text-foreground mt-1">Live Net Income</p>
                <p className="text-xs text-muted-foreground mt-0.5">Collections minus operating costs</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6 CORE PILLARS */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Engineered for Scale</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Everything required to run 1 to 50+ PG properties
            </p>
            <p className="text-sm text-muted-foreground">
              Built on production-grade PostgreSQL constraints with independent operational and financial ledgers per building.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-foreground">Multi-Property Switching</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seamlessly toggle between your consolidated business portfolio or drill down into individual PG buildings with independent accounts.
              </p>
            </div>

            {/* 2 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <BedDouble className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-foreground">Visual Floor & Bed Matrix</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Color-coded occupancy status (Vacant, Occupied, Reserved, Maintenance) enforced with database locking to guarantee no duplicate allocation.
              </p>
            </div>

            {/* 3 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-foreground">Tenant Lifecycle & Settlement</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                From 1-click KYC onboarding to automated checkout dues calculation, deposit deductions, and instant bed release without losing history.
              </p>
            </div>

            {/* 4 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-foreground">Invoicing & UPI Receipts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate monthly rent invoices in bulk, log partial or full payments, and issue tamper-evident receipt numbers with payment references.
              </p>
            </div>

            {/* 5 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-foreground">Daily Operations & Visitors</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log visitor check-in/out timestamps, delegate maintenance tickets to wardens, and publish broadcast notices to residents instantly.
              </p>
            </div>

            {/* 6 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-foreground">Real-Time P&L & CSV Exports</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                16 KPI metrics, revenue vs expense trends, utility bill management, and 1-click CSV exports for accounting and tax audits.
              </p>
            </div>
          </div>
        </section>

        {/* 4 ROLE-BASED PORTALS OVERVIEW */}
        <section className="py-16 bg-muted/20 border-y border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tailored Experiences</h2>
              <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">Four Dedicated Role Portals</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
                <Badge variant="outline" className="text-primary font-bold">Role 1</Badge>
                <h4 className="font-bold text-base text-foreground">Owner Dashboard</h4>
                <p className="text-xs text-muted-foreground">Consolidated KPIs, multi-property financials, pricing control, and owner-only audit history.</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
                <Badge variant="outline" className="text-blue-600 font-bold">Role 2</Badge>
                <h4 className="font-bold text-base text-foreground">Property Manager</h4>
                <p className="text-xs text-muted-foreground">Scoped strictly to assigned properties. Check-in/out, rent collection, and local complaints.</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
                <Badge variant="outline" className="text-purple-600 font-bold">Role 3</Badge>
                <h4 className="font-bold text-base text-foreground">Staff & Wardens</h4>
                <p className="text-xs text-muted-foreground">Daily attendance clock-in, visitor entry logs, and assigned maintenance tickets.</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
                <Badge variant="outline" className="text-emerald-600 font-bold">Role 4</Badge>
                <h4 className="font-bold text-base text-foreground">Resident Tenant</h4>
                <p className="text-xs text-muted-foreground">View rent invoices, download receipts, report maintenance issues, and read notices.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA STRIP */}
        <section className="py-20 text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
            Ready to upgrade your PG operations?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Join modern PG owners across Gujarat and India managing thousands of beds on PGBook Business Manager.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl font-bold px-8 shadow-md">
              <Link href="/manager/signup">
                Create Free Owner Account
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold">
              <Link href="/manager/pricing">
                View Pricing Plans
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <ManagerFooter />
    </div>
  );
}

