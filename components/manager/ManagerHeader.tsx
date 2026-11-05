"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ArrowRight, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPGBookUrl } from "@/lib/site";
import { useAuth } from "@/hooks/useAuth";

export function ManagerHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const publicPGBookUrl = getPGBookUrl();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link href="/manager" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-black text-lg tracking-tight text-foreground flex items-center gap-1.5">
                PG Manager
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                  SaaS
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                By PGBook
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/manager/features"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === "/manager/features"
                  ? "text-foreground font-semibold bg-muted/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              Features
            </Link>
            <Link
              href="/manager/pricing"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === "/manager/pricing"
                  ? "text-foreground font-semibold bg-muted/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <a
            href={publicPGBookUrl}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            PGBook Public
          </a>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="rounded-xl font-bold gap-1.5 text-xs h-9">
                <Link href="/owner/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="rounded-xl text-xs text-muted-foreground hover:text-destructive h-9"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-semibold h-9">
                <Link href="/manager/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="rounded-xl font-bold text-xs h-9 shadow-xs">
                <Link href="/manager/signup">
                  Start Free Trial
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

