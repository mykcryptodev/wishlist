// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console} from "forge-std/Script.sol";
import {Wishlist} from "../contracts/src/Wishlist.sol";

contract DeployWishlist is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        Wishlist wishlist = new Wishlist();
        
        vm.stopBroadcast();
    }
}
