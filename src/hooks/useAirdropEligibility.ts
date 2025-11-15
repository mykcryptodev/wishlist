import { chain, wish } from "@/constants";
import { client } from "@/providers/Thirdweb";
import { useQuery } from "@tanstack/react-query";
import { getContract } from "thirdweb";
import { isClaimed } from "thirdweb/extensions/airdrop";
import { toUnits } from "thirdweb/utils";

import { getAmountForAddress, isAddressEligible } from "@/lib/merkleProofs";
import { AIRDROP_CSV_DATA } from "../../airdrop/airdrop";

interface AirdropEligibility {
  eligibleAmount: bigint;
  eligibleAmountFormatted: string;
  isEligible: boolean;
  hasClaimed: boolean;
}

/**
 * Hook to check airdrop eligibility for a user
 * This uses CSV data to determine eligibility and checks on-chain claim status
 */
export function useAirdropEligibility(
  userAddress?: string,
  airdropContractAddress?: string,
) {
  return useQuery<AirdropEligibility>({
    queryKey: [
      "airdropEligibility",
      chain.id,
      userAddress,
      airdropContractAddress,
    ],
    queryFn: async () => {
      if (!userAddress || !airdropContractAddress) {
        return {
          eligibleAmount: BigInt(0),
          eligibleAmountFormatted: "0",
          isEligible: false,
          hasClaimed: false,
        };
      }

      try {
        const airdropContract = getContract({
          client,
          chain,
          address: airdropContractAddress,
        });

        // Step 1: Check eligibility from CSV data
        const isEligible = isAddressEligible(AIRDROP_CSV_DATA, userAddress);
        const amount = getAmountForAddress(AIRDROP_CSV_DATA, userAddress);

        // Convert amount to wei (BigInt) for consistency
        const eligibleAmount =
          amount > 0 ? toUnits(amount.toString(), 18) : BigInt(0);
        const eligibleAmountFormatted = amount > 0 ? amount.toString() : "0";

        // Step 2: Check if user has already claimed
        let hasClaimed = false;
        if (isEligible && eligibleAmount > BigInt(0)) {
          try {
            hasClaimed = await isClaimed({
              contract: airdropContract,
              receiver: userAddress as `0x${string}`,
              token: wish[chain.id] as `0x${string}`,
              tokenId: BigInt(0), // ERC20 uses tokenId 0
            });
          } catch (error) {
            console.warn("Error checking claim status:", error);
            // If we can't check claim status, assume not claimed
            // The contract will validate during claim anyway
            hasClaimed = false;
          }
        }

        return {
          eligibleAmount,
          eligibleAmountFormatted,
          isEligible,
          hasClaimed,
        };
      } catch (error) {
        console.error("Error checking airdrop eligibility:", error);
        return {
          eligibleAmount: BigInt(0),
          eligibleAmountFormatted: "0",
          isEligible: false,
          hasClaimed: false,
        };
      }
    },
    enabled: !!userAddress && !!airdropContractAddress,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}
