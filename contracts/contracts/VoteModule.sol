//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "hardhat/console.sol";
import "./GovernanceBadgeNFT.sol";
import "./VoteToken.sol";
import "./Treasury.sol";
import "./RewardToken.sol";

contract VoteModule {
    event DomainReported(
        string indexed domain,
        address indexed reporter,
        bool isScam,
        string evidences
    );

    event ValidationRequest(
        string indexed domain,
        address indexed requestor,
        bool isScam
    );

    event ValidationVerdict(
        string indexed domain,
        address indexed validator,
        bool isApproved,
        string validatorComments
    );

    event VotesBought(
        address indexed buyer,
        uint256 n,
        uint256 totalCost
    );

    struct Vote {
        address voter;
        bool isScam;
        string comments;
        string evidences;
    }

    struct DomainClaim {
        string domain;
        bool isScam;
        bool domainVerdictScamOrNot;
        address requestor;
        string status;
        string validatorComments;
        address validator;
    }

    uint256 votePrice;
    uint256 validationFees;
    uint256 rewardAmount;

    VoteToken public voteTokenContract;
    RewardToken public rewardTokenContract;
    Treasury public treasuryContract;
    // mapping(string => mapping(address => bool)) isDomainVoted;   
    mapping(address => int) noOfDomainsVoted;

    mapping(string => uint256) voteCount;
    mapping(string => mapping(uint256 => Vote)) votes;

    mapping(string => DomainClaim) domainVerdict;
    GovernanceBadgeNFT public governanceBadgeNFT;


    constructor(
        address _governanceBadgeNFT,
        address _voteTokenAddress,
        uint256 _votePrice,
        uint256 _validationFees,
        address _rewardTokenAddress,
        uint256 _rewardAmount,
        address payable _treasuryContract
    ) {
        governanceBadgeNFT = GovernanceBadgeNFT(_governanceBadgeNFT);
        voteTokenContract = VoteToken(_voteTokenAddress);
        votePrice = _votePrice;
        validationFees = _validationFees;
        rewardTokenContract = RewardToken(_rewardTokenAddress);
        rewardAmount = _rewardAmount;
        treasuryContract = Treasury(_treasuryContract); 
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

    function buyVotes(uint256 n) public payable {
        uint256 totalCost = n * n * votePrice;
        require(msg.value >= totalCost, "Insufficient funds");
        payable(treasuryContract).transfer(msg.value);
        voteTokenContract.mint(msg.sender, n);
        emit VotesBought(msg.sender, n, totalCost);
    }

    function withdraw() external {
        uint256 amount = voteTokenContract.balanceOf(msg.sender);
        noOfDomainsVoted[msg.sender] = 0;
        voteTokenContract.burn(msg.sender, amount);
        
        uint256 rewardBalance = rewardTokenContract.balanceOf(msg.sender);
        rewardTokenContract.redeemOnBehalf(rewardBalance, msg.sender, msg.sender);
        treasuryContract.sendFunds(msg.sender, amount);
    }

    function getStrength(string calldata domain) public view returns (uint256) {
        uint256 totalVotes = voteCount[domain];
        if (totalVotes == 0) {
            return 0;
        }

        uint256 totalStrength;
        for (uint256 i = 0; i < totalVotes; i++) {
            Vote memory currentVote = votes[domain][i];
            uint256 voteWeight = currentVote.isScam ? 0 : 1;

            // Consider the balance of the voter's votes in the voteToken contract
            uint256 voterBalance = voteTokenContract.balanceOf(
                currentVote.voter
            );
            totalStrength += uint256(voteWeight) * voterBalance;
            totalVotes += voterBalance;
        }
        return (totalStrength * 100) / totalVotes;
    }

    function reportDomain(
        string memory domain,
        bool isLegit,
        string[] calldata evidenceHashes,
        string calldata comments
    ) external {
        // if the domain verdict is present fail safely
        require(
            domainVerdict[domain].validator == address(0),
            "Domain already validated"
        );

        // require(isDomainVoted[domain][msg.sender] == false, "Domain already voted");

        require(isLegit != domainVerdict[domain].isScam, "Conflicting report");

        string memory evidenceHashesSerialised = "";
        uint256 nEvidences = evidenceHashes.length;
        require(nEvidences > 0, "Require atleast one evidence");

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

        if(noOfDomainsVoted[msg.sender] == 0) {
            rewardTokenContract.mint(msg.sender, rewardAmount);
        }

        // isDomainVoted[domain][msg.sender] = true;
        noOfDomainsVoted[msg.sender]++;
        voteCount[domain]++;
        votes[domain][voteCount[domain] - 1] = Vote(
            msg.sender,
            isLegit,
            comments,
            evidenceHashesSerialised
        );

        emit DomainReported(
            domain,
            msg.sender,
            isLegit,
            evidenceHashesSerialised
        );
    }

    function requestValidation(
        string calldata domain,
        bool isScam
    ) external payable {
        // require(false, "ab to hoga");
        uint256 strength = getStrength(domain);
        require(
            (isScam && strength >= 51) || (!isScam && strength < 51),
            "Validation request not allowed"
        );

        require(msg.value >= validationFees, "Insufficient funds");

        if (msg.value > validationFees) {
            payable(msg.sender).transfer(msg.value - validationFees);
        }

        domainVerdict[domain] = DomainClaim(
            domain,
            isScam,
            false,
            msg.sender,
            "Pending",
            "",
            address(0)
        );

        emit ValidationRequest(domain, msg.sender, isScam);
    }

    function verifyValidationRequest(
        string memory domain,
        bool isApproved,
        string calldata _validatorComments
    ) external {
        GovernanceBadgeNFT _gov = GovernanceBadgeNFT(governanceBadgeNFT);
        uint256 bal = _gov.balanceOf(msg.sender, _gov.VALIDATOR_NFT());
        require(bal > 0, "Only selected validators can validate");
        DomainClaim storage claim = domainVerdict[domain];
        require(claim.requestor != address(0), "No pending request");

        claim.validator = msg.sender;
        bool domainVerdictScamOrNot = (claim.isScam && isApproved) ||
            (!claim.isScam && !isApproved);
        if (isApproved) {
            claim.status = "Approved";
            claim.domainVerdictScamOrNot = domainVerdictScamOrNot;
            claim.validatorComments = _validatorComments;
            rewardTokenContract.mint(claim.requestor, rewardAmount);
        } else {
            claim.status = "Rejected";
        }

        uint256 totalVotesToSlash = validationFees / votePrice;
        uint256 totalAgainstVerdictVotes = 0;

        uint256 totalVoters = voteCount[domain];
        for (uint i = 0; i < totalVoters; i++) {
            Vote memory currentVote = votes[domain][i];
            if (currentVote.isScam != domainVerdictScamOrNot) {
                totalAgainstVerdictVotes += voteTokenContract.balanceOf(currentVote.voter);
            }
        }

        
        // Burn the votes of the voters who voted against the verdict
        for (uint i = 0; i < totalVoters; i++) {
            Vote memory currentVote = votes[domain][i];
            if (currentVote.isScam != domainVerdictScamOrNot) {
                uint256 voterBalance = voteTokenContract.balanceOf(currentVote.voter);
                uint256 votesToBurn = (voterBalance * totalVotesToSlash) / totalAgainstVerdictVotes;
                voteTokenContract.burn(currentVote.voter, votesToBurn);
            }
        }

        emit ValidationVerdict(
            domain, 
            msg.sender, 
            isApproved, 
            _validatorComments
        );

    }

    function getDomainVerdict(string memory domain)
        external
        view
        returns (
            string memory,
            bool,
            bool,
            address,
            string memory,
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
