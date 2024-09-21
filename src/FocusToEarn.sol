// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract FocusToEarn {
    IERC20 public immutable usdtToken;
    IERC20 public immutable ftnToken;

    uint256 public totalRewardsClaimed;

    struct UserInfo {
        bool hasDeposited;
        uint256 totalFocusTime;
        uint256 accumulatedRewards;
        uint256 lastStartTime;
        bool isTiming;
    }

    mapping(address => UserInfo) public userInfo;

    uint256 public constant USDT_DECIMALS = 6;
    uint256 public constant FTN_DECIMALS = 18;

    uint256 public constant DEPOSIT_AMOUNT = 200_000; // 0.2 USDT * 1e6

    event Deposit(address indexed user, uint256 amount);
    event TimerStarted(address indexed user, uint256 startTime);
    event TimerStopped(address indexed user, uint256 focusTime, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);

    error AlreadyDeposited();
    error DepositRequired();
    error TimerAlreadyStarted();
    error TimerNotStarted();
    error InsufficientRewards();

    constructor(address _usdtToken, address _ftnToken) {
        usdtToken = IERC20(_usdtToken);
        ftnToken = IERC20(_ftnToken);
    }

    function deposit() external {
        UserInfo storage user = userInfo[msg.sender];
        if (user.hasDeposited) revert AlreadyDeposited();

        bool success = usdtToken.transferFrom(msg.sender, address(this), DEPOSIT_AMOUNT);
        require(success, "USDT transfer failed");

        user.hasDeposited = true;

        emit Deposit(msg.sender, DEPOSIT_AMOUNT);
    }

    function startTimer() external {
        UserInfo storage user = userInfo[msg.sender];
        if (!user.hasDeposited) revert DepositRequired();
        if (user.isTiming) revert TimerAlreadyStarted();

        user.lastStartTime = block.timestamp;
        user.isTiming = true;

        emit TimerStarted(msg.sender, block.timestamp);
    }

    function stopTimer() external {
        UserInfo storage user = userInfo[msg.sender];
        if (!user.isTiming) revert TimerNotStarted();

        uint256 focusTime = block.timestamp - user.lastStartTime;
        user.totalFocusTime += focusTime;
        uint256 rewards = calculateRewards(msg.sender, focusTime);
        user.accumulatedRewards += rewards;
        user.isTiming = false;

        emit TimerStopped(msg.sender, focusTime, rewards);
    }

    function calculateRewards(address _user, uint256 _focusTime)
        internal
        view
        returns (uint256)
    {
        uint256 previousFocusTime = userInfo[_user].totalFocusTime;
        uint256 totalFocusTime = previousFocusTime + _focusTime;

        uint256 rewards = 0;
        uint256 remainingFocusTime = _focusTime;

        // Tier 1: <1 hour
        if (previousFocusTime < 1 hours) {
            uint256 tierLimit = 1 hours - previousFocusTime;
            uint256 timeInTier = remainingFocusTime < tierLimit
                ? remainingFocusTime
                : tierLimit;
            rewards += timeInTier * (1e16); // 0.01 FTN per second
            remainingFocusTime -= timeInTier;
            previousFocusTime += timeInTier;
        }

        // Tier 2: 1 - 2 hours
        if (
            remainingFocusTime > 0 &&
            previousFocusTime >= 1 hours &&
            previousFocusTime < 2 hours
        ) {
            uint256 tierLimit = 2 hours - previousFocusTime;
            uint256 timeInTier = remainingFocusTime < tierLimit
                ? remainingFocusTime
                : tierLimit;
            rewards += timeInTier * (2e16); // 0.02 FTN per second
            remainingFocusTime -= timeInTier;
            previousFocusTime += timeInTier;
        }

        // Tier 3: 2 - 5 hours
        if (
            remainingFocusTime > 0 &&
            previousFocusTime >= 2 hours &&
            previousFocusTime < 5 hours
        ) {
            uint256 tierLimit = 5 hours - previousFocusTime;
            uint256 timeInTier = remainingFocusTime < tierLimit
                ? remainingFocusTime
                : tierLimit;
            rewards += timeInTier * (3e16); // 0.03 FTN per second
            remainingFocusTime -= timeInTier;
            previousFocusTime += timeInTier;
        }

        // Tier 4: >5 hours
        if (remainingFocusTime > 0 && previousFocusTime >= 5 hours) {
            uint256 timeInTier = remainingFocusTime;
            rewards += timeInTier * (5e16); // 0.05 FTN per second
        }

        return rewards;
    }

    function claimRewards() external {
        UserInfo storage user = userInfo[msg.sender];
        if (user.accumulatedRewards < 1e18) revert InsufficientRewards();

        uint256 rewardsToClaim = user.accumulatedRewards;
        user.accumulatedRewards = 0;
        totalRewardsClaimed += rewardsToClaim;

        bool success = ftnToken.transfer(msg.sender, rewardsToClaim);
        require(success, "FTN transfer failed");

        emit RewardsClaimed(msg.sender, rewardsToClaim);
    }

    function getUserInfo(address _user)
        external
        view
        returns (
            bool hasDeposited,
            uint256 totalFocusTime,
            uint256 accumulatedRewards,
            bool isTiming
        )
    {
        UserInfo storage user = userInfo[_user];
        hasDeposited = user.hasDeposited;
        totalFocusTime = user.totalFocusTime;
        accumulatedRewards = user.accumulatedRewards;
        isTiming = user.isTiming;
    }
}
