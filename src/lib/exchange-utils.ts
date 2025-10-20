/**
 * Gift Exchange Utilities
 *
 * Helper functions for managing gift exchanges and determining
 * approved purchaser relationships.
 */

import { supabaseAdmin } from "./supabase";

/**
 * Get all approved purchaser addresses for a given user
 * An "approved purchaser" is anyone who is in the same exchange(s) as the user
 *
 * @param walletAddress - The user's wallet address
 * @returns Set of wallet addresses that are approved purchasers
 */
export async function getApprovedPurchasers(
  walletAddress: string | undefined | null,
): Promise<Set<string>> {
  try {
    // Handle undefined/null wallet address
    if (!walletAddress) {
      return new Set();
    }

    // Normalize the wallet address to lowercase
    const normalizedAddress = walletAddress.toLowerCase();

    // Step 1: Get all exchanges this user is a member of
    const { data: userMemberships, error: membershipError } =
      await supabaseAdmin
        .from("exchange_memberships")
        .select("exchange_id")
        .eq("wallet_address", normalizedAddress);

    if (membershipError) {
      console.error("Error fetching user memberships:", membershipError);
      return new Set();
    }

    if (!userMemberships || userMemberships.length === 0) {
      // User is not in any exchanges
      return new Set();
    }

    // Extract exchange IDs
    const exchangeIds = userMemberships.map(m => m.exchange_id);

    // Step 2: Get all members from these exchanges (excluding the user themselves)
    const { data: allMembers, error: allMembersError } = await supabaseAdmin
      .from("exchange_memberships")
      .select("wallet_address")
      .in("exchange_id", exchangeIds)
      .neq("wallet_address", normalizedAddress);

    if (allMembersError) {
      console.error("Error fetching exchange members:", allMembersError);
      return new Set();
    }

    // Step 3: Create a set of unique wallet addresses
    const approvedAddresses = new Set(
      allMembers?.map(m => m.wallet_address.toLowerCase()) || [],
    );

    return approvedAddresses;
  } catch (error) {
    console.error("Error in getApprovedPurchasers:", error);
    return new Set();
  }
}

/**
 * Check if a user is a member of any exchanges
 *
 * @param walletAddress - The user's wallet address
 * @returns True if the user is in at least one exchange
 */
export async function isInAnyExchange(
  walletAddress: string | undefined | null,
): Promise<boolean> {
  try {
    if (!walletAddress) {
      return false;
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const { data: userMemberships, error: membershipError } =
      await supabaseAdmin
        .from("exchange_memberships")
        .select("exchange_id")
        .eq("wallet_address", normalizedAddress)
        .limit(1); // Only need to check if at least one exists

    if (membershipError) {
      console.error("Error checking exchange membership:", membershipError);
      return false;
    }

    return userMemberships && userMemberships.length > 0;
  } catch (error) {
    console.error("Error in isInAnyExchange:", error);
    return false;
  }
}

/**
 * Check if two users are in the same exchange (approved purchasers for each other)
 *
 * @param walletAddress1 - First user's wallet address
 * @param walletAddress2 - Second user's wallet address
 * @returns True if they share at least one exchange
 */
export async function areInSameExchange(
  walletAddress1: string,
  walletAddress2: string,
): Promise<boolean> {
  try {
    const normalized1 = walletAddress1.toLowerCase();
    const normalized2 = walletAddress2.toLowerCase();

    // Get exchanges for first user
    const { data: user1Exchanges } = await supabaseAdmin
      .from("exchange_memberships")
      .select("exchange_id")
      .eq("wallet_address", normalized1);

    if (!user1Exchanges || user1Exchanges.length === 0) {
      return false;
    }

    const exchangeIds = user1Exchanges.map(m => m.exchange_id);

    // Check if second user is in any of these exchanges
    const { data: user2Memberships } = await supabaseAdmin
      .from("exchange_memberships")
      .select("exchange_id")
      .eq("wallet_address", normalized2)
      .in("exchange_id", exchangeIds);

    return (user2Memberships?.length || 0) > 0;
  } catch (error) {
    console.error("Error in areInSameExchange:", error);
    return false;
  }
}

/**
 * Generate a unique invite code for an exchange
 * Format: 6 uppercase alphanumeric characters (e.g., "ABC123")
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Ensure invite code is unique by checking database
 * If collision occurs, generate a new one
 */
export async function generateUniqueInviteCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateInviteCode();

    // Check if code already exists
    const { data, error } = await supabaseAdmin
      .from("exchanges")
      .select("id")
      .eq("invite_code", code)
      .single();

    if (error || !data) {
      // Code doesn't exist, we can use it
      return code;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique invite code after multiple attempts",
  );
}
