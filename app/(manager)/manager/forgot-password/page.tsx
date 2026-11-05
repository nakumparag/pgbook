"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils";

function PGManagerForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const isSubmittingRef = useRef(false);

  // Check URL query parameters for callback recovery errors
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "recovery_failed") {
      setError("Your password reset link is invalid or has expired. Please enter your email below to request a new link.");
    }
  }, [searchParams]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading || cooldown > 0) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : getAppUrl();
      const redirectTo = `${origin}/auth/callback?next=/manager/reset-password`;

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

      if (resetErr) {
        const msg = resetErr.message?.toLowerCase() || "";
        const isRateLimited =
          resetErr.status === 429 ||
          msg.includes("rate limit") ||
          msg.includes("too many") ||
          msg.includes("over_email_send_rate_limit");

        if (isRateLimited) {
          setError("Too many password reset requests. Please wait a moment before trying again.");
          setCooldown(60);
          return;
        }

        setError(resetErr.message || "Failed to send reset link. Please check the email and try again.");
      } else {
        setSuccess(true);
        setCooldown(60);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while requesting your reset link.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/20 text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/manager" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-foreground">
              PG Manager
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">Reset your business account password</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Reset Link Sent</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  We've sent a password reset link to <strong className="text-foreground">{email}</strong>. Please check your inbox and click the link to choose a new password.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSuccess(false);
                    setError("");
                  }}
                  disabled={cooldown > 0}
                  className="w-full rounded-xl text-xs font-semibold h-10"
                >
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : "Send another link"}
                </Button>

                <Button asChild className="w-full rounded-xl text-xs font-bold h-10 bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/manager/login">Back to PG Manager Login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Registered Email Address</Label>
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

              <Button
                type="submit"
                disabled={loading || cooldown > 0 || !email.trim()}
                className="w-full rounded-xl font-bold h-10 shadow-xs bg-slate-900 text-white hover:bg-slate-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Link...
                  </>
                ) : cooldown > 0 ? (
                  `Wait ${cooldown}s to retry`
                ) : (
                  "Send Password Reset Link"
                )}
              </Button>
            </form>
          )}

          {!success && (
            <div className="pt-2 text-center text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link href="/manager/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/manager/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to PG Manager Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PGManagerForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PGManagerForgotPasswordForm />
    </Suspense>
  );
}

