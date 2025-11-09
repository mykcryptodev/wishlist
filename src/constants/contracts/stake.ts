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
 * Represents the filters for the "BurnPoolFunded" event.
 */
export type BurnPoolFundedEventFilters = Partial<{
  funder: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "funder";
    type: "address";
  }>;
}>;

/**
 * Creates an event object for the BurnPoolFunded event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { burnPoolFundedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  burnPoolFundedEvent({
 *  funder: ...,
 * })
 * ],
 * });
 * ```
 */
export function burnPoolFundedEvent(filters: BurnPoolFundedEventFilters = {}) {
  return prepareEvent({
    signature:
      "event BurnPoolFunded(address indexed funder, uint256 amount, uint256 newReserve)",
    filters,
  });
}

/**
 * Represents the filters for the "BurnTrackingStarted" event.
 */
export type BurnTrackingStartedEventFilters = Partial<{
  staker: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "staker";
    type: "address";
  }>;
}>;

/**
 * Creates an event object for the BurnTrackingStarted event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { burnTrackingStartedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  burnTrackingStartedEvent({
 *  staker: ...,
 * })
 * ],
 * });
 * ```
 */
export function burnTrackingStartedEvent(
  filters: BurnTrackingStartedEventFilters = {},
) {
  return prepareEvent({
    signature:
      "event BurnTrackingStarted(address indexed staker, uint256 timestamp)",
    filters,
  });
}

/**
 * Creates an event object for the DailyBurnCapReached event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { dailyBurnCapReachedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  dailyBurnCapReachedEvent()
 * ],
 * });
 * ```
 */
export function dailyBurnCapReachedEvent() {
  return prepareEvent({
    signature: "event DailyBurnCapReached(uint256 day, uint256 amount)",
  });
}

/**
 * Represents the filters for the "RewardPoolFunded" event.
 */
export type RewardPoolFundedEventFilters = Partial<{
  funder: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "funder";
    type: "address";
  }>;
}>;

/**
 * Creates an event object for the RewardPoolFunded event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { rewardPoolFundedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  rewardPoolFundedEvent({
 *  funder: ...,
 * })
 * ],
 * });
 * ```
 */
export function rewardPoolFundedEvent(
  filters: RewardPoolFundedEventFilters = {},
) {
  return prepareEvent({
    signature:
      "event RewardPoolFunded(address indexed funder, uint256 amount, uint256 newReserve)",
    filters,
  });
}

/**
 * Represents the filters for the "RewardsClaimed" event.
 */
export type RewardsClaimedEventFilters = Partial<{
  staker: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "staker";
    type: "address";
  }>;
}>;

/**
 * Creates an event object for the RewardsClaimed event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { rewardsClaimedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  rewardsClaimedEvent({
 *  staker: ...,
 * })
 * ],
 * });
 * ```
 */
export function rewardsClaimedEvent(filters: RewardsClaimedEventFilters = {}) {
  return prepareEvent({
    signature:
      "event RewardsClaimed(address indexed staker, uint256 rewardAmount)",
    filters,
  });
}

/**
 * Represents the filters for the "RoleAdminChanged" event.
 */
export type RoleAdminChangedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
  previousAdminRole: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "bytes32";
    name: "previousAdminRole";
    type: "bytes32";
  }>;
  newAdminRole: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "bytes32";
    name: "newAdminRole";
    type: "bytes32";
  }>;
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
export function roleAdminChangedEvent(
  filters: RoleAdminChangedEventFilters = {},
) {
  return prepareEvent({
    signature:
      "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
    filters,
  });
}

/**
 * Represents the filters for the "RoleGranted" event.
 */
export type RoleGrantedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
  account: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "account";
    type: "address";
  }>;
  sender: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "sender";
    type: "address";
  }>;
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
    signature:
      "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
    filters,
  });
}

/**
 * Represents the filters for the "RoleRevoked" event.
 */
export type RoleRevokedEventFilters = Partial<{
  role: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
  account: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "account";
    type: "address";
  }>;
  sender: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "sender";
    type: "address";
  }>;
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
    signature:
      "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
    filters,
  });
}

/**
 * Represents the filters for the "StakedWishesBurned" event.
 */
export type StakedWishesBurnedEventFilters = Partial<{
  staker: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "staker";
    type: "address";
  }>;
}>;

/**
 * Creates an event object for the StakedWishesBurned event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { stakedWishesBurnedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  stakedWishesBurnedEvent({
 *  staker: ...,
 * })
 * ],
 * });
 * ```
 */
export function stakedWishesBurnedEvent(
  filters: StakedWishesBurnedEventFilters = {},
) {
  return prepareEvent({
    signature:
      "event StakedWishesBurned(address indexed staker, uint256 amount)",
    filters,
  });
}

/**
 * Represents the filters for the "TokensStaked" event.
 */
export type TokensStakedEventFilters = Partial<{
  staker: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "staker";
    type: "address";
  }>;
}>;

/**
 * Creates an event object for the TokensStaked event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { tokensStakedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  tokensStakedEvent({
 *  staker: ...,
 * })
 * ],
 * });
 * ```
 */
export function tokensStakedEvent(filters: TokensStakedEventFilters = {}) {
  return prepareEvent({
    signature: "event TokensStaked(address indexed staker, uint256 amount)",
    filters,
  });
}

/**
 * Represents the filters for the "TokensWithdrawn" event.
 */
export type TokensWithdrawnEventFilters = Partial<{
  staker: AbiParameterToPrimitiveType<{
    indexed: true;
    internalType: "address";
    name: "staker";
    type: "address";
  }>;
}>;

/**
 * Creates an event object for the TokensWithdrawn event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { tokensWithdrawnEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  tokensWithdrawnEvent({
 *  staker: ...,
 * })
 * ],
 * });
 * ```
 */
export function tokensWithdrawnEvent(
  filters: TokensWithdrawnEventFilters = {},
) {
  return prepareEvent({
    signature: "event TokensWithdrawn(address indexed staker, uint256 amount)",
    filters,
  });
}

/**
 * Creates an event object for the UpdatedMinStakeAmount event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { updatedMinStakeAmountEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  updatedMinStakeAmountEvent()
 * ],
 * });
 * ```
 */
export function updatedMinStakeAmountEvent() {
  return prepareEvent({
    signature:
      "event UpdatedMinStakeAmount(uint256 oldAmount, uint256 newAmount)",
  });
}

/**
 * Creates an event object for the UpdatedRewardRatio event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { updatedRewardRatioEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  updatedRewardRatioEvent()
 * ],
 * });
 * ```
 */
export function updatedRewardRatioEvent() {
  return prepareEvent({
    signature:
      "event UpdatedRewardRatio(uint256 oldNumerator, uint256 newNumerator, uint256 oldDenominator, uint256 newDenominator)",
  });
}

/**
 * Creates an event object for the UpdatedTimeUnit event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { updatedTimeUnitEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  updatedTimeUnitEvent()
 * ],
 * });
 * ```
 */
export function updatedTimeUnitEvent() {
  return prepareEvent({
    signature:
      "event UpdatedTimeUnit(uint256 oldTimeUnit, uint256 newTimeUnit)",
  });
}

/**
 * Contract read functions
 */

/**
 * Calls the "BURN_PERIOD" function on the contract.
 * @param options - The options for the BURN_PERIOD function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { BURN_PERIOD } from "TODO";
 *
 * const result = await BURN_PERIOD();
 *
 * ```
 */
export async function BURN_PERIOD(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x028d0369",
      [],
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "DAILY_BURN_CAP" function on the contract.
 * @param options - The options for the DAILY_BURN_CAP function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { DAILY_BURN_CAP } from "TODO";
 *
 * const result = await DAILY_BURN_CAP();
 *
 * ```
 */
export async function DAILY_BURN_CAP(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xc8ecf7bf",
      [],
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

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
export async function DEFAULT_ADMIN_ROLE(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xa217fddf",
      [],
      [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "STAKE_CONDITIONS_MANAGER_ROLE" function on the contract.
 * @param options - The options for the STAKE_CONDITIONS_MANAGER_ROLE function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { STAKE_CONDITIONS_MANAGER_ROLE } from "TODO";
 *
 * const result = await STAKE_CONDITIONS_MANAGER_ROLE();
 *
 * ```
 */
export async function STAKE_CONDITIONS_MANAGER_ROLE(
  options: BaseTransactionOptions,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0x4a34f456",
      [],
      [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "burnPoolReserve" function on the contract.
 * @param options - The options for the burnPoolReserve function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { burnPoolReserve } from "TODO";
 *
 * const result = await burnPoolReserve();
 *
 * ```
 */
export async function burnPoolReserve(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xa974c6cb",
      [],
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "burnToken" function on the contract.
 * @param options - The options for the burnToken function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { burnToken } from "TODO";
 *
 * const result = await burnToken();
 *
 * ```
 */
export async function burnToken(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xfaa0a264",
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
 * Represents the parameters for the "burnedAmount" function.
 */
export type BurnedAmountParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "";
    type: "address";
  }>;
};

/**
 * Calls the "burnedAmount" function on the contract.
 * @param options - The options for the burnedAmount function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { burnedAmount } from "TODO";
 *
 * const result = await burnedAmount({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function burnedAmount(
  options: BaseTransactionOptions<BurnedAmountParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0xca11e4d4",
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
 * Represents the parameters for the "dailyBurnedAmount" function.
 */
export type DailyBurnedAmountParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "";
    type: "uint256";
  }>;
};

/**
 * Calls the "dailyBurnedAmount" function on the contract.
 * @param options - The options for the dailyBurnedAmount function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { dailyBurnedAmount } from "TODO";
 *
 * const result = await dailyBurnedAmount({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function dailyBurnedAmount(
  options: BaseTransactionOptions<DailyBurnedAmountParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0x06c6d27c",
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
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
 * Represents the parameters for the "getBurnInfo" function.
 */
export type GetBurnInfoParams = {
  staker: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "staker";
    type: "address";
  }>;
};

/**
 * Calls the "getBurnInfo" function on the contract.
 * @param options - The options for the getBurnInfo function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getBurnInfo } from "TODO";
 *
 * const result = await getBurnInfo({
 *  staker: ...,
 * });
 *
 * ```
 */
export async function getBurnInfo(
  options: BaseTransactionOptions<GetBurnInfoParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0xe49c6333",
      [
        {
          internalType: "address",
          name: "staker",
          type: "address",
        },
      ],
      [
        {
          internalType: "uint256",
          name: "currentStaked",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "timeStaked",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "completePeriods",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalBurnable",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "alreadyBurned",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "availableToBurn",
          type: "uint256",
        },
      ],
    ],
    params: [options.staker],
  });
}

/**
 * Calls the "getBurnTokenBalance" function on the contract.
 * @param options - The options for the getBurnTokenBalance function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getBurnTokenBalance } from "TODO";
 *
 * const result = await getBurnTokenBalance();
 *
 * ```
 */
export async function getBurnTokenBalance(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xaa84a4b5",
      [],
      [
        {
          internalType: "uint256",
          name: "_burnTokensAvailableInContract",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Represents the parameters for the "getBurnableAmount" function.
 */
export type GetBurnableAmountParams = {
  staker: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "staker";
    type: "address";
  }>;
};

/**
 * Calls the "getBurnableAmount" function on the contract.
 * @param options - The options for the getBurnableAmount function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getBurnableAmount } from "TODO";
 *
 * const result = await getBurnableAmount({
 *  staker: ...,
 * });
 *
 * ```
 */
export async function getBurnableAmount(
  options: BaseTransactionOptions<GetBurnableAmountParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0x6c06485a",
      [
        {
          internalType: "address",
          name: "staker",
          type: "address",
        },
      ],
      [
        {
          internalType: "uint256",
          name: "burnableAmount",
          type: "uint256",
        },
      ],
    ],
    params: [options.staker],
  });
}

/**
 * Calls the "getDailyBurnCapInfo" function on the contract.
 * @param options - The options for the getDailyBurnCapInfo function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getDailyBurnCapInfo } from "TODO";
 *
 * const result = await getDailyBurnCapInfo();
 *
 * ```
 */
export async function getDailyBurnCapInfo(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xafc450ec",
      [],
      [
        {
          internalType: "uint256",
          name: "remaining",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "total",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "used",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "getRewardRatio" function on the contract.
 * @param options - The options for the getRewardRatio function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getRewardRatio } from "TODO";
 *
 * const result = await getRewardRatio();
 *
 * ```
 */
export async function getRewardRatio(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x97e1b4bc",
      [],
      [
        {
          internalType: "uint256",
          name: "_numerator",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_denominator",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "getRewardTokenBalance" function on the contract.
 * @param options - The options for the getRewardTokenBalance function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getRewardTokenBalance } from "TODO";
 *
 * const result = await getRewardTokenBalance();
 *
 * ```
 */
export async function getRewardTokenBalance(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x93ce5343",
      [],
      [
        {
          internalType: "uint256",
          name: "_rewardsAvailableInContract",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Represents the parameters for the "getRoleAdmin" function.
 */
export type GetRoleAdminParams = {
  role: AbiParameterToPrimitiveType<{
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
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
  options: BaseTransactionOptions<GetRoleAdminParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0x248a9ca3",
      [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
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
    params: [options.role],
  });
}

/**
 * Represents the parameters for the "getStakeInfo" function.
 */
export type GetStakeInfoParams = {
  staker: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "_staker";
    type: "address";
  }>;
};

/**
 * Calls the "getStakeInfo" function on the contract.
 * @param options - The options for the getStakeInfo function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getStakeInfo } from "TODO";
 *
 * const result = await getStakeInfo({
 *  staker: ...,
 * });
 *
 * ```
 */
export async function getStakeInfo(
  options: BaseTransactionOptions<GetStakeInfoParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0xc3453153",
      [
        {
          internalType: "address",
          name: "_staker",
          type: "address",
        },
      ],
      [
        {
          internalType: "uint256",
          name: "_tokensStaked",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_rewards",
          type: "uint256",
        },
      ],
    ],
    params: [options.staker],
  });
}

/**
 * Calls the "getTimeUnit" function on the contract.
 * @param options - The options for the getTimeUnit function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getTimeUnit } from "TODO";
 *
 * const result = await getTimeUnit();
 *
 * ```
 */
export async function getTimeUnit(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xd68124c7",
      [],
      [
        {
          internalType: "uint256",
          name: "_timeUnit",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "getTotalBurnedAllTime" function on the contract.
 * @param options - The options for the getTotalBurnedAllTime function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getTotalBurnedAllTime } from "TODO";
 *
 * const result = await getTotalBurnedAllTime();
 *
 * ```
 */
export async function getTotalBurnedAllTime(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x9b0952be",
      [],
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Represents the parameters for the "getUserTotalRewardsClaimed" function.
 */
export type GetUserTotalRewardsClaimedParams = {
  staker: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "staker";
    type: "address";
  }>;
};

/**
 * Calls the "getUserTotalRewardsClaimed" function on the contract.
 * @param options - The options for the getUserTotalRewardsClaimed function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getUserTotalRewardsClaimed } from "TODO";
 *
 * const result = await getUserTotalRewardsClaimed({
 *  staker: ...,
 * });
 *
 * ```
 */
export async function getUserTotalRewardsClaimed(
  options: BaseTransactionOptions<GetUserTotalRewardsClaimedParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0x3ad51d30",
      [
        {
          internalType: "address",
          name: "staker",
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
    params: [options.staker],
  });
}

/**
 * Represents the parameters for the "hasRole" function.
 */
export type HasRoleParams = {
  role: AbiParameterToPrimitiveType<{
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
  account: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "account";
    type: "address";
  }>;
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
export async function hasRole(options: BaseTransactionOptions<HasRoleParams>) {
  return readContract({
    contract: options.contract,
    method: [
      "0x91d14854",
      [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
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
    params: [options.role, options.account],
  });
}

/**
 * Represents the parameters for the "hasRoleWithSwitch" function.
 */
export type HasRoleWithSwitchParams = {
  role: AbiParameterToPrimitiveType<{
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
  account: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "account";
    type: "address";
  }>;
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
  options: BaseTransactionOptions<HasRoleWithSwitchParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0xa32fa5b3",
      [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
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
    params: [options.role, options.account],
  });
}

/**
 * Calls the "isDailyBurnCapReached" function on the contract.
 * @param options - The options for the isDailyBurnCapReached function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { isDailyBurnCapReached } from "TODO";
 *
 * const result = await isDailyBurnCapReached();
 *
 * ```
 */
export async function isDailyBurnCapReached(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x61182ceb",
      [],
      [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "rewardPoolReserve" function on the contract.
 * @param options - The options for the rewardPoolReserve function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { rewardPoolReserve } from "TODO";
 *
 * const result = await rewardPoolReserve();
 *
 * ```
 */
export async function rewardPoolReserve(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x21bb588e",
      [],
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "rewardToken" function on the contract.
 * @param options - The options for the rewardToken function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { rewardToken } from "TODO";
 *
 * const result = await rewardToken();
 *
 * ```
 */
export async function rewardToken(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xf7c618c1",
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
 * Calls the "rewardTokenDecimals" function on the contract.
 * @param options - The options for the rewardTokenDecimals function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { rewardTokenDecimals } from "TODO";
 *
 * const result = await rewardTokenDecimals();
 *
 * ```
 */
export async function rewardTokenDecimals(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x9bdcecd1",
      [],
      [
        {
          internalType: "uint16",
          name: "",
          type: "uint16",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Represents the parameters for the "stakers" function.
 */
export type StakersParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "";
    type: "address";
  }>;
};

/**
 * Calls the "stakers" function on the contract.
 * @param options - The options for the stakers function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { stakers } from "TODO";
 *
 * const result = await stakers({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function stakers(options: BaseTransactionOptions<StakersParams>) {
  return readContract({
    contract: options.contract,
    method: [
      "0x9168ae72",
      [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      [
        {
          internalType: "uint128",
          name: "timeOfLastUpdate",
          type: "uint128",
        },
        {
          internalType: "uint64",
          name: "conditionIdOflastUpdate",
          type: "uint64",
        },
        {
          internalType: "uint256",
          name: "amountStaked",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "unclaimedRewards",
          type: "uint256",
        },
      ],
    ],
    params: [options.arg_0],
  });
}

/**
 * Represents the parameters for the "stakersArray" function.
 */
export type StakersArrayParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "";
    type: "uint256";
  }>;
};

/**
 * Calls the "stakersArray" function on the contract.
 * @param options - The options for the stakersArray function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { stakersArray } from "TODO";
 *
 * const result = await stakersArray({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function stakersArray(
  options: BaseTransactionOptions<StakersArrayParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0x5357e916",
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
    ],
    params: [options.arg_0],
  });
}

/**
 * Represents the parameters for the "stakingStartTime" function.
 */
export type StakingStartTimeParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "";
    type: "address";
  }>;
};

/**
 * Calls the "stakingStartTime" function on the contract.
 * @param options - The options for the stakingStartTime function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { stakingStartTime } from "TODO";
 *
 * const result = await stakingStartTime({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function stakingStartTime(
  options: BaseTransactionOptions<StakingStartTimeParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0xd1232730",
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
 * Calls the "stakingToken" function on the contract.
 * @param options - The options for the stakingToken function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { stakingToken } from "TODO";
 *
 * const result = await stakingToken();
 *
 * ```
 */
export async function stakingToken(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x72f702f3",
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
 * Calls the "stakingTokenBalance" function on the contract.
 * @param options - The options for the stakingTokenBalance function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { stakingTokenBalance } from "TODO";
 *
 * const result = await stakingTokenBalance();
 *
 * ```
 */
export async function stakingTokenBalance(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x8caaa271",
      [],
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "stakingTokenDecimals" function on the contract.
 * @param options - The options for the stakingTokenDecimals function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { stakingTokenDecimals } from "TODO";
 *
 * const result = await stakingTokenDecimals();
 *
 * ```
 */
export async function stakingTokenDecimals(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0xb9f7a7b5",
      [],
      [
        {
          internalType: "uint16",
          name: "",
          type: "uint16",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "totalBurnedAllTime" function on the contract.
 * @param options - The options for the totalBurnedAllTime function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { totalBurnedAllTime } from "TODO";
 *
 * const result = await totalBurnedAllTime();
 *
 * ```
 */
export async function totalBurnedAllTime(options: BaseTransactionOptions) {
  return readContract({
    contract: options.contract,
    method: [
      "0x4ed1ec0c",
      [],
      [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Represents the parameters for the "totalRewardsClaimed" function.
 */
export type TotalRewardsClaimedParams = {
  arg_0: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "";
    type: "address";
  }>;
};

/**
 * Calls the "totalRewardsClaimed" function on the contract.
 * @param options - The options for the totalRewardsClaimed function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { totalRewardsClaimed } from "TODO";
 *
 * const result = await totalRewardsClaimed({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function totalRewardsClaimed(
  options: BaseTransactionOptions<TotalRewardsClaimedParams>,
) {
  return readContract({
    contract: options.contract,
    method: [
      "0xf6ce9004",
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
 * Contract write functions
 */

/**
 * Represents the parameters for the "burnRewardTokens" function.
 */
export type BurnRewardTokensParams = {
  amount: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "amount";
    type: "uint256";
  }>;
};

/**
 * Calls the "burnRewardTokens" function on the contract.
 * @param options - The options for the "burnRewardTokens" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { burnRewardTokens } from "TODO";
 *
 * const transaction = burnRewardTokens({
 *  amount: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function burnRewardTokens(
  options: BaseTransactionOptions<BurnRewardTokensParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xf4997a6b",
      [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      [],
    ],
    params: [options.amount],
  });
}

/**
 * Calls the "claimBurnAndCompound" function on the contract.
 * @param options - The options for the "claimBurnAndCompound" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claimBurnAndCompound } from "TODO";
 *
 * const transaction = claimBurnAndCompound();
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function claimBurnAndCompound(options: BaseTransactionOptions) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x6cc34269",
      [],
      [
        {
          internalType: "uint256",
          name: "rewardsClaimed",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountBurned",
          type: "uint256",
        },
      ],
    ],
    params: [],
  });
}

/**
 * Calls the "claimRewards" function on the contract.
 * @param options - The options for the "claimRewards" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claimRewards } from "TODO";
 *
 * const transaction = claimRewards();
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function claimRewards(options: BaseTransactionOptions) {
  return prepareContractCall({
    contract: options.contract,
    method: ["0x372500ab", [], []],
    params: [],
  });
}

/**
 * Represents the parameters for the "fundBurnPool" function.
 */
export type FundBurnPoolParams = {
  amount: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "amount";
    type: "uint256";
  }>;
};

/**
 * Calls the "fundBurnPool" function on the contract.
 * @param options - The options for the "fundBurnPool" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { fundBurnPool } from "TODO";
 *
 * const transaction = fundBurnPool({
 *  amount: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function fundBurnPool(
  options: BaseTransactionOptions<FundBurnPoolParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x24a97d43",
      [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      [],
    ],
    params: [options.amount],
  });
}

/**
 * Represents the parameters for the "fundRewardPool" function.
 */
export type FundRewardPoolParams = {
  amount: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "amount";
    type: "uint256";
  }>;
};

/**
 * Calls the "fundRewardPool" function on the contract.
 * @param options - The options for the "fundRewardPool" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { fundRewardPool } from "TODO";
 *
 * const transaction = fundRewardPool({
 *  amount: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function fundRewardPool(
  options: BaseTransactionOptions<FundRewardPoolParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x1d583e0d",
      [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      [],
    ],
    params: [options.amount],
  });
}

/**
 * Represents the parameters for the "grantRole" function.
 */
export type GrantRoleParams = {
  role: AbiParameterToPrimitiveType<{
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
  account: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "account";
    type: "address";
  }>;
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
export function grantRole(options: BaseTransactionOptions<GrantRoleParams>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x2f2ff15d",
      [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      [],
    ],
    params: [options.role, options.account],
  });
}

/**
 * Represents the parameters for the "recoverUnaccountedTokens" function.
 */
export type RecoverUnaccountedTokensParams = {
  amountForRewardPool: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "amountForRewardPool";
    type: "uint256";
  }>;
  amountForBurnPool: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "amountForBurnPool";
    type: "uint256";
  }>;
};

/**
 * Calls the "recoverUnaccountedTokens" function on the contract.
 * @param options - The options for the "recoverUnaccountedTokens" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { recoverUnaccountedTokens } from "TODO";
 *
 * const transaction = recoverUnaccountedTokens({
 *  amountForRewardPool: ...,
 *  amountForBurnPool: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function recoverUnaccountedTokens(
  options: BaseTransactionOptions<RecoverUnaccountedTokensParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xa7aa9fcf",
      [
        {
          internalType: "uint256",
          name: "amountForRewardPool",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountForBurnPool",
          type: "uint256",
        },
      ],
      [],
    ],
    params: [options.amountForRewardPool, options.amountForBurnPool],
  });
}

/**
 * Represents the parameters for the "renounceRole" function.
 */
export type RenounceRoleParams = {
  role: AbiParameterToPrimitiveType<{
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
  account: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "account";
    type: "address";
  }>;
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
  options: BaseTransactionOptions<RenounceRoleParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x36568abe",
      [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      [],
    ],
    params: [options.role, options.account],
  });
}

/**
 * Represents the parameters for the "revokeRole" function.
 */
export type RevokeRoleParams = {
  role: AbiParameterToPrimitiveType<{
    internalType: "bytes32";
    name: "role";
    type: "bytes32";
  }>;
  account: AbiParameterToPrimitiveType<{
    internalType: "address";
    name: "account";
    type: "address";
  }>;
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
export function revokeRole(options: BaseTransactionOptions<RevokeRoleParams>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xd547741f",
      [
        {
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      [],
    ],
    params: [options.role, options.account],
  });
}

/**
 * Represents the parameters for the "setRewardRatio" function.
 */
export type SetRewardRatioParams = {
  numerator: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_numerator";
    type: "uint256";
  }>;
  denominator: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_denominator";
    type: "uint256";
  }>;
};

/**
 * Calls the "setRewardRatio" function on the contract.
 * @param options - The options for the "setRewardRatio" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setRewardRatio } from "TODO";
 *
 * const transaction = setRewardRatio({
 *  numerator: ...,
 *  denominator: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function setRewardRatio(
  options: BaseTransactionOptions<SetRewardRatioParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x001b7934",
      [
        {
          internalType: "uint256",
          name: "_numerator",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_denominator",
          type: "uint256",
        },
      ],
      [],
    ],
    params: [options.numerator, options.denominator],
  });
}

/**
 * Represents the parameters for the "setTimeUnit" function.
 */
export type SetTimeUnitParams = {
  timeUnit: AbiParameterToPrimitiveType<{
    internalType: "uint80";
    name: "_timeUnit";
    type: "uint80";
  }>;
};

/**
 * Calls the "setTimeUnit" function on the contract.
 * @param options - The options for the "setTimeUnit" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { setTimeUnit } from "TODO";
 *
 * const transaction = setTimeUnit({
 *  timeUnit: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function setTimeUnit(
  options: BaseTransactionOptions<SetTimeUnitParams>,
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xb218f069",
      [
        {
          internalType: "uint80",
          name: "_timeUnit",
          type: "uint80",
        },
      ],
      [],
    ],
    params: [options.timeUnit],
  });
}

/**
 * Represents the parameters for the "stake" function.
 */
export type StakeParams = {
  amount: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_amount";
    type: "uint256";
  }>;
};

/**
 * Calls the "stake" function on the contract.
 * @param options - The options for the "stake" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { stake } from "TODO";
 *
 * const transaction = stake({
 *  amount: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function stake(options: BaseTransactionOptions<StakeParams>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0xa694fc3a",
      [
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
      ],
      [],
    ],
    params: [options.amount],
  });
}

/**
 * Represents the parameters for the "withdraw" function.
 */
export type WithdrawParams = {
  amount: AbiParameterToPrimitiveType<{
    internalType: "uint256";
    name: "_amount";
    type: "uint256";
  }>;
};

/**
 * Calls the "withdraw" function on the contract.
 * @param options - The options for the "withdraw" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { withdraw } from "TODO";
 *
 * const transaction = withdraw({
 *  amount: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function withdraw(options: BaseTransactionOptions<WithdrawParams>) {
  return prepareContractCall({
    contract: options.contract,
    method: [
      "0x2e1a7d4d",
      [
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
      ],
      [],
    ],
    params: [options.amount],
  });
}
