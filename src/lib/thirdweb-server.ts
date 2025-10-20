/**
 * Server-side Thirdweb client and auth configuration
 *
 * This client is configured with the secret key for backend operations
 * like signature verification. Never expose this client to the frontend.
 */

import { createThirdwebClient } from "thirdweb";
import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { base } from "thirdweb/chains";

if (!process.env.THIRDWEB_SECRET_KEY) {
  throw new Error("THIRDWEB_SECRET_KEY is required for server-side operations");
}

if (!process.env.ADMIN_PRIVATE_KEY) {
  throw new Error(
    "ADMIN_PRIVATE_KEY (private key) is required for SIWE authentication",
  );
}

export const serverClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

// Create the admin account from the project wallet private key
const adminAccount = privateKeyToAccount({
  client: serverClient,
  privateKey: process.env.ADMIN_PRIVATE_KEY,
});

// Create the auth instance
export const thirdwebAuth = createAuth({
  domain:
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ||
    "localhost:3000",
  client: serverClient,
  adminAccount,
});
