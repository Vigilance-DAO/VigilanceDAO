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
    let weth: Contract;
    let domain: string;
    let user: SignerWithAddress;
    let validator: SignerWithAddress;

    before(async () => {
        let signers = await ethers.getSigners();
        user = signers[0];
        validator = signers[1]
        console.log("User address", user.address);
        console.log("Validator's address", validator.address);

        console.log("Deploying GovernanceBadgeNFT....")
        let GovernanceBadgeNFT = await ethers.getContractFactory("GovernanceBadgeNFT");
        governanceBadgeNFT = await upgrades.deployProxy(
            GovernanceBadgeNFT,
            ["Vigilance DAO", "VIGI-NFT", "uri"],
            { timeout: 180000 }
        );
        await governanceBadgeNFT.deployed();
        console.log("governanceBadgeNFT address: ", governanceBadgeNFT.address);

        console.log("Deploying wETH....");
        let wETH = await ethers.getContractFactory("WETH");
        weth = await wETH.connect(user).deploy();
        weth = await weth.deployed();
        console.log("wETH address: ", weth.address);

        console.log("Deploying VoteToken....")
        let voteToken = await ethers.getContractFactory("VoteToken");
        voteTokenContract = await voteToken.connect(user).deploy();
        voteTokenContract = await voteTokenContract.deployed();
        console.log("voteTokenContract address: ", voteTokenContract.address);


        console.log("Deploying Treasury....")
        let treasury = await ethers.getContractFactory("Treasury");
        treasuryContract = await treasury.connect(user).deploy();
        treasuryContract = await treasuryContract.deployed();
        let setTreasuryOwner = await treasuryContract.connect(user).initialize();
        setTreasuryOwner = await setTreasuryOwner.wait();
        console.log("treasuryContract address: ", treasuryContract.address)

        console.log("Deploying RewardToken....")
        let rewardToken = await ethers.getContractFactory("RewardToken");
        rewardTokenContract = await rewardToken.connect(user).deploy(
            weth.address,
            "Reward Token",
            "RT",
        );
        rewardTokenContract = await rewardTokenContract.deployed();
        console.log("rewardTokenContract address: ", rewardTokenContract.address);

        const votePrice = ethers.utils.parseUnits("0.001", 18);
        const validationFees = ethers.utils.parseUnits("0.001", 18).toString();
        const rewardAmount = ethers.utils.parseUnits("1", 18).toString();

        console.log("Deploying VoteModule....")
        const VoteModule = await ethers.getContractFactory("VoteModule");
        voteModule = await VoteModule.deploy(
            governanceBadgeNFT.address,
            voteTokenContract.address,
            votePrice,
            validationFees,
            rewardTokenContract.address,
            rewardAmount,
            treasuryContract.address,
            weth.address
        )
        voteModule = await voteModule.deployed();
        console.log("voteModule address: ", voteModule.address);

        console.log("Setting vote module in treasury, reward token and vote token....")
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
        console.log("Setting complete")

        console.log("Minting Eth to user .....")
        const amountToMint = ethers.utils.parseEther("10").toString();
        let tx = await weth.connect(user).mint(user.address, amountToMint);
        tx = await tx.wait();
        console.log("Minted Eth to user successfully")

        console.log("Filling up the treasury ....")
        const amountToFill = ethers.utils.parseEther("100").toString();
        tx = await weth.connect(user).mint(treasuryContract.address, amountToFill);
        tx = await tx.wait();
        console.log("Treasury filled successfully")

    })

    it("should return correct vote price", async () => {
        const votePrice = await voteModule.getVotePrice();
        console.log("Vote price in 1st test: ", votePrice)
        const expectedVotePrice = ethers.utils.parseUnits("0.001", 18);
        expect(votePrice).to.equal(expectedVotePrice);
    })

    it("should allow users to buy votes using weth", async () => {
        const votePrice = await voteModule.getVotePrice();
        console.log('Vote price in 2nd test ', votePrice)
        const n = BigNumber.from(20);
        const totalCost = BigNumber.from(votePrice).mul(n).mul(n).toString();
        console.log("Total cost: ", totalCost)
        const initialBalance = await weth.balanceOf(user.address);
        console.log("Initial balance: ", initialBalance)

        await weth.connect(user).approve(voteModule.address, totalCost);

        const buyVotesTx = await expect(await voteModule.connect(user).buyVotes(n)).to.emit(voteModule, "VotesBought");
        // const buyVotesTx = await tx.wait();
        // console.log("Buy votes tx: ", buyVotesTx)
        const updatedBalance = await weth.balanceOf(user.address);
        console.log("Updated balance: ", updatedBalance)

        expect(updatedBalance).to.eq(initialBalance.sub(totalCost));
        const userVoteBalance = await voteTokenContract.balanceOf(user.address);
        expect(userVoteBalance).to.equal(n);
    })

    it("should allow users to report a domain", async () => {
        domain = "www.google.com";
        const isScam = true;
        
        const initialVoteCount = await voteModule.getVoteCount(domain);
        const initialRewardBalance = await rewardTokenContract.balanceOf(user.address);
        const rewardAmount = await voteModule.getRewardAmount();
        console.log("Reward amount: ", rewardAmount)
        console.log("Initial reward balance: ", initialRewardBalance)

        const reportTx = await voteModule.reportDomain(domain, isScam)
        const report = await expect(reportTx)
            .to.emit(voteModule, "DomainReported");
        // let report = await reportTx.wait();
        
        console.log("Report: ", report)

        const updatedVoteCount = await voteModule.getVoteCount(domain);
        const updatedRewardBalance = await rewardTokenContract.balanceOf(user.address);
        console.log("Updated reward balance: ", updatedRewardBalance)

        expect(updatedRewardBalance).to.equal(initialRewardBalance.add(rewardAmount));
        expect(updatedVoteCount).to.equal(initialVoteCount.add(1));
    })

    // it("should fail for degenerate case of going with the majority", async () => {
    //     domain = "www.google.com";
    //     const isScam = true;
    //     const evidences = ["evidence1", "evidence2"];
    //     const comments = "This is a scam domain";
    //     const validationFees = ethers.utils.parseUnits("0.001", 18).toString();
    //     const reportTx = await voteModule.reportDomain(domain, isScam);
    //     const report = await reportTx.wait();

    //     const strength = expect(await voteModule.getStrength(domain)).to.equal(BigNumber.from(0));
    //     let appproveTx = await weth.connect(user).approve(voteModule.address, validationFees);
    //     let approve = await appproveTx.wait();

    //     // const requestValidation = await expect(voteModule.requestValidation(domain, isScam, evidences, comments))
    //     //                             .to.be.revertedWith("Validation request not allowed");
    //     const requestValidation = await expect(voteModule.requestValidation(domain, isScam, evidences, comments)).to.be.reverted;
    // })


    // it("should generate a manual verification request with taking a validation fees", async () => {
    //     domain = "www.google.com";
    //     const isScam = true;
    //     const evidences = ["evidence1", "evidence2"];
    //     const comments = "This is a scam domain";
    //     const validationFees = ethers.utils.parseUnits("0.001", 18).toString();
    //     const initialBalance = await weth.balanceOf(user.address);
    //     console.log("Initial balance: ", initialBalance);
    //     let approveTx = await weth.connect(user).approve(voteModule.address, validationFees);
    //     approveTx = await approveTx.wait();
    //     const tx = await expect(await voteModule.requestValidation(domain, isScam, evidences, comments))
    //                 .to.emit(voteModule, "ValidationRequest");
    //     // let tx = await expect(voteModule.requestValidation(domain, isScam, evidences, comments))
    //     // let tx = await expect(voteModule.connect(user).requestValidation(domain, isScam, [], comments))
    //     // .to.be.revertedWith(
    //     //     "Require atleast one evidence"
    //     // );
    //     // tx = await tx.wait();
    //     console.log(tx)
    //     const updatedBalance = await weth.balanceOf(user.address);
    //     console.log("Updated balance: ", updatedBalance);

    //     expect(updatedBalance).to.equal(initialBalance.sub(validationFees));

    // })


    // it("should validate and refund fee with reward token for an approved request", async () => {
    //     domain = "www.google.com";
    //     const isApproved = true;
    //     const evidences = ["evidence1", "evidence2"];
    //     const comments = "This is a scam domain";
    //     const validatorComments = "Approved by validator";
    //     const validationFees = ethers.utils.parseUnits("0.001", 18);
    //     await voteModule.requestValidation(domain, true, evidences, comments, { value: validationFees })
    //     const rewardAmount = await voteModule.getRewardAmount();

    //     //check for refund
    //     const userBalanceBefore = await user.getBalance();
    //     const tx = await expect(await voteModule.connect(validator).verifyValidationRequest(domain, isApproved, validatorComments))
    //         .to.emit(voteModule, "ValidationVerdict");

    //     const userBalanceAfter = await user.getBalance();
    //     const validatorFee = await voteModule.getValidationFees();
    //     expect(userBalanceAfter.sub(userBalanceBefore)).to.equal(validatorFee);

    //     //check for reward amount
    //     const userRewardBalance = await rewardTokenContract.balanceOf(await user.getAddress());
    //     console.log("User reward balance: ", userRewardBalance)
    //     expect(userRewardBalance).to.equal(userBalanceBefore.add(rewardAmount));

    // })

    // it("should slash votes and send fees to treasury for a rejected request", async () => {
    //     domain = "www.google.com";
    //     const isApproved = false;
    //     const validatorComments = "Rejected by validator";

    //     const validationFees = ethers.utils.parseUnits("0.001", 18);
    //     await voteModule.requestValidation(domain, true, { value: validationFees });
    //     await voteModule.connect(validator).verifyValidationRequest(domain, isApproved, validatorComments);

    //     const userVoteBalance = await voteTokenContract.balanceOf(await user.getAddress());
    //     expect(userVoteBalance).to.equal(BigNumber.from(0));

    //     const treasuryBalance = await ethers.provider.getBalance(treasuryContract.address);
    //     expect(treasuryBalance).to.equal(validationFees);
    // })

});

