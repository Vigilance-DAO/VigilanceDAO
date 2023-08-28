// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@solidstate/contracts/token/ERC4626/SolidStateERC4626.sol";
import "@solidstate/contracts/access/ownable/Ownable.sol";
import "@solidstate/contracts/access/ownable/OwnableStorage.sol";
import "@solidstate/contracts/interfaces/IERC4626.sol";
import "@solidstate/contracts/token/ERC4626/base/ERC4626BaseStorage.sol";
import "@solidstate/contracts/token/ERC4626/base/ERC4626Base.sol";
import "@solidstate/contracts/token/ERC20/metadata/ERC20MetadataStorage.sol";
import "@solidstate/contracts/security/initializable/Initializable.sol";

contract RewardToken is SolidStateERC4626, Ownable, Initializable {

    event VoteModuleContractSet(address voteModules);

    address public voteModule;
    uint16 public APR; // 10% == 1000 bips
    uint256 ONE_YEAR_SECONDS;
    uint256 public startTime;

    function initialize(address WETH, string memory name, string memory symbol) 
    initializer public
    {
        ERC4626BaseStorage.layout().asset = WETH;
        ERC20MetadataStorage.layout().name = name;
        ERC20MetadataStorage.layout().symbol = symbol;
        ERC20MetadataStorage.layout().decimals = 18;
        OwnableStorage.layout().owner = msg.sender;
        startTime = block.timestamp;
        APR = 1000;
        ONE_YEAR_SECONDS = 86400 * 365;
    }

    modifier onlyAllowedCaller() {
        require(msg.sender == voteModule, "Only allowed caller");
        _;
    }

    function setVoteModulesContract(address _voteModule) public onlyOwner {
        voteModule = _voteModule;
        emit VoteModuleContractSet(_voteModule);
    }


    function _totalAssets() internal view override returns (uint256) {
        uint256 totalSupply = _totalSupply();
        uint256 nowTime = block.timestamp;
        uint256 diffTime = nowTime - startTime;
        return totalSupply * (1 + (APR * diffTime) / (ONE_YEAR_SECONDS * 10000));
    }

    function _deposit(
        uint256 assetAmount,
        address receiver
    ) internal onlyAllowedCaller override returns (uint256 shareAmount) {
        shareAmount = super._deposit(assetAmount, receiver);
    }

    function _mint(
        uint256 shareAmount,
        address receiver
    ) internal onlyAllowedCaller override returns (uint256 assetAmount) {
        assetAmount = super._mint(shareAmount, receiver);
    }

    function _withdraw(
        uint256 assetAmount,
        address receiver,
        address owner
    ) internal onlyAllowedCaller override returns (uint256 shareAmount) {
        shareAmount = super._withdraw(assetAmount, receiver, owner);
    }

    function _redeem(
        uint256 shareAmount,
        address receiver,
        address owner
    ) internal onlyAllowedCaller override returns (uint256 assetAmount) {
        assetAmount = super._redeem(shareAmount, receiver, owner);
    }

    // balance shows the balance in underlying asset
    // by default
    // function _balanceOf(
    //     address account
    // ) internal view virtual returns (uint256) {
    //     uint256 initialBal = ERC20BaseStorage.layout().balances[account];
    //     return _previewRedeem(initialBal);
    // }

}

