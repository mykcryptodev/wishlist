"use client";

import { useEffect,useState } from "react";

const AUTH_TOKEN_KEY = "wishlist_auth_token";

export function useAuthToken() {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from localStorage on mount
    console.log("[useAuthToken] Loading token from localStorage on mount");
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    console.log("[useAuthToken] Token found on mount:", !!storedToken);
    setTokenState(storedToken);
    setIsLoading(false);
  }, []);

  const setToken = (newToken: string | null) => {
    console.log(
      "[useAuthToken] setToken called with:",
      newToken?.substring(0, 50) + "...",
    );
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      console.log("[useAuthToken] Token saved to localStorage");
      // Verify it was saved
      const saved = localStorage.getItem(AUTH_TOKEN_KEY);
      console.log(
        "[useAuthToken] Verification - token in localStorage:",
        !!saved,
      );
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      console.log("[useAuthToken] Token removed from localStorage");
    }
  };

  const clearToken = () => {
    setTokenState(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return { token, setToken, clearToken, isLoading };
}
