"use client";
import { useState, useEffect } from "react";

export function useInfluencerAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(localStorage.getItem("inf_logged_in") === "true");
    setIsProfileComplete(localStorage.getItem("inf_profile_complete") === "true");
  }, []);

  const login = () => {
    localStorage.setItem("inf_logged_in", "true");
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("inf_logged_in");
    setIsLoggedIn(false);
  };

  const saveProfile = () => {
    localStorage.setItem("inf_profile_complete", "true");
    setIsProfileComplete(true);
  };

  return { isLoggedIn, isProfileComplete, login, logout, saveProfile, mounted };
}
