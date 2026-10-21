"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-zinc-950">
      
      {/* Decorative background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to main site
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-6 group">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary shadow-2xl group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-heading font-black text-white mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-zinc-400 font-medium">
            Restricted access. Authorized personnel only.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-zinc-800">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 ml-1">Admin ID (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input 
                  type="email" 
                  name="email"
                  required 
                  className="pl-11 py-6 rounded-xl bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-primary focus-visible:border-primary placeholder:text-zinc-600 transition-all" 
                  placeholder="admin@pgbook.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-zinc-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input 
                  type="password" 
                  name="password"
                  required 
                  className="pl-11 py-6 rounded-xl bg-zinc-950/50 border-zinc-800 text-white focus-visible:ring-primary focus-visible:border-primary placeholder:text-zinc-600 transition-all" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              size="lg"
              className="w-full py-6 text-base rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Secure Login"
              )}
            </Button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-xs font-medium text-zinc-600">
          <p>Protected by PGBook Security & Supabase Auth</p>
        </div>
      </div>
    </div>
  );
}
