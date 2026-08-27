"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as AuthUser, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database.types";

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isOwner: boolean;
  activeMode: "user" | "owner";
  setActiveMode: (mode: "user" | "owner") => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeMode, setActiveModeState] = useState<"user" | "owner">("user");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error("Exception fetching profile:", err);
      return null;
    }
  };

  const getSessionAndProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        
        const { data: ownerData } = await supabase
          .from("owner_profiles")
          .select("status")
          .eq("user_id", session.user.id)
          .single();
          
        if (ownerData?.status === "APPROVED") {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } else {
        setProfile(null);
        setIsOwner(false);
      }
    } catch (err) {
      console.error("Error fetching session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        
        const { data: ownerData } = await supabase
          .from("owner_profiles")
          .select("status")
          .eq("user_id", session.user.id)
          .single();
          
        if (ownerData?.status === "APPROVED") {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } else {
        setProfile(null);
        setIsOwner(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
     
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const isEmailVerified = !!user?.email_confirmed_at;

  const setActiveMode = (mode: "user" | "owner") => {
    setActiveModeState(mode);
    document.cookie = `pgbook-mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
  };

  useEffect(() => {
    // Read initial mode from cookie
    const match = document.cookie.match(new RegExp('(^| )pgbook-mode=([^;]+)'));
    if (match && (match[2] === "user" || match[2] === "owner")) {
      setActiveModeState(match[2] as "user" | "owner");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated: !!user,
        isEmailVerified,
        isOwner,
        activeMode,
        setActiveMode,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
