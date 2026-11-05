"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function PGManagerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/manager/reset-password`,
      });

      if (resetErr) {
        setError(resetErr.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/20 text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/manager" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-foreground">
              PG Manager
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">Reset your business account password</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
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
                <p className="text-xs text-muted-foreground mt-1">
                  We've sent a password reset link to <strong>{email}</strong>. Check your inbox and spam folder.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full rounded-xl text-xs font-semibold">
                <Link href="/manager/login">Back to PG Manager Login</Link>
              </Button>
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
                    placeholder="owner@example.com"
                    required
                    className="pl-9 rounded-xl h-10 text-sm"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold h-10 shadow-xs">
                {loading ? "Sending Link..." : "Send Password Reset Link"}
              </Button>
            </form>
          )}

          {!success && (
            <div className="pt-2 text-center text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link href="/manager/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

