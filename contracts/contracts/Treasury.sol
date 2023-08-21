// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
contract Treasury is OwnableUpgradeable {

    event FundsSent(address to,uint amount);
    event VoteModuleContractSet(address voteModules);
    
    address voteModules;
    function initialize() initializer public {
        __Ownable_init();
    }

    function setVoteModulesContract(address _voteModules) public onlyOwner {
        voteModules = _voteModules;
        emit VoteModuleContractSet(_voteModules);
    }

    modifier onlyAllowedCaller() {
        require(msg.sender == voteModules || owner() == msg.sender, "Only allowed caller");
        _;
    }

    function sendFunds(address to,uint amount) public onlyAllowedCaller {
        payable(to).transfer(amount);
        emit FundsSent(to,amount);
    }

    function sendERC20(address token,address to,uint amount) public onlyOwner{
        IERC20Upgradeable(token).transfer(to, amount);
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    receive() external payable {}
    fallback() external payable{}
}