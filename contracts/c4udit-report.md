# c4udit Report

## Files analyzed
- contracts\GovernanceBadgeNFT.sol
- contracts\ReportDomain.sol
- contracts\Token.sol
- contracts\Treasury.sol

## Issues found

### Don't Initialize Variables with Default Value

#### Impact
Issue Information: [G001](https://github.com/byterocket/c4-common-issues/blob/main/0-Gas-Optimizations.md#g001---dont-initialize-variables-with-default-value)

#### Findings:
```
contracts\ReportDomain.sol::104 => for(uint i=0; i<nEvidences; ++i) {
```
#### Tools used
[c4udit](https://github.com/byterocket/c4udit)

### Cache Array Length Outside of Loop

#### Impact
Issue Information: [G002](https://github.com/byterocket/c4-common-issues/blob/main/0-Gas-Optimizations.md#g002---cache-array-length-outside-of-loop)

#### Findings:
```
contracts\ReportDomain.sol::101 => uint nEvidences = evidenceHashes.length;
```
#### Tools used
[c4udit](https://github.com/byterocket/c4udit)

### Use != 0 instead of > 0 for Unsigned Integer Comparison

#### Impact
Issue Information: [G003](https://github.com/byterocket/c4-common-issues/blob/main/0-Gas-Optimizations.md#g003---use--0-instead-of--0-for-unsigned-integer-comparison)

#### Findings:
```
contracts\GovernanceBadgeNFT.sol::55 => require(validationRequests[msg.sender] > 0, "no request present");
contracts\GovernanceBadgeNFT.sol::77 => //     require(balanceOf(validator,VALIDATOR_NFT) > 0,"No use of Revoking");
contracts\GovernanceBadgeNFT.sol::102 => require(balanceOf(msg.sender,GOVERNANCE_NFT) > 0,"You are not governor to vote");
contracts\ReportDomain.sol::102 => require(nEvidences > 0, "Require atleast one evidence");
contracts\ReportDomain.sol::162 => require(bal > 0, "Only selected validators can validate");
contracts\ReportDomain.sol::170 => if(reportsByID[_reportId].isScam && reportsByDomain[reportsByID[_reportId].domain].reportIDforLegit > 0) {
contracts\ReportDomain.sol::173 => else if(!reportsByID[_reportId].isScam && reportsByDomain[reportsByID[_reportId].domain].reportIDforScam > 0){
```
#### Tools used
[c4udit](https://github.com/byterocket/c4udit)

### Use immutable for OpenZeppelin AccessControl's Roles Declarations

#### Impact
Issue Information: [G006](https://github.com/byterocket/c4-common-issues/blob/main/0-Gas-Optimizations.md#g006---use-immutable-for-openzeppelin-accesscontrols-roles-declarations)

#### Findings:
```
contracts\ReportDomain.sol::210 => return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
```
#### Tools used
[c4udit](https://github.com/byterocket/c4udit)

### Long Revert Strings

#### Impact
Issue Information: [G007](https://github.com/byterocket/c4-common-issues/blob/main/0-Gas-Optimizations.md#g007---long-revert-strings)

#### Findings:
```
contracts\GovernanceBadgeNFT.sol::4 => import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
contracts\GovernanceBadgeNFT.sol::5 => import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
contracts\GovernanceBadgeNFT.sol::6 => import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
contracts\ReportDomain.sol::4 => import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
contracts\ReportDomain.sol::5 => import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
contracts\ReportDomain.sol::162 => require(bal > 0, "Only selected validators can validate");
contracts\ReportDomain.sol::166 => require(reportsByDomain[reportsByID[_reportId].domain].scamReporter != msg.sender, "You cannot validate your own report");
contracts\ReportDomain.sol::168 => require(reportsByDomain[reportsByID[_reportId].domain].legitReporter != msg.sender, "You cannot validate your own report");
contracts\ReportDomain.sol::222 => emit defaultValidated(domain, false, msg.sender,"Auto-verified: top 10k domain by traffic");
contracts\Token.sol::3 => import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
contracts\Token.sol::4 => import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
contracts\Treasury.sol::3 => import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
contracts\Treasury.sol::4 => import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
```
#### Tools used
[c4udit](https://github.com/byterocket/c4udit)

### Unsafe ERC20 Operation(s)

#### Impact
Issue Information: [L001](https://github.com/byterocket/c4-common-issues/blob/main/2-Low-Risk.md#l001---unsafe-erc20-operations)

#### Findings:
```
contracts\GovernanceBadgeNFT.sol::58 => payable(msg.sender).transfer(toTransfer);
contracts\ReportDomain.sol::187 => payable(reportsByID[_reportId].reporter).transfer(reportsByID[_reportId].stake);
contracts\Treasury.sol::12 => payable(to).transfer(amount);
contracts\Treasury.sol::16 => IERC20Upgradeable(token).transfer(to,amount);
```
#### Tools used
[c4udit](https://github.com/byterocket/c4udit)

### Unspecific Compiler Version Pragma

#### Impact
Issue Information: [L003](https://github.com/byterocket/c4-common-issues/blob/main/2-Low-Risk.md#l003---unspecific-compiler-version-pragma)

#### Findings:
```
contracts\GovernanceBadgeNFT.sol::2 => pragma solidity ^0.8.12;
contracts\ReportDomain.sol::2 => pragma solidity ^0.8.12;
```
#### Tools used
[c4udit](https://github.com/byterocket/c4udit)

