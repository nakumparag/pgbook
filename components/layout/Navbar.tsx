"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Repeat,
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

const NAV_LINKS = [
  { href: "/explore", label: "Explore PGs" },
  { href: "/cities", label: "Cities" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, profile, isOwner, activeMode, setActiveMode, signOut } = useAuth();
  const pathname = usePathname();

  const toggleMode = () => {
    if (activeMode === 'user') {
      setActiveMode('owner');
      window.location.href = '/owner/dashboard';
    } else {
      setActiveMode('user');
      window.location.href = '/dashboard';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              Discover. Compare. Stay.
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
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* Role-based CTA (desktop) */}
          {profile?.role === 'ADMIN' ? (
            <Button asChild variant="ghost" className="hidden xl:flex font-semibold text-sm text-foreground hover:text-primary hover:bg-primary/8">
              <Link href="/admin/dashboard">
                Admin Dashboard
              </Link>
            </Button>
          ) : isOwner ? (
            <Button asChild variant="ghost" className="hidden xl:flex font-semibold text-sm text-foreground hover:text-primary hover:bg-primary/8">
              <Link href="/owner/dashboard">
                My PG Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="hidden xl:flex font-semibold text-sm text-foreground hover:text-primary hover:bg-primary/8">
              <Link href="/become-owner">
                List Your PG
              </Link>
            </Button>
          )}

          {/* Desktop Auth */}
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
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={profile?.role === 'ADMIN' ? "/admin/dashboard" : isOwner && activeMode === 'owner' ? "/owner/dashboard" : "/dashboard"} className="cursor-pointer flex items-center gap-2 py-2">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={toggleMode} className="cursor-pointer flex items-center gap-2 py-2">
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                        <span>Switch to {activeMode === 'owner' ? 'User' : 'Owner'} View</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer flex items-center gap-2 py-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>Saved PGs</span>
                    </Link>
                  </DropdownMenuItem>
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
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="font-semibold text-sm rounded-xl">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="font-semibold text-sm rounded-xl gradient-primary border-none shadow-sm hover:opacity-90 transition-opacity">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
            {/* Mobile Search Icon */}
            <Link href="/explore" aria-label="Search PGs">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Open menu">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 flex flex-col p-0">
                {/* Mobile Menu Header */}
                <div className="flex items-center gap-2 p-5 border-b border-border">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="font-bold text-lg font-heading">PGBook</span>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col p-4 gap-1" aria-label="Mobile navigation">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors",
                        pathname === link.href
                          ? "text-primary bg-primary/8"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {profile?.role === 'ADMIN' ? (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-primary hover:bg-primary/8 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  ) : isOwner ? (
                    <Link
                      href="/owner/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-primary hover:bg-primary/8 transition-colors"
                    >
                      My PG Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/become-owner"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-primary hover:bg-primary/8 transition-colors"
                    >
                      List Your PG
                    </Link>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => {
                        toggleMode();
                        setMobileOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Repeat className="w-5 h-5 mr-3 text-muted-foreground" />
                      Switch to {activeMode === 'owner' ? 'User' : 'Owner'} View
                    </button>
                  )}
                </nav>

                {/* Mobile Auth */}
                <div className="mt-auto p-4 border-t border-border flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold shrink-0">
                          {profile?.full_name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{profile?.full_name || "Account"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/favorites" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full rounded-xl text-sm" size="sm">
                            <Heart className="mr-1.5 h-4 w-4" /> Saved
                          </Button>
                        </Link>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/8 rounded-xl"
                        onClick={() => { signOut(); setMobileOpen(false); }}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" className="w-full" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl font-semibold">
                          Log In
                        </Button>
                      </Link>
                      <Link href="/signup" className="w-full" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full rounded-xl font-semibold gradient-primary border-none">
                          Sign Up Free
                        </Button>
                      </Link>
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
