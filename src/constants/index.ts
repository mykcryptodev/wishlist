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
  [baseSepolia.id]: "0x194aeC188A3F5a857DfA15D6DCCC3c46f8c82Bb1",
  [base.id]: "0x097ebA276dC9DD4cFe8837d80227B20275b88bE7",
};

export const multisig = {
  [baseSepolia.id]: "0xFAC5F38f795BC4F39950Cca8527eea00D5Bb0EF7",
  [base.id]: "0xFAC5F38f795BC4F39950Cca8527eea00D5Bb0EF7",
};

export const usdc = {
  [baseSepolia.id]: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

export const weth = {
  [baseSepolia.id]: "0x4200000000000000000000000000000000000006",
  [base.id]: "0x4200000000000000000000000000000000000006",
};

export const multicall = {
  [baseSepolia.id]: "0xcA11bde05977b3631167028862bE2a173976CA11",
  [base.id]: "0xca11bde05977b3631167028862be2a173976ca11",
};
