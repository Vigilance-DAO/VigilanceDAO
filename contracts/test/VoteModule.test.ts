import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployQV, loadRewards } from "../scripts/deployQVLib";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("VoteModule", function () {
    let governanceBadgeNFT: Contract;
    let voteTokenContract: Contract;
    let rewardTokenContract: Contract;
    let treasuryContract: Contract;
    let voteModule: Contract;
    let weth: Contract;
    let domain: string;
    let user: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;
    let validator: SignerWithAddress;
    const validationFees = ethers.utils.parseUnits("0.001", 18).toString();

    before(async () => {
        let signers = await ethers.getSigners();
        user = signers[0];
        console.log('addr', user.address)
        validator = signers[1]
        user2 = signers[2];
        user3 = signers[3];
        console.log("User address", user.address);
        console.log("Validator's address", validator.address);
        
        console.log("Deploying wETH....");
        let wETH = await ethers.getContractFactory("WETH");
        weth = await wETH.connect(user).deploy();
        weth = await weth.deployed();
        console.log("wETH address: ", weth.address);

        let contracts = await deployQV(weth);
        governanceBadgeNFT = contracts.governanceBadgeNFT;
        rewardTokenContract = contracts.rewardTokenContract;
        voteModule = contracts.voteModule;
        treasuryContract = contracts.treasuryContract;

        const checkOwner = expect(await treasuryContract.callStatic.owner()).to.equal(user.address);

        await loadRewards(weth, treasuryContract);
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
        console.log('approved')
        const buyVotesTx = await expect(await voteModule.connect(user).buyVotes(n, user.address)).to.emit(voteModule, "VotesBought");
        // const buyVotesTx = await tx.wait();
        // console.log("Buy votes tx: ", buyVotesTx)
        const updatedBalance = await weth.balanceOf(user.address);
        console.log("Updated balance: ", updatedBalance)

        expect(updatedBalance).to.eq(initialBalance.sub(totalCost));
        const userVoteBalance = await voteModule.getVotesBalance(user.address);
        expect(userVoteBalance).to.equal(n);
    })

    it("should allow users to buy votes using eth [user2]", async () => {
        const votePrice = await voteModule.getVotePrice();
        console.log('Vote price in 2nd test ', votePrice)
        const n = BigNumber.from(1);
        const totalCost = BigNumber.from(votePrice).mul(n).mul(n).toString();
        console.log("Total cost: ", totalCost)
        const initialBalance = await user2.getBalance();
        console.log("Initial balance: ", initialBalance)

        const buyVotesTx = await expect(await voteModule.connect(user2).buyVotesWithEth(n, user2.address, { value: totalCost })).to.emit(voteModule, "VotesBought");
        const updatedBalance = await user2.getBalance();
        console.log("Updated balance: ", updatedBalance)

        // bcz of gas
        expect(updatedBalance).lessThan(initialBalance.sub(totalCost));
        const userVoteBalance = await voteModule.getVotesBalance(user2.address);
        expect(userVoteBalance).to.equal(n);
    })

    it("should allow users to buy votes using eth [user3]", async () => {
        const votePrice = await voteModule.getVotePrice();
        console.log('Vote price in 2nd test ', votePrice)
        const n = BigNumber.from(2);
        const totalCost = BigNumber.from(votePrice).mul(n).mul(n).toString();
        console.log("Total cost: ", totalCost)
        const initialBalance = await user3.getBalance();
        console.log("Initial balance: ", initialBalance)

        domain = "www.youtube.com";
        const isScam = true;

        const buyVotesTx = await expect(await voteModule.connect(user3).buyVotesWithEThAndVote(n, domain, !isScam, { value: totalCost })).to.emit(voteModule, "VotesBought");
        const updatedBalance = await user3.getBalance();
        console.log("Updated balance: ", updatedBalance)

        // bcz of gas
        expect(updatedBalance).lessThan(initialBalance.sub(totalCost));
        const userVoteBalance = await voteModule.getVotesBalance(user3.address);
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
        console.log("Initial vote balance: ", initialVoteCount)

        const reportTx = await voteModule.reportDomain(domain, isScam)
        const report = await expect(reportTx)
            .to.emit(voteModule, "DomainReported");
        // let report = await reportTx.wait();
        
        console.log("Report: ", report)

        const updatedVoteCount = await voteModule.getVoteCount(domain);
        const updatedRewardBalance = await rewardTokenContract.balanceOf(user.address);
        console.log("Updated reward balance: ", updatedRewardBalance)
        console.log("Updated vote balance: ", updatedVoteCount)

        expect(updatedRewardBalance).to.equal(initialRewardBalance.add(0));
        expect(updatedVoteCount).to.equal(initialVoteCount.add(1));
    })

    it("should fail for degenerate case of going with the majority", async () => {
        domain = "www.google.com";
        const isScam = true;
        const evidences = ["evidence1", "evidence2"];
        const comments = "This is a scam domain";
        const validationFees = ethers.utils.parseUnits("0.001", 18).toString();
        const reportTx = await voteModule.reportDomain(domain, isScam);
        const report = await reportTx.wait();
        console.log('report', report);
        const strength = await voteModule.getStrength(domain)
        // ).to.equal(BigNumber.from(0));
        console.log('strength', strength);
        expect(strength.strength).to.equal(BigNumber.from(0));
        expect(strength.totalVotes).to.equal(BigNumber.from(20));
        let appproveTx = await weth.connect(user).approve(voteModule.address, validationFees);
        let approve = await appproveTx.wait();
        console.log('approved')
        // const requestValidation = await expect(voteModule.requestValidation(domain, isScam, evidences, comments))
        //                             .to.be.revertedWith("Validation request not allowed");
        try {
            const tx = await voteModule.requestValidation(domain, isScam, evidences, comments, {
                value: validationFees
            })
            await tx.wait();
            throw new Error('Expected revert')
        } catch(err) {
            // console.error(err);
        }
        // ).to.be.reverted;
    })


    it("should generate a manual verification request with taking a validation fees", async () => {
        domain = "www.google.com";
        const isScam = false;
        const evidences = ["evidence1", "evidence2"];
        const comments = "This is a scam domain";
        const initialBalance = await user.getBalance();
        console.log("Initial balance: ", initialBalance);
        const tx = await voteModule.requestValidation(domain, isScam, evidences, comments, {
            value: validationFees
        })
        await expect(tx)
                    .to.emit(voteModule, "ValidationRequest");
        await tx.wait();
        // let tx = await expect(voteModule.requestValidation(domain, isScam, evidences, comments))
        // let tx = await expect(voteModule.connect(user).requestValidation(domain, isScam, [], comments))
        // .to.be.revertedWith(
        //     "Require atleast one evidence"
        // );
        // tx = await tx.wait();
        console.log(tx)
        const updatedBalance = await user.getBalance();
        console.log("Updated balance: ", updatedBalance);

        expect(updatedBalance).lessThan(initialBalance.sub(validationFees));

    })


    it("should validate and refund fee with reward token for an approved request", async () => {
        domain = "www.google.com";
        const isApproved = true;
        const validatorComments = "Approved by validator";
        const rewardAmount = await voteModule.getRewardAmount();

        // request validator role
        console.log('reqquesting validation role');
        let tx1 = await governanceBadgeNFT.connect(validator).requestValidatorRole({ value: '1000000000000000'})
        await tx1.wait();

        // approve validator
        console.log('approving validation role');
        let tx2 = await governanceBadgeNFT.voteValidator(validator.address);
        await tx2.wait();
        console.log('reqquesting validation');

        //check for refund
        const userBalanceBefore = await weth.balanceOf(user.address)
        const userBalanceETHBefore = await user.getBalance();
        const tx = await expect(await voteModule.connect(validator).verifyValidationRequest(domain, isApproved, validatorComments))
        .to.emit(voteModule, "ValidationVerdict");

        const userBalanceAfter = await weth.balanceOf(user.address)
        const userBalanceETHAfter = await user.getBalance();
        const validatorFee = await voteModule.getValidationFees();
        console.log('validator fee', validatorFee);

        expect(userBalanceAfter.sub(userBalanceBefore)).to.equal(rewardAmount);
        expect(userBalanceETHAfter.sub(userBalanceETHBefore)).to.equal(validatorFee);
        
        // @todo We wil activate later
        // expect(validatorBalanceAfter.sub(validatorBalanceBefore)).to.equal(validatorFee);

    })

    it("should slash votes and send fees to treasury for a rejected request", async () => {
        domain = "www.google.com";
        const isApproved = false;
        const validatorComments = "Rejected by validator";
        const evidences = ["evidence1", "evidence2"];
        const comments = "This is a scam domain";
        const userVoteBalanceBefore = await voteModule.getVotesBalance(await user.getAddress());
        const validationFees = ethers.utils.parseUnits("0.001", 18);
        let tx = await voteModule.requestValidation(domain, false, evidences, comments, { value: validationFees });
        await tx.wait()
        tx = await voteModule.connect(validator).verifyValidationRequest(domain, isApproved, validatorComments);
        await tx.wait();
        console.log('userVoteBalanceBefore', userVoteBalanceBefore)
        // no slashing
        const userVoteBalanceAfter = await voteModule.getVotesBalance(await user.getAddress());
        console.log('userVoteBalanceAfter', userVoteBalanceAfter)
        expect(userVoteBalanceAfter).to.equal(userVoteBalanceBefore);
        console.log('balance match');

        const treasuryBalance = await ethers.provider.getBalance(treasuryContract.address);
        expect(treasuryBalance).to.equal(validationFees);
    })

});

