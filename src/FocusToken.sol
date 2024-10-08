// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FocusToEarnToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("FocusToken", "FTNS") {
        _mint(msg.sender, initialSupply);
    }
}
