// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../src/FocusToEarn.sol";

contract DeployFocusToEarn is Script {
    function run() external {
        // Fetch the deployer's private key from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Define the addresses of the deployed token contracts
        address usdtTokenAddress = 0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98; // Replace with the actual USDT token address
        address ftnTokenAddress = 0xfC94063D8aE51C5dacAc30015726cCb50DEC34D8; // FTN token address provided

        // Start the broadcast using the deployer's private key
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the FocusToEarn contract
        FocusToEarn focusToEarn = new FocusToEarn(usdtTokenAddress, ftnTokenAddress);

        // Stop the broadcast
        vm.stopBroadcast();

        // Log the deployed contract address
        console.log("FocusToEarn deployed at:", address(focusToEarn));
    }
}


