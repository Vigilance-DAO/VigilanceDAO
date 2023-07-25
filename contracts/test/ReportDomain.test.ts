import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import "./fetch-polyfills";
const { getTopDomains } = require("../scripts/domains/helper.js");

describe("ReportDomain", function () {
  let governanceBadgeNFT: Contract;
  let reportDomain: Contract;
  let superAdmin: SignerWithAddress;
  let secondAdmin: SignerWithAddress;
  let reportImplementationAddress: string;
  let domains: string[];

  before(async () => {
    domains = (await getTopDomains()).slice(0, 1000);
    console.log(domains.length);
    let result = await ethers.getSigners();
    superAdmin = result[0];
    secondAdmin = result[1];
    console.log(superAdmin.address);

    let GovernanceBadgeNFT = await ethers.getContractFactory(
      "GovernanceBadgeNFT"
    );
    governanceBadgeNFT = await upgrades.deployProxy(
      GovernanceBadgeNFT,
      ["Vigilance DAO", "VIGI-NFT", "uri"],
      { timeout: 180000 }
    );
    await governanceBadgeNFT.deployed();
    console.log("governanceBadgeNFT address: ", governanceBadgeNFT.address);

    let polygonTestnetAddress = "0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68";
    let ReportDomain = await ethers.getContractFactory("ReportDomain");
    reportDomain = await upgrades.deployProxy(
      ReportDomain,
      [governanceBadgeNFT.address, polygonTestnetAddress],
      { timeout: 180000 }
    );
    await reportDomain.deployed();

    reportImplementationAddress =
      await upgrades.erc1967.getImplementationAddress(reportDomain.address);

    console.log("reportDomain address: ", reportDomain.address);
  });

  it("validate 100 domains", async () => {
    let validate = await reportDomain.defaultDomain(domains.slice(0, 100));
    await validate.wait();
    console.log("validated 100");
  });

  it("validate 150 domains", async () => {
    let validate = await reportDomain.defaultDomain(domains.slice(0, 200));
    await validate.wait();
    console.log("validated 150");
  });

  it("validate 200 domains", async () => {
    let validate = await reportDomain.defaultDomain(domains.slice(0, 200));
    await validate.wait();
    console.log("validated 200");
  });

  // it("validate with no ID", async () => {
  //   try {
  //     let tx = await reportDomain.validate(100, true, "");
  //     await tx.wait();
  //   } catch (err: any) {
  //     return expect(err.message.includes("Case doesnt exist"));
  //   }
  //   throw new Error("Validation should have failed");
  // });

  // it("report (ACCEPT)", async () => {
  //   let domain = "google.com";
  //   let isScam = true;
  //   let evidences = ["scd", "sdvsdv"];
  //   let comments = "sdasbvf";
  //   let stakingAmount = await reportDomain.callStatic.stakingAmount();
  //   console.log("stakingAmount: ", stakingAmount.toString());
  //   let reportID = await reportDomain.callStatic.report(
  //     domain,
  //     isScam,
  //     evidences,
  //     comments,
  //     { value: stakingAmount.toString() }
  //   );
  //   let tx = await reportDomain
  //     .connect(secondAdmin)
  //     .report(domain, isScam, evidences, comments, {
  //       value: stakingAmount.toString(),
  //     });
  //   await tx.wait();

  //   let isReported = await reportDomain.callStatic.isReported(domain, isScam);
  //   expect(isReported, "is reported scam should be true").to.eq(true);

  //   let isReported2 = await reportDomain.callStatic.isReported(domain, !isScam);
  //   expect(isReported2, "is reported legit should be false").to.eq(false);

  //   let lockedAmount = await reportDomain.lockedAmount();
  //   expect(lockedAmount.toString(), "incorrect lockek amount").to.eq(
  //     stakingAmount.toString()
  //   );

  //   let initialBal = await secondAdmin.provider?.getBalance(
  //     secondAdmin.address
  //   );
  //   console.log("secondAdmin before", {
  //     initialBal: ethers.utils
  //       .formatEther(initialBal?.toString() || "0")
  //       .toString(),
  //   });

  //   let balance = await reportDomain.getBalance();
  //   expect(balance.toString(), "Balance should be 5ETH").to.eq(
  //     stakingAmount.toString()
  //   );
  //   console.log({ balance });

  //   tx = await reportDomain.validate(reportID, true, "my comments");
  //   await tx.wait();
  //   console.log("validated");
  //   lockedAmount = await reportDomain.lockedAmount();
  //   expect(lockedAmount.toString(), "incorrect locked amount").to.eq("0");
  //   console.log("locked amount is 0");
  //   balance = await reportDomain.getBalance();
  //   expect(balance?.toString(), "Balance should be 0").to.eq("0");
  //   console.log("balance is 0");
  //   let afterBal = await secondAdmin.provider?.getBalance(secondAdmin.address);
  //   console.log("secondAdmin after", {
  //     afterBal: ethers.utils
  //       .formatEther(afterBal?.toString() || "0")
  //       .toString(),
  //   });
  //   expect(afterBal?.toString(), "second admin should have +5").to.eq(
  //     initialBal?.add(stakingAmount).toString()
  //   );

  //   let points = await reportDomain.points(secondAdmin.address);
  //   expect(points.toString(), "points should be 10").to.eq("10");
  // });

  // it("report (REJECT)", async () => {
  //   let domain = "google.com";
  //   let isScam = false;
  //   let evidences = ["scd", "sdvsdv"];
  //   let comments = "sdasbvf";
  //   let stakingAmount = await reportDomain.callStatic.stakingAmount();
  //   let reportID = await reportDomain.callStatic.report(
  //     domain,
  //     isScam,
  //     evidences,
  //     comments,
  //     { value: stakingAmount.toString() }
  //   );
  //   let tx = await reportDomain
  //     .connect(secondAdmin)
  //     .report(domain, isScam, evidences, comments, {
  //       value: stakingAmount.toString(),
  //     });
  //   await tx.wait();

  //   let isReported = await reportDomain.callStatic.isReported(domain, isScam);
  //   expect(isReported, "is reported legit should be true").to.eq(true);

  //   let isReported2 = await reportDomain.callStatic.isReported(domain, !isScam);
  //   expect(isReported2, "is reported scam should be false").to.eq(false);

  //   let lockedAmount = await reportDomain.lockedAmount();
  //   expect(lockedAmount.toString(), "incorrect lockek amount").to.eq(
  //     stakingAmount.toString()
  //   );

  //   let initialBal = await secondAdmin.provider?.getBalance(
  //     secondAdmin.address
  //   );
  //   console.log("secondAdmin before", {
  //     initialBal: ethers.utils
  //       .formatEther(initialBal?.toString() || "0")
  //       .toString(),
  //   });

  //   let balance = await reportDomain.getBalance();
  //   console.log({ balance });
  //   expect(balance.toString(), "Balance should be 5ETH").to.eq(
  //     stakingAmount.toString()
  //   );

  //   tx = await reportDomain.validate(reportID, false, "my comments");
  //   await tx.wait();

  //   lockedAmount = await reportDomain.lockedAmount();
  //   expect(lockedAmount.toString(), "incorrect lockek amount").to.eq("0"); // lock released

  //   balance = await reportDomain.getBalance();
  //   expect(balance?.toString(), "Balance should be 0").to.eq("0");

  //   let afterBal = await secondAdmin.provider?.getBalance(secondAdmin.address);
  //   console.log("secondAdmin after", {
  //     afterBal: ethers.utils
  //       .formatEther(afterBal?.toString() || "0")
  //       .toString(),
  //   });
  //   expect(afterBal?.toString(), "second admin should have +5").to.eq(
  //     initialBal?.toString()
  //   );
  // });

  // it("report on same domain", async () => {
  //   let domain = "google.com";
  //   let isScam = false;
  //   let evidences = ["scd", "sdvsdv"];
  //   let comments = "sdasbvf";
  //   let stakingAmount = await reportDomain.callStatic.stakingAmount();
  //   let tx = await reportDomain
  //     .connect(secondAdmin)
  //     .report(domain, isScam, evidences, comments, {
  //       value: stakingAmount.toString(),
  //     });
  //   await tx.wait();

  //   let isReported = await reportDomain.callStatic.isReported(domain, isScam);
  //   expect(isReported, "is reported legit should be true").to.eq(true);

  //   let isReported2 = await reportDomain.callStatic.isReported(domain, !isScam);
  //   expect(isReported2, "is reported scam should be false").to.eq(false);

  //   await expect(
  //     reportDomain
  //       .connect(secondAdmin)
  //       .callStatic.report(domain, isScam, evidences, comments, {
  //         value: stakingAmount.toString(),
  //       })
  //   ).to.be.rejectedWith("Is Legit report already filed");
  //   await expect(
  //     reportDomain
  //       .connect(secondAdmin)
  //       .callStatic.report(domain, !isScam, evidences, comments, {
  //         value: stakingAmount.toString(),
  //       })
  //   ).to.be.rejectedWith("You already reported it as legit");
  //   tx = await reportDomain.report(domain, !isScam, evidences, comments, {
  //     value: stakingAmount.toString(),
  //   });
  //   await tx.wait();
  //   console.log("reported again");
  //   await expect(
  //     reportDomain.callStatic.report(domain, !isScam, evidences, comments, {
  //       value: stakingAmount.toString(),
  //     })
  //   ).to.be.rejectedWith("Is Scam report already filed");
  //   await expect(
  //     reportDomain.callStatic.report(domain, isScam, evidences, comments, {
  //       value: stakingAmount.toString(),
  //     })
  //   ).to.be.rejectedWith("Is Legit report already filed");
  // });

  // it("change Reward", async () => {
  //   let reward = await reportDomain.reward();
  //   console.log({ reward });
  //   let tx = await reportDomain.setreward(reward.add(1));
  //   await tx.wait();
  //   let newReward = await reportDomain.reward();
  //   console.log({ newReward });
  //   expect(newReward.toString(), "reward should be +1").to.eq(
  //     reward.add(1).toString()
  //   );
  // });
});
