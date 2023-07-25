//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "hardhat/console.sol";
import "./GovernanceBadgeNFT.sol";

contract ReportDomain is OwnableUpgradeable {
    string ACCEPTED;
    string REJECTED;

    address governanceBadgeNFT;
    address treasuryContract;

    uint256 public stakingAmount;
    uint256 public reward;
    uint256 public lockedAmount;
    uint256 public reportID;

    struct DomainClaim {
        bool isScamClaim;
        bool isLegitClaim;
        address scamReporter;
        address legitReporter;
        uint256 reportIDforScam;
        uint256 reportIDforLegit;
    }

    struct ReportInfo {
        uint256 id;
        uint256 stake;
        uint256 createdon;
        uint256 updatedon;
        bool exists;
        bool isOpen;
        bool isScam;
        string domain;
        string evidences;
        string comments;
        string status;
        string validatorComments;
        address reporter;
        address validator;
    }

    mapping(string => DomainClaim) reportsByDomain;
    mapping(uint256 => ReportInfo) reportsByID;
    mapping(address => uint256) public points;

    event Reported(
        uint256 indexed id,
        string domain,
        bool isScam,
        address indexed reporter,
        uint256 createdOn,
        string evidences,
        string comments,
        uint256 stakeAmount
    );
    event Validated(
        uint256 indexed id,
        string domain,
        bool isScam,
        address reporter,
        address indexed validator,
        uint256 updatedon,
        string validatorComments,
        string status,
        uint256 rewardAmount
    );
    event defaultValidated(
        string domain,
        bool isScam,
        address reporter,
        string validatorComments
    );

    function initialize(address _governanceBadgeNFT, address _treasuryContract)
        public
        initializer
    {
        __Ownable_init();
        governanceBadgeNFT = _governanceBadgeNFT;
        treasuryContract = _treasuryContract;
        reward = 10;
        stakingAmount = 0.5 ether;
        reportID = 0;

        ACCEPTED = "ACCEPTED";
        REJECTED = "REJECTED";
    }

    function setreward(uint256 _reward) public onlyOwner {
        reward = _reward;
    }

    function isReported(string calldata domain, bool isScam)
        public
        view
        returns (bool)
    {
        if (isScam) {
            return reportsByDomain[domain].isScamClaim;
        } else {
            return reportsByDomain[domain].isLegitClaim;
        }
    }

    /*
     * Report a domain
     * params: domain, isScam, evidences, comments
     * checks if a report already exists
     */
    function report(
        string calldata domain,
        bool isScam,
        string[] calldata evidenceHashes,
        string calldata comments
    ) public payable returns (uint256) {
        if (isScam) {
            require(
                !reportsByDomain[domain].isScamClaim,
                "Is Scam report already filed"
            );
            require(
                reportsByDomain[domain].legitReporter != msg.sender,
                "You already reported it as legit"
            );
        } else {
            require(
                !reportsByDomain[domain].isLegitClaim,
                "Is Legit report already filed"
            );
            require(
                reportsByDomain[domain].scamReporter != msg.sender,
                "You already reported it as scam"
            );
        }

        require(msg.value == stakingAmount, "Incorrect stake amount sent");
        lockedAmount += stakingAmount;

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

        uint256 timestamp = block.timestamp;

        reportID = reportID + 1;
        if (isScam) {
            reportsByDomain[domain].isScamClaim = true;
            reportsByDomain[domain].scamReporter = msg.sender;
            reportsByDomain[domain].reportIDforScam = reportID;
        } else {
            reportsByDomain[domain].isLegitClaim = true;
            reportsByDomain[domain].legitReporter = msg.sender;
            reportsByDomain[domain].reportIDforLegit = reportID;
        }

        ReportInfo memory reportInfo = ReportInfo(
            reportID,
            stakingAmount,
            timestamp,
            timestamp,
            true,
            true,
            isScam,
            domain,
            evidenceHashesSerialised,
            comments,
            "",
            "",
            msg.sender,
            address(0)
        );

        reportsByID[reportID] = reportInfo;

        emit Reported(
            reportID,
            domain,
            isScam,
            msg.sender,
            timestamp,
            evidenceHashesSerialised,
            comments,
            stakingAmount
        );

        return reportID;
    }

    /* Validate a report
     * Governance Badge NFT holders can validate the claims
     * params: reportId, isAccepted, comments
     */
    function validate(
        uint256 _reportId,
        bool isAccepted,
        string calldata comments
    ) public {
        GovernanceBadgeNFT _gov = GovernanceBadgeNFT(governanceBadgeNFT);
        uint256 bal = _gov.balanceOf(msg.sender, _gov.VALIDATOR_NFT());
        require(bal > 0, "Only selected validators can validate");
        require(reportsByID[_reportId].exists, "Case doesnt exist");
        require(reportsByID[_reportId].isOpen, "Case already validated");
        if (reportsByID[_reportId].isScam) {
            require(
                reportsByDomain[reportsByID[_reportId].domain].scamReporter !=
                    msg.sender,
                "You cannot validate your own report"
            );
        } else {
            require(
                reportsByDomain[reportsByID[_reportId].domain].legitReporter !=
                    msg.sender,
                "You cannot validate your own report"
            );
        }
        if (
            reportsByID[_reportId].isScam &&
            reportsByDomain[reportsByID[_reportId].domain].reportIDforLegit > 0
        ) {
            require(
                _reportId <
                    reportsByDomain[reportsByID[_reportId].domain]
                        .reportIDforLegit,
                "First close the legit file"
            );
        } else if (
            !reportsByID[_reportId].isScam &&
            reportsByDomain[reportsByID[_reportId].domain].reportIDforScam > 0
        ) {
            require(
                _reportId <
                    reportsByDomain[reportsByID[_reportId].domain]
                        .reportIDforScam,
                "First close the scam file"
            );
        }
        string memory status = ACCEPTED;
        if (!isAccepted) status = REJECTED;

        uint256 timestamp = block.timestamp;
        reportsByID[_reportId].status = status;
        reportsByID[_reportId].validatorComments = comments;
        reportsByID[_reportId].validator = msg.sender;
        reportsByID[_reportId].updatedon = timestamp;
        reportsByID[_reportId].isOpen = false;
        if (compareStrings(status, ACCEPTED)) {
            payable(reportsByID[_reportId].reporter).transfer(
                reportsByID[_reportId].stake
            );
            points[reportsByID[_reportId].reporter] += reward;
            emit Validated(
                _reportId,
                reportsByID[_reportId].domain,
                reportsByID[_reportId].isScam,
                reportsByID[_reportId].reporter,
                msg.sender,
                timestamp,
                comments,
                status,
                reward
            );
        } else {
            (bool sent, ) = payable(treasuryContract).call{
                value: reportsByID[_reportId].stake
            }("");
            require(sent, "Failed to send Ether");
            emit Validated(
                _reportId,
                reportsByID[_reportId].domain,
                reportsByID[_reportId].isScam,
                reportsByID[_reportId].reporter,
                msg.sender,
                timestamp,
                comments,
                status,
                0
            );
            reportsByDomain[reportsByID[_reportId].domain].isScamClaim = false;
            reportsByDomain[reportsByID[_reportId].domain].isLegitClaim = false;
            reportsByDomain[reportsByID[_reportId].domain]
                .scamReporter = address(0);
            reportsByDomain[reportsByID[_reportId].domain]
                .legitReporter = address(0);
            reportsByDomain[reportsByID[_reportId].domain].reportIDforScam = 0;
            reportsByDomain[reportsByID[_reportId].domain].reportIDforLegit = 0;
        }

        lockedAmount -= reportsByID[_reportId].stake;
    }

    function compareStrings(string memory a, string memory b)
        internal
        view
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function setStakingAmount(uint256 _stakingAmount) public onlyOwner {
        stakingAmount = _stakingAmount;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function defaultDomain(string[] memory domain) public onlyOwner {
        for (uint256 i = 0; i < domain.length; i++) {
            reportsByDomain[domain[i]].isLegitClaim = true;
            reportsByDomain[domain[i]].legitReporter = msg.sender;
            emit defaultValidated(
                domain[i],
                true,
                msg.sender,
                "Auto-verified: top 10k domain by traffic"
            );
        }
    }

    // function payDividends(uint amount) // todo
}
