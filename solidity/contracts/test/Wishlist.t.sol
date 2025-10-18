// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Wishlist} from "../src/Wishlist.sol";

contract WishlistTest is Test {
    Wishlist public wishlist;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public purchaser1 = address(0x4);
    address public purchaser2 = address(0x5);
    address public manager = address(0x6);
    address public admin = address(0x7);

    function setUp() public {
        vm.prank(owner);
        wishlist = new Wishlist();
    }

    function testCreateItem() public {
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone with titanium design",
            "https://apple.com/iphone-15-pro",
            "https://apple.com/images/iphone-15-pro.jpg",
            999 ether
        );

        assertEq(itemId, 1);
        assertEq(wishlist.nextItemId(), 2);

        Wishlist.WishlistItem memory item = wishlist.getItem(itemId);
        assertEq(item.id, 1);
        assertEq(item.owner, user1);
        assertEq(item.title, "iPhone 15 Pro");
        assertEq(item.description, "Latest iPhone with titanium design");
        assertEq(item.url, "https://apple.com/iphone-15-pro");
        assertEq(item.imageUrl, "https://apple.com/images/iphone-15-pro.jpg");
        assertEq(item.price, 999 ether);
        assertTrue(item.exists);
    }

    function testCreateItemEmptyTitle() public {
        vm.prank(user1);
        vm.expectRevert(Wishlist.EmptyTitle.selector);
        wishlist.createItem(
            "",
            "Description",
            "https://example.com",
            "",
            0
        );
    }

    function testCreateItemEmptyUrl() public {
        vm.prank(user1);
        vm.expectRevert(Wishlist.EmptyUrl.selector);
        wishlist.createItem(
            "Title",
            "Description",
            "",
            "",
            0
        );
    }

    function testUpdateItem() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Update item
        vm.prank(user1);
        wishlist.updateItem(
            itemId,
            "iPhone 15 Pro Max",
            "Latest iPhone with larger screen",
            "https://apple.com/iphone-15-pro-max",
            "https://apple.com/images/iphone-15-pro-max.jpg",
            1099 ether
        );

        Wishlist.WishlistItem memory item = wishlist.getItem(itemId);
        assertEq(item.title, "iPhone 15 Pro Max");
        assertEq(item.description, "Latest iPhone with larger screen");
        assertEq(item.url, "https://apple.com/iphone-15-pro-max");
        assertEq(item.imageUrl, "https://apple.com/images/iphone-15-pro-max.jpg");
        assertEq(item.price, 1099 ether);
    }

    function testUpdateItemNotOwner() public {
        // Create item as user1
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Try to update as user2
        vm.prank(user2);
        vm.expectRevert(Wishlist.NotItemOwner.selector);
        wishlist.updateItem(
            itemId,
            "iPhone 15 Pro Max",
            "Latest iPhone with larger screen",
            "https://apple.com/iphone-15-pro-max",
            "",
            1099 ether
        );
    }

    function testDeleteItem() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Delete item
        vm.prank(user1);
        wishlist.deleteItem(itemId);

        // Check that item no longer exists
        vm.expectRevert(Wishlist.ItemDoesNotExist.selector);
        wishlist.getItem(itemId);
    }

    function testSignUpAsPurchaser() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Sign up as purchaser
        vm.prank(purchaser1);
        wishlist.signUpAsPurchaser(itemId);

        // Check purchaser count
        assertEq(wishlist.getPurchaserCount(itemId), 1);
        assertTrue(wishlist.checkIsPurchaser(itemId, purchaser1));

        // Get purchasers
        Wishlist.Purchaser[] memory purchasers = wishlist.getPurchasers(itemId);
        assertEq(purchasers.length, 1);
        assertEq(purchasers[0].purchaser, purchaser1);
        assertTrue(purchasers[0].exists);
    }

    function testSignUpAsPurchaserOwnItem() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Try to sign up as purchaser for own item
        vm.prank(user1);
        vm.expectRevert(Wishlist.CannotPurchaseOwnItem.selector);
        wishlist.signUpAsPurchaser(itemId);
    }

    function testSignUpAsPurchaserTwice() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Sign up as purchaser first time
        vm.prank(purchaser1);
        wishlist.signUpAsPurchaser(itemId);

        // Try to sign up again
        vm.prank(purchaser1);
        vm.expectRevert(Wishlist.AlreadyPurchaser.selector);
        wishlist.signUpAsPurchaser(itemId);
    }

    function testRemoveAsPurchaser() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Sign up as purchaser
        vm.prank(purchaser1);
        wishlist.signUpAsPurchaser(itemId);

        // Remove as purchaser
        vm.prank(purchaser1);
        wishlist.removeAsPurchaser(itemId);

        // Check purchaser count
        assertEq(wishlist.getPurchaserCount(itemId), 0);
        assertFalse(wishlist.checkIsPurchaser(itemId, purchaser1));
    }

    function testMultiplePurchasers() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Sign up multiple purchasers
        vm.prank(purchaser1);
        wishlist.signUpAsPurchaser(itemId);

        vm.prank(purchaser2);
        wishlist.signUpAsPurchaser(itemId);

        // Check purchaser count
        assertEq(wishlist.getPurchaserCount(itemId), 2);
        assertTrue(wishlist.checkIsPurchaser(itemId, purchaser1));
        assertTrue(wishlist.checkIsPurchaser(itemId, purchaser2));

        // Get purchasers
        Wishlist.Purchaser[] memory purchasers = wishlist.getPurchasers(itemId);
        assertEq(purchasers.length, 2);
    }

    function testGetItemsByOwner() public {
        // Create items for user1
        vm.prank(user1);
        uint256 itemId1 = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        vm.prank(user1);
        uint256 itemId2 = wishlist.createItem(
            "MacBook Pro",
            "Latest MacBook",
            "https://apple.com/macbook-pro",
            "",
            1999 ether
        );

        // Create item for user2
        vm.prank(user2);
        uint256 itemId3 = wishlist.createItem(
            "iPad Pro",
            "Latest iPad",
            "https://apple.com/ipad-pro",
            "",
            799 ether
        );

        // Get items by owner
        uint256[] memory user1Items = wishlist.getItemsByOwner(user1);
        assertEq(user1Items.length, 2);
        assertEq(user1Items[0], itemId1);
        assertEq(user1Items[1], itemId2);

        uint256[] memory user2Items = wishlist.getItemsByOwner(user2);
        assertEq(user2Items.length, 1);
        assertEq(user2Items[0], itemId3);
    }

    function testGetItemsPaginated() public {
        // Create multiple items
        vm.prank(user1);
        wishlist.createItem("Item 1", "Description 1", "https://example.com/1", "", 100 ether);
        
        vm.prank(user2);
        wishlist.createItem("Item 2", "Description 2", "https://example.com/2", "", 200 ether);
        
        vm.prank(user1);
        wishlist.createItem("Item 3", "Description 3", "https://example.com/3", "", 300 ether);

        // Test pagination
        (uint256[] memory items1, bool hasMore1) = wishlist.getItemsPaginated(0, 2);
        assertEq(items1.length, 2);
        assertTrue(hasMore1);

        (uint256[] memory items2, bool hasMore2) = wishlist.getItemsPaginated(2, 2);
        assertEq(items2.length, 1);
        assertFalse(hasMore2);
    }

    function testGetTotalItems() public {
        assertEq(wishlist.getTotalItems(), 0);

        vm.prank(user1);
        wishlist.createItem("Item 1", "Description 1", "https://example.com/1", "", 100 ether);
        
        assertEq(wishlist.getTotalItems(), 1);

        vm.prank(user2);
        wishlist.createItem("Item 2", "Description 2", "https://example.com/2", "", 200 ether);
        
        assertEq(wishlist.getTotalItems(), 2);
    }

    function testEvents() public {
        // Test ItemCreated event
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit Wishlist.ItemCreated(1, user1, "iPhone 15 Pro", "https://apple.com/iphone-15-pro");
        wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );

        // Test PurchaserSignedUp event
        vm.prank(purchaser1);
        vm.expectEmit(true, true, true, false);
        emit Wishlist.PurchaserSignedUp(1, purchaser1, user1);
        wishlist.signUpAsPurchaser(1);
    }

    // Permission System Tests

    function testGrantManagerRole() public {
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        assertTrue(wishlist.hasManagerRole(manager));
    }

    function testRevokeManagerRole() public {
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        vm.prank(owner);
        wishlist.revokeManagerRole(manager);
        
        assertFalse(wishlist.hasManagerRole(manager));
    }

    function testOnlyAdminCanGrantManagerRole() public {
        vm.prank(user1);
        vm.expectRevert("Only admin can grant manager role");
        wishlist.grantManagerRole(manager);
    }

    function testOnlyAdminCanRevokeManagerRole() public {
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        vm.prank(user1);
        vm.expectRevert("Only admin can revoke manager role");
        wishlist.revokeManagerRole(manager);
    }

    function testManagerCanCreateItemForUser() public {
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        vm.prank(manager);
        uint256 itemId = wishlist.createItemForUser(
            user1,
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        assertEq(itemId, 1);
        Wishlist.WishlistItem memory item = wishlist.getItem(itemId);
        assertEq(item.owner, user1);
        assertEq(item.title, "iPhone 15 Pro");
    }

    function testManagerCanUpdateItemForUser() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        // Grant manager role
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        // Manager updates item
        vm.prank(manager);
        wishlist.updateItemForUser(
            itemId,
            "iPhone 15 Pro Max",
            "Latest iPhone with larger screen",
            "https://apple.com/iphone-15-pro-max",
            "",
            1099 ether
        );
        
        Wishlist.WishlistItem memory item = wishlist.getItem(itemId);
        assertEq(item.title, "iPhone 15 Pro Max");
        assertEq(item.price, 1099 ether);
    }

    function testManagerCanDeleteItemForUser() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        // Grant manager role
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        // Manager deletes item
        vm.prank(manager);
        wishlist.deleteItemForUser(itemId);
        
        // Check that item no longer exists
        vm.expectRevert(Wishlist.ItemDoesNotExist.selector);
        wishlist.getItem(itemId);
    }

    function testManagerCanSignUpPurchaserForUser() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        // Grant manager role
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        // Manager signs up purchaser
        vm.prank(manager);
        wishlist.signUpPurchaserForUser(itemId, purchaser1);
        
        assertTrue(wishlist.checkIsPurchaser(itemId, purchaser1));
        assertEq(wishlist.getPurchaserCount(itemId), 1);
    }

    function testManagerCanRemovePurchaserForUser() public {
        // Create item and sign up purchaser first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        vm.prank(purchaser1);
        wishlist.signUpAsPurchaser(itemId);
        
        // Grant manager role
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        // Manager removes purchaser
        vm.prank(manager);
        wishlist.removePurchaserForUser(itemId, purchaser1);
        
        assertFalse(wishlist.checkIsPurchaser(itemId, purchaser1));
        assertEq(wishlist.getPurchaserCount(itemId), 0);
    }

    function testNonManagerCannotCreateItemForUser() public {
        vm.prank(user1);
        vm.expectRevert("Only managers can create items for users");
        wishlist.createItemForUser(
            user2,
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
    }

    function testNonManagerCannotUpdateItemForUser() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        vm.prank(user2);
        vm.expectRevert("Only managers can update items for users");
        wishlist.updateItemForUser(
            itemId,
            "iPhone 15 Pro Max",
            "Latest iPhone with larger screen",
            "https://apple.com/iphone-15-pro-max",
            "",
            1099 ether
        );
    }

    function testNonManagerCannotDeleteItemForUser() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        vm.prank(user2);
        vm.expectRevert("Only managers can delete items for users");
        wishlist.deleteItemForUser(itemId);
    }

    function testNonManagerCannotSignUpPurchaserForUser() public {
        // Create item first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        vm.prank(user2);
        vm.expectRevert("Only managers can sign up purchasers for users");
        wishlist.signUpPurchaserForUser(itemId, purchaser1);
    }

    function testNonManagerCannotRemovePurchaserForUser() public {
        // Create item and sign up purchaser first
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        vm.prank(purchaser1);
        wishlist.signUpAsPurchaser(itemId);
        
        vm.prank(user2);
        vm.expectRevert("Only managers can remove purchasers for users");
        wishlist.removePurchaserForUser(itemId, purchaser1);
    }

    // Wishlist Address Directory Tests

    function testFirstItemAddsUserToDirectory() public {
        // Initially no addresses
        assertEq(wishlist.getWishlistAddressCount(), 0);
        assertFalse(wishlist.hasWishlist(user1));
        
        // Create first item
        vm.prank(user1);
        wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        // User should be added to directory
        assertEq(wishlist.getWishlistAddressCount(), 1);
        assertTrue(wishlist.hasWishlist(user1));
        
        address[] memory addresses = wishlist.getAllWishlistAddresses();
        assertEq(addresses.length, 1);
        assertEq(addresses[0], user1);
    }

    function testSecondItemDoesNotDuplicateUser() public {
        // Create first item
        vm.prank(user1);
        wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        assertEq(wishlist.getWishlistAddressCount(), 1);
        
        // Create second item for same user
        vm.prank(user1);
        wishlist.createItem(
            "MacBook Pro",
            "Latest MacBook",
            "https://apple.com/macbook-pro",
            "",
            1999 ether
        );
        
        // Count should still be 1
        assertEq(wishlist.getWishlistAddressCount(), 1);
        
        address[] memory addresses = wishlist.getAllWishlistAddresses();
        assertEq(addresses.length, 1);
        assertEq(addresses[0], user1);
    }

    function testMultipleUsersAddedToDirectory() public {
        // Create items for different users
        vm.prank(user1);
        wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        vm.prank(user2);
        wishlist.createItem(
            "iPad Pro",
            "Latest iPad",
            "https://apple.com/ipad-pro",
            "",
            799 ether
        );
        
        vm.prank(purchaser1);
        wishlist.createItem(
            "AirPods Pro",
            "Latest AirPods",
            "https://apple.com/airpods-pro",
            "",
            249 ether
        );
        
        // All three users should be in directory
        assertEq(wishlist.getWishlistAddressCount(), 3);
        assertTrue(wishlist.hasWishlist(user1));
        assertTrue(wishlist.hasWishlist(user2));
        assertTrue(wishlist.hasWishlist(purchaser1));
        
        address[] memory addresses = wishlist.getAllWishlistAddresses();
        assertEq(addresses.length, 3);
        assertEq(addresses[0], user1);
        assertEq(addresses[1], user2);
        assertEq(addresses[2], purchaser1);
    }

    function testManagerCreatingItemAddsUserToDirectory() public {
        // Grant manager role
        vm.prank(owner);
        wishlist.grantManagerRole(manager);
        
        // Manager creates item for user1
        vm.prank(manager);
        wishlist.createItemForUser(
            user1,
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        // User1 should be in directory
        assertEq(wishlist.getWishlistAddressCount(), 1);
        assertTrue(wishlist.hasWishlist(user1));
        
        address[] memory addresses = wishlist.getAllWishlistAddresses();
        assertEq(addresses.length, 1);
        assertEq(addresses[0], user1);
    }

    function testGetWishlistAddressesPaginated() public {
        // Create items for 5 different users
        address[5] memory users = [user1, user2, purchaser1, purchaser2, manager];
        
        for (uint256 i = 0; i < users.length; i++) {
            vm.prank(users[i]);
            wishlist.createItem(
                string(abi.encodePacked("Item ", i)),
                "Description",
                string(abi.encodePacked("https://example.com/", i)),
                "",
                100 ether
            );
        }
        
        assertEq(wishlist.getWishlistAddressCount(), 5);
        
        // Test first page (2 items)
        (address[] memory page1, bool hasMore1) = wishlist.getWishlistAddressesPaginated(0, 2);
        assertEq(page1.length, 2);
        assertTrue(hasMore1);
        assertEq(page1[0], user1);
        assertEq(page1[1], user2);
        
        // Test second page (2 items)
        (address[] memory page2, bool hasMore2) = wishlist.getWishlistAddressesPaginated(2, 2);
        assertEq(page2.length, 2);
        assertTrue(hasMore2);
        assertEq(page2[0], purchaser1);
        assertEq(page2[1], purchaser2);
        
        // Test last page (1 item)
        (address[] memory page3, bool hasMore3) = wishlist.getWishlistAddressesPaginated(4, 2);
        assertEq(page3.length, 1);
        assertFalse(hasMore3);
        assertEq(page3[0], manager);
        
        // Test offset beyond end
        (address[] memory page4, bool hasMore4) = wishlist.getWishlistAddressesPaginated(10, 2);
        assertEq(page4.length, 0);
        assertFalse(hasMore4);
    }

    function testGetWishlistAddressesPaginatedLargeLimit() public {
        // Create items for 3 users
        vm.prank(user1);
        wishlist.createItem("Item 1", "Description", "https://example.com/1", "", 100 ether);
        
        vm.prank(user2);
        wishlist.createItem("Item 2", "Description", "https://example.com/2", "", 100 ether);
        
        vm.prank(purchaser1);
        wishlist.createItem("Item 3", "Description", "https://example.com/3", "", 100 ether);
        
        // Request with limit larger than total
        (address[] memory addresses, bool hasMore) = wishlist.getWishlistAddressesPaginated(0, 100);
        assertEq(addresses.length, 3);
        assertFalse(hasMore);
    }

    function testUserAddedToWishlistDirectoryEvent() public {
        // Test event emission
        vm.prank(user1);
        vm.expectEmit(true, false, false, false);
        emit Wishlist.UserAddedToWishlistDirectory(user1);
        wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
    }

    function testUserAddedToWishlistDirectoryEventOnlyOnFirstItem() public {
        // First item should emit event
        vm.prank(user1);
        vm.expectEmit(true, false, false, false);
        emit Wishlist.UserAddedToWishlistDirectory(user1);
        wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        // Second item should NOT emit the directory event
        // (We can't easily test that an event is NOT emitted, but we can verify the count doesn't change)
        uint256 countBefore = wishlist.getWishlistAddressCount();
        
        vm.prank(user1);
        wishlist.createItem(
            "MacBook Pro",
            "Latest MacBook",
            "https://apple.com/macbook-pro",
            "",
            1999 ether
        );
        
        uint256 countAfter = wishlist.getWishlistAddressCount();
        assertEq(countBefore, countAfter);
    }

    function testDeleteItemDoesNotRemoveFromDirectory() public {
        // Create item
        vm.prank(user1);
        uint256 itemId = wishlist.createItem(
            "iPhone 15 Pro",
            "Latest iPhone",
            "https://apple.com/iphone-15-pro",
            "",
            999 ether
        );
        
        assertTrue(wishlist.hasWishlist(user1));
        assertEq(wishlist.getWishlistAddressCount(), 1);
        
        // Delete item
        vm.prank(user1);
        wishlist.deleteItem(itemId);
        
        // User should still be in directory
        assertTrue(wishlist.hasWishlist(user1));
        assertEq(wishlist.getWishlistAddressCount(), 1);
    }

    function testEmptyDirectoryInitially() public {
        assertEq(wishlist.getWishlistAddressCount(), 0);
        
        address[] memory addresses = wishlist.getAllWishlistAddresses();
        assertEq(addresses.length, 0);
        
        (address[] memory paginatedAddresses, bool hasMore) = wishlist.getWishlistAddressesPaginated(0, 10);
        assertEq(paginatedAddresses.length, 0);
        assertFalse(hasMore);
    }
}
