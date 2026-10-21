"use client";

import { useState, useRef, useEffect } from "react";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
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
          setError("This reset link has expired or was already used. Request a new link to continue.");
          setIsCheckingLink(false);
        }
        url.hash = "";
        url.searchParams.delete("error");
        url.searchParams.delete("error_code");
        url.searchParams.delete("error_description");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) {
            setIsLinkInvalid(true);
            setError("This reset link has expired or was already used. Request a new link to continue.");
          }
        } else {
          url.searchParams.delete("code");
          window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        if (!session) {
          setIsLinkInvalid(true);
          setError("Open the latest password reset email link first, then choose a new password.");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
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
          setError("This reset link has expired or was already used. Request a new link to continue.");
        } else {
          setError(updateError.message || "Failed to update password. Please try again.");
        }
        return;
      }

      // Clear password from memory
      setPassword("");
      setConfirmPassword("");

      // Force sign out so they must log in with the new password
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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-black text-foreground mb-2">Reset Password</h2>
          <p className="text-muted-foreground font-medium">
            Create a new password for your account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card p-8 rounded-3xl shadow-xl border border-border">
          {isCheckingLink ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking reset link...
            </div>
          ) : isLinkInvalid ? (
            <div className="space-y-5 text-center">
              <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
                {error}
              </div>
              <Link href="/forgot-password" className="block">
                <Button className="w-full py-6 text-base rounded-xl font-bold">Request a New Reset Link</Button>
              </Link>
              <p className="text-sm text-muted-foreground">Use the newest email link once, as soon as it arrives.</p>
            </div>
          ) : error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {!isCheckingLink && !isLinkInvalid && isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Password Updated</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <Link href="/login" className="w-full">
                  <Button className="w-full py-6 text-base rounded-xl font-bold">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : !isCheckingLink && !isLinkInvalid ? (
            <form onSubmit={handleSubmit} method="POST" action="#" className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">New Password</label>
                <PasswordInput
                  leadingIcon={<Lock className="h-5 w-5" />}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent"
                  placeholder="Enter new password"
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Confirm New Password</label>
                <PasswordInput
                  leadingIcon={<Lock className="h-5 w-5" />}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent"
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                size="lg"
                className="w-full py-6 text-base rounded-xl font-bold mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
