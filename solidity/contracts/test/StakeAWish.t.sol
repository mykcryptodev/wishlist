// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {StakeAWish} from "../src/StakeAWish.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract WishToken is ERC20Burnable {
    constructor(uint256 initialSupply) ERC20("Wish Token", "WISH") {
        _mint(msg.sender, initialSupply);
    }
}

contract MockWETH is ERC20 {
    constructor() ERC20("Wrapped ETH", "WETH") {}
}

contract StakeAWishTest is Test {
    StakeAWish public stakeContract;
    WishToken public stakingToken;
    WishToken public rewardToken;
    MockWETH public weth;
    
    address public owner = address(1);
    address public alice = address(2);
    address public bob = address(3);
    address public attacker = address(4);
    
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;
    uint256 public constant REWARD_POOL = 500_000 * 10**18;
    uint80 public constant TIME_UNIT = 1 days;
    uint256 public constant REWARD_NUMERATOR = 1;
    uint256 public constant REWARD_DENOMINATOR = 1;
    
    function setUp() public {
        vm.startPrank(owner);
        stakingToken = new WishToken(INITIAL_SUPPLY);
        rewardToken = new WishToken(INITIAL_SUPPLY);
        weth = new MockWETH();
        
        stakeContract = new StakeAWish(
            TIME_UNIT,
            REWARD_NUMERATOR,
            REWARD_DENOMINATOR,
            address(stakingToken),
            address(rewardToken),
            address(weth)
        );
        
        rewardToken.transfer(address(stakeContract), REWARD_POOL);
        stakingToken.transfer(alice, 10_000 * 10**18);
        stakingToken.transfer(bob, 10_000 * 10**18);
        stakingToken.transfer(attacker, 10_000 * 10**18);
        vm.stopPrank();
    }
    
    function testStakeAutomaticallyStartsTracking() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        
        // Stake without explicitly calling startBurnTracking
        stakeContract.stake(stakeAmount);
        
        vm.stopPrank();
        
        // Verify stake worked
        (uint256 stakedAmount, ) = stakeContract.getStakeInfo(alice);
        assertEq(stakedAmount, stakeAmount);
        
        // Verify burn tracking started automatically
        assertGt(stakeContract.stakingStartTime(alice), 0, "Burn tracking should start automatically");
        assertEq(stakeContract.stakingStartTime(alice), block.timestamp);
    }
    
    function testTrackingOnlyStartsWithStake() public {
        // Verify tracking hasn't started before staking
        assertEq(stakeContract.stakingStartTime(alice), 0, "Tracking should not be active before staking");
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), 1000 * 10**18);
        stakeContract.stake(1000 * 10**18);
        vm.stopPrank();
        
        // Verify tracking started after staking
        assertGt(stakeContract.stakingStartTime(alice), 0, "Tracking should start automatically after staking");
    }
    
    function testMultipleStakesDoNotResetTracking() public {
        vm.startPrank(alice);
        
        // First stake
        stakingToken.approve(address(stakeContract), 1000 * 10**18);
        stakeContract.stake(1000 * 10**18);
        uint256 firstStartTime = stakeContract.stakingStartTime(alice);
        
        // Wait 1 day and stake again
        vm.warp(block.timestamp + 1 days);
        stakingToken.approve(address(stakeContract), 500 * 10**18);
        stakeContract.stake(500 * 10**18);
        
        uint256 secondStartTime = stakeContract.stakingStartTime(alice);
        assertEq(firstStartTime, secondStartTime, "Start time should not change on subsequent stakes");
        vm.stopPrank();
    }
    
    function testBurnAfterOnePeriod() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        stakeContract.stake(stakeAmount);
        
        vm.warp(block.timestamp + 1 days);
        
        uint256 burnable = stakeContract.getBurnableAmount(alice);
        assertEq(burnable, stakeAmount);
        
        stakeContract.burnRewardTokens(burnable);
        assertEq(stakeContract.burnedAmount(alice), burnable);
        vm.stopPrank();
    }
    
    function testCannotBurnBeforeFirstPeriod() public {
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), 1000 * 10**18);
        stakeContract.stake(1000 * 10**18);
        
        vm.warp(block.timestamp + 23 hours);
        
        uint256 burnable = stakeContract.getBurnableAmount(alice);
        assertEq(burnable, 0);
        
        vm.expectRevert(StakeAWish.NoBurnableTokens.selector);
        stakeContract.burnRewardTokens(1);
        vm.stopPrank();
    }
    
    function testBurnAllowanceIncreasesWithTime() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        stakeContract.stake(stakeAmount);
        
        uint256 trackingStartTime = stakeContract.stakingStartTime(alice);
        
        vm.warp(trackingStartTime + 1 days);
        assertEq(stakeContract.getBurnableAmount(alice), stakeAmount);
        
        vm.warp(trackingStartTime + 2 days);
        assertEq(stakeContract.getBurnableAmount(alice), stakeAmount * 2);
        
        vm.warp(trackingStartTime + 3 days);
        assertEq(stakeContract.getBurnableAmount(alice), stakeAmount * 3);
        vm.stopPrank();
    }
    
    function testAutoBurnOnPartialUnstake() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        stakeContract.stake(stakeAmount);
        uint256 startTime = stakeContract.stakingStartTime(alice);
        
        // Wait 2 days to accumulate burn allowance
        vm.warp(block.timestamp + 2 days);
        
        // Check burnable amount
        uint256 burnableBeforeUnstake = stakeContract.getBurnableAmount(alice);
        assertEq(burnableBeforeUnstake, stakeAmount * 2, "Should have 2 days worth of burnable tokens");
        
        // Unstake half - should burn tokens but keep tracking active
        stakeContract.withdraw(stakeAmount / 2);
        
        // Verify tracking is still active after partial unstake
        assertEq(stakeContract.stakingStartTime(alice), startTime, "Tracking should persist after partial unstake");
        assertEq(stakeContract.burnedAmount(alice), stakeAmount * 2, "Should have burned all available tokens");
        
        // Verify remaining stake
        (uint256 remainingStake, ) = stakeContract.getStakeInfo(alice);
        assertEq(remainingStake, stakeAmount / 2, "Should have half stake remaining");
        
        vm.stopPrank();
    }
    
    function testAutoBurnOnFullUnstake() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        stakeContract.stake(stakeAmount);
        
        // Wait 2 days to accumulate burn allowance
        vm.warp(block.timestamp + 2 days);
        
        // Check burnable amount before unstaking
        uint256 burnableBeforeUnstake = stakeContract.getBurnableAmount(alice);
        assertEq(burnableBeforeUnstake, stakeAmount * 2, "Should have 2 days worth of burnable tokens");
        
        // Unstake everything - should automatically burn tokens and reset tracking
        stakeContract.withdraw(stakeAmount);
        
        // Verify tracking was reset after full unstake
        assertEq(stakeContract.stakingStartTime(alice), 0, "Tracking should be reset after full unstake");
        assertEq(stakeContract.burnedAmount(alice), 0, "Burned amount should be reset after full unstake");
        
        // Verify no more stake remaining
        (uint256 remainingStake, ) = stakeContract.getStakeInfo(alice);
        assertEq(remainingStake, 0, "Should have no stake remaining");
        
        vm.stopPrank();
    }
    
    function testMultipleStakingSessions() public {
        uint256 firstStake = 1000 * 10**18;
        uint256 secondStake = 500 * 10**18;
        
        vm.startPrank(alice);
        
        // First stake - tracking starts automatically
        stakingToken.approve(address(stakeContract), firstStake);
        stakeContract.stake(firstStake);
        uint256 startTime = stakeContract.stakingStartTime(alice);
        
        (uint256 stakedAmount1, ) = stakeContract.getStakeInfo(alice);
        assertEq(stakedAmount1, firstStake);
        assertGt(startTime, 0, "Tracking should start automatically on first stake");
        
        // Wait 1 day
        vm.warp(startTime + 1 days);
        
        // Second stake - tracking continues automatically without resetting
        stakingToken.approve(address(stakeContract), secondStake);
        stakeContract.stake(secondStake);
        
        (uint256 stakedAmount2, ) = stakeContract.getStakeInfo(alice);
        assertEq(stakedAmount2, firstStake + secondStake, "Total staked should be cumulative");
        
        // Start time should not have changed
        uint256 startTimeAfterSecondStake = stakeContract.stakingStartTime(alice);
        assertEq(startTime, startTimeAfterSecondStake, "Start time should remain the same");
        
        // Burnable amount should be based on total staked and time from first stake
        uint256 burnable = stakeContract.getBurnableAmount(alice);
        assertEq(burnable, (firstStake + secondStake) * 1, "Burnable based on total stake and 1 day");
        
        vm.stopPrank();
    }
    
    function testMultipleUsersIndependent() public {
        uint256 aliceStake = 1000 * 10**18;
        uint256 bobStake = 2000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), aliceStake);
        stakeContract.stake(aliceStake);
        uint256 aliceStartTime = stakeContract.stakingStartTime(alice);
        vm.stopPrank();
        
        vm.warp(aliceStartTime + 1 days);
        
        vm.startPrank(bob);
        stakingToken.approve(address(stakeContract), bobStake);
        stakeContract.stake(bobStake);
        vm.stopPrank();
        
        vm.warp(aliceStartTime + 2 days);
        
        assertEq(stakeContract.getBurnableAmount(alice), aliceStake * 2);
        assertEq(stakeContract.getBurnableAmount(bob), bobStake * 1);
    }
    
    function testAccessControl() public {
        vm.prank(alice);
        vm.expectRevert();
        stakeContract.setRewardRatio(2, 1);
        
        vm.prank(owner);
        stakeContract.setRewardRatio(2, 1);
    }
    
    function testGrantAndRevokeRole() public {
        bytes32 managerRole = stakeContract.STAKE_CONDITIONS_MANAGER_ROLE();
        
        vm.startPrank(owner);
        stakeContract.grantRole(managerRole, alice);
        vm.stopPrank();
        
        vm.prank(alice);
        stakeContract.setRewardRatio(2, 1);
        
        vm.prank(owner);
        stakeContract.revokeRole(managerRole, alice);
        
        vm.prank(alice);
        vm.expectRevert();
        stakeContract.setRewardRatio(3, 1);
    }
    
    function testRewardAccrual() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        stakeContract.stake(stakeAmount);
        
        vm.warp(block.timestamp + 1 days);
        
        (uint256 staked, uint256 rewards) = stakeContract.getStakeInfo(alice);
        assertEq(staked, stakeAmount);
        assertGt(rewards, 0);
        vm.stopPrank();
    }
    
    function testFuzzBurnAfterPeriod(uint256 stakeAmount, uint256 daysStaked) public {
        stakeAmount = bound(stakeAmount, 1 * 10**18, 10_000 * 10**18);
        daysStaked = bound(daysStaked, 1, 100);
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        stakeContract.stake(stakeAmount);
        
        vm.warp(block.timestamp + (daysStaked * 1 days));
        
        uint256 burnable = stakeContract.getBurnableAmount(alice);
        assertEq(burnable, stakeAmount * daysStaked);
        vm.stopPrank();
    }
}

