"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  UserCircle,
  LogOut,
  LayoutDashboard,
  Heart,
  Search,
  ChevronDown,
  ArrowUpRight,
  Building,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPgManagerUrl } from "@/lib/site";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore PGs" },
  { href: "/become-owner", label: "List Your PG" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pgManagerUrl = getPgManagerUrl();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 pt-4 pb-2 pointer-events-none"
    >
      <div 
        className={cn(
          "container-custom flex items-center justify-between gap-4 transition-all duration-300 pointer-events-auto rounded-full",
          isScrolled
            ? "bg-white/90 dark:bg-card/90 backdrop-blur-xl border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2.5 px-6"
            : "bg-transparent py-3 px-4"
        )}
      >

        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="PGBook Home">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="white" fillOpacity="0.9"/>
              <path d="M9 22V12H15V22" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-bold text-lg tracking-tight text-foreground">
              PGBook
            </span>
            <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">
              Discover. Connect. Stay.
            </span>
          </div>
        </Link>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/8 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* Prominent PG Manager CTA button */}
          <Button
            asChild
            size="sm"
            className="rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 gap-1.5 shadow-xs text-xs h-9 px-3.5"
          >
            <a href={pgManagerUrl} target="_blank" rel="noopener noreferrer">
              <Building className="w-3.5 h-3.5 text-primary" />
              <span>PG Manager</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
          </Button>

          {/* Desktop Auth for Residents/Seekers */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted font-medium"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-border shadow-xl">
                  <div className="flex items-center gap-3 p-3 pb-2">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {profile?.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      {profile?.full_name && (
                        <p className="font-semibold text-sm text-foreground truncate">{profile.full_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center gap-2 py-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span>My Profile ({profile?.role || "USER"})</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center gap-2 py-2">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      <span>Saved & Inquiries</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer flex items-center gap-2 py-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>Saved PGs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {profile?.role === "OWNER" ? (
                    <DropdownMenuItem asChild>
                      <a href={pgManagerUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center justify-between py-2 text-indigo-600 dark:text-indigo-400 font-bold">
                        <span className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>PG Manager Dashboard</span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/become-owner" className="cursor-pointer flex items-center justify-between py-2 text-primary font-bold">
                        <span className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>Become a PG Owner</span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8 flex items-center gap-2 py-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login">
                  <Button variant="ghost" className="font-semibold text-xs rounded-xl h-9">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="font-semibold text-xs rounded-xl gradient-primary border-none shadow-xs hover:opacity-90 transition-opacity h-9 px-3">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
            <Link href="/explore" aria-label="Search PGs">
              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" aria-label="Open menu">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 flex flex-col p-0">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="white"/>
                      </svg>
                    </div>
                    <span className="font-bold text-lg font-heading">PGBook</span>
                  </div>
                </div>

                <nav className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="my-2 border-t border-border/60" />

                  <a
                    href={pgManagerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-foreground text-background font-bold text-sm shadow-xs mt-2"
                  >
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary" />
                      PG Business Manager
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </nav>

                <div className="p-4 border-t border-border">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Button asChild variant="outline" className="w-full rounded-xl text-xs font-semibold">
                        <Link href="/profile" onClick={() => setMobileOpen(false)}>My Profile</Link>
                      </Button>
                      <Button
                        onClick={() => {
                          signOut();
                          setMobileOpen(false);
                        }}
                        variant="ghost"
                        className="w-full rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10"
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1 rounded-xl text-xs font-semibold">
                        <Link href="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
                      </Button>
                      <Button asChild className="flex-1 rounded-xl text-xs font-bold gradient-primary border-none">
                        <Link href="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}
