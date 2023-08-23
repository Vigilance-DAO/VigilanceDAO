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

    uint256 votePrice;
    uint256 validationFees;
    uint256 rewardAmount;

    VoteToken public voteTokenContract;
    RewardToken public rewardTokenContract;
    Treasury public treasuryContract;
    address public wethAddress;
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
        address payable _treasuryContract,
        address _wethAddress
    ) {
        governanceBadgeNFT = GovernanceBadgeNFT(_governanceBadgeNFT);
        voteTokenContract = VoteToken(_voteTokenAddress);
        votePrice = _votePrice;
        validationFees = _validationFees;
        rewardTokenContract = RewardToken(_rewardTokenAddress);
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

    function buyVotes(uint256 n) public {
        uint256 totalCost = n * n * votePrice;
        bool sent = IERC20(wethAddress).transferFrom(
            msg.sender,
            address(treasuryContract),
            totalCost
        );
        require(sent, "WETH transfer failed");
        voteTokenContract.mint(msg.sender, n);
        emit VotesBought(msg.sender, n, totalCost);
    }


    // withdraw the votes and reward tokens
    // here the reward tokens will be burnt, 
    // so user in advance will have to approve the vote module contract 
    // to spend the reward tokens
    function withdraw() external {
        // Get vote balance of user
        uint256 voterBalance = voteTokenContract.balanceOf(msg.sender);

        // Reset variables
        noOfDomainsVoted[msg.sender] = 0;

        // Burn the votes
        voteTokenContract.burn(msg.sender, voterBalance);

        // Redeem reward tokens of the user on his behalf
        uint256 rewardBalance = rewardTokenContract.balanceOf(msg.sender);
        rewardTokenContract.redeem(
            rewardBalance,
            msg.sender,
            msg.sender
        );

        // Send the equivalent funds from the treasury to the user
        uint256 amount = voterBalance * voterBalance * votePrice;
        treasuryContract.sendERC20(wethAddress, msg.sender, amount);
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

    function reportDomain(string memory domain, bool isLegit) external {
        // if the domain verdict is present fail safely
        require(
            domainVerdict[domain].validator == address(0),
            "Domain already validated"
        );

        // Mint reward token if the user is reporting for the first time
        // 1. get the amount from the treasury 
        //    since we cant simply mint as it would devalue previous reward token share holders
        // 2. mint the reward token to the user, after getting the funds from treasury
        if (noOfDomainsVoted[msg.sender] == 0) {
            uint256 wethAmount = rewardTokenContract.previewMint(rewardAmount);
            treasuryContract.sendERC20(wethAddress, address(this), wethAmount);
            IERC20(wethAddress).approve(address(rewardTokenContract), wethAmount);
            rewardTokenContract.mint(rewardAmount, msg.sender);
        }

        noOfDomainsVoted[msg.sender]++;
        voteCount[domain]++;
        votes[domain][voteCount[domain] - 1] = Vote(msg.sender, isLegit);

        emit DomainReported(domain, msg.sender, isLegit);
    }

    // Preapproval of (validation fees) required for this function
    function requestValidation(
        string calldata domain,
        bool isScam,
        string[] calldata evidenceHashes,
        string calldata comments
    ) external {
        uint256 strength = getStrength(domain);
        require(
            (isScam && strength >= 51) || (!isScam && strength < 51),
            "Validation request not allowed"
        );

        bool sent = IERC20(wethAddress).transferFrom(
            msg.sender,
            address(this),
            validationFees
        );
        require(sent, "Transfer Failed");

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
        GovernanceBadgeNFT _gov = GovernanceBadgeNFT(governanceBadgeNFT);
        uint256 bal = _gov.balanceOf(msg.sender, _gov.VALIDATOR_NFT());
        require(bal > 0, "Only selected validators can validate");
        DomainClaim storage claim = domainVerdict[domain];
        require(claim.requestor != address(0), "No pending request");

        claim.validator = msg.sender;
        bool domainVerdictScamOrNot = ( claim.isScam && isApproved ) || ( !claim.isScam && !isApproved );
        if (isApproved) {
            claim.status = Status.Approved;
            claim.domainVerdictScamOrNot = domainVerdictScamOrNot;
            claim.validatorComments = _validatorComments;


            // Mint reward token if the user is reporting for the first time
            // 1. get the amount from the treasury 
            //    since we cant simply mint as it would devalue previous reward token share holders
            // 2. mint the reward token to the user, after getting the funds from treasury
            uint256 wethAmount = rewardTokenContract.previewMint(rewardAmount);
            treasuryContract.sendERC20(wethAddress, address(this), wethAmount);
            IERC20(wethAddress).approve(address(rewardTokenContract), wethAmount);
            rewardTokenContract.mint(rewardAmount, claim.requestor);
        } else {
            claim.status = Status.Rejected;
        }


        // cost = n*n*price for n votes
        // expense? recover in terms of votes slashed, let the expense be e
        // x*x*price = e
        // x = (e/price)^0.5

        // Burn the votes of the voters who voted against the verdict
        uint256 totalVotesToSlash = sqrt(validationFees / votePrice);
        uint256 totalAgainstVerdictVotes = 0;

        uint256 totalVoters = voteCount[domain];
        for (uint i = 0; i < totalVoters; i++) {
            Vote memory currentVote = votes[domain][i];
            if (currentVote.isScam != domainVerdictScamOrNot) {
                totalAgainstVerdictVotes += voteTokenContract.balanceOf(
                    currentVote.voter
                );
            }
        }

        // Burn the votes of the voters who voted against the verdict
        for (uint i = 0; i < totalVoters; i++) {
            Vote memory currentVote = votes[domain][i];
            if (currentVote.isScam != domainVerdictScamOrNot) {
                uint256 voterBalance = voteTokenContract.balanceOf(
                    currentVote.voter
                );
                uint256 votesToBurn = (voterBalance * totalVotesToSlash) /
                    totalAgainstVerdictVotes;
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
