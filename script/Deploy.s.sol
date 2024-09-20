// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../src/FocusToken.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Specify the initial supply for the FocusToken
        uint256 initialSupply = 1000000 * 1e18; // 1 million tokens with 18 decimals
        new FocusToken(initialSupply);

        vm.stopBroadcast();
    }
}
