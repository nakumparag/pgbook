"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Basic password strength validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      setIsLoading(false);
      return;
    }

    const phone = formData.get("phone") as string;
    const isOwner = formData.get("isOwner") === "on";
    const ownerType = formData.get("ownerType") as string;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: isOwner ? "OWNER" : "USER",
          phone: phone,
          owner_type: isOwner ? ownerType : null
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    setIsLoading(false);

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already registered') || signUpError.status === 422) {
        setError("An account with this email already exists");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    // Pass email as query param so verify-email can use it for resend
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) {
      setError(error.message);
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  name="fullName"
                  required 
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
                  required 
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
                  required 
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
                  className="w-5 h-5 rounded border-muted-foreground text-primary focus:ring-primary"
                  onChange={(e) => {
                    const select = document.getElementById("ownerTypeSelect");
                    if (select) select.style.display = e.target.checked ? "block" : "none";
                  }}
                />
                <span className="font-semibold text-foreground">I want to list my PG/Property</span>
              </label>
              
              <div id="ownerTypeSelect" className="mt-4 space-y-2 hidden">
                <label className="text-sm font-semibold text-foreground ml-1">Owner Type</label>
                <select 
                  name="ownerType" 
                  className="w-full pl-4 py-3 rounded-xl bg-muted/50 focus-visible:bg-transparent border border-border outline-none"
                >
                  <option value="PG Owner">PG Owner</option>
                  <option value="Property Owner">Property Owner</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  name="password"
                  required 
                  className="pl-11 py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent" 
                  placeholder="Create a password"
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  name="confirmPassword"
                  required 
                  className="pl-11 py-6 rounded-xl bg-muted/50 focus-visible:bg-transparent" 
                  placeholder="Confirm your password"
                  minLength={8}
                />
              </div>
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
