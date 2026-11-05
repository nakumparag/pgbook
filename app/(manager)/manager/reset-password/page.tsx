"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { Building2, Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function PGManagerResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isSubmittingRef = useRef(false);
  const linkCheckStartedRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (linkCheckStartedRef.current) return;
    linkCheckStartedRef.current = true;
    let cancelled = false;

    const checkRecoveryLink = async () => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.slice(1));
      const authError =
        url.searchParams.get("error_code") ||
        url.searchParams.get("error") ||
        hashParams.get("error_code") ||
        hashParams.get("error");

      if (authError) {
        if (!cancelled) {
          setIsLinkInvalid(true);
          setError("This password reset link has expired or was already used. Please request a new link.");
          setIsCheckingLink(false);
        }
        url.hash = "";
        url.searchParams.delete("error");
        url.searchParams.delete("error_code");
        url.searchParams.delete("error_description");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
        return;
      }

      // If PKCE authorization code was returned directly
      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) {
            setIsLinkInvalid(true);
            setError("This reset link has expired or was already used. Please request a new link.");
          }
        } else {
          url.searchParams.delete("code");
          window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        }
      }

      // Verify active session established by callback or code exchange
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        if (!session) {
          setIsLinkInvalid(true);
          setError("Please open the latest password reset email link first, then choose a new password.");
        }
        setIsCheckingLink(false);
      }
    };

    void checkRecoveryLink();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmittingRef.current || isLoading) {
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        const message = updateError.message?.toLowerCase() || "";
        if (message.includes("session") || message.includes("token") || message.includes("expired")) {
          setPassword("");
          setConfirmPassword("");
          setIsLinkInvalid(true);
          setError("Your password reset session has expired. Please request a new link.");
        } else {
          setError(updateError.message || "Failed to update password. Please try again.");
        }
        return;
      }

      // Clear password from memory
      setPassword("");
      setConfirmPassword("");

      // Force sign out so user authenticates cleanly with new credentials
      await supabase.auth.signOut();
      setIsSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try requesting a new reset link.");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/20 text-foreground">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/manager" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-foreground">
              PG Manager
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            Set a new password for your PG business account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
          {isCheckingLink ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
              <p className="text-xs font-semibold">Verifying password reset authorization...</p>
            </div>
          ) : isLinkInvalid ? (
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-foreground">Reset Link Expired or Invalid</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {error || "This password reset link is invalid or has expired. Please request a new link to continue."}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Button asChild className="w-full rounded-xl text-xs font-bold h-10 bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/manager/forgot-password">Request a New Reset Link</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl text-xs font-semibold h-10">
                  <Link href="/manager/login">Back to PG Manager Login</Link>
                </Button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-foreground">Password Reset Successful</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your password has been securely updated. You can now sign in to PG Manager with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full rounded-xl text-xs font-bold h-10 bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/manager/login">Proceed to Sign In</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 pb-1 text-slate-800 dark:text-slate-200">
                <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Choose New Password</span>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">New Password * (min. 6 characters)</Label>
                <PasswordInput
                  leadingIcon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Confirm New Password *</Label>
                <PasswordInput
                  leadingIcon={<Lock className="w-4 h-4" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full rounded-xl font-bold h-10 shadow-xs bg-slate-900 text-white hover:bg-slate-800 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}

          {!isSuccess && !isCheckingLink && !isLinkInvalid && (
            <div className="pt-2 text-center text-xs text-muted-foreground">
              Cancel and return to{" "}
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

export default function PGManagerResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PGManagerResetPasswordForm />
    </Suspense>
  );
}

