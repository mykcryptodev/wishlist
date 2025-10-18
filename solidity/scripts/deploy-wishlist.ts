import { ethers } from "hardhat";
import { Wishlist } from "../typechain-types";

async function main() {
  console.log("Deploying Wishlist contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const WishlistFactory = await ethers.getContractFactory("Wishlist");
  const wishlist: Wishlist = await WishlistFactory.deploy();
  await wishlist.waitForDeployment();

  const wishlistAddress = await wishlist.getAddress();
  console.log("Wishlist contract deployed to:", wishlistAddress);
  console.log("Next item ID:", await wishlist.nextItemId());

  // Verify the deployment
  console.log("\nVerifying deployment...");
  console.log("Total items:", await wishlist.getTotalItems());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
