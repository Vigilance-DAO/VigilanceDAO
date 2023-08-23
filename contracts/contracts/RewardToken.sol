// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract RewardToken is ERC4626, Ownable {

    address public voteModule;
    event VoteModuleContractSet(address voteModules);
    constructor (address WETH, string memory name, string memory symbol) 
        ERC4626(IERC20(WETH)) 
        ERC20(name, symbol)  
        Ownable()
    {
    }

    modifier onlyAllowedCaller() {
        require(msg.sender == voteModule, "Only allowed caller");
        _;
    }

    function setVoteModulesContract(address _voteModule) public onlyOwner {
        voteModule = _voteModule;
        emit VoteModuleContractSet(_voteModule);
    }
}

