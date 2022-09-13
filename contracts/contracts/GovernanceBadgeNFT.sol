//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "hardhat/console.sol";

contract GovernanceBadgeERC1155 is ERC1155Upgradeable, OwnableUpgradeable, ERC1155HolderUpgradeable {

    string name;
    string symbol;

    uint8 public GOVERNANCE_NFT;
    uint8 public VALIDATOR_NFT;
    uint public minVotes;
    uint public stakingAmount;

    mapping(address => uint) public validationRequests; //address => stake mapping
    mapping(address => bool) public governors;
    mapping(address => mapping(address => bool)) public governorsVoted;
    mapping(address => uint) public validationVotes;


    function initialize(string memory _name, 
        string memory _symbol, 
        string calldata _uri) initializer public {
        __ERC1155_init(_uri);
        __Ownable_init();
        __ERC1155Holder_init();
        name = _name;
        symbol = _symbol;
        GOVERNANCE_NFT = 0;
        VALIDATOR_NFT = 1;
        stakingAmount = 5 ether;
        minVotes = 20;

        _mint(address(this), VALIDATOR_NFT, 100000, "");
        _mint(address(this), GOVERNANCE_NFT, 100, "");
        _setApprovalForAll(address(this), _msgSender(), true);
        safeTransferFrom(address(this), msg.sender, VALIDATOR_NFT, 1, "");
        safeTransferFrom(address(this), msg.sender, GOVERNANCE_NFT, 1, "");
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


    function removeGovernor(address governor) public onlyOwner {
        uint256 bal = balanceOf(governor, GOVERNANCE_NFT);
        require(bal!=0, "Has not NFT");
        _safeTransferFrom(governor, address(this), GOVERNANCE_NFT, bal, "");
    }

    function removeValidator(address validator) public onlyOwner {
        uint256 bal = balanceOf(validator, VALIDATOR_NFT);
        require(bal!=0, "Has not NFT");
        _safeTransferFrom(validator, address(this), VALIDATOR_NFT, bal, "");
    }

    function revokeVote(address validator) public{
        require(governorsVoted[validator][msg.sender],"Not voted");
        require(balanceOf(validator,VALIDATOR_NFT) > 0,"No use of Revoking");
        validationVotes[validator] = validationVotes[validator]-1;
    }

    function setGovernor(address governor) public onlyOwner {
        uint256 bal = balanceOf(governor,GOVERNANCE_NFT);
        require(bal==0, "Already has NFT");
        safeTransferFrom(address(this), governor, GOVERNANCE_NFT, 1, "");
        governors[governor]=true;
    }

    function setMinVotes(uint _votes) public onlyOwner{
        minVotes = _votes;
    }

    function setStakingAmount(uint _stakingAmount) public onlyOwner {
        stakingAmount = _stakingAmount;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155ReceiverUpgradeable, ERC1155Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function voteValidator(address validator) public{
        require(validationRequests[msg.sender]==stakingAmount, "You are not requested");
        require(balanceOf(msg.sender,GOVERNANCE_NFT) > 0,"You are not governor to vote");
        require(balanceOf(validator,VALIDATOR_NFT) == 0,"You are already Validator");
        require(!governorsVoted[validator][msg.sender],"Already voted");
        validationVotes[validator] = validationVotes[validator]+1;
        if(validationVotes[validator] >= minVotes){
            validationRequests[validator] = 0;
            safeTransferFrom(address(this), validator, VALIDATOR_NFT, 1, "");
        }
    }

}
