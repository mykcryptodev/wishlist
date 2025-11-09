// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Staking20} from "@thirdweb-dev/contracts/extension/Staking20.sol";
import {Permissions} from "@thirdweb-dev/contracts/extension/Permissions.sol";
import {IERC20} from "@thirdweb-dev/contracts/eip/interface/IERC20.sol";
import {IERC20Metadata} from "@thirdweb-dev/contracts/eip/interface/IERC20Metadata.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title StakeAWish
 * @dev A staking contract that rewards stakers and allows burning from a separate burn pool based on stake duration
 * @notice Users earn rewards from staking AND can burn tokens from a separate burn pool for every 24h they stake
 * The reward pool and burn pool are completely isolated to ensure staking rewards are always claimable
 */
contract StakeAWish is Staking20, Permissions {
    // Custom errors
    error InsufficientBurnAllowance();
    error NoBurnableTokens();
    error InvalidAmount();
    error DailyBurnCapExceeded();
    error InsufficientRewardPool();
    error InsufficientBurnPool();
    error EmergencyWithdrawalDisabled();

    // Permission role for managing stake conditions
    bytes32 public constant STAKE_CONDITIONS_MANAGER_ROLE = keccak256("STAKE_CONDITIONS_MANAGER_ROLE");

    address public rewardToken;
    address public burnToken;

    // Burn period (24 hours in production)
    uint256 public constant BURN_PERIOD = 1 days;

    // Global daily burn cap to protect burn pool - 222M WISH/day
    uint256 public constant DAILY_BURN_CAP = 222_000_000 * 10**18;

    // Reserve tracking for true pool separation (even with same token)
    uint256 public rewardPoolReserve;  // Amount reserved for staking rewards
    uint256 public burnPoolReserve;    // Amount reserved for burning

    // Track how much burn allowance has been used per user
    mapping(address => uint256) public burnedAmount;
    
    // Track when each staker first staked (for burn calculations)
    mapping(address => uint256) public stakingStartTime;

    // Track total amount burned per day (day number => amount burned that day)
    mapping(uint256 => uint256) public dailyBurnedAmount;

    // Track total rewards claimed per user (for analytics)
    mapping(address => uint256) public totalRewardsClaimed;

    // Track total amount burned across all time and all users
    uint256 public totalBurnedAllTime;

    /// @dev Flag to permanently disable emergency withdrawals - can never be re-enabled
    bool public emergencyWithdrawalPermanentlyDisabled;

    // Events
    event StakedWishesBurned(address indexed staker, uint256 amount);
    event BurnTrackingStarted(address indexed staker, uint256 timestamp);
    event DailyBurnCapReached(uint256 day, uint256 amount);
    event RewardPoolFunded(address indexed funder, uint256 amount, uint256 newReserve);
    event BurnPoolFunded(address indexed funder, uint256 amount, uint256 newReserve);
    event EmergencyWithdrawal(address indexed admin, address indexed token, uint256 amount, address indexed to);
    event EmergencyWithdrawalPermanentlyDisabled(address indexed admin, uint256 timestamp);

    constructor(
        uint80 _timeUnit,
        uint256 _rewardRatioNumerator,
        uint256 _rewardRatioDenominator,
        address _stakingToken,
        address _rewardToken,
        address _burnToken,
        address _nativeTokenWrapper
    ) Staking20(
            _nativeTokenWrapper,
            _stakingToken,
            IERC20Metadata(_stakingToken).decimals(),
            IERC20Metadata(_rewardToken).decimals()
    ) {
        _setStakingCondition(_timeUnit, _rewardRatioNumerator, _rewardRatioDenominator);
        rewardToken = _rewardToken;
        burnToken = _burnToken;
        
        // Setup permissions - grant deployer the stake conditions manager role
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(STAKE_CONDITIONS_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Override stake function to automatically start burn tracking
     * @param _amount Amount of tokens to stake
     */
    function _stake(uint256 _amount) internal virtual override {
        // Call parent stake function
        super._stake(_amount);
        
        // Automatically start burn tracking if not already started
        _startBurnTracking(msg.sender);
    }

    /**
     * @dev Override withdraw function to automatically burn available tokens
     * @param _amount Amount of tokens to unstake
     */
    function _withdraw(uint256 _amount) internal virtual override {
        // Get burnable amount before withdrawing
        uint256 burnable = getBurnableAmount(msg.sender);
        
        // Burn available tokens if any (before unstaking)
        // Use graceful mode to ensure withdrawal never fails due to empty burn pool
        if (burnable > 0) {
            _executeBurnWithCapCheck(msg.sender, burnable, burnable, true);
        }
        
        // Call parent withdraw function
        super._withdraw(_amount);
        
        // Check if user has fully unstaked
        (uint256 remainingStake, ) = this.getStakeInfo(msg.sender);
        if (remainingStake == 0 && stakingStartTime[msg.sender] > 0) {
            // Auto-reset tracking when fully unstaked
            delete stakingStartTime[msg.sender];
            delete burnedAmount[msg.sender];
        }
    }

    /**
     * @dev Internal function to start burn tracking
     * @param staker Address of the staker
     */
    function _startBurnTracking(address staker) internal {
        // Only set start time if not already tracking
        // This makes the function idempotent - safe to call multiple times
        if (stakingStartTime[staker] == 0) {
            stakingStartTime[staker] = block.timestamp;
            emit BurnTrackingStarted(staker, block.timestamp);
        }
    }

    /**
     * @dev Fund the reward pool with tokens
     * @param amount Amount of reward tokens to add to the reserve
     * @notice Only callable by contract owner/admin. Increases the reward pool reserve.
     */
    function fundRewardPool(uint256 amount) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only admin can fund reward pool");
        if (amount == 0) revert InvalidAmount();
        
        // Transfer tokens from sender to contract
        IERC20(rewardToken).transferFrom(msg.sender, address(this), amount);
        
        // Increase reward pool reserve
        rewardPoolReserve += amount;
        
        emit RewardPoolFunded(msg.sender, amount, rewardPoolReserve);
    }

    /**
     * @dev Fund the burn pool with tokens
     * @param amount Amount of burn tokens to add to the reserve
     * @notice Only callable by contract owner/admin. Increases the burn pool reserve.
     */
    function fundBurnPool(uint256 amount) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only admin can fund burn pool");
        if (amount == 0) revert InvalidAmount();
        
        // Transfer tokens from sender to contract
        IERC20(burnToken).transferFrom(msg.sender, address(this), amount);
        
        // Increase burn pool reserve
        burnPoolReserve += amount;
        
        emit BurnPoolFunded(msg.sender, amount, burnPoolReserve);
    }

    /**
     * @dev Recover unaccounted tokens that were sent directly to the contract
     * This allows admin to allocate tokens that were sent via direct transfer (not using fund functions)
     * @param amountForRewardPool Amount to allocate to reward pool reserve
     * @param amountForBurnPool Amount to allocate to burn pool reserve
     * @notice Only callable by admin. Use to recover from accidental direct transfers.
     */
    function recoverUnaccountedTokens(uint256 amountForRewardPool, uint256 amountForBurnPool) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only admin can recover tokens");
        
        // Calculate actual token balances in contract
        uint256 actualRewardBalance = IERC20(rewardToken).balanceOf(address(this));
        uint256 actualBurnBalance = IERC20(burnToken).balanceOf(address(this));
        
        // If same token, balances will be the same - need to account for that
        if (rewardToken == burnToken) {
            // Same token - total unaccounted is difference between actual and sum of reserves
            uint256 totalReserved = rewardPoolReserve + burnPoolReserve + stakingTokenBalance;
            uint256 unaccounted = actualRewardBalance > totalReserved ? actualRewardBalance - totalReserved : 0;
            
            // Verify we're not over-allocating
            require(amountForRewardPool + amountForBurnPool <= unaccounted, "Cannot allocate more than unaccounted");
            
            // Allocate to reserves
            if (amountForRewardPool > 0) {
                rewardPoolReserve += amountForRewardPool;
                emit RewardPoolFunded(msg.sender, amountForRewardPool, rewardPoolReserve);
            }
            
            if (amountForBurnPool > 0) {
                burnPoolReserve += amountForBurnPool;
                emit BurnPoolFunded(msg.sender, amountForBurnPool, burnPoolReserve);
            }
        } else {
            // Different tokens - calculate separately
            uint256 unaccountedReward = actualRewardBalance > rewardPoolReserve ? actualRewardBalance - rewardPoolReserve : 0;
            uint256 unaccountedBurn = actualBurnBalance > burnPoolReserve ? actualBurnBalance - burnPoolReserve : 0;
            
            require(amountForRewardPool <= unaccountedReward, "Exceeds unaccounted reward tokens");
            require(amountForBurnPool <= unaccountedBurn, "Exceeds unaccounted burn tokens");
            
            if (amountForRewardPool > 0) {
                rewardPoolReserve += amountForRewardPool;
                emit RewardPoolFunded(msg.sender, amountForRewardPool, rewardPoolReserve);
            }
            
            if (amountForBurnPool > 0) {
                burnPoolReserve += amountForBurnPool;
                emit BurnPoolFunded(msg.sender, amountForBurnPool, burnPoolReserve);
            }
        }
    }

    /**
     *  @dev    Returns the available reward token balance in the contract.
     *  @return _rewardsAvailableInContract The amount of reward tokens available.
     */
    function getRewardTokenBalance() external view virtual override returns (uint256 _rewardsAvailableInContract) {
        return rewardPoolReserve;
    }

    /**
     *  @dev    Returns the available burn token balance in the contract.
     *  @return _burnTokensAvailableInContract The amount of burn tokens available.
     */
    function getBurnTokenBalance() external view returns (uint256 _burnTokensAvailableInContract) {
        return burnPoolReserve;
    }

    /**
     *  @dev    Mint/Transfer ERC20 rewards to the staker. Must override.
     *
     *  @param _staker    Address for sending rewards to.
     *  @param _rewards   Amount of tokens to be given out as reward.
     */
    function _mintRewards(address _staker, uint256 _rewards) internal override {
        // Check that reward pool has sufficient reserve
        if (rewardPoolReserve < _rewards) revert InsufficientRewardPool();
        
        // Deduct from reward pool reserve
        rewardPoolReserve -= _rewards;
        
        // Track total rewards claimed by this user
        totalRewardsClaimed[_staker] += _rewards;
        
        // Transfer rewards to staker
        IERC20(rewardToken).transfer(_staker, _rewards);
    }

    /**
     *  @dev    Returns whether staking conditions can be set. Must override.
     *  @return True if staking conditions can be set, false otherwise.
     */
    function _canSetStakeConditions() internal view virtual override returns (bool) {
        return hasRole(STAKE_CONDITIONS_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Calculate how many tokens a staker can burn from the burn pool
     * Formula: (stakedAmount * completePeriods) - alreadyBurned
     * @param staker The address to check
     * @return burnableAmount The amount that can be burned
     */
    function getBurnableAmount(address staker) public view returns (uint256 burnableAmount) {
        // Get staked amount from parent contract
        (uint256 amountStaked, ) = this.getStakeInfo(staker);
        
        if (amountStaked == 0 || stakingStartTime[staker] == 0) return 0;

        // Calculate complete 24h periods since staking
        uint256 timeStaked = block.timestamp - stakingStartTime[staker];
        uint256 completePeriods = timeStaked / BURN_PERIOD;
        
        // Total burnable = staked amount * number of complete 24h periods
        uint256 totalBurnable = amountStaked * completePeriods;
        
        // Subtract already burned amount
        if (totalBurnable > burnedAmount[staker]) {
            burnableAmount = totalBurnable - burnedAmount[staker];
        } else {
            burnableAmount = 0;
        }
        
        return burnableAmount;
    }

    /**
     * @dev Burn tokens from the burn pool based on staking duration
     * For every 24 hours staked, user can burn an amount equal to their staked balance
     * Subject to global daily burn cap to protect burn pool
     * If requested amount exceeds remaining daily cap, burns up to the cap instead of reverting
     * @param amount The maximum amount of burn tokens to burn
     */
    function burnRewardTokens(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        
        uint256 burnable = getBurnableAmount(msg.sender);
        if (burnable == 0) revert NoBurnableTokens();
        
        // Check if daily cap is already reached before attempting burn
        uint256 today = block.timestamp / 1 days;
        uint256 burnedToday = dailyBurnedAmount[today];
        uint256 remainingCap = DAILY_BURN_CAP > burnedToday ? DAILY_BURN_CAP - burnedToday : 0;
        if (remainingCap == 0) revert DailyBurnCapExceeded();
        
        // Execute burn with cap checking (strict mode - will revert if pool insufficient)
        _executeBurnWithCapCheck(msg.sender, amount, burnable, false);
    }

    /**
     * @dev Internal function to calculate and execute burn respecting daily cap
     * @param staker Address of the staker
     * @param requestedAmount Maximum amount user wants to burn
     * @param burnableAllowance Maximum amount user is allowed to burn (from staking duration)
     * @param gracefulFail If true, returns 0 when pool empty; if false, reverts with InsufficientBurnPool
     * @return actualBurnAmount The actual amount burned (may be less due to cap)
     */
    function _executeBurnWithCapCheck(
        address staker,
        uint256 requestedAmount,
        uint256 burnableAllowance,
        bool gracefulFail
    ) internal returns (uint256 actualBurnAmount) {
        if (burnableAllowance == 0) return 0;
        
        // Check daily burn cap
        uint256 today = block.timestamp / 1 days;
        uint256 burnedToday = dailyBurnedAmount[today];
        uint256 remainingCap = DAILY_BURN_CAP > burnedToday ? DAILY_BURN_CAP - burnedToday : 0;
        
        // If cap already reached, return 0
        if (remainingCap == 0) return 0;
        
        // Calculate actual amount to burn (minimum of: requested, burnable allowance, remaining cap, burn pool reserve)
        actualBurnAmount = requestedAmount;
        if (actualBurnAmount > burnableAllowance) {
            actualBurnAmount = burnableAllowance;
        }
        if (actualBurnAmount > remainingCap) {
            actualBurnAmount = remainingCap;
        }
        
        // Check burn pool reserve
        if (actualBurnAmount > burnPoolReserve) {
            if (gracefulFail) {
                // Gracefully burn what's available
                actualBurnAmount = burnPoolReserve;
            } else {
                // Revert if not enough in pool (explicit burn attempt)
                if (burnPoolReserve < actualBurnAmount) revert InsufficientBurnPool();
            }
        }
        
        // If nothing to burn after all checks, return 0
        if (actualBurnAmount == 0) return 0;
        
        // Update daily burn tracking
        dailyBurnedAmount[today] += actualBurnAmount;
        
        // Emit event if cap is now reached
        if (dailyBurnedAmount[today] >= DAILY_BURN_CAP) {
            emit DailyBurnCapReached(today, dailyBurnedAmount[today]);
        }
        
        // Execute the burn
        _burnRewardTokens(staker, actualBurnAmount);
        
        return actualBurnAmount;
    }

    /**
     * @dev Internal function to burn tokens from the burn pool
     * @param staker Address of the staker
     * @param amount Amount of tokens to burn from burn pool
     */
    function _burnRewardTokens(address staker, uint256 amount) internal {
        // Check that burn pool has sufficient reserve
        if (burnPoolReserve < amount) revert InsufficientBurnPool();
        
        // Update burned amount tracker (per user)
        burnedAmount[staker] += amount;
        
        // Update total burned all time (global counter)
        totalBurnedAllTime += amount;
        
        // Deduct from burn pool reserve
        burnPoolReserve -= amount;
        
        // Burn the tokens using ERC20Burnable
        ERC20Burnable(burnToken).burn(amount);
        
        emit StakedWishesBurned(staker, amount);
    }

    /**
     * @dev Get detailed burn information for a staker
     * @param staker The address to check
     * @return currentStaked Current staked amount
     * @return timeStaked Time in seconds since first stake
     * @return completePeriods Number of complete 24h periods
     * @return totalBurnable Total amount that could be burned
     * @return alreadyBurned Amount already burned
     * @return availableToBurn Amount currently available to burn
     */
    function getBurnInfo(address staker) external view returns (
        uint256 currentStaked,
        uint256 timeStaked,
        uint256 completePeriods,
        uint256 totalBurnable,
        uint256 alreadyBurned,
        uint256 availableToBurn
    ) {
        // Get staked amount from parent contract
        (currentStaked, ) = this.getStakeInfo(staker);
        alreadyBurned = burnedAmount[staker];
        
        if (currentStaked == 0 || stakingStartTime[staker] == 0) {
            return (0, 0, 0, 0, alreadyBurned, 0);
        }

        timeStaked = block.timestamp - stakingStartTime[staker];
        completePeriods = timeStaked / BURN_PERIOD;
        totalBurnable = currentStaked * completePeriods;
        availableToBurn = getBurnableAmount(staker);
        
        return (currentStaked, timeStaked, completePeriods, totalBurnable, alreadyBurned, availableToBurn);
    }

    /**
     * @dev Get remaining daily burn cap for today
     * @return remaining Amount of burn cap still available today
     * @return total Total daily burn cap
     * @return used Amount already burned today
     */
    function getDailyBurnCapInfo() external view returns (
        uint256 remaining,
        uint256 total,
        uint256 used
    ) {
        uint256 today = block.timestamp / 1 days;
        used = dailyBurnedAmount[today];
        total = DAILY_BURN_CAP;
        remaining = total > used ? total - used : 0;
        
        return (remaining, total, used);
    }

    /**
     * @dev Check if daily burn cap has been reached
     * @return True if today's burn cap has been reached
     */
    function isDailyBurnCapReached() external view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        return dailyBurnedAmount[today] >= DAILY_BURN_CAP;
    }

    /**
     * @dev Get total amount burned across all time and all users
     * @return The total amount of tokens burned since contract deployment
     */
    function getTotalBurnedAllTime() external view returns (uint256) {
        return totalBurnedAllTime;
    }

    /**
     * @dev Get total rewards claimed by a specific user
     * @param staker The address to check
     * @return The total amount of rewards claimed by this user all time
     */
    function getUserTotalRewardsClaimed(address staker) external view returns (uint256) {
        return totalRewardsClaimed[staker];
    }

    /**
     * @dev Claim rewards, burn available allowance, and compound rewards back into staking
     * This is a convenience function that performs all three operations atomically:
     * 1. Burns any available burn allowance (based on staking duration)
     * 2. Claims pending staking rewards
     * 3. Re-stakes the claimed rewards to compound returns
     * 
     * @notice This is more gas efficient than doing these operations separately
     * @return rewardsClaimed Amount of rewards that were claimed and re-staked
     * @return amountBurned Amount of tokens burned from burn pool
     */
    function claimBurnAndCompound() external returns (uint256 rewardsClaimed, uint256 amountBurned) {
        // SECURITY: Verify that reward token matches staking token
        // Compounding only makes sense if rewards are in the same token as staking
        require(rewardToken == address(stakingToken), "Cannot compound different tokens");
        
        // Step 1: Get burnable amount and burn if any (graceful mode - continue even if pool empty)
        uint256 burnable = getBurnableAmount(msg.sender);
        amountBurned = _executeBurnWithCapCheck(msg.sender, burnable, burnable, true);
        
        // Step 2: Claim rewards (this updates internal accounting)
        _updateUnclaimedRewardsForStaker(msg.sender);
        rewardsClaimed = stakers[msg.sender].unclaimedRewards;
        
        if (rewardsClaimed > 0) {
            // Check that reward pool has sufficient reserve
            if (rewardPoolReserve < rewardsClaimed) revert InsufficientRewardPool();
            
            // Deduct from reward pool reserve
            rewardPoolReserve -= rewardsClaimed;
            
            // Track total rewards claimed by this user
            totalRewardsClaimed[msg.sender] += rewardsClaimed;
            
            // Reset unclaimed rewards
            stakers[msg.sender].unclaimedRewards = 0;
            stakers[msg.sender].timeOfLastUpdate = uint80(block.timestamp);
            
            // Step 3: Compound by directly increasing staked amount
            // Don't call _stake() as that would try to transfer tokens from user
            // The rewards are already in the contract, so just update the accounting
            // This is safe because we verified rewardToken == stakingToken above
            stakers[msg.sender].amountStaked += uint128(rewardsClaimed);
            stakingTokenBalance += rewardsClaimed;
            
            emit RewardsClaimed(msg.sender, rewardsClaimed);
            emit TokensStaked(msg.sender, rewardsClaimed);
        }
        
        return (rewardsClaimed, amountBurned);
    }

    /**
     * @dev Emergency withdraw tokens from contract with proportional accounting
     * @param token Address of token to withdraw (rewardToken, burnToken, or other)
     * @param amount Amount to withdraw
     * @param to Address to send tokens to
     * @notice Only callable by admin. Handles proportional deduction when reward/burn tokens are same.
     * @notice Can be permanently disabled via permanentlyDisableEmergencyWithdrawal()
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only admin");
        if (emergencyWithdrawalPermanentlyDisabled) revert EmergencyWithdrawalDisabled();
        require(to != address(0), "Invalid recipient");
        if (amount == 0) revert InvalidAmount();
        
        // Handle accounting based on which token is being withdrawn
        if (rewardToken == burnToken && token == rewardToken) {
            // Same token for both pools - deduct proportionally from reserves
            uint256 totalReserve = rewardPoolReserve + burnPoolReserve;
            
            if (totalReserve > 0 && amount <= totalReserve) {
                // Proportional deduction based on pool sizes
                uint256 fromReward = (amount * rewardPoolReserve) / totalReserve;
                uint256 fromBurn = amount - fromReward;
                
                rewardPoolReserve -= fromReward;
                burnPoolReserve -= fromBurn;
            } else if (amount > totalReserve) {
                // Withdrawing more than in reserves - zero them out
                rewardPoolReserve = 0;
                burnPoolReserve = 0;
            }
        } else {
            // Different tokens - deduct from appropriate reserve
            if (token == rewardToken) {
                uint256 deduction = amount > rewardPoolReserve ? rewardPoolReserve : amount;
                rewardPoolReserve -= deduction;
            }
            if (token == burnToken) {
                uint256 deduction = amount > burnPoolReserve ? burnPoolReserve : amount;
                burnPoolReserve -= deduction;
            }
            // If token is neither (e.g., accidentally sent tokens), just withdraw without reserve update
        }
        
        // Transfer tokens
        IERC20(token).transfer(to, amount);
        
        emit EmergencyWithdrawal(msg.sender, token, amount, to);
    }

    /**
     * @dev Permanently disable emergency withdrawal functionality
     * @notice THIS ACTION IS IRREVERSIBLE. Once called, emergency withdrawals can never be re-enabled.
     */
    function permanentlyDisableEmergencyWithdrawal() external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only admin");
        require(!emergencyWithdrawalPermanentlyDisabled, "Already disabled");
        
        emergencyWithdrawalPermanentlyDisabled = true;
        
        emit EmergencyWithdrawalPermanentlyDisabled(msg.sender, block.timestamp);
    }
}
