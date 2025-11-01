// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Staking20} from "@thirdweb-dev/contracts/extension/Staking20.sol";
import {Permissions} from "@thirdweb-dev/contracts/extension/Permissions.sol";
import {IERC20} from "@thirdweb-dev/contracts/eip/interface/IERC20.sol";
import {IERC20Metadata} from "@thirdweb-dev/contracts/eip/interface/IERC20Metadata.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title StakeAWish
 * @dev A staking contract that rewards stakers and allows burning from reward pool based on stake duration
 * @notice Users earn rewards from staking AND can burn tokens from the reward pool for every 24h they stake
 */
contract StakeAWish is Staking20, Permissions {
    // Custom errors
    error InsufficientBurnAllowance();
    error NoBurnableTokens();
    error InvalidAmount();
    error DailyBurnCapExceeded();

    // Permission role for managing stake conditions
    bytes32 public constant STAKE_CONDITIONS_MANAGER_ROLE = keccak256("STAKE_CONDITIONS_MANAGER_ROLE");

    address public rewardToken;

    // Burn period (24 hours in production)
    uint256 public constant BURN_PERIOD = 1 days;

    // Global daily burn cap to protect reward pool burns 222M WISH/day
    uint256 public constant DAILY_BURN_CAP = 222_000_000 * 10**18;

    // Track how much burn allowance has been used per user
    mapping(address => uint256) public burnedAmount;
    
    // Track when each staker first staked (for burn calculations)
    mapping(address => uint256) public stakingStartTime;

    // Track total amount burned per day (day number => amount burned that day)
    mapping(uint256 => uint256) public dailyBurnedAmount;

    // Events
    event StakedWishesBurned(address indexed staker, uint256 amount);
    event BurnTrackingStarted(address indexed staker, uint256 timestamp);
    event DailyBurnCapReached(uint256 day, uint256 amount);

    constructor(
        uint80 _timeUnit,
        uint256 _rewardRatioNumerator,
        uint256 _rewardRatioDenominator,
        address _stakingToken,
        address _rewardToken,
        address _nativeTokenWrapper
    ) Staking20(
            _nativeTokenWrapper,
            _stakingToken,
            IERC20Metadata(_stakingToken).decimals(),
            IERC20Metadata(_rewardToken).decimals()
    ) {
        _setStakingCondition(_timeUnit, _rewardRatioNumerator, _rewardRatioDenominator);
        rewardToken = _rewardToken;
        
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
        if (burnable > 0) {
            _burnRewardTokens(msg.sender, burnable);
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
     *  @dev    Returns the available reward token balance in the contract.
     *  @return _rewardsAvailableInContract The amount of reward tokens available.
     */
    function getRewardTokenBalance() external view virtual override returns (uint256 _rewardsAvailableInContract) {
        return IERC20(rewardToken).balanceOf(address(this));
    }

    /**
     *  @dev    Mint/Transfer ERC20 rewards to the staker. Must override.
     *
     *  @param _staker    Address for sending rewards to.
     *  @param _rewards   Amount of tokens to be given out as reward.
     */
    function _mintRewards(address _staker, uint256 _rewards) internal override {
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
     * @dev Calculate how many tokens a staker can burn from the reward pool
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
     * @dev Burn tokens from the reward pool based on staking duration
     * For every 24 hours staked, user can burn an amount equal to their staked balance
     * Subject to global daily burn cap to protect reward pool
     * If requested amount exceeds remaining daily cap, burns up to the cap instead of reverting
     * @param amount The maximum amount of reward tokens to burn
     */
    function burnRewardTokens(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        
        uint256 burnable = getBurnableAmount(msg.sender);
        if (burnable == 0) revert NoBurnableTokens();
        
        // Check daily burn cap
        uint256 today = block.timestamp / 1 days;
        uint256 burnedToday = dailyBurnedAmount[today];
        uint256 remainingCap = DAILY_BURN_CAP > burnedToday ? DAILY_BURN_CAP - burnedToday : 0;
        
        // If cap is already reached, revert
        if (remainingCap == 0) revert DailyBurnCapExceeded();
        
        // Calculate actual amount to burn (minimum of: requested, burnable allowance, remaining cap)
        uint256 actualBurnAmount = amount;
        if (actualBurnAmount > burnable) {
            actualBurnAmount = burnable;
        }
        if (actualBurnAmount > remainingCap) {
            actualBurnAmount = remainingCap;
        }
        
        // Update daily burn tracking
        dailyBurnedAmount[today] += actualBurnAmount;
        
        // Emit event if cap is now reached
        if (dailyBurnedAmount[today] >= DAILY_BURN_CAP) {
            emit DailyBurnCapReached(today, dailyBurnedAmount[today]);
        }
        
        _burnRewardTokens(msg.sender, actualBurnAmount);
    }

    /**
     * @dev Internal function to burn reward tokens
     * @param staker Address of the staker
     * @param amount Amount of tokens to burn from reward pool
     */
    function _burnRewardTokens(address staker, uint256 amount) internal {
        // Update burned amount tracker
        burnedAmount[staker] += amount;
        
        // Get reward pool balance
        uint256 rewardPoolBalance = IERC20(rewardToken).balanceOf(address(this));
        
        // Burn the tokens using ERC20Burnable
        // Only burn what's available in the pool
        uint256 amountToBurn = amount > rewardPoolBalance ? rewardPoolBalance : amount;
        
        if (amountToBurn > 0) {
            ERC20Burnable(rewardToken).burn(amountToBurn);
        }
        
        emit StakedWishesBurned(staker, amountToBurn);
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
}
