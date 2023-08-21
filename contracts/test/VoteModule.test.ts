import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("VoteModule", function () {
    let governanceBadgeNFT: Contract;
    let voteTokenContract: Contract;
    let rewardTokenContract: Contract;
    let treasuryContract: Contract;
    let voteModule: Contract;
    let domain: string;
    let user: SignerWithAddress;
    let validator: SignerWithAddress;

    before(async () => {
        let signers = await ethers.getSigners();
        user = signers[0];
        validator = signers[1]
        console.log("User address", user.address);
        console.log("Validator's address", validator.address);

        let GovernanceBadgeNFT = await ethers.getContractFactory("GovernanceBadgeNFT");
        governanceBadgeNFT = await upgrades.deployProxy(
            GovernanceBadgeNFT,
            ["Vigilance DAO", "VIGI-NFT", "uri"],
            { timeout: 180000 }
        );
        await governanceBadgeNFT.deployed();
        console.log("governanceBadgeNFT address: ", governanceBadgeNFT.address);

        let voteToken = await ethers.getContractFactory("VoteToken");
        voteTokenContract = await voteToken.connect(user).deploy();
        voteTokenContract = await voteTokenContract.deployed();
        console.log("voteTokenContract address: ", voteTokenContract.address);


        let treasury = await ethers.getContractFactory("Treasury");
        treasuryContract = await treasury.connect(user).deploy();
        treasuryContract = await treasuryContract.deployed();
        let setTreasuryOwner = await treasuryContract.connect(user).initialize();
        setTreasuryOwner = await setTreasuryOwner.wait();
        console.log("treasuryContract address: ", treasuryContract.address)

        let rewardToken = await ethers.getContractFactory("RewardToken");
        rewardTokenContract = await rewardToken.connect(user).deploy();
        rewardTokenContract = await rewardTokenContract.deployed();
        console.log("rewardTokenContract address: ", rewardTokenContract.address);

        const votePrice = ethers.utils.parseUnits("0.001", 18);
        const validationFees = ethers.utils.parseUnits("0.001", 18).toString();
        const rewardAmount = ethers.utils.parseUnits("1", 18).toString();

        const VoteModule = await ethers.getContractFactory("VoteModule");
        voteModule = await VoteModule.deploy(
            governanceBadgeNFT.address,
            voteTokenContract.address,
            votePrice,
            validationFees,
            rewardTokenContract.address,
            rewardAmount,
            treasuryContract.address
        )
        voteModule = await voteModule.deployed();
        console.log("voteModule address: ", voteModule.address);

        const setVoteModuleInTreasury = await expect(await treasuryContract.setVoteModulesContract(voteModule.address)).
            to.emit(treasuryContract, "VoteModuleContractSet")
            .withArgs(voteModule.address);

        const checkOwner = expect(await treasuryContract.callStatic.owner()).to.equal(user.address);

        const setVoteModuleInRT = await expect(await rewardTokenContract.setVoteModulesContract(voteModule.address))
            .to.emit(rewardTokenContract, "VoteModuleContractSet")
            .withArgs(voteModule.address);


        const setVoteModuleInVT = await expect(await voteTokenContract.setVoteModule(voteModule.address))
            .to.emit(voteTokenContract, "VoteModuleContractSet")
            .withArgs(voteModule.address);
    })

    it("should return correct vote price", async () => {
        const votePrice = await voteModule.getVotePrice();
        console.log("Vote price in 1st test: ", votePrice)
        const expectedVotePrice = ethers.utils.parseUnits("0.001", 18);
        expect(votePrice).to.equal(expectedVotePrice);
    })

    it("should allow users to buy votes", async () => {
        const initialBalance = await user.getBalance();
        console.log("Initial balance: ", initialBalance)

        const votePrice = await voteModule.getVotePrice();
        console.log('Vote price in 2nd test ', votePrice)
        const n = BigNumber.from(20);
        const totalCost = BigNumber.from(votePrice).mul(n).mul(n);
        console.log("Total cost: ", totalCost)

        const buyVotesTx = await expect(await voteModule.connect(user).buyVotes(n, { value: totalCost })).to.emit(voteModule, "VotesBought");
        console.log("Buy votes tx: ", buyVotesTx)
        const updatedBalance = await user.getBalance();
        console.log("Updated balance: ", updatedBalance)

        expect(updatedBalance).to.lessThan(initialBalance.sub(totalCost));
        const userVoteBalance = await voteTokenContract.balanceOf(user.address);
        expect(userVoteBalance).to.equal(n);
    })

    // // it("should calculate strength of a domain", async() => {
    // //     domain = "www.google.com";
    //     // const n = BigNumber.from(20);
    //     // const totalCost = BigNumber.from(votePrice).mul(n).mul(n);
    // //     const buyVotesTx = await expect(await voteModule.connect(user).buyVotes(n, { value: totalCost })).to.emit(voteModule, "VotesBought");
    // //     await voteModule.reportDomain(domain, false, [], "") //reporting a domain with legit votes
    // //     const expect
    // // })

    it("should allow users to report a domain", async () => {
        domain = "www.google.com";
        const isScam = true;
        const evidenceHashes = ["evidence1", "evidence2"];
        const comments = "This is a scam domain";

        const initialVoteCount = await voteModule.getVoteCount(domain);
        const initialRewardBalance = await rewardTokenContract.balanceOf(user.address);
        const rewardAmount = await voteModule.getRewardAmount();
        console.log("Reward amount: ", rewardAmount)
        console.log("Initial reward balance: ", initialRewardBalance)
        const report = await expect(await voteModule.reportDomain(domain, isScam, evidenceHashes, comments))
            .to.emit(voteModule, "DomainReported");
        const updatedVoteCount = await voteModule.getVoteCount(domain);
        const updatedRewardBalance = await rewardTokenContract.balanceOf(user.address);
        console.log("Updated reward balance: ", updatedRewardBalance)
        expect(updatedRewardBalance).to.equal(initialRewardBalance.add(rewardAmount));
        expect(updatedVoteCount).to.equal(initialVoteCount.add(1));
    })

    it("should fail for degenerate case of going with the majority", async () => {
        domain = "www.google.com";
        const isScam = true;
        const evidenceHashes = ["evidence1", "evidence2"];
        const comments = "This is a scam domain";

        const reportTx = await voteModule.reportDomain(domain, isScam, evidenceHashes, comments);
        const report = await reportTx.wait();

        const strength = expect(await voteModule.getStrength(domain)).to.equal(BigNumber.from(0));

        const requestValidation = await expect(voteModule.requestValidation(domain, isScam))
                                    .to.be.revertedWith("Validation request not allowed");
        // const requestValidation = await expect(voteModule.requestValidation(domain, isScam)).to.be.reverted;
    })


    it("should generate a manual verification request with taking a validation fees", async () => {
        domain = "www.google.com";
        const isScam = true;
        // const validationFees = await voteModule.getValidationFees();
        const validationFees = ethers.utils.parseUnits("0.001", 18);
        const initialBalance = await user.getBalance();
        const tx = await expect(await voteModule.requestValidation(domain, isScam, { value: validationFees }) )
                    .to.emit(voteModule, "ValidationRequest");
        const updatedBalance = await user.getBalance();
        expect(updatedBalance).to.equal(initialBalance.sub(validationFees));

    })


    it("should validate and refund fee with reward token for an approved request", async() => {
      domain = "www.google.com";
      const isApproved = true;
      const validatorComments = "Approved by validator";
      const validationFees = ethers.utils.parseUnits("0.001", 18);
      await voteModule.requestValidation(domain, false, {value: validationFees})
      const rewardAmount = await voteModule.getRewardAmount();

      //check for refund
      const userBalanceBefore = await user.getBalance();
      const tx = await expect(await voteModule.connect(validator).verifyValidationRequest(domain, isApproved, validatorComments))
                .to.emit(voteModule, "ValidationVerdict");

      const userBalanceAfter = await user.getBalance();
      const validatorFee = await voteModule.getValidationFees();
      expect(userBalanceAfter.sub(userBalanceBefore)).to.equal(validatorFee);

       //check for reward amount
       const userRewardBalance = await rewardTokenContract.balanceOf(await user.getAddress());
       console.log("User reward balance: ", userRewardBalance)
       expect(userRewardBalance).to.equal(userBalanceBefore.add(rewardAmount));

    })

    it("should slash votes and send fees to treasury for a rejected request", async() => {
        domain = "www.google.com";
        const isApproved = false;
        const validatorComments = "Rejected by validator";

        const validationFees = ethers.utils.parseUnits("0.001", 18);
        await voteModule.requestValidation(domain, true, {value: validationFees});
        await voteModule.connect(validator).verifyValidationRequest(domain, isApproved, validatorComments);

        const userVoteBalance = await voteTokenContract.balanceOf(await user.getAddress());
        expect(userVoteBalance).to.equal(BigNumber.from(0));

        const treasuryBalance = await ethers.provider.getBalance(treasuryContract.address);
        expect(treasuryBalance).to.equal(validationFees);
    })
});

