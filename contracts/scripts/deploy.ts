import { ethers, upgrades } from "hardhat";
const { getTopDomains } = require("./domains/helper.js");
async function main() {
  const domains = (await getTopDomains()).slice(0, 1000);
  const governanceBadgeNFT = await ethers.getContractFactory(
    "GovernanceBadgeNFT"
  );
  const governanceBadgeNFTContract = await upgrades.deployProxy(
    governanceBadgeNFT,
    ["Vigilance DAO", "VIGI-NFT", "uri"]
  );
  await governanceBadgeNFTContract.deployed();

  console.log(
    "GovernanceBadgeNFT deployed to:",
    governanceBadgeNFTContract.address
  );

  const Token = await ethers.getContractFactory("Token");
  const token = await upgrades.deployProxy(Token, ["Vigilance Token", "VIGI"]);
  await token.deployed();

  console.log("Token deployed to:", token.address);

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await upgrades.deployProxy(Treasury);
  await treasury.deployed();
  console.log("treasury address: ", treasury.address);

  const ReportDomain = await ethers.getContractFactory("ReportDomain");
  const reportDomain = await upgrades.deployProxy(ReportDomain, [
    governanceBadgeNFTContract.address,
    treasury.address,
  ]);
  await reportDomain.deployed();

  console.log("reportDomain address: ", reportDomain.address);

  let reportImplementationAddress =
    await upgrades.erc1967.getImplementationAddress(reportDomain.address);
  console.log("reportImplementationAddress: ", reportImplementationAddress);

  const tx = await token.transferOwnership(reportDomain.address);
  await tx.wait();
  let slice;
  let validate;
  for (let i = 0; i < domains.length; ) {
    slice = domains.slice(i, i + 100);
    validate = await reportDomain.defaultDomain(slice);
    await validate.wait();
    i += 100;
    console.log("validated", i);
  }
  console.log("validated");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
