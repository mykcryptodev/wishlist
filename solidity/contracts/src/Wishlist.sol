// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import {Permissions} from "@thirdweb-dev/contracts/extension/Permissions.sol";

/**
 * @title Wishlist
 * @dev A smart contract for managing wishlist items with purchaser functionality
 * @notice Users can create, update, and delete wishlist items. Other addresses can sign up as purchasers for items.
 * @notice Supports Thirdweb permissions for executing functions on behalf of other addresses.
 */
contract Wishlist is Permissions {
    // Custom errors
    error ItemDoesNotExist();
    error NotItemOwner();
    error AlreadyPurchaser();
    error NotPurchaserOfItem();
    error CannotPurchaseOwnItem();
    error EmptyTitle();
    error EmptyUrl();

    // Permission roles
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Struct to represent a wishlist item
    struct WishlistItem {
        uint256 id;
        address owner;
        string title;
        string description;
        string url;
        string imageUrl;
        uint256 price; // Price in wei (0 if not specified)
        bool exists;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Struct to represent a purchaser for an item
    struct Purchaser {
        address purchaser;
        uint256 signedUpAt;
        bool exists;
    }

    // Counter for wishlist item IDs
    uint256 public nextItemId = 1;

    // Mapping from item ID to WishlistItem
    mapping(uint256 => WishlistItem) public items;

    // Mapping from user address to array of item IDs they own
    mapping(address => uint256[]) public itemsByOwner;

    // Mapping from item ID to array of purchasers
    mapping(uint256 => Purchaser[]) public purchasersByItem;

    // Mapping from item ID to purchaser address to check if already signed up
    mapping(uint256 => mapping(address => bool)) public isPurchaser;

    // Events
    event ItemCreated(
        uint256 indexed itemId,
        address indexed owner,
        string title,
        string url
    );

    event ItemUpdated(
        uint256 indexed itemId,
        address indexed owner,
        string title
    );

    event ItemDeleted(
        uint256 indexed itemId,
        address indexed owner
    );

    event PurchaserSignedUp(
        uint256 indexed itemId,
        address indexed purchaser,
        address indexed itemOwner
    );

    event PurchaserRemoved(
        uint256 indexed itemId,
        address indexed purchaser,
        address indexed itemOwner
    );

    // Constructor
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, 0xb9c4BbD95838f5d51Cdac85344Db53756Ba56C7d);
    }

    // Modifiers
    modifier onlyItemOwner(uint256 _itemId) {
        if (!items[_itemId].exists) revert ItemDoesNotExist();
        if (items[_itemId].owner != msg.sender && !hasRole(MANAGER_ROLE, msg.sender)) revert NotItemOwner();
        _;
    }

    modifier onlyItemOwnerOrManager(uint256 _itemId) {
        if (!items[_itemId].exists) revert ItemDoesNotExist();
        if (items[_itemId].owner != msg.sender && !hasRole(MANAGER_ROLE, msg.sender)) revert NotItemOwner();
        _;
    }

    modifier itemExists(uint256 _itemId) {
        if (!items[_itemId].exists) revert ItemDoesNotExist();
        _;
    }

    modifier notAlreadyPurchaser(uint256 _itemId) {
        if (isPurchaser[_itemId][msg.sender]) revert AlreadyPurchaser();
        _;
    }

    modifier isPurchaserOfItem(uint256 _itemId) {
        if (!isPurchaser[_itemId][msg.sender]) revert NotPurchaserOfItem();
        _;
    }

    // Internal Functions - Core Logic

    /**
     * @dev Internal function to create a wishlist item
     * @param _owner The owner of the item
     * @param _title The title of the item
     * @param _description Description of the item
     * @param _url URL of the product
     * @param _imageUrl URL of the product image
     * @param _price Price of the item in wei (0 if not specified)
     * @return itemId The ID of the created item
     */
    function _createItem(
        address _owner,
        string memory _title,
        string memory _description,
        string memory _url,
        string memory _imageUrl,
        uint256 _price
    ) internal returns (uint256 itemId) {
        if (bytes(_title).length == 0) revert EmptyTitle();
        if (bytes(_url).length == 0) revert EmptyUrl();

        itemId = nextItemId++;
        
        items[itemId] = WishlistItem({
            id: itemId,
            owner: _owner,
            title: _title,
            description: _description,
            url: _url,
            imageUrl: _imageUrl,
            price: _price,
            exists: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        itemsByOwner[_owner].push(itemId);

        emit ItemCreated(itemId, _owner, _title, _url);
        
        return itemId;
    }

    /**
     * @dev Internal function to update a wishlist item
     * @param _itemId The ID of the item to update
     * @param _title New title of the item
     * @param _description New description of the item
     * @param _url New URL of the product
     * @param _imageUrl New URL of the product image
     * @param _price New price of the item in wei
     */
    function _updateItem(
        uint256 _itemId,
        string memory _title,
        string memory _description,
        string memory _url,
        string memory _imageUrl,
        uint256 _price
    ) internal {
        if (bytes(_title).length == 0) revert EmptyTitle();
        if (bytes(_url).length == 0) revert EmptyUrl();

        items[_itemId].title = _title;
        items[_itemId].description = _description;
        items[_itemId].url = _url;
        items[_itemId].imageUrl = _imageUrl;
        items[_itemId].price = _price;
        items[_itemId].updatedAt = block.timestamp;

        emit ItemUpdated(_itemId, items[_itemId].owner, _title);
    }

    /**
     * @dev Internal function to delete a wishlist item
     * @param _itemId The ID of the item to delete
     */
    function _deleteItem(uint256 _itemId) internal {
        address itemOwner = items[_itemId].owner;
        
        // Remove from owner's items array
        uint256[] storage ownerItems = itemsByOwner[itemOwner];
        for (uint256 i = 0; i < ownerItems.length; i++) {
            if (ownerItems[i] == _itemId) {
                ownerItems[i] = ownerItems[ownerItems.length - 1];
                ownerItems.pop();
                break;
            }
        }

        // Clear purchasers mapping
        Purchaser[] storage purchasers = purchasersByItem[_itemId];
        for (uint256 i = 0; i < purchasers.length; i++) {
            isPurchaser[_itemId][purchasers[i].purchaser] = false;
        }
        delete purchasersByItem[_itemId];

        // Mark item as deleted
        items[_itemId].exists = false;

        emit ItemDeleted(_itemId, itemOwner);
    }

    // Public Functions - User Self-Management

    /**
     * @dev Create a new wishlist item (self-management)
     * @param _title The title of the item
     * @param _description Description of the item
     * @param _url URL of the product
     * @param _imageUrl URL of the product image
     * @param _price Price of the item in wei (0 if not specified)
     * @return itemId The ID of the created item
     */
    function createItem(
        string memory _title,
        string memory _description,
        string memory _url,
        string memory _imageUrl,
        uint256 _price
    ) external returns (uint256 itemId) {
        return _createItem(msg.sender, _title, _description, _url, _imageUrl, _price);
    }

    /**
     * @dev Update an existing wishlist item (self-management)
     * @param _itemId The ID of the item to update
     * @param _title New title of the item
     * @param _description New description of the item
     * @param _url New URL of the product
     * @param _imageUrl New URL of the product image
     * @param _price New price of the item in wei
     */
    function updateItem(
        uint256 _itemId,
        string memory _title,
        string memory _description,
        string memory _url,
        string memory _imageUrl,
        uint256 _price
    ) external onlyItemOwner(_itemId) {
        _updateItem(_itemId, _title, _description, _url, _imageUrl, _price);
    }

    /**
     * @dev Delete a wishlist item (self-management)
     * @param _itemId The ID of the item to delete
     */
    function deleteItem(uint256 _itemId) external onlyItemOwner(_itemId) {
        _deleteItem(_itemId);
    }

    /**
     * @dev Sign up as a purchaser for a wishlist item
     * @param _itemId The ID of the item to purchase
     */
    function signUpAsPurchaser(uint256 _itemId) 
        external 
        itemExists(_itemId) 
        notAlreadyPurchaser(_itemId) 
    {
        if (items[_itemId].owner == msg.sender) revert CannotPurchaseOwnItem();

        purchasersByItem[_itemId].push(Purchaser({
            purchaser: msg.sender,
            signedUpAt: block.timestamp,
            exists: true
        }));

        isPurchaser[_itemId][msg.sender] = true;

        emit PurchaserSignedUp(_itemId, msg.sender, items[_itemId].owner);
    }

    /**
     * @dev Remove yourself as a purchaser for a wishlist item
     * @param _itemId The ID of the item
     */
    function removeAsPurchaser(uint256 _itemId) 
        external 
        itemExists(_itemId) 
        isPurchaserOfItem(_itemId) 
    {
        // Remove from purchasers array
        Purchaser[] storage purchasers = purchasersByItem[_itemId];
        for (uint256 i = 0; i < purchasers.length; i++) {
            if (purchasers[i].purchaser == msg.sender) {
                purchasers[i] = purchasers[purchasers.length - 1];
                purchasers.pop();
                break;
            }
        }

        isPurchaser[_itemId][msg.sender] = false;

        emit PurchaserRemoved(_itemId, msg.sender, items[_itemId].owner);
    }

    /**
     * @dev Get details of a wishlist item
     * @param _itemId The ID of the item
     * @return item The wishlist item details
     */
    function getItem(uint256 _itemId) 
        external 
        view 
        itemExists(_itemId) 
        returns (WishlistItem memory item) 
    {
        return items[_itemId];
    }

    /**
     * @dev Get all purchasers for a specific item
     * @param _itemId The ID of the item
     * @return purchasers Array of purchasers
     */
    function getPurchasers(uint256 _itemId) 
        external 
        view 
        itemExists(_itemId) 
        returns (Purchaser[] memory purchasers) 
    {
        return purchasersByItem[_itemId];
    }

    /**
     * @dev Get all items owned by a specific address
     * @param _owner The address of the owner
     * @return itemIds Array of item IDs owned by the address
     */
    function getItemsByOwner(address _owner) 
        external 
        view 
        returns (uint256[] memory itemIds) 
    {
        return itemsByOwner[_owner];
    }

    /**
     * @dev Get the count of purchasers for a specific item
     * @param _itemId The ID of the item
     * @return count Number of purchasers
     */
    function getPurchaserCount(uint256 _itemId) 
        external 
        view 
        itemExists(_itemId) 
        returns (uint256 count) 
    {
        return purchasersByItem[_itemId].length;
    }

    /**
     * @dev Check if an address is a purchaser for a specific item
     * @param _itemId The ID of the item
     * @param _purchaser The address to check
     * @return isPurchaser_ True if the address is a purchaser
     */
    function checkIsPurchaser(uint256 _itemId, address _purchaser) 
        external 
        view 
        itemExists(_itemId) 
        returns (bool isPurchaser_) 
    {
        return isPurchaser[_itemId][_purchaser];
    }

    /**
     * @dev Get the total number of items created
     * @return totalItems Total number of items (including deleted ones)
     */
    function getTotalItems() external view returns (uint256 totalItems) {
        return nextItemId - 1;
    }

    /**
     * @dev Get items with pagination
     * @param _offset Starting index
     * @param _limit Maximum number of items to return
     * @return itemIds Array of item IDs
     * @return hasMore True if there are more items
     */
    function getItemsPaginated(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory itemIds, bool hasMore) 
    {
        uint256 totalItems = nextItemId - 1;
        uint256 endIndex = _offset + _limit;
        
        if (endIndex > totalItems) {
            endIndex = totalItems;
        }
        
        if (_offset >= totalItems) {
            return (new uint256[](0), false);
        }
        
        uint256[] memory result = new uint256[](endIndex - _offset);
        uint256 resultIndex = 0;
        
        for (uint256 i = _offset + 1; i <= endIndex; i++) {
            if (items[i].exists) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        
        // Resize array to actual length
        uint256[] memory finalResult = new uint256[](resultIndex);
        for (uint256 i = 0; i < resultIndex; i++) {
            finalResult[i] = result[i];
        }
        
        return (finalResult, endIndex < totalItems);
    }

    // Permission Management Functions

    /**
     * @dev Grant manager role to an address
     * @param _manager The address to grant manager role to
     */
    function grantManagerRole(address _manager) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can grant manager role");
        _setupRole(MANAGER_ROLE, _manager);
    }

    /**
     * @dev Revoke manager role from an address
     * @param _manager The address to revoke manager role from
     */
    function revokeManagerRole(address _manager) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can revoke manager role");
        _revokeRole(MANAGER_ROLE, _manager);
    }

    /**
     * @dev Check if an address has manager role
     * @param _manager The address to check
     * @return hasRole_ True if the address has manager role
     */
    function hasManagerRole(address _manager) external view returns (bool hasRole_) {
        return hasRole(MANAGER_ROLE, _manager);
    }

    // Manager Functions - Allow managers to act on behalf of item owners

    /**
     * @dev Create a wishlist item on behalf of another user (manager only)
     * @param _owner The address of the user to create the item for
     * @param _title The title of the item
     * @param _description Description of the item
     * @param _url URL of the product
     * @param _imageUrl URL of the product image
     * @param _price Price of the item in wei (0 if not specified)
     * @return itemId The ID of the created item
     */
    function createItemForUser(
        address _owner,
        string memory _title,
        string memory _description,
        string memory _url,
        string memory _imageUrl,
        uint256 _price
    ) external returns (uint256 itemId) {
        require(hasRole(MANAGER_ROLE, msg.sender), "Only managers can create items for users");
        return _createItem(_owner, _title, _description, _url, _imageUrl, _price);
    }

    /**
     * @dev Update a wishlist item on behalf of the owner (manager only)
     * @param _itemId The ID of the item to update
     * @param _title New title of the item
     * @param _description New description of the item
     * @param _url New URL of the product
     * @param _imageUrl New URL of the product image
     * @param _price New price of the item in wei
     */
    function updateItemForUser(
        uint256 _itemId,
        string memory _title,
        string memory _description,
        string memory _url,
        string memory _imageUrl,
        uint256 _price
    ) external {
        require(hasRole(MANAGER_ROLE, msg.sender), "Only managers can update items for users");
        if (!items[_itemId].exists) revert ItemDoesNotExist();
        _updateItem(_itemId, _title, _description, _url, _imageUrl, _price);
    }

    /**
     * @dev Delete a wishlist item on behalf of the owner (manager only)
     * @param _itemId The ID of the item to delete
     */
    function deleteItemForUser(uint256 _itemId) external {
        require(hasRole(MANAGER_ROLE, msg.sender), "Only managers can delete items for users");
        if (!items[_itemId].exists) revert ItemDoesNotExist();
        _deleteItem(_itemId);
    }

    /**
     * @dev Sign up as purchaser for a wishlist item on behalf of another user (manager only)
     * @param _itemId The ID of the item to purchase
     * @param _purchaser The address to sign up as purchaser
     */
    function signUpPurchaserForUser(uint256 _itemId, address _purchaser) 
        external 
        itemExists(_itemId) 
    {
        require(hasRole(MANAGER_ROLE, msg.sender), "Only managers can sign up purchasers for users");
        require(!isPurchaser[_itemId][_purchaser], "Already signed up as purchaser");
        require(items[_itemId].owner != _purchaser, "Cannot purchase own item");

        purchasersByItem[_itemId].push(Purchaser({
            purchaser: _purchaser,
            signedUpAt: block.timestamp,
            exists: true
        }));

        isPurchaser[_itemId][_purchaser] = true;

        emit PurchaserSignedUp(_itemId, _purchaser, items[_itemId].owner);
    }

    /**
     * @dev Remove a purchaser from a wishlist item on behalf of the purchaser (manager only)
     * @param _itemId The ID of the item
     * @param _purchaser The address to remove as purchaser
     */
    function removePurchaserForUser(uint256 _itemId, address _purchaser) 
        external 
        itemExists(_itemId) 
    {
        require(hasRole(MANAGER_ROLE, msg.sender), "Only managers can remove purchasers for users");
        require(isPurchaser[_itemId][_purchaser], "Not a purchaser of this item");
        
        // Remove from purchasers array
        Purchaser[] storage purchasers = purchasersByItem[_itemId];
        for (uint256 i = 0; i < purchasers.length; i++) {
            if (purchasers[i].purchaser == _purchaser) {
                purchasers[i] = purchasers[purchasers.length - 1];
                purchasers.pop();
                break;
            }
        }

        isPurchaser[_itemId][_purchaser] = false;

        emit PurchaserRemoved(_itemId, _purchaser, items[_itemId].owner);
    }
}
