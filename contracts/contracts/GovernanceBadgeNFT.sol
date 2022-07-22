pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "hardhat/console.sol";

contract GovernanceBadgeERC1155 is ERC1155Upgradeable, OwnableUpgradeable, ERC1155HolderUpgradeable {

    string name;
    string symbol;

    uint8 public VALIDATOR_NFT;

    uint public stakingAmount;

    // struct ValidationRequest {
    //     address requester;
    //     uint stake;
    // }

    mapping(address => uint) public validationRequests; //address => stake mapping

    function initialize(string memory _name, 
        string memory _symbol, 
        string calldata _uri) initializer public {
        __ERC1155_init(_uri);
        __Ownable_init();
        __ERC1155Holder_init();
        name = _name;
        symbol = _symbol;
        VALIDATOR_NFT = 0;
        stakingAmount = 5 ether;

        _mint(address(this), VALIDATOR_NFT, 100000, "");
        _setApprovalForAll(address(this), _msgSender(), true);
        safeTransferFrom(address(this), msg.sender, VALIDATOR_NFT, 1, "");
    }

    function requestValidatorRole() public payable returns(bool) {
        require(msg.value == stakingAmount, "Need required staking amount");
        require(validationRequests[msg.sender]==0, "Already requested");
        validationRequests[msg.sender] = stakingAmount;
        console.log("request: %s", msg.sender);
        console.log("request#2: %s", validationRequests[msg.sender]);
        return true;
    }

    function revokeValidationRequest() public {
        require(validationRequests[msg.sender] > 0, "no request present");
        uint toTransfer = validationRequests[msg.sender];
        validationRequests[msg.sender] = 0;
        payable(msg.sender).transfer(toTransfer);
    }

    function setValidator(address validator) public onlyOwner {
        uint256 bal = balanceOf(validator, VALIDATOR_NFT);
        require(bal==0, "Already has NFT");
        require(validationRequests[validator] == stakingAmount, "Not exact stake for validator");
        validationRequests[validator] = 0;
        safeTransferFrom(address(this), validator, VALIDATOR_NFT, 1, "");
    }

    function removeValidator(address validator) public onlyOwner {
        uint256 bal = balanceOf(validator, VALIDATOR_NFT);
        require(bal!=0, "Has not NFT");
        _safeTransferFrom(validator, address(this), VALIDATOR_NFT, bal, "");
    }

    function setStakingAmount(uint _stakingAmount) public onlyOwner {
        stakingAmount = _stakingAmount;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155ReceiverUpgradeable, ERC1155Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}