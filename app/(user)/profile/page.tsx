"use client";

import { useState, useEffect } from "react";
import { UserCircle, Save, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
       
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    } else if (user?.user_metadata?.full_name) {
       
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      await refreshProfile();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-custom py-12 max-w-4xl">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <UserCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">My Profile</h1>
          <p className="text-muted-foreground font-medium">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Profile updated successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email Address</label>
            <Input 
              type="email" 
              value={user?.email || ""} 
              disabled 
              className="py-6 rounded-xl bg-muted/50 cursor-not-allowed opacity-70" 
            />
            <p className="text-xs text-muted-foreground">Email address cannot be changed currently.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Full Name</label>
            <Input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="py-6 rounded-xl focus-visible:bg-transparent" 
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Phone Number (Optional)</label>
            <Input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="py-6 rounded-xl focus-visible:bg-transparent" 
              placeholder="+91 98765 43210"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Account Role</label>
            <div className="px-4 py-3 bg-muted/50 rounded-xl border border-border inline-block">
              <span className="font-bold text-primary">{profile?.role || "USER"}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button 
              type="submit" 
              disabled={isLoading || !user}
              size="lg"
              className="py-6 px-8 rounded-xl font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
