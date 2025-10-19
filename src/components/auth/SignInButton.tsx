"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuthToken } from "@/hooks/useAuthToken";

/**
 * SignInButton Component
 *
 * Allows users to sign in with Ethereum (SIWE) to authenticate API requests.
 * This is required for creating/managing gift exchanges and viewing filtered purchaser lists.
 */
export function SignInButton() {
  const account = useActiveAccount();
  const { token, saveToken, clearToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Initiate SIWE authentication
      const initiateResponse = await fetch(
        "https://api.thirdweb.com/v1/auth/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
          },
          body: JSON.stringify({
            method: "siwe",
            address: account.address,
            chainId: 8453, // Base mainnet
          }),
        },
      );

      if (!initiateResponse.ok) {
        throw new Error("Failed to initiate authentication");
      }

      const initiateData = await initiateResponse.json();
      const payload = initiateData.payload;

      // Step 2: Sign the SIWE message
      const signature = await account.signMessage({
        message: payload,
      });

      // Step 3: Complete authentication
      const completeResponse = await fetch(
        "https://api.thirdweb.com/v1/auth/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
          },
          body: JSON.stringify({
            method: "siwe",
            payload,
            signature,
          }),
        },
      );

      if (!completeResponse.ok) {
        throw new Error("Failed to complete authentication");
      }

      const completeData = await completeResponse.json();
      const authToken = completeData.token;

      // Save the token
      saveToken(authToken);
      toast.success("Signed in successfully!");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    clearToken();
    toast.success("Signed out successfully");
  };

  if (!account) {
    return null;
  }

  if (token) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="gap-2"
      >
        <ShieldCheck className="h-4 w-4" />
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleSignIn}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing In...
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4" />
          Sign In
        </>
      )}
    </Button>
  );
}
