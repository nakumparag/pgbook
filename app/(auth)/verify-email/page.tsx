"use client";

import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import { Mail, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isSubmittingRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (isSubmittingRef.current || isLoading || cooldown > 0) return;

    if (!email) {
      setMessage({ text: "No email address found. Please try signing up again.", type: 'error' });
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${getAppUrl()}/auth/callback`,
        }
      });

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        const isRateLimited =
          error.status === 429 ||
          msg.includes("rate limit") ||
          msg.includes("too many") ||
          msg.includes("over_email_send_rate_limit");

        if (isRateLimited) {
          setMessage({ text: "Too many email requests. Please wait a moment and try again.", type: 'error' });
          setCooldown(60);
        } else {
          setMessage({ text: error.message, type: 'error' });
        }
      } else {
        setMessage({ text: "Verification email resent successfully! Please check your inbox.", type: 'success' });
        setCooldown(60);
      }
    } catch {
      setMessage({ text: "Failed to resend verification email. Please try again later.", type: 'error' });
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage(null);
    
    // We can fetch the user session to check if they clicked the link
    // and were authenticated in the background (or in another tab)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    setIsRefreshing(false);

    if (user && user.email_confirmed_at) {
      router.push('/dashboard');
      router.refresh();
    } else if (error || !user) {
      setMessage({ text: "Account not verified yet. Check your email or try logging in.", type: 'error' });
    } else {
      setMessage({ text: "Still waiting for verification. Please click the link in your email.", type: 'error' });
    }
  };

  return (
    <div className="max-w-md w-full text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-primary" />
      </div>
      
      <h2 className="text-3xl font-heading font-black text-foreground mb-4">Check your email</h2>
      
      <p className="text-muted-foreground font-medium mb-4">
        We've sent a verification link to <span className="font-bold text-foreground">{email || "your email address"}</span>.
      </p>
      <p className="text-muted-foreground font-medium mb-8">
        Please click the link to verify your account and continue.
      </p>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-card p-6 rounded-3xl shadow-sm border border-border mb-8 space-y-4">
        <Button 
          variant="default" 
          className="w-full rounded-xl font-bold py-6"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" /> I have verified my email
            </>
          )}
        </Button>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Didn't receive the email? Check your spam folder or
          </p>
          <Button 
            variant="outline" 
            className="w-full rounded-xl font-bold"
            onClick={handleResend}
            disabled={isLoading || cooldown > 0 || !email}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend available in ${cooldown}s`
            ) : (
              "Resend Verification Email"
            )}
          </Button>
        </div>
      </div>

      <Link href="/login">
        <Button variant="link" className="text-muted-foreground hover:text-foreground">
          Return to Login <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
