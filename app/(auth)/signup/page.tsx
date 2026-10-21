"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { Home, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { getAppUrl } from "@/lib/utils";

function SignupContent() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [ownerType, setOwnerType] = useState("PG Owner");

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isSubmittingRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || searchParams.get('redirect');
  const supabase = createClient();

  // Strip any accidental email or password query parameters immediately on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const url = new URL(window.location.href);
      let changed = false;
      if (url.searchParams.has("password")) {
        url.searchParams.delete("password");
        changed = true;
      }
      if (url.searchParams.has("email")) {
        url.searchParams.delete("email");
        changed = true;
      }
      if (changed) {
        const cleanQuery = url.searchParams.toString();
        const cleanPath = url.pathname + (cleanQuery ? `?${cleanQuery}` : "");
        window.history.replaceState({}, "", cleanPath);
      }
    }
  }, []);

  const getSafeRedirectUrl = () => {
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
      return nextParam;
    }
    return '/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingRef.current || isLoading || isGoogleLoading) {
      return;
    }

    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setError("Full name must be at least 2 characters long");
      return;
    }

    if (!trimmedEmail) {
      setError("Email address is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Basic password strength validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            role: isOwner ? "OWNER" : "USER",
            phone: trimmedPhone || null,
            owner_type: isOwner ? ownerType : null
          },
          emailRedirectTo: `${getAppUrl()}/auth/callback`,
        }
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() || "";
        const isRateLimited =
          signUpError.status === 429 ||
          msg.includes("rate limit") ||
          msg.includes("too many") ||
          msg.includes("over_email_send_rate_limit");

        if (isRateLimited) {
          setError("Too many email requests. Please wait a moment and try again.");
        } else if (msg.includes('already registered') || signUpError.status === 422) {
          setError("An account with this email already exists. Please log in.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Check if account already existed (Supabase returns empty identities array when email confirmation is enabled and email is taken)
      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        setError("An account with this email already exists. Please log in.");
        return;
      }

      // Clear password from memory
      setPassword("");
      setConfirmPassword("");

      // If session is present, email confirmation is disabled in Supabase - user is immediately authenticated!
      if (signUpData.session) {
        // Update phone on the profile record if provided and trigger didn't include it
        if (trimmedPhone && signUpData.user) {
          await supabase
            .from('profiles')
            .update({ phone: trimmedPhone })
            .eq('id', signUpData.user.id);
        }

        if (isOwner) {
          router.replace('/become-owner');
        } else {
          router.replace(getSafeRedirectUrl());
        }
        router.refresh();
        return;
      }

      // Otherwise, email confirmation is required - redirect to verification notice without credentials
      router.replace(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading || isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(getSafeRedirectUrl())}`,
        }
      });
      
      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError("Failed to initiate Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Home className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-heading font-black text-foreground mb-2">Create an account</h2>
          <p className="text-muted-foreground font-medium">
            Join PGBook to find your perfect stay
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card p-8 rounded-3xl shadow-xl border border-border">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} method="POST" action="#" className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                  autoComplete="name"
                  className="pl-11 py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent" 
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">+91</span>
                <Input 
                  type="tel" 
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                  autoComplete="tel"
                  className="pl-12 py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent" 
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl border border-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isOwner" 
                  checked={isOwner}
                  onChange={(e) => setIsOwner(e.target.checked)}
                  className="w-5 h-5 rounded border-muted-foreground text-primary focus:ring-primary"
                />
                <span className="font-semibold text-foreground">I want to list my PG/Property</span>
              </label>
              
              {isOwner && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Owner Type</label>
                  <select 
                    name="ownerType" 
                    value={ownerType}
                    onChange={(e) => setOwnerType(e.target.value)}
                    className="w-full pl-4 py-3 rounded-xl bg-muted/50 focus-visible:bg-transparent border border-border outline-none"
                  >
                    <option value="PG Owner">PG Owner</option>
                    <option value="Property Owner">Property Owner</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Password</label>
              <PasswordInput
                leadingIcon={<Lock className="h-5 w-5" />}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent"
                placeholder="Create a password"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Confirm Password</label>
              <PasswordInput
                leadingIcon={<Lock className="h-5 w-5" />}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent"
                placeholder="Confirm your password"
                minLength={8}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || isGoogleLoading}
              size="lg"
              className="w-full py-6 text-base rounded-xl font-bold mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                type="button" 
                variant="outline"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-6 rounded-xl flex items-center justify-center gap-3 font-semibold"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Google
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-muted-foreground font-medium">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
