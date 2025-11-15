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
 * Creates an event object for the Airdrop event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { airdropEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  airdropEvent()
 * ],
 * });
 * ```
 */
export function airdropEvent() {
  return prepareEvent({
    signature: "event Airdrop(address token)",
  });
}

/**
 * Creates an event object for the AirdropClaimed event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { airdropClaimedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  airdropClaimedEvent()
 * ],
 * });
 * ```
 */
export function airdropClaimedEvent() {
  return prepareEvent({
    signature: "event AirdropClaimed(address token, address receiver)",
  });
}

/**
 * Creates an event object for the AirdropWithSignature event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { airdropWithSignatureEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  airdropWithSignatureEvent()
 * ],
 * });
 * ```
 */
export function airdropWithSignatureEvent() {
  return prepareEvent({
    signature: "event AirdropWithSignature(address token)",
  });
}

/**
 * Creates an event object for the ContractURIUpdated event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { contractURIUpdatedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  contractURIUpdatedEvent()
 * ],
 * });
 * ```
 */
export function contractURIUpdatedEvent() {
  return prepareEvent({
    signature: "event ContractURIUpdated(string prevURI, string newURI)",
  });
}

/**
 * Creates an event object for the Initialized event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { initializedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  initializedEvent()
 * ],
 * });
 * ```
 */
export function initializedEvent() {
  return prepareEvent({
    signature: "event Initialized(uint8 version)",
  });
}

/**
 * Represents the filters for the "OwnerUpdated" event.
 */
export type OwnerUpdatedEventFilters = Partial<{
  prevOwner: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "prevOwner";
    type: "address";
  }>;
  newOwner: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "newOwner";
    type: "address";
  }>;
}>;

/**
 * Creates an event object for the OwnerUpdated event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { ownerUpdatedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  ownerUpdatedEvent({
 *  prevOwner: ...,
 *  newOwner: ...,
 * })
 * ],
 * });
 * ```
 */
export function ownerUpdatedEvent(filters: OwnerUpdatedEventFilters = {}) {
  return prepareEvent({
    signature:
      "event OwnerUpdated(address indexed prevOwner, address indexed newOwner)",
    filters,
  });
}

/**
 * Contract read functions
 */

/**
 * Calls the "contractURI" function on the contract.
 * @param options - The options for the contractURI function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { contractURI } from "TODO";
 *
 * const result = await contractURI();
 *
 * ```
 */
export async function contractURI(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xe8a3d485",
      [],
      [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "eip712Domain" function on the contract.
 * @param options - The options for the eip712Domain function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { eip712Domain } from "TODO";
 *
 * const result = await eip712Domain();
 *
 * ```
 */
export async function eip712Domain(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x84b0196e",
      [],
      [
        {
          internalType: "bytes1",
          name: "fields",
          type: "bytes1",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "version",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "verifyingContract",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "salt",
          type: "bytes32",
        },
        {
          internalType: "uint256[]",
          name: "extensions",
          type: "uint256[]",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Represents the parameters for the "isClaimed" function.
 */
export type IsClaimedParams = {
  receiver: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_receiver";
    type: "address";
  }>;
  token: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_token";
    type: "address";
  }>;
  tokenId: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_tokenId";
    type: "uint256";
  }>;
};

/**
 * Calls the "isClaimed" function on the contract.
 * @param options - The options for the isClaimed function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { isClaimed } from "TODO";
 *
 * const result = await isClaimed({
 *  receiver: ...,
 *  token: ...,
 *  tokenId: ...,
 * });
 *
 * ```
 */
export async function isClaimed(
  options: BaseTransactionOptions<IsClaimedParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0xd12acf73",
      [
        {
          internalType: "address",
          name: "_receiver",
          type: "address",
        },
        {
          internalType: "address",
          name: "_token",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
      ],
      [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
    ],
    params: [options.receiver, options.token, options.tokenId],
  });
}

/**
 * Calls the "owner" function on the contract.
 * @param options - The options for the owner function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { owner } from "TODO";
 *
 * const result = await owner();
 *
 * ```
 */
export async function owner(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x8da5cb5b",
      [],
      [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Represents the parameters for the "processed" function.
 */
export type ProcessedParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "bytes32";
    name: "";
    type: "bytes32";
  }>;
};

/**
 * Calls the "processed" function on the contract.
 * @param options - The options for the processed function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { processed } from "TODO";
 *
 * const result = await processed({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function processed(
  options: BaseTransactionOptions<ProcessedParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0xc1f0808a",
      [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
    ],
    params: [options.arg_0],
  });
}

/**
 * Represents the parameters for the "tokenConditionId" function.
 */
export type TokenConditionIdParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "";
    type: "address";
  }>;
};

/**
 * Calls the "tokenConditionId" function on the contract.
 * @param options - The options for the tokenConditionId function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { tokenConditionId } from "TODO";
 *
 * const result = await tokenConditionId({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function tokenConditionId(
  options: BaseTransactionOptions<TokenConditionIdParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0x3dc28d49",
      [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
    ],
    params: [options.arg_0],
  });
}

/**
 * Represents the parameters for the "tokenMerkleRoot" function.
 */
export type TokenMerkleRootParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "";
    type: "address";
  }>;
};

/**
 * Calls the "tokenMerkleRoot" function on the contract.
 * @param options - The options for the tokenMerkleRoot function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { tokenMerkleRoot } from "TODO";
 *
 * const result = await tokenMerkleRoot({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function tokenMerkleRoot(
  options: BaseTransactionOptions<TokenMerkleRootParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0x95f5c120",
      [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
    ],
    params: [options.arg_0],
  });
}

/**
 * Contract write functions
 */

/**
 * Represents the parameters for the "airdropERC1155" function.
 */
export type AirdropERC1155Params = {
  tokenAddress: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_tokenAddress";
    type: "address";
  }>;
  contents: AbiParameterToPrimitiveType<{
    components: [
      { internalType: "address"; name: "recipient"; type: "address" },
      { internalType: "uint256"; name: "tokenId"; type: "uint256" },
      { internalType: "uint256"; name: "amount"; type: "uint256" },
    ];
    internalType: "struct Airdrop.AirdropContentERC1155[]";
    name: "_contents";
    type: "tuple[]";
  }>;
};

/**
 * Calls the "airdropERC1155" function on the contract.
 * @param options - The options for the "airdropERC1155" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { airdropERC1155 } from "TODO";
 *
 * const transaction = airdropERC1155({
 *  tokenAddress: ...,
 *  contents: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function airdropERC1155(
  options: BaseTransactionOptions<AirdropERC1155Params>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x2d89e38b",
      [
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address",
        },
        {
          components: [
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          internalType: "struct Airdrop.AirdropContentERC1155[]",
          name: "_contents",
          type: "tuple[]",
        },
      ],
      [],
    ],
    params: [options.tokenAddress, options.contents],
  });
}

/**
 * Represents the parameters for the "airdropERC1155WithSignature" function.
 */
export type AirdropERC1155WithSignatureParams = {
  req: AbiParameterToPrimitiveType<{
    components: [
      { internalType: "bytes32"; name: "uid"; type: "bytes32" },
      { internalType: "address"; name: "tokenAddress"; type: "address" },
      { internalType: "uint256"; name: "expirationTimestamp"; type: "uint256" },
      {
        components: [
          { internalType: "address"; name: "recipient"; type: "address" },
          { internalType: "uint256"; name: "tokenId"; type: "uint256" },
          { internalType: "uint256"; name: "amount"; type: "uint256" },
        ];
        internalType: "struct Airdrop.AirdropContentERC1155[]";
        name: "contents";
        type: "tuple[]";
      },
    ];
    internalType: "struct Airdrop.AirdropRequestERC1155";
    name: "req";
    type: "tuple";
  }>;
  signature: AbiParameterToPrimitiveType<{
    internalType: "bytes";
    name: "signature";
    type: "bytes";
  }>;
};

/**
 * Calls the "airdropERC1155WithSignature" function on the contract.
 * @param options - The options for the "airdropERC1155WithSignature" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { airdropERC1155WithSignature } from "TODO";
 *
 * const transaction = airdropERC1155WithSignature({
 *  req: ...,
 *  signature: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function airdropERC1155WithSignature(
  options: BaseTransactionOptions<AirdropERC1155WithSignatureParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xd0d4afd6",
      [
        {
          components: [
            {
              internalType: "bytes32",
              name: "uid",
              type: "bytes32",
            },
            {
              internalType: "address",
              name: "tokenAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "expirationTimestamp",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "tokenId",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct Airdrop.AirdropContentERC1155[]",
              name: "contents",
              type: "tuple[]",
            },
          ],
          internalType: "struct Airdrop.AirdropRequestERC1155",
          name: "req",
          type: "tuple",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
        },
      ],
      [],
    ],
    params: [options.req, options.signature],
  });
}

/**
 * Represents the parameters for the "airdropERC20" function.
 */
export type AirdropERC20Params = {
  tokenAddress: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_tokenAddress";
    type: "address";
  }>;
  contents: AbiParameterToPrimitiveType<{
    components: [
      { internalType: "address"; name: "recipient"; type: "address" },
      { internalType: "uint256"; name: "amount"; type: "uint256" },
    ];
    internalType: "struct Airdrop.AirdropContentERC20[]";
    name: "_contents";
    type: "tuple[]";
  }>;
};

/**
 * Calls the "airdropERC20" function on the contract.
 * @param options - The options for the "airdropERC20" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { airdropERC20 } from "TODO";
 *
 * const transaction = airdropERC20({
 *  tokenAddress: ...,
 *  contents: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function airdropERC20(
  options: BaseTransactionOptions<AirdropERC20Params>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x56b0b449",
      [
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address",
        },
        {
          components: [
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          internalType: "struct Airdrop.AirdropContentERC20[]",
          name: "_contents",
          type: "tuple[]",
        },
      ],
      [],
    ],
    params: [options.tokenAddress, options.contents],
  });
}

/**
 * Represents the parameters for the "airdropERC20WithSignature" function.
 */
export type AirdropERC20WithSignatureParams = {
  req: AbiParameterToPrimitiveType<{
    components: [
      { internalType: "bytes32"; name: "uid"; type: "bytes32" },
      { internalType: "address"; name: "tokenAddress"; type: "address" },
      { internalType: "uint256"; name: "expirationTimestamp"; type: "uint256" },
      {
        components: [
          { internalType: "address"; name: "recipient"; type: "address" },
          { internalType: "uint256"; name: "amount"; type: "uint256" },
        ];
        internalType: "struct Airdrop.AirdropContentERC20[]";
        name: "contents";
        type: "tuple[]";
      },
    ];
    internalType: "struct Airdrop.AirdropRequestERC20";
    name: "req";
    type: "tuple";
  }>;
  signature: AbiParameterToPrimitiveType<{
    internalType: "bytes";
    name: "signature";
    type: "bytes";
  }>;
};

/**
 * Calls the "airdropERC20WithSignature" function on the contract.
 * @param options - The options for the "airdropERC20WithSignature" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { airdropERC20WithSignature } from "TODO";
 *
 * const transaction = airdropERC20WithSignature({
 *  req: ...,
 *  signature: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function airdropERC20WithSignature(
  options: BaseTransactionOptions<AirdropERC20WithSignatureParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xaaba07f6",
      [
        {
          components: [
            {
              internalType: "bytes32",
              name: "uid",
              type: "bytes32",
            },
            {
              internalType: "address",
              name: "tokenAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "expirationTimestamp",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct Airdrop.AirdropContentERC20[]",
              name: "contents",
              type: "tuple[]",
            },
          ],
          internalType: "struct Airdrop.AirdropRequestERC20",
          name: "req",
          type: "tuple",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
        },
      ],
      [],
    ],
    params: [options.req, options.signature],
  });
}

/**
 * Represents the parameters for the "airdropERC721" function.
 */
export type AirdropERC721Params = {
  tokenAddress: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_tokenAddress";
    type: "address";
  }>;
  contents: AbiParameterToPrimitiveType<{
    components: [
      { internalType: "address"; name: "recipient"; type: "address" },
      { internalType: "uint256"; name: "tokenId"; type: "uint256" },
    ];
    internalType: "struct Airdrop.AirdropContentERC721[]";
    name: "_contents";
    type: "tuple[]";
  }>;
};

/**
 * Calls the "airdropERC721" function on the contract.
 * @param options - The options for the "airdropERC721" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { airdropERC721 } from "TODO";
 *
 * const transaction = airdropERC721({
 *  tokenAddress: ...,
 *  contents: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function airdropERC721(
  options: BaseTransactionOptions<AirdropERC721Params>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x6d582ebe",
      [
        {
          internalType: "address",
          name: "_tokenAddress",
          type: "address",
        },
        {
          components: [
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          internalType: "struct Airdrop.AirdropContentERC721[]",
          name: "_contents",
          type: "tuple[]",
        },
      ],
      [],
    ],
    params: [options.tokenAddress, options.contents],
  });
}

/**
 * Represents the parameters for the "airdropERC721WithSignature" function.
 */
export type AirdropERC721WithSignatureParams = {
  req: AbiParameterToPrimitiveType<{
    components: [
      { internalType: "bytes32"; name: "uid"; type: "bytes32" },
      { internalType: "address"; name: "tokenAddress"; type: "address" },
      { internalType: "uint256"; name: "expirationTimestamp"; type: "uint256" },
      {
        components: [
          { internalType: "address"; name: "recipient"; type: "address" },
          { internalType: "uint256"; name: "tokenId"; type: "uint256" },
        ];
        internalType: "struct Airdrop.AirdropContentERC721[]";
        name: "contents";
        type: "tuple[]";
      },
    ];
    internalType: "struct Airdrop.AirdropRequestERC721";
    name: "req";
    type: "tuple";
  }>;
  signature: AbiParameterToPrimitiveType<{
    internalType: "bytes";
    name: "signature";
    type: "bytes";
  }>;
};

/**
 * Calls the "airdropERC721WithSignature" function on the contract.
 * @param options - The options for the "airdropERC721WithSignature" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { airdropERC721WithSignature } from "TODO";
 *
 * const transaction = airdropERC721WithSignature({
 *  req: ...,
 *  signature: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function airdropERC721WithSignature(
  options: BaseTransactionOptions<AirdropERC721WithSignatureParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xb654a6f3",
      [
        {
          components: [
            {
              internalType: "bytes32",
              name: "uid",
              type: "bytes32",
            },
            {
              internalType: "address",
              name: "tokenAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "expirationTimestamp",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "address",
                  name: "recipient",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "tokenId",
                  type: "uint256",
                },
              ],
              internalType: "struct Airdrop.AirdropContentERC721[]",
              name: "contents",
              type: "tuple[]",
            },
          ],
          internalType: "struct Airdrop.AirdropRequestERC721",
          name: "req",
          type: "tuple",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
        },
      ],
      [],
    ],
    params: [options.req, options.signature],
  });
}

/**
 * Represents the parameters for the "airdropNativeToken" function.
 */
export type AirdropNativeTokenParams = {
  contents: AbiParameterToPrimitiveType<{
    components: [
      { internalType: "address"; name: "recipient"; type: "address" },
      { internalType: "uint256"; name: "amount"; type: "uint256" },
    ];
    internalType: "struct Airdrop.AirdropContentERC20[]";
    name: "_contents";
    type: "tuple[]";
  }>;
};

/**
 * Calls the "airdropNativeToken" function on the contract.
 * @param options - The options for the "airdropNativeToken" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { airdropNativeToken } from "TODO";
 *
 * const transaction = airdropNativeToken({
 *  contents: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function airdropNativeToken(
  options: BaseTransactionOptions<AirdropNativeTokenParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x0d5818f7",
      [
        {
          components: [
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          internalType: "struct Airdrop.AirdropContentERC20[]",
          name: "_contents",
          type: "tuple[]",
        },
      ],
      [],
    ],
    params: [options.contents],
  });
}

/**
 * Represents the parameters for the "claimERC1155" function.
 */
export type ClaimERC1155Params = {
  token: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_token";
    type: "address";
  }>;
  receiver: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_receiver";
    type: "address";
  }>;
  tokenId: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_tokenId";
    type: "uint256";
  }>;
  quantity: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_quantity";
    type: "uint256";
  }>;
  proofs: AbiParameterToPrimitiveType<{
    internalType: "bytes32[]";
    name: "_proofs";
    type: "bytes32[]";
  }>;
};

/**
 * Calls the "claimERC1155" function on the contract.
 * @param options - The options for the "claimERC1155" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claimERC1155 } from "TODO";
 *
 * const transaction = claimERC1155({
 *  token: ...,
 *  receiver: ...,
 *  tokenId: ...,
 *  quantity: ...,
 *  proofs: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function claimERC1155(
  options: BaseTransactionOptions<ClaimERC1155Params>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xc6fa26ab",
      [
        {
          internalType: "address",
          name: "_token",
          type: "address",
        },
        {
          internalType: "address",
          name: "_receiver",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_quantity",
          type: "uint256",
        },
        {
          internalType: "bytes32[]",
          name: "_proofs",
          type: "bytes32[]",
        },
      ],
      [],
    ],
    params: [
      options.token,
      options.receiver,
      options.tokenId,
      options.quantity,
      options.proofs,
    ],
  });
}

/**
 * Represents the parameters for the "claimERC20" function.
 */
export type ClaimERC20Params = {
  token: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_token";
    type: "address";
  }>;
  receiver: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_receiver";
    type: "address";
  }>;
  quantity: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_quantity";
    type: "uint256";
  }>;
  proofs: AbiParameterToPrimitiveType<{
    internalType: "bytes32[]";
    name: "_proofs";
    type: "bytes32[]";
  }>;
};

/**
 * Calls the "claimERC20" function on the contract.
 * @param options - The options for the "claimERC20" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claimERC20 } from "TODO";
 *
 * const transaction = claimERC20({
 *  token: ...,
 *  receiver: ...,
 *  quantity: ...,
 *  proofs: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function claimERC20(options: BaseTransactionOptions<ClaimERC20Params>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xecf3d3d4",
      [
        {
          internalType: "address",
          name: "_token",
          type: "address",
        },
        {
          internalType: "address",
          name: "_receiver",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_quantity",
          type: "uint256",
        },
        {
          internalType: "bytes32[]",
          name: "_proofs",
          type: "bytes32[]",
        },
      ],
      [],
    ],
    params: [options.token, options.receiver, options.quantity, options.proofs],
  });
}

/**
 * Represents the parameters for the "claimERC721" function.
 */
export type ClaimERC721Params = {
  token: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_token";
    type: "address";
  }>;
  receiver: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_receiver";
    type: "address";
  }>;
  tokenId: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_tokenId";
    type: "uint256";
  }>;
  proofs: AbiParameterToPrimitiveType<{
    internalType: "bytes32[]";
    name: "_proofs";
    type: "bytes32[]";
  }>;
};

/**
 * Calls the "claimERC721" function on the contract.
 * @param options - The options for the "claimERC721" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claimERC721 } from "TODO";
 *
 * const transaction = claimERC721({
 *  token: ...,
 *  receiver: ...,
 *  tokenId: ...,
 *  proofs: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function claimERC721(
  options: BaseTransactionOptions<ClaimERC721Params>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x1290be10",
      [
        {
          internalType: "address",
          name: "_token",
          type: "address",
        },
        {
          internalType: "address",
          name: "_receiver",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
        {
          internalType: "bytes32[]",
          name: "_proofs",
          type: "bytes32[]",
        },
      ],
      [],
    ],
    params: [options.token, options.receiver, options.tokenId, options.proofs],
  });
}

/**
 * Represents the parameters for the "initialize" function.
 */
export type InitializeParams = {
  defaultAdmin: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_defaultAdmin";
    type: "address";
  }>;
  contractURI: AbiParameterToPrimitiveType<{
    internalType: "string";
    name: "_contractURI";
    type: "string";
  }>;
};

/**
 * Calls the "initialize" function on the contract.
 * @param options - The options for the "initialize" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { initialize } from "TODO";
 *
 * const transaction = initialize({
 *  defaultAdmin: ...,
 *  contractURI: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function initialize(options: BaseTransactionOptions<InitializeParams>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xf399e22e",
      [
        {
          internalType: "address",
          name: "_defaultAdmin",
          type: "address",
        },
        {
          internalType: "string",
          name: "_contractURI",
          type: "string",
        },
      ],
      [],
    ],
    params: [options.defaultAdmin, options.contractURI],
  });
}

/**
 * Represents the parameters for the "setContractURI" function.
 */
export type SetContractURIParams = {
  uri: AbiParameterToPrimitiveType<{
    internalType: "string";
    name: "_uri";
    type: "string";
  }>;
};

/**
 * Calls the "setContractURI" function on the contract.
 * @param options - The options for the "setContractURI" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setContractURI } from "TODO";
 *
 * const transaction = setContractURI({
 *  uri: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function setContractURI(
  options: BaseTransactionOptions<SetContractURIParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x938e3d7b",
      [
        {
          internalType: "string",
          name: "_uri",
          type: "string",
        },
      ],
      [],
    ],
    params: [options.uri],
  });
}

/**
 * Represents the parameters for the "setMerkleRoot" function.
 */
export type SetMerkleRootParams = {
  token: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_token";
    type: "address";
  }>;
  tokenMerkleRoot: AbiParameterToPrimitiveType<{
    internalType: "bytes32";
    name: "_tokenMerkleRoot";
    type: "bytes32";
  }>;
  resetClaimStatus: AbiParameterToPrimitiveType<{
    internalType: "bool";
    name: "_resetClaimStatus";
    type: "bool";
  }>;
};

/**
 * Calls the "setMerkleRoot" function on the contract.
 * @param options - The options for the "setMerkleRoot" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setMerkleRoot } from "TODO";
 *
 * const transaction = setMerkleRoot({
 *  token: ...,
 *  tokenMerkleRoot: ...,
 *  resetClaimStatus: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function setMerkleRoot(
  options: BaseTransactionOptions<SetMerkleRootParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x8259a87b",
      [
        {
          internalType: "address",
          name: "_token",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "_tokenMerkleRoot",
          type: "bytes32",
        },
        {
          internalType: "bool",
          name: "_resetClaimStatus",
          type: "bool",
        },
      ],
      [],
    ],
    params: [options.token, options.tokenMerkleRoot, options.resetClaimStatus],
  });
}

/**
 * Represents the parameters for the "setOwner" function.
 */
export type SetOwnerParams = {
  newOwner: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_newOwner";
    type: "address";
  }>;
};

/**
 * Calls the "setOwner" function on the contract.
 * @param options - The options for the "setOwner" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setOwner } from "TODO";
 *
 * const transaction = setOwner({
 *  newOwner: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function setOwner(options: BaseTransactionOptions<SetOwnerParams>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x13af4035",
      [
        {
          internalType: "address",
          name: "_newOwner",
          type: "address",
        },
      ],
      [],
    ],
    params: [options.newOwner],
  });
}
