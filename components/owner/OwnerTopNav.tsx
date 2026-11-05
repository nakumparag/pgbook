"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, UserCircle, LogOut, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OwnerSidebar } from "./OwnerSidebar";
import { PropertySelector, SimpleProperty } from "@/components/shared/PropertySelector";
import { useAuth } from "@/hooks/useAuth";

interface OwnerTopNavProps {
  properties: SimpleProperty[];
  selectedPropertyId?: string | null;
  title?: string;
}

export function OwnerTopNav({
  properties,
  selectedPropertyId,
  title,
}: OwnerTopNavProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile trigger & Property Selector */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <OwnerSidebar />
          </SheetContent>
        </Sheet>

        {/* Property Switcher */}
        <div className="flex items-center gap-2">
          <PropertySelector
            properties={properties}
            selectedPropertyId={selectedPropertyId}
          />
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 h-10 px-2.5 rounded-xl border border-transparent hover:border-border hover:bg-muted/50"
            >
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "O"}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                  {profile?.full_name || "Owner"}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">Business Owner</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
            <DropdownMenuLabel className="font-normal p-3 pb-2">
              <p className="text-xs font-bold text-foreground">{profile?.full_name || "Owner Account"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer text-xs py-2">
                <UserCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                Account Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer text-xs py-2">
                <ArrowLeft className="w-4 h-4 mr-2 text-muted-foreground" />
                Exit to PGBook Public
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="cursor-pointer text-xs py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

