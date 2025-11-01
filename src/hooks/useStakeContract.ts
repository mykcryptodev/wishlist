"use client";

import { encode, getContract, toUnits, waitForReceipt } from "thirdweb";
import { allowance, approve, decimals } from "thirdweb/extensions/erc20";
import {
  useActiveAccount,
  useActiveWallet,
  useCapabilities,
  useSendTransaction,
} from "thirdweb/react";
import { sendCalls as walletSendCalls } from "thirdweb/wallets/eip5792";

import { chain, stake as stakeAddress, wish } from "@/constants";
import {
  stake,
  startBurnTracking,
  withdraw,
  getStakeInfo,
} from "@/constants/contracts/stake";
import { client } from "@/providers/Thirdweb";

export function useStakeContract() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { data: capabilities, isLoading: capabilitiesLoading } =
    useCapabilities({
      chainId: chain.id,
    });
  const { mutateAsync: sendTx } = useSendTransaction();

  const stakeContract = getContract({
    client,
    chain,
    address: stakeAddress[chain.id],
  });

  const wishContract = getContract({
    client,
    chain,
    address: wish[chain.id],
  });

  // Stake tokens with optional burn tracking
  const stakeTokens = async (params: {
    amount: string; // amount in token units (not wei)
    startTracking?: boolean; // whether to also call startBurnTracking
  }) => {
    if (!account) throw new Error("No account connected");
    if (!wallet) throw new Error("No wallet connected");

    try {
      // Get token decimals
      const tokenDecimals = await decimals({ contract: wishContract });

      // Convert amount to wei
      const amountInWei = toUnits(params.amount, tokenDecimals);

      console.log(
        `Staking ${params.amount} tokens (${amountInWei.toString()} wei)`,
      );

      // Check capabilities for batching support
      const hasError = capabilities && "message" in capabilities;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caps = capabilities as any;

      const supportsBatching =
        !capabilitiesLoading &&
        capabilities &&
        !hasError &&
        (caps?.atomicBatch?.supported === true ||
          caps?.[chain.id]?.atomicBatch?.supported === true ||
          caps?.[`0x${chain.id.toString(16)}`]?.atomicBatch?.supported ===
            true ||
          caps?.[String(chain.id)]?.atomicBatch?.supported === true ||
          caps?.sendCalls !== undefined ||
          caps?.[chain.id]?.sendCalls !== undefined ||
          caps?.[`0x${chain.id.toString(16)}`]?.sendCalls !== undefined);

      if (capabilitiesLoading) {
        console.log("⏳ Loading wallet capabilities...");
      } else if (hasError) {
        console.log(
          `❌ Wallet capabilities error: ${(capabilities as any).message}. Will send transactions separately if needed.`,
        );
      } else if (supportsBatching) {
        console.log(
          `✅ Wallet supports batching on chain ${chain.id}, will batch transactions if needed`,
        );
      } else {
        console.log(
          `⚠️ Wallet does not support batching on chain ${chain.id}, will send transactions separately if needed`,
        );
      }

      // Check allowance
      const currentAllowance = await allowance({
        contract: wishContract,
        owner: account.address,
        spender: stakeAddress[chain.id],
      });

      console.log(
        `Current allowance: ${currentAllowance.toString()} wei, needed: ${amountInWei.toString()} wei`,
      );

      // Prepare transactions
      const needsApproval = currentAllowance < amountInWei;
      const transactions = [];

      // Approval transaction (if needed)
      let approveTransaction;
      if (needsApproval) {
        console.log("⚠️ Approval needed");
        approveTransaction = approve({
          contract: wishContract,
          spender: stakeAddress[chain.id],
          amountWei: amountInWei,
        });
        transactions.push(approveTransaction);
      }

      // Stake transaction
      const stakeTransaction = stake({
        contract: stakeContract,
        amount: amountInWei,
      });
      transactions.push(stakeTransaction);

      // Start burn tracking transaction (if requested)
      let burnTrackingTransaction;
      if (params.startTracking) {
        burnTrackingTransaction = startBurnTracking({
          contract: stakeContract,
        });
        transactions.push(burnTrackingTransaction);
      }

      // Execute transactions based on wallet capabilities
      if (supportsBatching && transactions.length > 1) {
        // Batch all transactions together
        console.log(
          `✅ Batching ${transactions.length} transactions together...`,
        );

        const calls = await Promise.all(
          transactions.map(async tx => ({
            to: tx.to!,
            data: await encode(tx),
            value: BigInt(0),
            chain,
            client,
          })),
        );

        const bundleId = await walletSendCalls({
          wallet,
          calls,
        });

        console.log("✅ Batched transaction sent! Bundle ID:", bundleId);
        return { bundleId, batched: true };
      } else if (!supportsBatching && transactions.length > 1) {
        // Send transactions separately
        console.log(
          `Sending ${transactions.length} transactions separately...`,
        );

        const receipts = [];

        // Send approval first (if needed)
        if (needsApproval && approveTransaction) {
          const approvalResult = await sendTx(approveTransaction);
          const approvalReceipt = await waitForReceipt({
            client,
            chain,
            transactionHash: approvalResult.transactionHash,
          });
          console.log(
            "✅ Approval confirmed:",
            approvalReceipt.transactionHash,
          );
          receipts.push(approvalReceipt);
        }

        // Send stake transaction
        const stakeResult = await sendTx(stakeTransaction);
        const stakeReceipt = await waitForReceipt({
          client,
          chain,
          transactionHash: stakeResult.transactionHash,
        });
        console.log("✅ Stake confirmed:", stakeReceipt.transactionHash);
        receipts.push(stakeReceipt);

        // Send burn tracking transaction (if requested)
        if (params.startTracking && burnTrackingTransaction) {
          const burnResult = await sendTx(burnTrackingTransaction);
          const burnReceipt = await waitForReceipt({
            client,
            chain,
            transactionHash: burnResult.transactionHash,
          });
          console.log("✅ Burn tracking started:", burnReceipt.transactionHash);
          receipts.push(burnReceipt);
        }

        return { receipts, batched: false };
      } else {
        // Single transaction (no approval needed)
        const result = await sendTx(stakeTransaction);
        const receipt = await waitForReceipt({
          client,
          chain,
          transactionHash: result.transactionHash,
        });

        // If burn tracking was requested, send it separately
        if (params.startTracking && burnTrackingTransaction) {
          const burnResult = await sendTx(burnTrackingTransaction);
          const burnReceipt = await waitForReceipt({
            client,
            chain,
            transactionHash: burnResult.transactionHash,
          });
          console.log("✅ Burn tracking started:", burnReceipt.transactionHash);
          return { receipts: [receipt, burnReceipt], batched: false };
        }

        return { receipt, batched: false };
      }
    } catch (error) {
      console.error("Error staking tokens:", error);
      throw error;
    }
  };

  // Unstake (withdraw) tokens
  const unstakeTokens = async (params: { amount: string }) => {
    if (!account) throw new Error("No account connected");

    try {
      // Get token decimals
      const tokenDecimals = await decimals({ contract: wishContract });

      // Convert amount to wei
      const amountInWei = toUnits(params.amount, tokenDecimals);

      console.log(
        `Unstaking ${params.amount} tokens (${amountInWei.toString()} wei)`,
      );

      const withdrawTransaction = withdraw({
        contract: stakeContract,
        amount: amountInWei,
      });

      const result = await sendTx(withdrawTransaction);
      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: result.transactionHash,
      });

      console.log("✅ Unstake confirmed:", receipt.transactionHash);
      return { receipt };
    } catch (error) {
      console.error("Error unstaking tokens:", error);
      throw error;
    }
  };

  // Get staked info for an address
  const getStakedInfo = async (address: string) => {
    try {
      const result = await getStakeInfo({
        contract: stakeContract,
        staker: address,
      });

      // result is [tokensStaked, rewards]
      return {
        tokensStaked: result[0],
        rewards: result[1],
      };
    } catch (error) {
      console.error("Error getting stake info:", error);
      throw error;
    }
  };

  return {
    stakeTokens,
    unstakeTokens,
    getStakedInfo,
  };
}
