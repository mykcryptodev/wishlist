import { base, baseSepolia } from "thirdweb/chains";

// APP INFO
export const appName = "Wishlist";
export const appDescription =
  "Create your perfect holiday wishlist. Add items from any website, organize your favorites, and share with family and friends!";

// CHAINS
export const chain = base;

// ADDRESSES
export const wishlist = {
  [baseSepolia.id]: "0x7b037daa8cbd14b68b2bc920d7be045c3eb2ab0a",
  [base.id]: "0x7b037daa8cbd14b68b2bc920d7be045c3eb2ab0a",
};

export const usdc = {
  [baseSepolia.id]: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

export const multicall = {
  [baseSepolia.id]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [base.id]: "0xca11bde05977b3631167028862be2a173976ca11",
};
