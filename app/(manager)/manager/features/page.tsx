import Link from "next/link";
import { Building2, BedDouble, Users, Wallet, ShieldCheck, CheckCircle2, ArrowRight, Zap, RefreshCw, Smartphone, Download, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManagerHeader } from "@/components/manager/ManagerHeader";
import { ManagerFooter } from "@/components/manager/ManagerFooter";

const FEATURES = [
  {
    title: "Multi-Property Architecture",
    description: "Operate multiple PG hostels across different cities and localities from a single owner account with consolidated analytics.",
    icon: Building2,
  },
  {
    title: "Floor & Bed Visual Inventory",
    description: "Map floors, rooms, and individual beds. Atomic PostgreSQL transactions prevent double-booking under all concurrency conditions.",
    icon: BedDouble,
  },
  {
    title: "Complete Tenant Onboarding",
    description: "Capture Aadhaar/PAN KYC, emergency contacts, rent due dates, security deposit collection, and auto-issue initial invoice.",
    icon: Users,
  },
  {
    title: "Instant Checkout Settlement",
    description: "Calculate pending dues, record damages deductions, process refunds, and atomically release beds back to VACANT status.",
    icon: RefreshCw,
  },
  {
    title: "Automated Monthly Invoicing",
    description: "1-Click bulk rent invoice generation for all active residents. Record cash, UPI, or bank payments with unique receipt numbers.",
    icon: Wallet,
  },
  {
    title: "Expense & Utility Tracking",
    description: "Track maintenance, staff salaries, electricity bills, and WiFi expenses by property to monitor exact net operating income.",
    icon: Zap,
  },
  {
    title: "Staff & Attendance Management",
    description: "Maintain warden, cook, cleaner, and security profiles. Daily attendance logging with half-day and leave tracking.",
    icon: Layers,
  },
  {
    title: "1-Click CSV & Tax Reports",
    description: "Download resident directories, payment audit logs, and monthly profit & loss statements formatted for accounting.",
    icon: Download,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ManagerHeader />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="text-primary font-bold">Platform Capabilities</Badge>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-heading">
              Built for high-efficiency PG operations
            </h1>
            <p className="text-sm text-muted-foreground">
              Every feature is built on actual database records with owner-based row-level security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>

          <div className="p-8 rounded-2xl bg-muted/30 border border-border/80 text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-xl font-extrabold font-heading text-foreground">Ready to test these features?</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Start your free 14-day trial now and experience automated PG management.
            </p>
            <Button asChild className="rounded-xl font-bold shadow-md">
              <Link href="/manager/signup">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <ManagerFooter />
    </div>
  );
}

