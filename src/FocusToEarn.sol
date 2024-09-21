// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Import the SafeERC20 library and IERC20 interface from OpenZeppelin
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.0/contracts/token/ERC20/utils/SafeERC20.sol";

contract FocusToEarn {
    using SafeERC20 for IERC20;

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

    uint256 public constant USDT_DECIMALS = 18;
    uint256 public constant FTN_DECIMALS = 18;

    uint256 public constant DEPOSIT_AMOUNT = 200_000; // 0.2 USDT * 1e6

    uint256 public constant REWARD_RATE_PER_SECOND = 10 * (10 ** FTN_DECIMALS); // 10 FTN tokens per second

    event Deposit(address indexed user, uint256 amount);
    event TimerStarted(address indexed user, uint256 startTime);
    event TimerStopped(address indexed user, uint256 focusTime, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);

    error AlreadyDeposited();
    error DepositRequired();
    error TimerAlreadyStarted();
    error TimerNotStarted();
    error NoRewardsToClaim();

    constructor(address _usdtToken, address _ftnToken) {
        usdtToken = IERC20(_usdtToken);
        ftnToken = IERC20(_ftnToken);
    }

    function deposit() external {
        UserInfo storage user = userInfo[msg.sender];
        if (user.hasDeposited) revert AlreadyDeposited();

        // Use SafeERC20 for token transfer
        usdtToken.safeTransferFrom(msg.sender, address(this), DEPOSIT_AMOUNT);

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
        uint256 rewards = calculateRewards(focusTime);
        user.accumulatedRewards += rewards;
        user.isTiming = false;

        emit TimerStopped(msg.sender, focusTime, rewards);
    }

    function calculateRewards(uint256 _focusTime)
        internal
        pure
        returns (uint256)
    {
        uint256 rewards = _focusTime * REWARD_RATE_PER_SECOND;
        return rewards;
    }

    function claimRewards() external {
        UserInfo storage user = userInfo[msg.sender];
        uint256 rewardsToClaim = user.accumulatedRewards;

        if (rewardsToClaim == 0) revert NoRewardsToClaim();

        uint256 contractBalance = ftnToken.balanceOf(address(this));
        if (contractBalance < rewardsToClaim) revert("Insufficient contract FTN balance");

        user.accumulatedRewards = 0;
        totalRewardsClaimed += rewardsToClaim;

        ftnToken.safeTransfer(msg.sender, rewardsToClaim);

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

    // function to check the contract's FTN token balance
    function getContractFTNBalance() external view returns (uint256) {
        return ftnToken.balanceOf(address(this));
    }
}
