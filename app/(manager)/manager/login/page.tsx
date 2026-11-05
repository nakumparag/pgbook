"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Lock, Mail, AlertCircle, ArrowLeft, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getPGBookUrl } from "@/lib/site";
import { getAppUrl } from "@/lib/utils";

function PGManagerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  const publicPGBookUrl = getPGBookUrl();

  // Display friendly error if redirected from auth callback or protected route
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "auth_callback_failed") {
      setError("Google authentication failed or expired. Please sign in again.");
    } else if (urlError === "access_denied") {
      setError("Access was denied. Please sign in to continue.");
    } else if (urlError === "verification_failed") {
      setError("Email verification failed or expired. Please sign in or request a new link.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIsEmailUnconfirmed(false);
    setResendStatus("");

    try {
      const supabase = createClient();
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authErr) {
        const msg = authErr.message.toLowerCase();
        if (msg.includes("email not confirmed") || (authErr as any).code === "email_not_confirmed") {
          setIsEmailUnconfirmed(true);
          setError("Your email address has not been confirmed yet. Please verify your email before signing in.");
        } else if (msg.includes("invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials.");
        } else {
          setError(authErr.message || "Failed to log in");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch profile to do smart role redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        // Check if assigned as manager in property_members
        const { data: member } = await supabase
          .from("property_members")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        let target = nextUrl || "/owner/dashboard";

        if (profile?.role === "ADMIN" || profile?.role === "OWNER") {
          target = nextUrl || "/owner/dashboard";
        } else if (member?.role === "PROPERTY_MANAGER") {
          target = nextUrl || "/manager/manager-portal";
        } else if (member?.role === "STAFF") {
          target = nextUrl || "/manager/staff-portal";
        } else {
          // Check if resident tenant
          const { data: tenant } = await supabase
            .from("tenants")
            .select("id")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (tenant) {
            target = nextUrl || "/manager/tenant-portal";
          } else {
            // Check if user already owns any properties
            const { count: pgCount } = await supabase
              .from("pgs")
              .select("id", { count: "exact", head: true })
              .eq("owner_id", data.user.id);

            if (pgCount && pgCount > 0) {
              target = nextUrl || "/owner/dashboard";
            } else {
              // Normal user logging in to PG Manager -> take to 1-click owner onboarding
              target = nextUrl || "/become-owner";
            }
          }
        }

        router.replace(target);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Please enter your email address to resend verification.");
      return;
    }
    setResending(true);
    setResendStatus("");
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/owner/dashboard`,
        },
      });

      if (resendErr) {
        setResendStatus(`Error: ${resendErr.message}`);
      } else {
        setResendStatus("Confirmation email resent successfully! Please check your inbox.");
      }
    } catch {
      setResendStatus("Failed to resend confirmation email.");
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading || isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : getAppUrl();
      const targetNext = nextUrl || "/owner/dashboard";
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(targetNext)}`,
        },
      });
      if (oAuthError) {
        setError(oAuthError.message || "Failed to sign in with Google.");
        setIsGoogleLoading(false);
      }
    } catch {
      setError("Failed to initiate Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/20 text-foreground">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/manager" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-foreground">
              PG Manager
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">Sign in to your PG Business Operating System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p>{error}</p>
                {isEmailUnconfirmed && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="mt-2 text-xs h-8 rounded-lg gap-1.5 font-bold"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Resending..." : "Resend Confirmation Email"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {resendStatus && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Business / Owner Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@mybusiness.com"
                  required
                  className="pl-9 rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Password</Label>
                <Link
                  href="/manager/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9 rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading || isGoogleLoading} className="w-full rounded-xl font-bold h-10 shadow-xs bg-slate-900 text-white hover:bg-slate-800">
              {loading ? "Authenticating..." : "Sign In to PG Manager"}
            </Button>
          </form>

          {/* Divider and Google Sign-in */}
          <div className="pt-1">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-card text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={loading || isGoogleLoading}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2.5 font-semibold text-xs border-border/80 hover:bg-muted/50 transition-colors"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Sign in with Google
              </Button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Don't have a business account?{" "}
            <Link href="/manager/signup" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Create an owner account
            </Link>
          </div>
        </div>

        {/* Link back to public discovery */}
        <div className="text-center">
          <a
            href={publicPGBookUrl}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Looking to book a PG room? Go to PGBook Public
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PGManagerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PGManagerLoginForm />
    </Suspense>
  );
}
