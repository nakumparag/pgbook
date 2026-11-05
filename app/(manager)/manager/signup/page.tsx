"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, User, Phone, Mail, Lock, AlertCircle, ArrowLeft, Building, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getPGBookUrl } from "@/lib/site";

export default function PGManagerSignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const publicPGBookUrl = getPGBookUrl();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit Indian mobile number");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      
      const { data, error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/owner/dashboard`,
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            business_name: businessName.trim(),
          },
        },
      });

      if (authErr) {
        setError(authErr.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // If session was granted immediately (email confirmation disabled in Supabase)
        if (data.session) {
          router.replace("/owner/dashboard");
          router.refresh();
          return;
        }

        // If email confirmation is required by Supabase
        setVerificationPending(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMessage("");
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
        setResendMessage(`Error: ${resendErr.message}`);
      } else {
        setResendMessage("Confirmation email resent successfully! Check your inbox.");
      }
    } catch {
      setResendMessage("Failed to resend confirmation email.");
    } finally {
      setResending(false);
    }
  };

  // If verification is pending, show modern email verification card
  if (verificationPending) {
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
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-heading">Verify Your Email</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Please check your inbox and click the link to activate your PG Business Manager account.
              </p>
            </div>

            {resendMessage && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                {resendMessage}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resending}
                className="w-full rounded-xl font-semibold text-xs h-10 gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                {resending ? "Resending..." : "Resend Confirmation Email"}
              </Button>

              <Button asChild className="w-full rounded-xl font-bold h-10 bg-slate-900 text-white hover:bg-slate-800">
                <Link href="/manager/login">
                  Proceed to Sign In
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Link href="/manager" className="text-xs text-muted-foreground hover:text-foreground font-medium">
              ← Return to PG Manager Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-xs text-muted-foreground">Register your PG & Hostel Business Account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Your Full Name *</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Parag Patel"
                  required
                  className="pl-9 rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">PG Business / Hostel Brand Name *</Label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Shivalik Luxury Living"
                  required
                  className="pl-9 rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">10-Digit Mobile Number *</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                  maxLength={10}
                  className="pl-9 rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address *</Label>
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
              <Label className="text-xs font-semibold">Password * (min. 6 characters)</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-9 rounded-xl h-10 text-sm"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold h-10 shadow-xs bg-slate-900 text-white hover:bg-slate-800">
              {loading ? "Creating Business Account..." : "Create Owner Account"}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Already have a business account?{" "}
            <Link href="/manager/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Sign in to PG Manager
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
