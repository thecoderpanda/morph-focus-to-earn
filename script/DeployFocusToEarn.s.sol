// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../src/FocusToEarn.sol";

contract DeployFocusToEarn is Script {
    function run() external {
        // Set the private key from the .env file
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start the broadcast using the deployer's private key
        vm.startBroadcast(deployerPrivateKey);

        // Define the address of the deployed DemoToken contract
        address tokenAddress = 0xfC94063D8aE51C5dacAc30015726cCb50DEC34D8; // Replace with your actual DemoToken contract address

        // Deploy the FocusToEarn contract
        FocusToEarn focusToEarn = new FocusToEarn(IERC20(tokenAddress));

        // Print the address of the deployed contract
        console.log("FocusToEarn deployed at:", address(focusToEarn));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
