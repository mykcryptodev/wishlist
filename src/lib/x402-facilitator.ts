/**
 * x402 Payment Facilitator Configuration
 *
 * This module sets up the facilitator for handling x402 payments.
 * The facilitator verifies and settles payments on-chain.
 *
 * Documentation: https://portal.thirdweb.com/payments/x402
 */

import { createThirdwebClient } from "thirdweb";
import { facilitator } from "thirdweb/x402";

const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const SERVER_WALLET_ADDRESS = process.env.THIRDWEB_PROJECT_WALLET;

if (!THIRDWEB_SECRET_KEY) {
  throw new Error(
    "THIRDWEB_SECRET_KEY environment variable is required for x402 payments",
  );
}

if (!SERVER_WALLET_ADDRESS) {
  throw new Error(
    "THIRDWEB_PROJECT_WALLET environment variable is required for x402 payments",
  );
}

// Create Thirdweb client for facilitator
const client = createThirdwebClient({
  secretKey: THIRDWEB_SECRET_KEY,
});

/**
 * x402 facilitator instance
 *
 * This facilitator handles verifying and settling payments on-chain.
 * It uses your project wallet to settle payments.
 */
export const x402Facilitator = facilitator({
  client,
  serverWalletAddress: SERVER_WALLET_ADDRESS,
});
