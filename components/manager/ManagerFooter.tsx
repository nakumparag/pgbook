import Link from "next/link";
import { Building2, ShieldCheck, Heart } from "lucide-react";
import { getPGBookUrl } from "@/lib/site";

export function ManagerFooter() {
  const publicPGBookUrl = getPGBookUrl();

  return (
    <footer className="border-t border-border/80 bg-card/60 text-muted-foreground text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-heading font-black text-base text-foreground tracking-tight">
                PG Manager
              </span>
              <p className="text-[11px] text-muted-foreground">The Business Operating System for Modern Hostels & PGs</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/manager/features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/manager/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/manager/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <a href={publicPGBookUrl} className="text-primary hover:underline font-semibold">
              Visit PGBook.com ↗
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} PGBook Inc. All rights reserved. Supabase-powered multi-property cloud security.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Data Isolation & RLS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

