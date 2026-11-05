"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  Wallet,
  UserCheck,
  ClipboardList,
  BarChart3,
  MessageSquare,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  {
    title: "Overview",
    items: [
      { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/owner/properties", label: "Properties", icon: Building2 },
      { href: "/owner/rooms", label: "Rooms & Beds", icon: BedDouble },
      { href: "/owner/tenants", label: "Tenants", icon: Users },
    ],
  },
  {
    title: "Finance & Accounts",
    items: [
      { href: "/owner/finance", label: "Invoices & Payments", icon: Wallet },
      { href: "/owner/reports", label: "Reports & P&L", icon: BarChart3 },
    ],
  },
  {
    title: "Management & Staff",
    items: [
      { href: "/owner/staff", label: "Staff & Attendance", icon: UserCheck },
      { href: "/owner/operations", label: "Visitors & Tickets", icon: ClipboardList },
      { href: "/owner/inquiries", label: "Enquiries", icon: MessageSquare },
    ],
  },
];

export function OwnerSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/manager/login");
      router.refresh();
    } catch {
      router.replace("/manager/login");
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-slate-950 text-slate-100 border-r border-slate-800/80 h-screen sticky top-0 shrink-0 select-none z-30",
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/owner/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              PG Manager
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Business Operating System
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_ITEMS.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/owner/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150 group",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "text-slate-300 hover:text-white hover:bg-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add CTA & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/60">
        <Button asChild size="sm" className="w-full rounded-xl font-bold gap-2 text-xs h-9 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs">
          <Link href="/owner/add-pg">
            <PlusCircle className="w-3.5 h-3.5" />
            Add Property
          </Link>
        </Button>

        <div className="flex items-center justify-between pt-1 text-[11px] px-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            PGBook Public
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors font-medium"
            title="Sign out of PG Manager"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
