"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getLocalAuth, setLocalAuth, clearLocalAuth } from "@/lib/auth";

export function useLocalAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const convexValidate = useMutation(api.auth.validatePassword);

  // Check local auth on mount
  useEffect(() => {
    const auth = getLocalAuth();
    setIsAuthenticated(auth?.isAuthenticated ?? false);
    setIsLoading(false);
  }, []);

  // Login function - validates via Convex (where AUTH_PASSWORD is stored)
  const login = useCallback(
    async (password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      try {
        // Validate via Convex (works for both web and mobile)
        const isValid = await convexValidate({ password });
        
        if (isValid) {
          setLocalAuth();
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: "Invalid password" };
      } catch (e) {
        console.error("Login error:", e);
        setIsLoading(false);
        return { success: false, error: "Login failed - are you online?" };
      }
    },
    [convexValidate]
  );

  // Logout function
  const logout = useCallback(() => {
    clearLocalAuth();
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
