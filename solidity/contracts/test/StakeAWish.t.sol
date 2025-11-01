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
    
    function testStakeAndStartTracking() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        stakeContract.stake(stakeAmount);
        stakeContract.startBurnTracking();
        vm.stopPrank();
        
        (uint256 stakedAmount, ) = stakeContract.getStakeInfo(alice);
        assertEq(stakedAmount, stakeAmount);
        assertEq(stakeContract.stakingStartTime(alice), block.timestamp);
    }
    
    function testCannotStartTrackingWithoutStake() public {
        vm.prank(alice);
        vm.expectRevert("Must have active stake");
        stakeContract.startBurnTracking();
    }
    
    function testCannotStartTrackingTwice() public {
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), 1000 * 10**18);
        stakeContract.stake(1000 * 10**18);
        stakeContract.startBurnTracking();
        
        vm.expectRevert("Tracking already started");
        stakeContract.startBurnTracking();
        vm.stopPrank();
    }
    
    function testBurnAfterOnePeriod() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), stakeAmount);
        stakeContract.stake(stakeAmount);
        stakeContract.startBurnTracking();
        
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
        stakeContract.startBurnTracking();
        
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
        stakeContract.startBurnTracking();
        
        uint256 trackingStartTime = stakeContract.stakingStartTime(alice);
        
        vm.warp(trackingStartTime + 1 days);
        assertEq(stakeContract.getBurnableAmount(alice), stakeAmount);
        
        vm.warp(trackingStartTime + 2 days);
        assertEq(stakeContract.getBurnableAmount(alice), stakeAmount * 2);
        
        vm.warp(trackingStartTime + 3 days);
        assertEq(stakeContract.getBurnableAmount(alice), stakeAmount * 3);
        vm.stopPrank();
    }
    
    function testStopBurnTracking() public {
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), 1000 * 10**18);
        stakeContract.stake(1000 * 10**18);
        stakeContract.startBurnTracking();
        
        vm.warp(block.timestamp + 2 days);
        stakeContract.burnRewardTokens(500 * 10**18);
        
        stakeContract.stopBurnTracking();
        
        assertEq(stakeContract.stakingStartTime(alice), 0);
        assertEq(stakeContract.burnedAmount(alice), 0);
        vm.stopPrank();
    }
    
    function testMultipleUsersIndependent() public {
        uint256 aliceStake = 1000 * 10**18;
        uint256 bobStake = 2000 * 10**18;
        
        vm.startPrank(alice);
        stakingToken.approve(address(stakeContract), aliceStake);
        stakeContract.stake(aliceStake);
        stakeContract.startBurnTracking();
        uint256 aliceStartTime = stakeContract.stakingStartTime(alice);
        vm.stopPrank();
        
        vm.warp(aliceStartTime + 1 days);
        
        vm.startPrank(bob);
        stakingToken.approve(address(stakeContract), bobStake);
        stakeContract.stake(bobStake);
        stakeContract.startBurnTracking();
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
        stakeContract.startBurnTracking();
        
        vm.warp(block.timestamp + (daysStaked * 1 days));
        
        uint256 burnable = stakeContract.getBurnableAmount(alice);
        assertEq(burnable, stakeAmount * daysStaked);
        vm.stopPrank();
    }
}

