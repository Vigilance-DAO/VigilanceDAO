pragma solidity 0.8.12;

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "hardhat/console.sol";
import "./GovernanceBadgeNFT.sol";
import "./Token.sol";

contract ReportDomain is OwnableUpgradeable {
    ITablelandTables private _tableland;

    string public metadataTable;
    uint256 private _metadataTableId;
    string private _tablePrefix;
    uint256 _tableCurrentID;

    address governanceBadgeNFT;
    address tokenContract;
    uint public reward;

    function initialize(address _governanceBadgeNFT, address _tokenContract, address _tablelandRegistry) initializer public {
        __Ownable_init();
        governanceBadgeNFT = _governanceBadgeNFT;
        tokenContract = _tokenContract;
        _tableland = ITablelandTables(_tablelandRegistry);
        _tablePrefix = "domainreports";
        _tableCurrentID = 0;
        reward = 10;
        string memory createTableCmd = " (id int, domain text, isScam int, evidences text, comments text, status text, account text, createdon text, updatedon text, primary key (id));";

        /*
        * Stores the unique ID for the newly created table.
        */
        _metadataTableId = _tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                _tablePrefix,
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
                " (id, domain, isScam, evidences, comments, status, account, createdon, updatedon) VALUES (",
                StringsUpgradeable.toString(_tableCurrentID),
                ", '", domain,
                "', ", StringsUpgradeable.toString(isScamInt),
                ", '", evidenceHashesSerialised,
                "', '", comments,
                "', 'OPEN'",
                ", '", StringsUpgradeable.toHexString(uint160(msg.sender), 20),
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
        uint reportID = _tableCurrentID;
        _tableCurrentID += 1;
        return reportID;
    }

    /* Validate a report
    * Governance Badge NFT holders can validate the claims
    * params: reportId, isScam, comments
    */
    function validate(uint reportId, bool isScam, string calldata comments) public {
        GovernanceBadgeNFT _gov = GovernanceBadgeNFT(governanceBadgeNFT);
        uint256 bal = _gov.balanceOf(msg.sender, _gov.VALIDATOR_NFT());
        require(bal > 0, "Only governance member can validate");



        Token token = Token(tokenContract);
        // token.mint()
    }
}
