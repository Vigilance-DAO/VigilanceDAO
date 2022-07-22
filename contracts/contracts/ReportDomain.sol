pragma solidity 0.8.12;

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "hardhat/console.sol";
import "./GovernanceBadgeNFT.sol";
import "./Token.sol";

contract ReportDomain is OwnableUpgradeable {
    string ACCEPTED;
    string REJECTED;
    
    ITablelandTables private _tableland;

    string public metadataTable;
    uint256 private _metadataTableId;
    string private _tablePrefix;
    uint256 _tableCurrentID;

    address governanceBadgeNFT;
    address tokenContract;

    uint public stakingAmount;
    uint public reward;
    uint public lockedAmount;

    struct DomainClaim {
        bool isScamClaim;
        bool isLegitClaim;
    }

    struct ReportInfo {
        address reporter;
        bool exists;
        uint stake;
        bool isOpen;
    }

    mapping(string => DomainClaim) reportsByDomain;
    mapping(uint => ReportInfo) reportsByID;


    function initialize(address _governanceBadgeNFT, address _tokenContract, address _tablelandRegistry) initializer public {
        __Ownable_init();
        governanceBadgeNFT = _governanceBadgeNFT;
        tokenContract = _tokenContract;
        _tableland = ITablelandTables(_tablelandRegistry);
        _tablePrefix = "domainreports";
        _tableCurrentID = 0;
        reward = 10 ether;
        stakingAmount = 0.5 ether;

        ACCEPTED = "ACCEPTED";
        REJECTED = "REJECTED";

        string memory createTableCmd = " (id int, domain text, stake text, isScam int, evidences text, comments text, status text, account text, validator text, validatorComments text, createdon text, updatedon text, primary key (id));";

        /*
        * Stores the unique ID for the newly created table.
        */
        _metadataTableId = _tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                _tablePrefix,
                "_",
                StringsUpgradeable.toString(block.chainid),
                createTableCmd
            )
        );


        /*
        * Stores the full tablename for the new table. 
        * {prefix}_{chainid}_{tableid}
        */
        metadataTable = string.concat(
            _tablePrefix,
            "_",
            StringsUpgradeable.toString(block.chainid),
            "_",
            StringsUpgradeable.toString(_metadataTableId)
        );

    }

    function setReward(uint _reward) public onlyOwner {
        reward = _reward;
    }

    function isReported(string calldata domain, bool isScam) public returns(bool) {
        if(isScam) {
            return reportsByDomain[domain].isScamClaim;
        } else {
            return reportsByDomain[domain].isLegitClaim;
        }
    }

    // function getAllOpenReports() public {
    //     string memory cmd = string.concat(
    //             "SELECT * FROM ",
    //             metadataTable,
    //             " WHERE status='OPEN'"
    //     );
    //     _tableland.runSQL(
    //         address(this),
    //         _metadataTableId,
    //         cmd
    //     );
    // }

    /*
    * Report a domain
    * params: domain, isScam, evidences, comments
    * checks if a report already exists
    */
    function report(string calldata domain, bool isScam, string[] calldata evidenceHashes, string calldata comments) public payable returns(uint) {
        if(isScam)
            require(!reportsByDomain[domain].isScamClaim, "Is Scam report already filed");
        else
            require(!reportsByDomain[domain].isLegitClaim, "Is Legit report already filed");

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

        uint isScamInt = isScam ? 1 : 0;
        uint timestamp = block.timestamp;
        string memory cmd = string.concat(
                "INSERT INTO ",
                metadataTable,
                " (id, domain, stake, isScam, evidences, comments, status, account, validator, validatorComments, createdon, updatedon) VALUES (",
                StringsUpgradeable.toString(_tableCurrentID),
                ", '", domain,
                "', '", StringsUpgradeable.toString(stakingAmount),
                "', ", StringsUpgradeable.toString(isScamInt),
                ", '", evidenceHashesSerialised,
                "', '", comments,
                "', 'OPEN'",
                ", '", StringsUpgradeable.toHexString(uint160(msg.sender), 20),
                "', 'pending', 'pending",
                "', '", StringsUpgradeable.toString(timestamp),
                "', '", StringsUpgradeable.toString(timestamp),
                "')"
        );
        console.log(cmd);
        _tableland.runSQL(
            address(this),
            _metadataTableId,
            cmd
        );

        if(isScam) {
            reportsByDomain[domain].isScamClaim = true;
        } else {
            reportsByDomain[domain].isLegitClaim = true;
        }
        ReportInfo storage _reportInfo = reportsByID[_tableCurrentID];
        _reportInfo.exists = true;
        _reportInfo.reporter = msg.sender;
        _reportInfo.stake = stakingAmount;
        _reportInfo.isOpen = true;


        uint reportID = _tableCurrentID;
        _tableCurrentID += 1;
        return reportID;
    }

    /* Validate a report
    * Governance Badge NFT holders can validate the claims
    * params: reportId, isAccepted, comments
    */
    function validate(uint reportId, bool isAccepted, string calldata comments) public {
        GovernanceBadgeERC1155 _gov = GovernanceBadgeERC1155(governanceBadgeNFT);
        uint256 bal = _gov.balanceOf(msg.sender, _gov.VALIDATOR_NFT());
        require(bal > 0, "Only governance member can validate");
        require(reportsByID[reportId].exists, "Case doesnt exist");
        require(reportsByID[reportId].isOpen, "Case already validated");

        string memory status = ACCEPTED;
        if(!isAccepted)
            status = REJECTED;

        uint timestamp = block.timestamp;
        string memory cmd = string.concat(
                "UPDATE ",
                metadataTable,
                " SET ",
                "status='",
                status,
                "', validatorComments='",
                comments,
                "', validator='",
                StringsUpgradeable.toHexString(uint160(msg.sender), 20),
                "', updatedon='",
                StringsUpgradeable.toString(timestamp),
                "' WHERE id=",
                StringsUpgradeable.toString(reportId)
        );
        console.log(cmd);
        _tableland.runSQL(
            address(this),
            _metadataTableId,
            cmd
        );
        reportsByID[reportId].isOpen = false;
        if(compareStrings(status, ACCEPTED)) {
            payable(reportsByID[reportId].reporter).transfer(reportsByID[reportId].stake);
            Token token = Token(tokenContract);
            token.mint(reportsByID[reportId].reporter, reward);
        }
        lockedAmount -= reportsByID[reportId].stake;
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
