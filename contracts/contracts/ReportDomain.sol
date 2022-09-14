pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "hardhat/console.sol";
import "./GovernanceBadgeNFT.sol";
import "./Token.sol";

contract ReportDomain is OwnableUpgradeable {
    string ACCEPTED;
    string REJECTED;

    address governanceBadgeNFT;
    address tokenContract;
    address treasuryContract;

    uint public stakingAmount;
    uint public reward;
    uint public lockedAmount;
    uint public reportID;

    struct DomainClaim {
        bool isScamClaim;
        bool isLegitClaim;
        address scamReporter;
        address legitReporter;
        uint reportIDforScam;
        uint reportIDforLegit;
    }

    struct ReportInfo {
        uint id;
        uint stake;
        uint createdon;
        uint updatedon;
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
    mapping(uint => ReportInfo) reportsByID;
    

    event Reported(uint id, string domain,bool isScam,address reporter, uint createdon);
    event Validated(uint id, string domain,bool isScam,address reporter,address governor, uint updatedon);


    function initialize(address _governanceBadgeNFT, address _tokenContract,address _treasuryContract) initializer public {
        __Ownable_init();
        governanceBadgeNFT = _governanceBadgeNFT;
        tokenContract = _tokenContract;
        treasuryContract = _treasuryContract;
        reward = 10 ether;
        stakingAmount = 0.5 ether;
        reportID = 0;

        ACCEPTED = "ACCEPTED";
        REJECTED = "REJECTED";
    }

    function setReward(uint _reward) public onlyOwner {
        reward = _reward;
    }

    function isReported(string calldata domain, bool isScam) public view returns(bool) {
        if(isScam) {
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
    function report(string calldata domain, bool isScam, string[] calldata evidenceHashes, string calldata comments) public payable returns(uint) {
        if(isScam){
            require(!reportsByDomain[domain].isScamClaim, "Is Scam report already filed");
            require(reportsByDomain[domain].legitReporter != msg.sender, "You already reported it as legit");
        }
        else{
            require(!reportsByDomain[domain].isLegitClaim, "Is Legit report already filed");
            require(reportsByDomain[domain].scamReporter != msg.sender, "You already reported it as scam");
        }


        require(msg.value == stakingAmount, "Incorrect stake amount sent");
        lockedAmount += stakingAmount;

        string memory evidenceHashesSerialised = "";
        uint nEvidences = evidenceHashes.length;
        require(nEvidences > 0, "Require atleast one evidence");

        for(uint i=0; i<nEvidences; ++i) {
            evidenceHashesSerialised = string.concat(
                evidenceHashesSerialised,
                evidenceHashes[i]
            );
            if(i < (nEvidences-1)) {
                evidenceHashesSerialised = string.concat(
                    evidenceHashesSerialised,
                    ","
                );  
            }
        }

        uint timestamp = block.timestamp;
        
        reportID = reportID + 1;
        if(isScam) {
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

        emit Reported(reportID, domain, isScam, msg.sender, timestamp);
        
        return reportID;
    }

    /* Validate a report
    * Governance Badge NFT holders can validate the claims
    * params: reportId, isAccepted, comments
    */
    function validate(uint _reportId, bool isAccepted, string calldata comments) public {
        GovernanceBadgeERC1155 _gov = GovernanceBadgeERC1155(governanceBadgeNFT);
        uint256 bal = _gov.balanceOf(msg.sender, _gov.VALIDATOR_NFT());
        require(bal > 0, "Only selected validators can validate");
        require(reportsByID[_reportId].exists, "Case doesnt exist");
        require(reportsByID[_reportId].isOpen, "Case already validated");
        if(reportsByID[_reportId].isScam) {
            require(_reportId < reportsByDomain[reportsByID[_reportId].domain].reportIDforLegit, "First close the legit file");
        } else {
            require(_reportId < reportsByDomain[reportsByID[_reportId].domain].reportIDforScam, "First close the scam file");
        }
        string memory status = ACCEPTED;
        if(!isAccepted)
            status = REJECTED;

        uint timestamp = block.timestamp;
        reportsByID[_reportId].status = status;
        reportsByID[_reportId].validatorComments = comments;
        reportsByID[_reportId].validator = msg.sender;
        reportsByID[_reportId].updatedon = timestamp;
        reportsByID[_reportId].isOpen = false;
        if(compareStrings(status, ACCEPTED)) {
            payable(reportsByID[_reportId].reporter).transfer(reportsByID[_reportId].stake);
            Token token = Token(tokenContract);
            token.mint(reportsByID[_reportId].reporter, reward);
            emit Validated(_reportId, reportsByID[_reportId].domain, reportsByID[_reportId].isScam, reportsByID[_reportId].reporter,msg.sender, timestamp);
        }
        else{
            payable(treasuryContract).transfer(reportsByID[_reportId].stake);
        }

        lockedAmount -= reportsByID[_reportId].stake;
        reportsByDomain[reportsByID[_reportId].domain].isScamClaim = false;
        reportsByDomain[reportsByID[_reportId].domain].isLegitClaim = false;
        reportsByDomain[reportsByID[_reportId].domain].scamReporter = address(0);
        reportsByDomain[reportsByID[_reportId].domain].legitReporter = address(0);

    }

    function compareStrings(string memory a, string memory b) internal view returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function setStakingAmount(uint _stakingAmount) public onlyOwner {
        stakingAmount = _stakingAmount;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // function payDividends(uint amount) // todo
}
