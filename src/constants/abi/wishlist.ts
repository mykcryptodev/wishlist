import {
  prepareEvent,
  prepareContractCall,
  readContract,
  type BaseTransactionOptions,
  type AbiParameterToPrimitiveType,
} from "thirdweb";

/**
* Contract events
*/

/**
 * Represents the filters for the "ItemCreated" event.
 */
export type ItemCreatedEventFilters = Partial<{
  itemId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"}>
owner: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"owner","type":"address"}>
}>;

/**
 * Creates an event object for the ItemCreated event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { itemCreatedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  itemCreatedEvent({
 *  itemId: ...,
 *  owner: ...,
 * })
 * ],
 * });
 * ```
 */
export function itemCreatedEvent(filters: ItemCreatedEventFilters = {}) {
  return prepareEvent({
    signature: "event ItemCreated(uint256 indexed itemId, address indexed owner, string title, string url)",
    filters,
  });
};
  

/**
 * Represents the filters for the "ItemDeleted" event.
 */
export type ItemDeletedEventFilters = Partial<{
  itemId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"}>
owner: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"owner","type":"address"}>
}>;

/**
 * Creates an event object for the ItemDeleted event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { itemDeletedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  itemDeletedEvent({
 *  itemId: ...,
 *  owner: ...,
 * })
 * ],
 * });
 * ```
 */
export function itemDeletedEvent(filters: ItemDeletedEventFilters = {}) {
  return prepareEvent({
    signature: "event ItemDeleted(uint256 indexed itemId, address indexed owner)",
    filters,
  });
};
  

/**
 * Represents the filters for the "ItemUpdated" event.
 */
export type ItemUpdatedEventFilters = Partial<{
  itemId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"}>
owner: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"owner","type":"address"}>
}>;

/**
 * Creates an event object for the ItemUpdated event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { itemUpdatedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  itemUpdatedEvent({
 *  itemId: ...,
 *  owner: ...,
 * })
 * ],
 * });
 * ```
 */
export function itemUpdatedEvent(filters: ItemUpdatedEventFilters = {}) {
  return prepareEvent({
    signature: "event ItemUpdated(uint256 indexed itemId, address indexed owner, string title)",
    filters,
  });
};
  

/**
 * Represents the filters for the "PurchaserRemoved" event.
 */
export type PurchaserRemovedEventFilters = Partial<{
  itemId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"}>
purchaser: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"purchaser","type":"address"}>
itemOwner: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"itemOwner","type":"address"}>
}>;

/**
 * Creates an event object for the PurchaserRemoved event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { purchaserRemovedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  purchaserRemovedEvent({
 *  itemId: ...,
 *  purchaser: ...,
 *  itemOwner: ...,
 * })
 * ],
 * });
 * ```
 */
export function purchaserRemovedEvent(filters: PurchaserRemovedEventFilters = {}) {
  return prepareEvent({
    signature: "event PurchaserRemoved(uint256 indexed itemId, address indexed purchaser, address indexed itemOwner)",
    filters,
  });
};
  

/**
 * Represents the filters for the "PurchaserSignedUp" event.
 */
export type PurchaserSignedUpEventFilters = Partial<{
  itemId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"}>
purchaser: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"purchaser","type":"address"}>
itemOwner: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"itemOwner","type":"address"}>
}>;

/**
 * Creates an event object for the PurchaserSignedUp event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { purchaserSignedUpEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  purchaserSignedUpEvent({
 *  itemId: ...,
 *  purchaser: ...,
 *  itemOwner: ...,
 * })
 * ],
 * });
 * ```
 */
export function purchaserSignedUpEvent(filters: PurchaserSignedUpEventFilters = {}) {
  return prepareEvent({
    signature: "event PurchaserSignedUp(uint256 indexed itemId, address indexed purchaser, address indexed itemOwner)",
    filters,
  });
};
  

/**
 * Represents the filters for the "RoleAdminChanged" event.
 */
export type RoleAdminChangedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"}>
previousAdminRole: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"}>
newAdminRole: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}>
}>;

/**
 * Creates an event object for the RoleAdminChanged event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { roleAdminChangedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  roleAdminChangedEvent({
 *  role: ...,
 *  previousAdminRole: ...,
 *  newAdminRole: ...,
 * })
 * ],
 * });
 * ```
 */
export function roleAdminChangedEvent(filters: RoleAdminChangedEventFilters = {}) {
  return prepareEvent({
    signature: "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
    filters,
  });
};
  

/**
 * Represents the filters for the "RoleGranted" event.
 */
export type RoleGrantedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"account","type":"address"}>
sender: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"sender","type":"address"}>
}>;

/**
 * Creates an event object for the RoleGranted event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { roleGrantedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  roleGrantedEvent({
 *  role: ...,
 *  account: ...,
 *  sender: ...,
 * })
 * ],
 * });
 * ```
 */
export function roleGrantedEvent(filters: RoleGrantedEventFilters = {}) {
  return prepareEvent({
    signature: "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
    filters,
  });
};
  

/**
 * Represents the filters for the "RoleRevoked" event.
 */
export type RoleRevokedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"account","type":"address"}>
sender: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"sender","type":"address"}>
}>;

/**
 * Creates an event object for the RoleRevoked event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { roleRevokedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  roleRevokedEvent({
 *  role: ...,
 *  account: ...,
 *  sender: ...,
 * })
 * ],
 * });
 * ```
 */
export function roleRevokedEvent(filters: RoleRevokedEventFilters = {}) {
  return prepareEvent({
    signature: "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
    filters,
  });
};
  

/**
 * Represents the filters for the "UserAddedToWishlistDirectory" event.
 */
export type UserAddedToWishlistDirectoryEventFilters = Partial<{
  user: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"user","type":"address"}>
}>;

/**
 * Creates an event object for the UserAddedToWishlistDirectory event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { userAddedToWishlistDirectoryEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  userAddedToWishlistDirectoryEvent({
 *  user: ...,
 * })
 * ],
 * });
 * ```
 */
export function userAddedToWishlistDirectoryEvent(filters: UserAddedToWishlistDirectoryEventFilters = {}) {
  return prepareEvent({
    signature: "event UserAddedToWishlistDirectory(address indexed user)",
    filters,
  });
};
  

/**
* Contract read functions
*/



/**
 * Calls the "ADMIN_ROLE" function on the contract.
 * @param options - The options for the ADMIN_ROLE function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { ADMIN_ROLE } from "TODO";
 *
 * const result = await ADMIN_ROLE();
 *
 * ```
 */
export async function ADMIN_ROLE(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x75b238fc",
  [],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "DEFAULT_ADMIN_ROLE" function on the contract.
 * @param options - The options for the DEFAULT_ADMIN_ROLE function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { DEFAULT_ADMIN_ROLE } from "TODO";
 *
 * const result = await DEFAULT_ADMIN_ROLE();
 *
 * ```
 */
export async function DEFAULT_ADMIN_ROLE(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xa217fddf",
  [],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "MANAGER_ROLE" function on the contract.
 * @param options - The options for the MANAGER_ROLE function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { MANAGER_ROLE } from "TODO";
 *
 * const result = await MANAGER_ROLE();
 *
 * ```
 */
export async function MANAGER_ROLE(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xec87621c",
  [],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "addressesWithWishlists" function.
 */
export type AddressesWithWishlistsParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "addressesWithWishlists" function on the contract.
 * @param options - The options for the addressesWithWishlists function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { addressesWithWishlists } from "TODO";
 *
 * const result = await addressesWithWishlists({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function addressesWithWishlists(
  options: BaseTransactionOptions<AddressesWithWishlistsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x03841da0",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ]
],
    params: [options.arg_0]
  });
};


/**
 * Represents the parameters for the "checkIsPurchaser" function.
 */
export type CheckIsPurchaserParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
purchaser: AbiParameterToPrimitiveType<{"internalType":"address","name":"_purchaser","type":"address"}>
};

/**
 * Calls the "checkIsPurchaser" function on the contract.
 * @param options - The options for the checkIsPurchaser function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { checkIsPurchaser } from "TODO";
 *
 * const result = await checkIsPurchaser({
 *  itemId: ...,
 *  purchaser: ...,
 * });
 *
 * ```
 */
export async function checkIsPurchaser(
  options: BaseTransactionOptions<CheckIsPurchaserParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x91acdcc9",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_purchaser",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "isPurchaser_",
      "type": "bool"
    }
  ]
],
    params: [options.itemId, options.purchaser]
  });
};




/**
 * Calls the "getAllWishlistAddresses" function on the contract.
 * @param options - The options for the getAllWishlistAddresses function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getAllWishlistAddresses } from "TODO";
 *
 * const result = await getAllWishlistAddresses();
 *
 * ```
 */
export async function getAllWishlistAddresses(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x4491310d",
  [],
  [
    {
      "internalType": "address[]",
      "name": "addresses",
      "type": "address[]"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "getItem" function.
 */
export type GetItemParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
};

/**
 * Calls the "getItem" function on the contract.
 * @param options - The options for the getItem function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getItem } from "TODO";
 *
 * const result = await getItem({
 *  itemId: ...,
 * });
 *
 * ```
 */
export async function getItem(
  options: BaseTransactionOptions<GetItemParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x3129e773",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    }
  ],
  [
    {
      "components": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "url",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "imageUrl",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "updatedAt",
          "type": "uint256"
        }
      ],
      "internalType": "struct Wishlist.WishlistItem",
      "name": "item",
      "type": "tuple"
    }
  ]
],
    params: [options.itemId]
  });
};


/**
 * Represents the parameters for the "getItemsByOwner" function.
 */
export type GetItemsByOwnerParams = {
  owner: AbiParameterToPrimitiveType<{"internalType":"address","name":"_owner","type":"address"}>
};

/**
 * Calls the "getItemsByOwner" function on the contract.
 * @param options - The options for the getItemsByOwner function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getItemsByOwner } from "TODO";
 *
 * const result = await getItemsByOwner({
 *  owner: ...,
 * });
 *
 * ```
 */
export async function getItemsByOwner(
  options: BaseTransactionOptions<GetItemsByOwnerParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x2c67a8e5",
  [
    {
      "internalType": "address",
      "name": "_owner",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "uint256[]",
      "name": "itemIds",
      "type": "uint256[]"
    }
  ]
],
    params: [options.owner]
  });
};


/**
 * Represents the parameters for the "getItemsPaginated" function.
 */
export type GetItemsPaginatedParams = {
  offset: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_offset","type":"uint256"}>
limit: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_limit","type":"uint256"}>
};

/**
 * Calls the "getItemsPaginated" function on the contract.
 * @param options - The options for the getItemsPaginated function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getItemsPaginated } from "TODO";
 *
 * const result = await getItemsPaginated({
 *  offset: ...,
 *  limit: ...,
 * });
 *
 * ```
 */
export async function getItemsPaginated(
  options: BaseTransactionOptions<GetItemsPaginatedParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xb314913b",
  [
    {
      "internalType": "uint256",
      "name": "_offset",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_limit",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256[]",
      "name": "itemIds",
      "type": "uint256[]"
    },
    {
      "internalType": "bool",
      "name": "hasMore",
      "type": "bool"
    }
  ]
],
    params: [options.offset, options.limit]
  });
};


/**
 * Represents the parameters for the "getPurchaserCount" function.
 */
export type GetPurchaserCountParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
};

/**
 * Calls the "getPurchaserCount" function on the contract.
 * @param options - The options for the getPurchaserCount function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getPurchaserCount } from "TODO";
 *
 * const result = await getPurchaserCount({
 *  itemId: ...,
 * });
 *
 * ```
 */
export async function getPurchaserCount(
  options: BaseTransactionOptions<GetPurchaserCountParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xe84bb3fc",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "count",
      "type": "uint256"
    }
  ]
],
    params: [options.itemId]
  });
};


/**
 * Represents the parameters for the "getPurchasers" function.
 */
export type GetPurchasersParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
};

/**
 * Calls the "getPurchasers" function on the contract.
 * @param options - The options for the getPurchasers function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getPurchasers } from "TODO";
 *
 * const result = await getPurchasers({
 *  itemId: ...,
 * });
 *
 * ```
 */
export async function getPurchasers(
  options: BaseTransactionOptions<GetPurchasersParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x9530d190",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    }
  ],
  [
    {
      "components": [
        {
          "internalType": "address",
          "name": "purchaser",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "signedUpAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        }
      ],
      "internalType": "struct Wishlist.Purchaser[]",
      "name": "purchasers",
      "type": "tuple[]"
    }
  ]
],
    params: [options.itemId]
  });
};


/**
 * Represents the parameters for the "getRoleAdmin" function.
 */
export type GetRoleAdminParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
};

/**
 * Calls the "getRoleAdmin" function on the contract.
 * @param options - The options for the getRoleAdmin function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getRoleAdmin } from "TODO";
 *
 * const result = await getRoleAdmin({
 *  role: ...,
 * });
 *
 * ```
 */
export async function getRoleAdmin(
  options: BaseTransactionOptions<GetRoleAdminParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x248a9ca3",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    }
  ],
  [
    {
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }
  ]
],
    params: [options.role]
  });
};




/**
 * Calls the "getTotalItems" function on the contract.
 * @param options - The options for the getTotalItems function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getTotalItems } from "TODO";
 *
 * const result = await getTotalItems();
 *
 * ```
 */
export async function getTotalItems(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x310aac69",
  [],
  [
    {
      "internalType": "uint256",
      "name": "totalItems",
      "type": "uint256"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "getWishlistAddressCount" function on the contract.
 * @param options - The options for the getWishlistAddressCount function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getWishlistAddressCount } from "TODO";
 *
 * const result = await getWishlistAddressCount();
 *
 * ```
 */
export async function getWishlistAddressCount(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x88633e82",
  [],
  [
    {
      "internalType": "uint256",
      "name": "count",
      "type": "uint256"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "getWishlistAddressesPaginated" function.
 */
export type GetWishlistAddressesPaginatedParams = {
  offset: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_offset","type":"uint256"}>
limit: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_limit","type":"uint256"}>
};

/**
 * Calls the "getWishlistAddressesPaginated" function on the contract.
 * @param options - The options for the getWishlistAddressesPaginated function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getWishlistAddressesPaginated } from "TODO";
 *
 * const result = await getWishlistAddressesPaginated({
 *  offset: ...,
 *  limit: ...,
 * });
 *
 * ```
 */
export async function getWishlistAddressesPaginated(
  options: BaseTransactionOptions<GetWishlistAddressesPaginatedParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x315eb36d",
  [
    {
      "internalType": "uint256",
      "name": "_offset",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_limit",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "address[]",
      "name": "addresses",
      "type": "address[]"
    },
    {
      "internalType": "bool",
      "name": "hasMore",
      "type": "bool"
    }
  ]
],
    params: [options.offset, options.limit]
  });
};


/**
 * Represents the parameters for the "hasManagerRole" function.
 */
export type HasManagerRoleParams = {
  manager: AbiParameterToPrimitiveType<{"internalType":"address","name":"_manager","type":"address"}>
};

/**
 * Calls the "hasManagerRole" function on the contract.
 * @param options - The options for the hasManagerRole function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { hasManagerRole } from "TODO";
 *
 * const result = await hasManagerRole({
 *  manager: ...,
 * });
 *
 * ```
 */
export async function hasManagerRole(
  options: BaseTransactionOptions<HasManagerRoleParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x5026c826",
  [
    {
      "internalType": "address",
      "name": "_manager",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "hasRole_",
      "type": "bool"
    }
  ]
],
    params: [options.manager]
  });
};


/**
 * Represents the parameters for the "hasRole" function.
 */
export type HasRoleParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "hasRole" function on the contract.
 * @param options - The options for the hasRole function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { hasRole } from "TODO";
 *
 * const result = await hasRole({
 *  role: ...,
 *  account: ...,
 * });
 *
 * ```
 */
export async function hasRole(
  options: BaseTransactionOptions<HasRoleParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x91d14854",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "hasRoleWithSwitch" function.
 */
export type HasRoleWithSwitchParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "hasRoleWithSwitch" function on the contract.
 * @param options - The options for the hasRoleWithSwitch function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { hasRoleWithSwitch } from "TODO";
 *
 * const result = await hasRoleWithSwitch({
 *  role: ...,
 *  account: ...,
 * });
 *
 * ```
 */
export async function hasRoleWithSwitch(
  options: BaseTransactionOptions<HasRoleWithSwitchParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xa32fa5b3",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "hasWishlist" function.
 */
export type HasWishlistParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"address","name":"","type":"address"}>
};

/**
 * Calls the "hasWishlist" function on the contract.
 * @param options - The options for the hasWishlist function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { hasWishlist } from "TODO";
 *
 * const result = await hasWishlist({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function hasWishlist(
  options: BaseTransactionOptions<HasWishlistParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x3bb09007",
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.arg_0]
  });
};


/**
 * Represents the parameters for the "isPurchaser" function.
 */
export type IsPurchaserParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"address","name":"","type":"address"}>
};

/**
 * Calls the "isPurchaser" function on the contract.
 * @param options - The options for the isPurchaser function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { isPurchaser } from "TODO";
 *
 * const result = await isPurchaser({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 *
 * ```
 */
export async function isPurchaser(
  options: BaseTransactionOptions<IsPurchaserParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x5dffb37e",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};


/**
 * Represents the parameters for the "items" function.
 */
export type ItemsParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "items" function on the contract.
 * @param options - The options for the items function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { items } from "TODO";
 *
 * const result = await items({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function items(
  options: BaseTransactionOptions<ItemsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xbfb231d2",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "id",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "owner",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "title",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "description",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "url",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "imageUrl",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "price",
      "type": "uint256"
    },
    {
      "internalType": "bool",
      "name": "exists",
      "type": "bool"
    },
    {
      "internalType": "uint256",
      "name": "createdAt",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "updatedAt",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0]
  });
};


/**
 * Represents the parameters for the "itemsByOwner" function.
 */
export type ItemsByOwnerParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"address","name":"","type":"address"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "itemsByOwner" function on the contract.
 * @param options - The options for the itemsByOwner function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { itemsByOwner } from "TODO";
 *
 * const result = await itemsByOwner({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 *
 * ```
 */
export async function itemsByOwner(
  options: BaseTransactionOptions<ItemsByOwnerParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x52151d64",
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};




/**
 * Calls the "nextItemId" function on the contract.
 * @param options - The options for the nextItemId function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { nextItemId } from "TODO";
 *
 * const result = await nextItemId();
 *
 * ```
 */
export async function nextItemId(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x6a868974",
  [],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "purchasersByItem" function.
 */
export type PurchasersByItemParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "purchasersByItem" function on the contract.
 * @param options - The options for the purchasersByItem function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { purchasersByItem } from "TODO";
 *
 * const result = await purchasersByItem({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 *
 * ```
 */
export async function purchasersByItem(
  options: BaseTransactionOptions<PurchasersByItemParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xec086b31",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "address",
      "name": "purchaser",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "signedUpAt",
      "type": "uint256"
    },
    {
      "internalType": "bool",
      "name": "exists",
      "type": "bool"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};


/**
* Contract write functions
*/

/**
 * Represents the parameters for the "createItem" function.
 */
export type CreateItemParams = {
  title: AbiParameterToPrimitiveType<{"internalType":"string","name":"_title","type":"string"}>
description: AbiParameterToPrimitiveType<{"internalType":"string","name":"_description","type":"string"}>
url: AbiParameterToPrimitiveType<{"internalType":"string","name":"_url","type":"string"}>
imageUrl: AbiParameterToPrimitiveType<{"internalType":"string","name":"_imageUrl","type":"string"}>
price: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_price","type":"uint256"}>
};

/**
 * Calls the "createItem" function on the contract.
 * @param options - The options for the "createItem" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { createItem } from "TODO";
 *
 * const transaction = createItem({
 *  title: ...,
 *  description: ...,
 *  url: ...,
 *  imageUrl: ...,
 *  price: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function createItem(
  options: BaseTransactionOptions<CreateItemParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x930fd2d2",
  [
    {
      "internalType": "string",
      "name": "_title",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_description",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_url",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_imageUrl",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "_price",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "itemId",
      "type": "uint256"
    }
  ]
],
    params: [options.title, options.description, options.url, options.imageUrl, options.price]
  });
};


/**
 * Represents the parameters for the "createItemForUser" function.
 */
export type CreateItemForUserParams = {
  owner: AbiParameterToPrimitiveType<{"internalType":"address","name":"_owner","type":"address"}>
title: AbiParameterToPrimitiveType<{"internalType":"string","name":"_title","type":"string"}>
description: AbiParameterToPrimitiveType<{"internalType":"string","name":"_description","type":"string"}>
url: AbiParameterToPrimitiveType<{"internalType":"string","name":"_url","type":"string"}>
imageUrl: AbiParameterToPrimitiveType<{"internalType":"string","name":"_imageUrl","type":"string"}>
price: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_price","type":"uint256"}>
};

/**
 * Calls the "createItemForUser" function on the contract.
 * @param options - The options for the "createItemForUser" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { createItemForUser } from "TODO";
 *
 * const transaction = createItemForUser({
 *  owner: ...,
 *  title: ...,
 *  description: ...,
 *  url: ...,
 *  imageUrl: ...,
 *  price: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function createItemForUser(
  options: BaseTransactionOptions<CreateItemForUserParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x46a284f1",
  [
    {
      "internalType": "address",
      "name": "_owner",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "_title",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_description",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_url",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_imageUrl",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "_price",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "itemId",
      "type": "uint256"
    }
  ]
],
    params: [options.owner, options.title, options.description, options.url, options.imageUrl, options.price]
  });
};


/**
 * Represents the parameters for the "deleteItem" function.
 */
export type DeleteItemParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
};

/**
 * Calls the "deleteItem" function on the contract.
 * @param options - The options for the "deleteItem" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { deleteItem } from "TODO";
 *
 * const transaction = deleteItem({
 *  itemId: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function deleteItem(
  options: BaseTransactionOptions<DeleteItemParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x654fc833",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.itemId]
  });
};


/**
 * Represents the parameters for the "deleteItemForUser" function.
 */
export type DeleteItemForUserParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
};

/**
 * Calls the "deleteItemForUser" function on the contract.
 * @param options - The options for the "deleteItemForUser" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { deleteItemForUser } from "TODO";
 *
 * const transaction = deleteItemForUser({
 *  itemId: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function deleteItemForUser(
  options: BaseTransactionOptions<DeleteItemForUserParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x040d1e1c",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.itemId]
  });
};


/**
 * Represents the parameters for the "grantManagerRole" function.
 */
export type GrantManagerRoleParams = {
  manager: AbiParameterToPrimitiveType<{"internalType":"address","name":"_manager","type":"address"}>
};

/**
 * Calls the "grantManagerRole" function on the contract.
 * @param options - The options for the "grantManagerRole" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { grantManagerRole } from "TODO";
 *
 * const transaction = grantManagerRole({
 *  manager: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function grantManagerRole(
  options: BaseTransactionOptions<GrantManagerRoleParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x26e885e3",
  [
    {
      "internalType": "address",
      "name": "_manager",
      "type": "address"
    }
  ],
  []
],
    params: [options.manager]
  });
};


/**
 * Represents the parameters for the "grantRole" function.
 */
export type GrantRoleParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "grantRole" function on the contract.
 * @param options - The options for the "grantRole" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { grantRole } from "TODO";
 *
 * const transaction = grantRole({
 *  role: ...,
 *  account: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function grantRole(
  options: BaseTransactionOptions<GrantRoleParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x2f2ff15d",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  []
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "removeAsPurchaser" function.
 */
export type RemoveAsPurchaserParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
};

/**
 * Calls the "removeAsPurchaser" function on the contract.
 * @param options - The options for the "removeAsPurchaser" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { removeAsPurchaser } from "TODO";
 *
 * const transaction = removeAsPurchaser({
 *  itemId: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function removeAsPurchaser(
  options: BaseTransactionOptions<RemoveAsPurchaserParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x0b962bd9",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.itemId]
  });
};


/**
 * Represents the parameters for the "removePurchaserForUser" function.
 */
export type RemovePurchaserForUserParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
purchaser: AbiParameterToPrimitiveType<{"internalType":"address","name":"_purchaser","type":"address"}>
};

/**
 * Calls the "removePurchaserForUser" function on the contract.
 * @param options - The options for the "removePurchaserForUser" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { removePurchaserForUser } from "TODO";
 *
 * const transaction = removePurchaserForUser({
 *  itemId: ...,
 *  purchaser: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function removePurchaserForUser(
  options: BaseTransactionOptions<RemovePurchaserForUserParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xfca90629",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_purchaser",
      "type": "address"
    }
  ],
  []
],
    params: [options.itemId, options.purchaser]
  });
};


/**
 * Represents the parameters for the "renounceRole" function.
 */
export type RenounceRoleParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "renounceRole" function on the contract.
 * @param options - The options for the "renounceRole" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { renounceRole } from "TODO";
 *
 * const transaction = renounceRole({
 *  role: ...,
 *  account: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function renounceRole(
  options: BaseTransactionOptions<RenounceRoleParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x36568abe",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  []
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "revokeManagerRole" function.
 */
export type RevokeManagerRoleParams = {
  manager: AbiParameterToPrimitiveType<{"internalType":"address","name":"_manager","type":"address"}>
};

/**
 * Calls the "revokeManagerRole" function on the contract.
 * @param options - The options for the "revokeManagerRole" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { revokeManagerRole } from "TODO";
 *
 * const transaction = revokeManagerRole({
 *  manager: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function revokeManagerRole(
  options: BaseTransactionOptions<RevokeManagerRoleParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xbe4dc94f",
  [
    {
      "internalType": "address",
      "name": "_manager",
      "type": "address"
    }
  ],
  []
],
    params: [options.manager]
  });
};


/**
 * Represents the parameters for the "revokeRole" function.
 */
export type RevokeRoleParams = {
  role: AbiParameterToPrimitiveType<{"internalType":"bytes32","name":"role","type":"bytes32"}>
account: AbiParameterToPrimitiveType<{"internalType":"address","name":"account","type":"address"}>
};

/**
 * Calls the "revokeRole" function on the contract.
 * @param options - The options for the "revokeRole" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { revokeRole } from "TODO";
 *
 * const transaction = revokeRole({
 *  role: ...,
 *  account: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function revokeRole(
  options: BaseTransactionOptions<RevokeRoleParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xd547741f",
  [
    {
      "internalType": "bytes32",
      "name": "role",
      "type": "bytes32"
    },
    {
      "internalType": "address",
      "name": "account",
      "type": "address"
    }
  ],
  []
],
    params: [options.role, options.account]
  });
};


/**
 * Represents the parameters for the "signUpAsPurchaser" function.
 */
export type SignUpAsPurchaserParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
};

/**
 * Calls the "signUpAsPurchaser" function on the contract.
 * @param options - The options for the "signUpAsPurchaser" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { signUpAsPurchaser } from "TODO";
 *
 * const transaction = signUpAsPurchaser({
 *  itemId: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function signUpAsPurchaser(
  options: BaseTransactionOptions<SignUpAsPurchaserParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xaeaa502e",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.itemId]
  });
};


/**
 * Represents the parameters for the "signUpPurchaserForUser" function.
 */
export type SignUpPurchaserForUserParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
purchaser: AbiParameterToPrimitiveType<{"internalType":"address","name":"_purchaser","type":"address"}>
};

/**
 * Calls the "signUpPurchaserForUser" function on the contract.
 * @param options - The options for the "signUpPurchaserForUser" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { signUpPurchaserForUser } from "TODO";
 *
 * const transaction = signUpPurchaserForUser({
 *  itemId: ...,
 *  purchaser: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function signUpPurchaserForUser(
  options: BaseTransactionOptions<SignUpPurchaserForUserParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xd41dba08",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_purchaser",
      "type": "address"
    }
  ],
  []
],
    params: [options.itemId, options.purchaser]
  });
};


/**
 * Represents the parameters for the "updateItem" function.
 */
export type UpdateItemParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
title: AbiParameterToPrimitiveType<{"internalType":"string","name":"_title","type":"string"}>
description: AbiParameterToPrimitiveType<{"internalType":"string","name":"_description","type":"string"}>
url: AbiParameterToPrimitiveType<{"internalType":"string","name":"_url","type":"string"}>
imageUrl: AbiParameterToPrimitiveType<{"internalType":"string","name":"_imageUrl","type":"string"}>
price: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_price","type":"uint256"}>
};

/**
 * Calls the "updateItem" function on the contract.
 * @param options - The options for the "updateItem" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { updateItem } from "TODO";
 *
 * const transaction = updateItem({
 *  itemId: ...,
 *  title: ...,
 *  description: ...,
 *  url: ...,
 *  imageUrl: ...,
 *  price: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function updateItem(
  options: BaseTransactionOptions<UpdateItemParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xeb7a5a31",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "_title",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_description",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_url",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_imageUrl",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "_price",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.itemId, options.title, options.description, options.url, options.imageUrl, options.price]
  });
};


/**
 * Represents the parameters for the "updateItemForUser" function.
 */
export type UpdateItemForUserParams = {
  itemId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_itemId","type":"uint256"}>
title: AbiParameterToPrimitiveType<{"internalType":"string","name":"_title","type":"string"}>
description: AbiParameterToPrimitiveType<{"internalType":"string","name":"_description","type":"string"}>
url: AbiParameterToPrimitiveType<{"internalType":"string","name":"_url","type":"string"}>
imageUrl: AbiParameterToPrimitiveType<{"internalType":"string","name":"_imageUrl","type":"string"}>
price: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_price","type":"uint256"}>
};

/**
 * Calls the "updateItemForUser" function on the contract.
 * @param options - The options for the "updateItemForUser" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { updateItemForUser } from "TODO";
 *
 * const transaction = updateItemForUser({
 *  itemId: ...,
 *  title: ...,
 *  description: ...,
 *  url: ...,
 *  imageUrl: ...,
 *  price: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function updateItemForUser(
  options: BaseTransactionOptions<UpdateItemForUserParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x72aac294",
  [
    {
      "internalType": "uint256",
      "name": "_itemId",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "_title",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_description",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_url",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_imageUrl",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "_price",
      "type": "uint256"
    }
  ],
  []
],
    params: [options.itemId, options.title, options.description, options.url, options.imageUrl, options.price]
  });
};


