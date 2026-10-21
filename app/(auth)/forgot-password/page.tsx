"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const isSubmittingRef = useRef(false);
  const supabase = createClient();

  // Cooldown countdown timer to prevent duplicate / spam requests
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent duplicate submission / double-click
    if (isSubmittingRef.current || isLoading || cooldown > 0) {
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Determine production redirect URL
      const redirectTo = `${getAppUrl()}/auth/callback?next=/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

      if (resetError) {
        const msg = resetError.message?.toLowerCase() || "";
        const isRateLimited =
          resetError.status === 429 ||
          msg.includes("rate limit") ||
          msg.includes("too many") ||
          msg.includes("over_email_send_rate_limit");

        if (isRateLimited) {
          setError("Too many email requests. Please wait a moment and try again.");
          setCooldown(60);
          return;
        }

        setError(resetError.message || "Failed to send reset link. Please try again.");
        return;
      }

      setIsSuccess(true);
      setCooldown(60);
    } catch {
      setError("An unexpected error occurred. Please try again later.");
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
          <Link href="/login" className="inline-flex items-center justify-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          <h2 className="text-3xl font-heading font-black text-foreground mb-2">Forgot Password</h2>
          <p className="text-muted-foreground font-medium">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card p-8 rounded-3xl shadow-xl border border-border">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Password reset link sent</h3>
                <p className="text-muted-foreground text-sm">
                  Password reset link sent. Please check your email.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setError(null);
                  }}
                  disabled={cooldown > 0}
                  className="w-full rounded-xl py-5 font-semibold text-sm"
                >
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : "Send another link"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} method="POST" action="#" className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="email" 
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    autoComplete="email"
                    className="pl-11 py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent" 
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || cooldown > 0 || !email.trim()}
                size="lg"
                className="w-full py-6 text-base rounded-xl font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending link...
                  </>
                ) : cooldown > 0 ? (
                  `Wait ${cooldown}s before retrying`
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
