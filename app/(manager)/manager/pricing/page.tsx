import Link from "next/link";
import { Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManagerHeader } from "@/components/manager/ManagerHeader";
import { ManagerFooter } from "@/components/manager/ManagerFooter";

const PLANS = [
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    description: "Ideal for single building PG owners getting started with digital operations.",
    features: [
      "1 PG Property",
      "Up to 25 Beds",
      "Visual Floor & Bed Layout",
      "Tenant Onboarding & KYC",
      "Rent Invoicing & Receipts",
      "Security Deposit Ledger",
      "Email & Chat Support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "₹1,499",
    period: "/month",
    description: "For established hostel owners managing multiple buildings and staff.",
    features: [
      "Up to 3 PG Properties",
      "Up to 100 Beds",
      "Consolidated Multi-Property Dashboard",
      "Property Manager & Staff Logins",
      "Daily Staff Attendance Tracker",
      "Expense & Utility Tracking",
      "Visitor Entry & Maintenance Desk",
      "1-Click CSV & P&L Reports",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "₹3,499",
    period: "/month",
    description: "For large hostel chains and student accommodation operating systems.",
    features: [
      "Unlimited PG Properties",
      "Unlimited Bed Capacity",
      "Custom Subdomain Branding",
      "Dedicated Account Manager",
      "Priority Phone Support",
      "Custom Accounting Integrations",
      "Automated WhatsApp Reminders",
    ],
    cta: "Contact Enterprise Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ManagerHeader />

      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="text-primary font-bold">Simple, Transparent Pricing</Badge>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-heading">
              Predictable plans that scale with your beds
            </h1>
            <p className="text-sm text-muted-foreground">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 bg-card flex flex-col justify-between shadow-xs transition-all ${
                  plan.popular
                    ? "border-primary ring-2 ring-primary/20 shadow-md relative"
                    : "border-border/80"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black font-heading text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground font-semibold">{plan.period}</span>
                  </div>

                  <div className="pt-4 border-t border-border/60 space-y-2.5">
                    <p className="text-xs font-bold text-foreground">What's included:</p>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/40">
                  <Button
                    asChild
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full rounded-xl font-bold text-xs h-10 shadow-xs"
                  >
                    <Link href="/manager/signup">
                      {plan.cta}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-muted/20 border border-border/80 text-center space-y-2 text-xs text-muted-foreground">
            <p className="font-bold text-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Risk-Free Guarantee
            </p>
            <p>
              Cancel anytime with 1 click. Need help migrating from Excel or legacy software? Our team will import your beds and tenants free of charge.
            </p>
          </div>
        </div>
      </main>

      <ManagerFooter />
    </div>
  );
}

