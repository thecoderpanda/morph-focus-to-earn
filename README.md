# Focus to Earn DApp

Focus to Earn is a decentralized application (DApp) that rewards users for their focused work time. Users can deposit USDT, start a timer, and earn FTN tokens for each second of focused work.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Smart Contracts](#smart-contracts)
3. [Frontend](#frontend)
4. [Getting Started](#getting-started)
5. [Deployment](#deployment)

## Project Overview

The Focus-to-Earn DApp consists of:

- Smart contracts written in Solidity
- A frontend application built with Next.js and React
- Integration with the Morphl2 Helensky Testnet 

## Usage of the Application:

1. Connect your wallet to the Morphl2 Testnet
2. Approve and deposit 0.2 USDT
3. Start the timer when you begin focused work
4. Stop the timer when you're done
5. Claim your FTN token rewards

## Smart Contracts

### FocusToEarn.sol

The main contract that handles user deposits, timing, and reward distribution.

[FocusToEarn.sol](./src/FocusToEarn.sol)

### FocusToken.sol

The ERC20 token contract for the FTN (Focus Token) used as rewards.

[Token.sol](./src/FocusToken.sol)


## Frontend

The frontend is built using Next.js and React. 

[FocusToEarnDApp.tsx](./frontend/components/FocusToEarnDApp.tsx)

## Getting Started

To run the project locally:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The smart contracts are deployed using a Foundry script:


```1:31:script/DeployFocusToEarn.s.sol
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



```


To deploy the contracts:

1. Set up your environment variables (PRIVATE_KEY)
2. Run the deployment script:
   ```
   forge script script/DeployFocusToEarn.s.sol:DeployFocusToEarn --rpc-url <YOUR_RPC_URL> --broadcast --legacy
   ```


## Contract Addresses

- FocusToEarn: 0xa525EDf168BB9E9853513a53B328bca2D14295CF
- USDT Token: 0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98
- FTN Token: 0xfC94063D8aE51C5dacAc30015726cCb50DEC34D8

## Morphl2 Testnet Configuration


```348:358:frontend/components/FocusToEarnDApp.tsx
const morphl2Config = {
  chainId: '0x1f47', // 8007 in decimal
  chainName: 'Morphl2 Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://rpc-quicknode-holesky.morphl2.io'],
  blockExplorerUrls: ['https://explorer.morphl2.io']
}
```


For more information on using Next.js, refer to the [Next.js documentation](https://nextjs.org/docs).