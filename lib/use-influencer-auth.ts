"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useInfluencerAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsProfileComplete(localStorage.getItem("inf_profile_complete") === "true");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=influencer`,
      },
    });
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  const saveProfile = () => {
    localStorage.setItem("inf_profile_complete", "true");
    setIsProfileComplete(true);
  };

  return { isLoggedIn: !!user, user, isProfileComplete, login, logout, saveProfile, mounted };
}
