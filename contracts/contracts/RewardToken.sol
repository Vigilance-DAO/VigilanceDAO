// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract RewardToken is ERC20, Ownable {

    address public voteModules;
    event VoteModuleContractSet(address voteModules);

    constructor() Ownable() ERC20("Reward Token", "RT") {
    }
    

    function setVoteModulesContract(address _voteModules) public onlyOwner {
        voteModules = _voteModules;
        emit VoteModuleContractSet(_voteModules);
    }

    modifier onlyAllowedCaller() {
        require(msg.sender == voteModules, "Only allowed caller");
        _;
    }

    function asset() external pure returns (address) {
        return address(0);
    }

    function totalAssets() public view returns (uint256 totalManagedAssets){
        return address(this).balance;
    }


    function convertToShares(uint256 assets) public view returns (uint256 shares) {
        uint256 exchangeRate = totalSupply() / totalAssets();
        return assets * exchangeRate;
    }

    function convertToAssets(uint256 shares) public view returns (uint256 assets) {
        uint256 exchangeRate = totalAssets() / totalSupply();
        return shares * exchangeRate;
    }

    function mint(address account, uint256 shares) external onlyAllowedCaller {
        _mint(account, shares);
    }

    function withdraw(uint256 assets) external returns (uint256 sharesToBurn) {
        sharesToBurn = convertToShares(assets);
        require(balanceOf(msg.sender) >= sharesToBurn, "Insufficient balance");
        _burn(msg.sender, sharesToBurn);
        payable(msg.sender).transfer(assets);
        // return sharesToBurn;
    }

    function withdrawOnBehalf(uint256 assets, address receiver, address owner) external onlyAllowedCaller returns (uint256) {
        uint256 sharesToBurn = convertToShares(assets);
        require(balanceOf(owner) >= sharesToBurn, "Insufficient balance");
        _burn(owner, sharesToBurn);
        payable(receiver).transfer(assets);
        return sharesToBurn;
    }

    function redeem(uint256 shares) external returns (uint256 assets) {
        uint256 assetsToWithdraw = convertToAssets(shares);
        require(balanceOf(msg.sender) >= shares, "Insufficient balance");
        _burn(msg.sender, shares);
        payable(msg.sender).transfer(assetsToWithdraw);
        return assetsToWithdraw;
    }

    function redeemOnBehalf(uint256 shares, address receiver, address owner) external onlyAllowedCaller returns (uint256 assets) {
        uint256 assetsToWithdraw = convertToAssets(shares);
        require(balanceOf(owner) >= shares, "Insufficient balance");
        _burn(owner, shares);
        payable(receiver).transfer(assetsToWithdraw);
        return assetsToWithdraw;
    }
}

