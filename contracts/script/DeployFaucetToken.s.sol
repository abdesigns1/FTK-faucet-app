// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FaucetToken.sol";

contract DeployFaucetToken is Script {
    function run() external returns (FaucetToken token) {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");

        vm.startBroadcast();
        token = new FaucetToken(deployer);
        vm.stopBroadcast();

        console2.log("FaucetToken deployed at:", address(token));
        console2.log("Owner:", deployer);
        console2.log("Total supply:", token.totalSupply());
    }
}
