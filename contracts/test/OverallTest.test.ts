import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import './fetch-polyfills'

describe("Overall testing", function () {
    let governanceBadgeNFT: Contract;
    let reportDomain: Contract;
    let token: Contract;
    let treasury: Contract;
    let superAdmin: SignerWithAddress;
    let secondAdmin: SignerWithAddress;
    let validatorAddress: SignerWithAddress;
    let userAddress: SignerWithAddress;
    let reportImplementationAddress: string;

    before(async () => {
    
        let result = await ethers.getSigners()
        superAdmin = result[0]
        secondAdmin = result[1]
        validatorAddress = result[2]
        userAddress = result[3]
        console.log(superAdmin.address)

        let GovernanceBadgeNFT = await ethers.getContractFactory('GovernanceBadgeERC1155')
        governanceBadgeNFT = await upgrades.deployProxy(GovernanceBadgeNFT, [
            "Vigilance DAO",
            "VIGI-NFT",
            "uri"
        ], {timeout: 180000});
        await governanceBadgeNFT.deployed()
        console.log('governanceBadgeNFT address: ', governanceBadgeNFT.address)

        let Token = await ethers.getContractFactory('Token')
        token = await upgrades.deployProxy(Token, [
            "Vigilance Token",
            "VIGI",
        ], {timeout: 180000});
        await token.deployed()
        console.log('token address: ', token.address)

        let Treasury = await ethers.getContractFactory('Treasury')
        treasury = await upgrades.deployProxy(Treasury)
        await treasury.deployed()
        console.log('treasury address: ', treasury.address)

        let ReportDomain = await ethers.getContractFactory('ReportDomain')
        reportDomain = await upgrades.deployProxy(ReportDomain, [
            governanceBadgeNFT.address,
            token.address,
            treasury.address,
        ], {timeout: 180000});
        await reportDomain.deployed()
        
        reportImplementationAddress = await upgrades.erc1967.getImplementationAddress(reportDomain.address);

        console.log('reportDomain address: ', reportDomain.address)

        let tx = await token.transferOwnership(reportDomain.address)
        await tx.wait()
    })

    it("set governor", async () => {
        let tx = await governanceBadgeNFT.setGovernor(secondAdmin.address);
        await tx.wait()
        let bal = await governanceBadgeNFT.callStatic.balanceOf(secondAdmin.address, 0);
        console.log({bal})
        expect(bal, "Expected NFT balanace to be 1").to.eq(1)
    })


    it("Request validator role", async () => {
        let stakingAmount = await governanceBadgeNFT.callStatic.stakingAmount();
        console.log({stakingAmount})
        let tx = await governanceBadgeNFT.connect(validatorAddress).requestValidatorRole({value: stakingAmount});
        await tx.wait()
        let validationRequestStake = await governanceBadgeNFT.callStatic.validationRequests(validatorAddress.address)
        console.log({validationRequestStake, address: validatorAddress.address})
        expect(validationRequestStake.toString(), "Expected stake to be correct").to.eq(stakingAmount.toString())
    })

    it("vote validator", async () => {
        let tx = await governanceBadgeNFT.voteValidator(validatorAddress.address);
        await tx.wait()
        let tx2 = await governanceBadgeNFT.connect(secondAdmin).voteValidator(validatorAddress.address);
        await tx2.wait()
        let bal = await governanceBadgeNFT.callStatic.balanceOf(validatorAddress.address, 1);
        console.log({bal})
        expect(bal, "Expected NFT balanace to be 1").to.eq(1)
    })


    it("report (ACCEPT)", async () => {
        let domain = 'google.com'
        let isScam = true
        let evidences = ['scd', 'sdvsdv']
        let comments = 'sdasbvf'
        let stakingAmount = await reportDomain.callStatic.stakingAmount();
        console.log('stakingAmount: ', stakingAmount.toString())
        let reportID = await reportDomain.callStatic.report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
        let tx = await reportDomain.connect(userAddress).report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
        await tx.wait()
        

        let isReported = await reportDomain.callStatic.isReported(domain, isScam)
        expect(isReported, "is reported scam should be true").to.eq(true)

        let isReported2 = await reportDomain.callStatic.isReported(domain, !isScam)
        expect(isReported2, "is reported legit should be false").to.eq(false)

        
        let lockedAmount = await reportDomain.lockedAmount()
        expect(lockedAmount.toString(), "incorrect lockek amount").to.eq(stakingAmount.toString())
        
        let initialBal = await userAddress.provider?.getBalance(userAddress.address)
        console.log('secondAdmin before', {initialBal: ethers.utils.formatEther(initialBal?.toString() || '0').toString()})

        let balance = await reportDomain.getBalance()
        expect(balance.toString(), "Balance should be 5ETH").to.eq(stakingAmount.toString());
        console.log({balance})

        tx = await reportDomain.connect(validatorAddress).validate(reportID, true, "my comments")
        await tx.wait()
        console.log("validated")

        lockedAmount = await reportDomain.lockedAmount()
        expect(lockedAmount.toString(), "incorrect locked amount").to.eq('0')
        console.log("locked amount is 0")

        balance = await reportDomain.getBalance()
        expect(balance?.toString(), "Balance should be 0").to.eq('0');
        console.log("balance is 0")

        let afterBal = await userAddress.provider?.getBalance(userAddress.address)
        console.log('secondAdmin after', {afterBal: ethers.utils.formatEther(afterBal?.toString() || '0').toString()})
        expect(afterBal?.toString(), 'second admin should have +5').to.eq(initialBal?.add(stakingAmount).toString())

        let tokenBal = await token.balanceOf(userAddress.address)
        let reward = await reportDomain.reward();
        console.log({tokenBal})
        expect(tokenBal.toString(), 'Should be rewarded').to.eq(reward.toString())
    })

    it("report (REJECT)", async () => {
        let domain = 'google.com'
        let isScam = false
        let evidences = ['scd', 'sdvsdv']
        let comments = 'sdasbvf'
        let stakingAmount = await reportDomain.callStatic.stakingAmount()
        let reportID = await reportDomain.callStatic.report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
        let tx = await reportDomain.connect(userAddress).report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
        await tx.wait()

        let isReported = await reportDomain.callStatic.isReported(domain, isScam)
        expect(isReported, "is reported legit should be true").to.eq(true)

        let isReported2 = await reportDomain.callStatic.isReported(domain, !isScam)
        expect(isReported2, "is reported scam should be false").to.eq(false)

        let lockedAmount = await reportDomain.lockedAmount()
        expect(lockedAmount.toString(), "incorrect locked amount").to.eq(stakingAmount.toString())
        

        let balance = await reportDomain.getBalance()
        console.log({balance})
        expect(balance.toString(), "Balance should be 5ETH").to.eq(stakingAmount.toString());

        tx = await reportDomain.connect(validatorAddress).validate(reportID, false, "my comments")
        await tx.wait()
        console.log("validated")

        lockedAmount = await reportDomain.lockedAmount()
        expect(lockedAmount.toString(), "incorrect locked amount").to.eq('0') // lock released

        balance = await reportDomain.getBalance()
        expect(balance?.toString(), "Balance should be 0").to.eq('0');

        balance = await treasury.getBalance();
        expect(balance.toString(), "Balance should be 5ETH").to.eq(stakingAmount.toString());


        // token bal remains same as before
        let tokenBal = await token.balanceOf(userAddress.address)
        let reward = await reportDomain.reward();
        console.log({tokenBal})
        expect(tokenBal.toString(), 'Should be rewarded').to.eq(reward.toString())
    })

    it("report on same domain", async () => {
        let domain = 'google.com'
        let isScam = false
        let evidences = ['scd', 'sdvsdv']
        let comments = 'sdasbvf'
        let stakingAmount = await reportDomain.callStatic.stakingAmount()
        let tx = await reportDomain.connect(secondAdmin).report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
        await tx.wait()

        let isReported = await reportDomain.callStatic.isReported(domain, isScam)
        expect(isReported, "is reported legit should be true").to.eq(true)

        let isReported2 = await reportDomain.callStatic.isReported(domain, !isScam)
        expect(isReported2, "is reported scam should be false").to.eq(false)


        await expect(reportDomain.connect(secondAdmin).callStatic.report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})).to.be.revertedWith("Is Legit report already filed");
        await expect(reportDomain.connect(secondAdmin).callStatic.report(domain, !isScam, evidences, comments, {value: stakingAmount.toString()})).to.be.revertedWith("You already reported it as legit");
        tx = await reportDomain.report(domain, !isScam, evidences, comments, {value: stakingAmount.toString()})
        await tx.wait()
        console.log("reported again")
        await expect(reportDomain.callStatic.report(domain, !isScam, evidences, comments, {value: stakingAmount.toString()})).to.be.revertedWith("Is Scam report already filed");
        await expect(reportDomain.callStatic.report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})).to.be.revertedWith("Is Legit report already filed");

    })

    it("change Reward", async () => {
        let reward = await reportDomain.reward();
        console.log({reward})
        let tx = await reportDomain.setReportReward(reward.add(100))
        await tx.wait()
        let newReward = await reportDomain.reward();
        console.log({newReward})
        expect(newReward.toString(), "reward should be +1").to.eq(reward.add(100).toString())
    })

    it("reward contributors", async () => {
        let tx = await reportDomain.rewardContributors(secondAdmin.address,ethers.BigNumber.from(""+10**18))
        await tx.wait()
        let tokenBal = await token.balanceOf(secondAdmin.address)
        console.log({tokenBal})
        expect(tokenBal.toString(), 'Should be rewarded').to.eq(((10**18)).toString())
    })

    it("remove validator", async () => {
        let tx = await governanceBadgeNFT.removeValidator(validatorAddress.address);
        await tx.wait()
        let bal = await governanceBadgeNFT.callStatic.balanceOf(validatorAddress.address, 1);
        console.log({bal})
        expect(bal, "Expected NFT balanace to be 0").to.eq(0)
    })

    it("remove governor", async () => {
        let tx = await governanceBadgeNFT.removeGovernor(secondAdmin.address);
        await tx.wait()
        let bal = await governanceBadgeNFT.callStatic.balanceOf(secondAdmin.address, 0);
        console.log({bal})
        expect(bal, "Expected NFT balanace to be 0").to.eq(0)
    })


    it("send matic" , async () => {
        let balance =await treasury.getBalance();
        console.log({balance})

        let initialBal = await userAddress.provider?.getBalance(userAddress.address)
        console.log('secondAdmin before', {initialBal: ethers.utils.formatEther(initialBal?.toString() || '0').toString()})

        let tx = await treasury.sendMatic(userAddress.address,balance)
        await tx.wait()

        let afterBal = await userAddress.provider?.getBalance(userAddress.address)
        console.log('secondAdmin after', {afterBal: ethers.utils.formatEther(afterBal?.toString() || '0').toString()})
        expect(afterBal?.toString(), 'second admin should have +5').to.eq(initialBal?.add(balance).toString())
    })

    it("send tokens" , async () => {

        let tx = await reportDomain.rewardContributors(treasury.address,ethers.BigNumber.from(""+10**18));
        await tx.wait()
        let balance = await token.balanceOf(treasury.address)
        console.log({balance})

        let initialBal = await token.balanceOf(userAddress.address)
        console.log('secondAdmin before', {initialBal: ethers.utils.formatEther(initialBal?.toString() || '0').toString()})

        tx = await treasury.sendERC20(token.address,userAddress.address,balance)
        await tx.wait()

        let afterBal = await token.balanceOf(userAddress.address)
        console.log('secondAdmin after', {afterBal: ethers.utils.formatEther(afterBal?.toString() || '0').toString()})
        expect(afterBal?.toString(), 'second admin should have +5').to.eq(initialBal?.add(balance).toString())
    })
})