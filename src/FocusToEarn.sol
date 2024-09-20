// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract FocusToEarn {
    IERC20 public token;
    address public owner;

    struct User {
        uint256 deposit;
        uint256 focusStartTime;
        uint256 accumulatedRewards;
        uint256 totalFocusTime;
    }

    mapping(address => User) public users;
    uint256 public totalRewardsClaimed;
    uint256 public totalFocusTime;

    event Deposit(address indexed user, uint256 amount);
    event StartFocus(address indexed user, uint256 startTime);
    event StopFocus(address indexed user, uint256 endTime, uint256 focusDuration, uint256 rewards);
    event ClaimRewards(address indexed user, uint256 amount);
    event Penalty(address indexed user, uint256 penaltyAmount);
    event RewardsCalculated(address indexed user, uint256 focusDuration, uint256 rewards);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(IERC20 _token) {
        token = _token;
        owner = msg.sender;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than zero");
        users[msg.sender].deposit += amount;
        token.transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }

    function startFocus() external {
        require(users[msg.sender].deposit > 0, "Deposit required to start focus");
        require(users[msg.sender].focusStartTime == 0, "Focus already started");
        users[msg.sender].focusStartTime = block.timestamp;
        emit StartFocus(msg.sender, block.timestamp);
    }

    function stopFocus() external {
        require(users[msg.sender].focusStartTime > 0, "Focus not started");
        uint256 focusDuration = block.timestamp - users[msg.sender].focusStartTime;

        // Calculate dynamic rewards
        uint256 rewards = calculateDynamicRewards(msg.sender, focusDuration);

        // Update user's accumulated rewards and focus time
        users[msg.sender].accumulatedRewards += rewards;
        users[msg.sender].totalFocusTime += focusDuration;
        totalFocusTime += focusDuration;

        // Reset focus start time
        users[msg.sender].focusStartTime = 0;

        emit StopFocus(msg.sender, block.timestamp, focusDuration, rewards);
        emit RewardsCalculated(msg.sender, focusDuration, rewards);
    }

    function claimRewards() external {
        uint256 rewards = users[msg.sender].accumulatedRewards;
        require(rewards > 0, "No rewards to claim");

        // Reset user's rewards and update total claimed
        users[msg.sender].accumulatedRewards = 0;
        totalRewardsClaimed += rewards;

        // Transfer rewards to user
        token.transfer(msg.sender, rewards);
        emit ClaimRewards(msg.sender, rewards);
    }

    function applyPenalty(address userAddress) external onlyOwner {
        require(users[userAddress].focusStartTime > 0, "User is not focusing");

        uint256 penaltyAmount = users[userAddress].deposit / 2; // 50% penalty
        users[userAddress].deposit -= penaltyAmount;
        users[userAddress].focusStartTime = 0;

        // Optionally, transfer the penalty to the owner or keep it in the contract
        token.transfer(owner, penaltyAmount);

        emit Penalty(userAddress, penaltyAmount);
    }

    function calculateDynamicRewards(address user, uint256 focusDuration) internal view returns (uint256) {
        User memory currentUser = users[user];

        // Dynamic reward calculation based on focus time tiers and deposit amount
        uint256 baseReward = focusDuration * 1e18; // 1 token per second as base
        uint256 rewardMultiplier = 1;

        // Adjust multiplier based on deposit amount
        if (currentUser.deposit >= 1000 * 1e18) {
            rewardMultiplier = 2; // 2x rewards for high deposits
        } else if (currentUser.deposit >= 500 * 1e18) {
            rewardMultiplier = 1.5 ether; // 1.5x rewards
        }

        // Additional bonus for long focus sessions
        if (focusDuration > 3600) { // Over 1 hour focus
            rewardMultiplier += 1; // Extra bonus multiplier
        } else if (focusDuration > 1800) { // Over 30 minutes focus
            rewardMultiplier += 0.5 ether;
        }

        // Calculate final rewards with multiplier
        uint256 finalRewards = (baseReward * rewardMultiplier) / 1 ether;

        // Apply penalties for session breaks (adjusted dynamically)
        if (currentUser.focusStartTime > 0 && block.timestamp - currentUser.focusStartTime < focusDuration) {
            finalRewards = (finalRewards * 80) / 100; // Apply a 20% penalty if focus is broken
        }

        return finalRewards;
    }
}
