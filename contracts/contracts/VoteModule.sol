//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "hardhat/console.sol";
import "./GovernanceBadgeNFT.sol";
import "./Treasury.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { IWETH } from "./interfaces/IWETH.sol";

contract VoteModule {
    event DomainReported(
        string indexed domain,
        address indexed reporter,
        bool isScam
    );

    event ValidationRequest(
        string indexed domain,
        address indexed requestor,
        bool isScam,
        string evidences,
        string comments
    );

    event ValidationVerdict(
        string indexed domain,
        address indexed validator,
        bool isApproved,
        string validatorComments
    );

    event VotesBought(address indexed buyer, uint256 n, uint256 totalCost);

    struct Vote {
        address voter;
        bool isScam;
    }

    enum Status {
        None,
        Pending,
        Approved,
        Rejected
    }

    struct DomainClaim {
        string domain;
        bool isScam;
        address requestor;
        string requestorComments;
        string requestorEvidences;
        Status status;
        address validator;
        string validatorComments;
        bool domainVerdictScamOrNot;
    }

    // constants
    uint256 votePrice; // cost for each vote
    uint256 validationFees; // manual validation fees
    uint256 rewardAmount; // correct manual validation report reward to rewarder

    // Required supporting contracts
    IERC4626 public rewardTokenContract;
    Treasury public treasuryContract;
    address public wethAddress;
    GovernanceBadgeNFT public governanceBadgeNFT; 

    // reporting & validation storage
    mapping(string => uint256) voteCount; // total reports on domain (unique per address)
    mapping(string => address[]) domainVoterArray; // array of voters for each domain
    mapping(string => mapping(address => Vote)) votes; // vote of each user for a domain
    mapping(string => DomainClaim) domainVerdict; // validation claims

    constructor(
        address _governanceBadgeNFT,
        uint256 _votePrice,
        uint256 _validationFees,
        address _rewardTokenAddress,
        uint256 _rewardAmount,
        address payable _treasuryContract,
        address _wethAddress
    ) {
        governanceBadgeNFT = GovernanceBadgeNFT(_governanceBadgeNFT);
        votePrice = _votePrice;
        validationFees = _validationFees;
        rewardTokenContract = IERC4626(_rewardTokenAddress);
        rewardAmount = _rewardAmount;
        treasuryContract = Treasury(_treasuryContract);
        wethAddress = _wethAddress;
    }

    function getVotePrice() public view returns (uint256) {
        return votePrice;
    }

    function getValidationFees() public view returns (uint256) {
        return validationFees;
    }

    function getRewardAmount() public view returns (uint256) {
        return rewardAmount;
    }

    function getVoteCount(string memory domain) public view returns (uint256) {
        return voteCount[domain];
    }

    function getVotesBalance(address user) public view returns (uint256) {
        uint256 bal = rewardTokenContract.balanceOf(user);
        console.log("bal: %s", bal);
        uint256 value = rewardTokenContract.previewRedeem(bal);
        console.log("value: %s, reward: %s", value, votePrice);
        return sqrt(value/votePrice);
    }

    // babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function buyVotes(uint256 n, address receiver) public {
        require(n != 0, "n should >= 1");
        console.log("transfering0: %s", n);
        uint256 totalCost = n * n * votePrice;
        console.log("transfering1: %s", totalCost);
        bool sent = IERC20(wethAddress).transferFrom(
            msg.sender,
            address(this),
            totalCost
        );
        console.log("transfering2");
        require(sent, "WETH transfer failed");
        _buyVotes(totalCost, n, receiver);
    }

    // internal
    function _buyVotes(uint256 totalCost, uint256 n, address receiver) internal {
        IERC20(wethAddress).approve(
            address(rewardTokenContract),
            totalCost
        );
        console.log("transfering3");
        rewardTokenContract.deposit(totalCost, receiver);
        emit VotesBought(msg.sender, n, totalCost);
    }

    // withdraw the votes and reward tokens
    // here the reward tokens will be burnt, 
    // so user in advance will have to approve the vote module contract 
    // to spend the reward tokens
    function withdraw() external {
        // Get vote balance of user
        uint256 voterBalance = rewardTokenContract.balanceOf(msg.sender);
        // burn votes and withdraw balance + rewards to user
        rewardTokenContract.transferFrom(
            msg.sender,
            address(this),
            voterBalance
        );
        rewardTokenContract.redeem(voterBalance, msg.sender, address(this));
        
        
        // no need to loop and remove votes. as their weight will
        // be zero anyways. 
    }

    function withdrawETH() external {
        // Get vote balance of user
        uint256 voterBalance = rewardTokenContract.balanceOf(msg.sender);
        require(voterBalance > 0, "no balance");
        // burn votes and withdraw balance + rewards to user
        rewardTokenContract.transferFrom(
            msg.sender,
            address(this),
            voterBalance
        );
        uint256 amount = rewardTokenContract.redeem(voterBalance, address(this), address(this));
        
        IWETH(wethAddress).withdraw(amount);
        bool sent = payable(msg.sender).send(amount);
        require(sent, "ETH transfer failed");
    }

    // returns in basis points
    function getStrength(string calldata domain) public view returns (uint256 strength, uint256 totalVotes) {
        uint256 totalReports = voteCount[domain];
        if (totalReports == 0) {
            return (0, 0);
        }

        uint256 totalStrength;
        uint256 _totalVotes = 0;
        for (uint256 i = 0; i < totalReports; i++) {
            address voter = domainVoterArray[domain][i];
            Vote memory currentVote = votes[domain][voter];
            uint256 voteWeight = currentVote.isScam ? 0 : 1;

            // Consider the balance of the voter's votes in the voteToken contract
            uint256 voterBalance = getVotesBalance(currentVote.voter);
            totalStrength += uint256(voteWeight) * voterBalance;
            _totalVotes += voterBalance;
        }    
        return ((totalStrength * 10000) / _totalVotes, _totalVotes);
    }

    function _reportDomain(string memory domain, bool isLegit) internal {
        // @todo should voting be reset after validation and allow fresh voting again?
        // Decision: yes

        // @todo report reward?
        uint256 totalVoters = voteCount[domain];
        require(totalVoters < 50, "Max 50 votes per domain");

        Vote memory existingVote = votes[domain][msg.sender];
        // if new voter
        if (existingVote.voter == address(0)) {
            domainVoterArray[domain].push(msg.sender);
            voteCount[domain]++;
        }

        votes[domain][msg.sender] = Vote(msg.sender, isLegit);

        emit DomainReported(domain, msg.sender, isLegit);
    }

    function reportDomain(string memory domain, bool isLegit) external {
        _reportDomain(domain, isLegit);
    }

    // Preapproval of (validation fees) required for this function
    function requestValidation(
        string calldata domain,
        bool isScam,
        string[] calldata evidenceHashes,
        string calldata comments
    ) external payable {
        console.log(111);
        (uint256 strength,) = getStrength(domain);
        console.log(122, isScam, strength);
        require(
            (isScam && strength >= 5100) || (!isScam && strength < 5100),
            "Validation request not allowed"
        );

        // avoid duplicate request when one is already pending and in same direction
        // supports max one claim at a time on domain
        DomainClaim memory existingRequest = domainVerdict[domain];
        require(existingRequest.status != Status.Pending, "Pending claim exists");

        console.log(133);
        
        require(msg.value == validationFees, "Incorrect validation fee");

        console.log(144);

        string memory evidenceHashesSerialised = "";
        uint256 nEvidences = evidenceHashes.length;
        require(nEvidences > 0, "Require atleast one evidence");
        console.log(166);

        for (uint256 i = 0; i < nEvidences; ++i) {
            evidenceHashesSerialised = string.concat(
                evidenceHashesSerialised,
                evidenceHashes[i]
            );
            if (i < (nEvidences - 1)) {
                evidenceHashesSerialised = string.concat(
                    evidenceHashesSerialised,
                    ","
                );
            }
        }
        console.log(177);

        domainVerdict[domain] = DomainClaim(
            domain, // domain
            isScam, // isScam -> true if the requestor thinks domain is a scam
            msg.sender, // requestor
            comments, // requestorComments
            evidenceHashesSerialised, // requestorEvidences
            Status.Pending, // status
            address(0),
            "",
            false
        );
        console.log(188);

        emit ValidationRequest(
            domain,
            msg.sender,
            isScam,
            evidenceHashesSerialised,
            comments
        );
    }

    function verifyValidationRequest(
        string memory domain,
        bool isApproved,
        string calldata _validatorComments
    ) external {
        console.log(1);
        GovernanceBadgeNFT _gov = GovernanceBadgeNFT(governanceBadgeNFT);
        uint256 bal = _gov.balanceOf(msg.sender, _gov.VALIDATOR_NFT());
        console.log(12);
        require(bal > 0, "Only selected validators can validate");
        console.log(13);
        DomainClaim storage claim = domainVerdict[domain];
        console.log(14);
        require(claim.requestor != address(0), "No pending request");
        console.log(2);

        claim.validator = msg.sender;
        bool domainVerdictScamOrNot = ( claim.isScam && isApproved ) || ( !claim.isScam && !isApproved );
        if (isApproved) {
            console.log("approving");
            claim.status = Status.Approved;
            claim.domainVerdictScamOrNot = domainVerdictScamOrNot;
            claim.validatorComments = _validatorComments;
            
            // return fees
            bool sent = payable(claim.requestor).send(validationFees);
            require(sent, "Failed to return fees");
            
            // send reward from treasury
            treasuryContract.sendERC20(wethAddress, claim.requestor, rewardAmount);
        } else {
            claim.status = Status.Rejected;
            uint256 bal2 = address(this).balance;
            console.log("rejecting, %s, %s, %s", address(treasuryContract), validationFees, bal2);
            bool sent = treasuryContract.receiveETH{value: validationFees}();
            // bool sent = payable(treasuryContract).send(validationFees);
            console.log("funds sent: %s", sent);
            require(sent, "Failed to move fees to treasury");
            console.log("funds sent2");
        }

        console.log(3);

        // cost = n*n*price for n votes
        // expense? recover in terms of votes slashed, let the expense be e
        // x*x*price = e
        // x = (e/price)^0.5

        // Burn the votes of the voters who voted against the verdict
        // uint256 totalVotesToSlash = sqrt(validationFees / votePrice);
        // uint256 totalAgainstVerdictVotes = 0;
        // console.log(4);

        // @todo penalisation can do later
        // uint256 totalVoters = voteCount[domain];
        // for (uint i = 0; i < totalVoters; i++) {
        //     Vote memory currentVote = votes[domain][i];
        //     if (currentVote.isScam != domainVerdictScamOrNot) {
        //         totalAgainstVerdictVotes += getVoteCount(currentVote.voter);
        //     }
        // }

        // Burn the votes of the voters who voted against the verdict
        // for (uint i = 0; i < totalVoters; i++) {
        //     Vote memory currentVote = votes[domain][i];
        //     if (currentVote.isScam != domainVerdictScamOrNot) {
        //         uint256 voterBalance = getVoteCount(currentVote.voter);
        //         uint256 votesToBurn = (voterBalance * totalVotesToSlash) /
        //             totalAgainstVerdictVotes;
        //         // @todo need an option to burn without approval
        //         // rewardTokenContract.burn(currentVote.voter, votesToBurn);
        //     }
        // }
        console.log(5);

        // pay validator fees
        // @note: Will be activated later
        // bool sent = payable(msg.sender).send(validationFees);
        // require(sent, "Failed to send fees");

        // reset domain votes
        uint256 count = voteCount[domain];
        for (uint i = 0; i < count; i++) {
            address voter = domainVoterArray[domain][i];
            delete votes[domain][voter];
        }
        voteCount[domain] = 0;
        delete domainVoterArray[domain];

        emit ValidationVerdict(
            domain,
            msg.sender,
            isApproved,
            _validatorComments
        );
        console.log(6);
    }

    function buyVotesWithEth(uint256 n, address receiver) public payable {
        require(n != 0, "n should >= 1");
        uint256 totalCost = n * n * votePrice;
        IWETH(wethAddress).deposit{value: totalCost}();
        _buyVotes(totalCost, n, receiver);
    }

    function buyVotesWithEThAndVote(uint256 n, string memory domain, bool isLegit) public payable {
        buyVotesWithEth(n, msg.sender);
        _reportDomain(domain, isLegit);
    }

    function getDomainVerdict(
        string memory domain
    )
        external
        view
        returns (
            string memory,
            bool,
            bool,
            address,
            Status,
            string memory,
            address
        )
    {
        DomainClaim memory claim = domainVerdict[domain];
        return (
            claim.domain,
            claim.isScam,
            claim.domainVerdictScamOrNot,
            claim.requestor,
            claim.status,
            claim.validatorComments,
            claim.validator
        );
    }
}
