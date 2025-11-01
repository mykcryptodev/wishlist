import { base, baseSepolia } from "thirdweb/chains";

// APP INFO
export const appName = "Wishlist";
export const appDescription =
  "Create your perfect holiday wishlist. Collaborate with family and friends!";

// CHAINS
export const chain = base;

// ADDRESSES
export const wishlist = {
  [baseSepolia.id]: "0x3753f2cD72850Df8Df3B665229fF5c9Bb13a26Af",
  [base.id]: "0x28b2c964c06d49Ea857B69aa6c743080a125F773",
};

export const wish = {
  [baseSepolia.id]: "0x859A5c8777Dac39Fb84820dF00Fa1e1324CA094b",
  [base.id]: "0xf5f7Ec461CE97d0FA2396b3BFF36656b63811b07",
};

export const stake = {
  [baseSepolia.id]: "0xb21d9c50aedd37e530085a0bc206fba316d3a000",
  [base.id]: "0xd78aF06a5A63e4e8E4Ab94C403C1907ebded583C",
};

export const usdc = {
  [baseSepolia.id]: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

export const multicall = {
  [baseSepolia.id]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [base.id]: "0xca11bde05977b3631167028862be2a173976ca11",
};
