// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.12;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract VoteToken is ERC20, Ownable {

//     address public voteModules;
//     event VoteModuleContractSet(address voteModules);

//     address public VoteModule;
//     constructor() Ownable() ERC20("Vote Token", "VT") {}

//     modifier onlyAllowedCaller {
//         require(msg.sender == VoteModule || msg.sender == owner(), "Only allowed caller");
//         _;
//     }

//     function setVoteModule(address _voteModule) public onlyOwner {
//         VoteModule = _voteModule;
//         emit VoteModuleContractSet(_voteModule);
//     }

//     function mint(address to, uint256 amount) public onlyAllowedCaller {
//         _mint(to, amount);
//     }

//     function burn(address from, uint256 amount) public onlyAllowedCaller {
//         _burn(from, amount);
//     }
// }
