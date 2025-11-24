/**
 * Authentication Utilities
 *
 * Handles SIWE (Sign-In With Ethereum) authentication using Thirdweb's API
 * and JWT token management.
 */

import { isAddress } from "thirdweb";

import { thirdwebAuth } from "@/lib/thirdweb-server";

/**
 * Token stored in cookies/localStorage after authentication
 */
export interface AuthToken {
  walletAddress: string;
  isNewUser: boolean;
  type: string;
}

/**
 * Get auth token from request headers
 * Expects: Authorization: Bearer <token>
 */
export function getAuthTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

/**
 * Verify and decode an auth token from SIWE
 *
 * @param token - JWT token from the request
 * @returns Wallet address if valid, null otherwise
 */
export async function verifyAuthToken(token: string): Promise<string | null> {
  try {
    // Use Thirdweb's verifyJWT to verify the token
    const verifiedToken = await thirdwebAuth.verifyJWT({ jwt: token });

    if (!verifiedToken.valid) {
      return null;
    }

    // The 'sub' field contains the user's address
    const address = verifiedToken.parsedJWT.sub;

    if (!address || !isAddress(address)) {
      return null;
    }

    return address.toLowerCase();
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return null;
  }
}

/**
 * Require authentication for an API route
 * Returns the authenticated wallet address or throws an error
 *
 * @param request - Next.js request object
 * @returns Wallet address in lowercase
 * @throws Error if authentication fails
 */
export async function requireAuth(request: Request): Promise<string> {
  const headers = new Headers(request.headers);

  // Try Bearer token first (SIWE)
  const token = getAuthTokenFromHeaders(headers);
  if (token) {
    const walletAddress = await verifyAuthToken(token);
    if (walletAddress) {
      return walletAddress;
    }
  }

  throw new Error("No valid authentication provided");
}

/**
 * Optional authentication - returns wallet address if authenticated, null otherwise
 * Use this when authentication is optional but you want to know who the user is
 *
 * Tries Bearer token (SIWE) from header first
 */
export async function optionalAuth(request: Request): Promise<string | null> {
  const headers = new Headers(request.headers);

  // Try Bearer token first (SIWE)
  const token = getAuthTokenFromHeaders(headers);
  if (token) {
    const walletAddress = await verifyAuthToken(token);
    if (walletAddress) {
      return walletAddress;
    }
  }

  return null;
}
