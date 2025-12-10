import { createConfig } from "ponder";

import { stakingAbi } from "./abis/staking";

export default createConfig({
  chains: {
    base: {
      id: 8453,
      // RPC URLs from environment variable (comma-separated)
      // Falls back to public Base RPC if not set
      // Set PONDER_RPC_URLS in your .env file (see env.example)
      rpc: process.env.PONDER_RPC_URLS?.split(",").filter(Boolean) || [
        "https://mainnet.base.org",
      ],
      // Limit requests per second to avoid rate limits
      maxRequestsPerSecond: 5,
    },
  },
  contracts: {
    StakeAWish: {
      chain: "base",
      abi: stakingAbi,
      address: "0xf175a87fcdf7d51dffecf1edc81dbcf97f0128a9",
      startBlock: 37973391,
    },
  },
});
