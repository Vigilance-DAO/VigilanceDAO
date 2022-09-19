import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import './fetch-polyfills'

describe("ReportDomain", function () {
    let governanceBadgeNFT: Contract;
    let reportDomain: Contract;
    let token: Contract;
    let superAdmin: SignerWithAddress;
    let secondAdmin: SignerWithAddress;
    let reportImplementationAddress: string;

    before(async () => {
    
        let result = await ethers.getSigners()
        superAdmin = result[0]
        secondAdmin = result[1]
        console.log(superAdmin.address)

        let Token = await ethers.getContractFactory('Token')
        token = await upgrades.deployProxy(Token, [
            "Vigilance Token",
            "VIGI"
        ], {timeout: 180000});
        await token.deployed()
        console.log('token address: ', token.address)

        let GovernanceBadgeNFT = await ethers.getContractFactory('GovernanceBadgeERC1155')
        governanceBadgeNFT = await upgrades.deployProxy(GovernanceBadgeNFT, [
            "Vigilance DAO",
            "VIGI-NFT",
            "uri"
        ], {timeout: 180000});
        await governanceBadgeNFT.deployed()
        console.log('governanceBadgeNFT address: ', governanceBadgeNFT.address)

        let polygonTestnetAddress = "0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68"
        let ReportDomain = await ethers.getContractFactory('ReportDomain')
        reportDomain = await upgrades.deployProxy(ReportDomain, [
            governanceBadgeNFT.address,
            token.address,
            polygonTestnetAddress
        ], {timeout: 180000});
        await reportDomain.deployed()
        
        reportImplementationAddress = await upgrades.erc1967.getImplementationAddress(reportDomain.address);

        console.log('reportDomain address: ', reportDomain.address)

        let tx = await token.transferOwnership(reportDomain.address)
        await tx.wait()
    })

    // it("validate with no ID", async () => {
    //     try {
    //         let tx = await reportDomain.validate(100, true, "")
    //         await tx.wait()
    //     } catch(err: any) {
    //         return expect(err.message.includes('Case doesnt exist'))
    //     }
    //     throw new Error('Validation should have failed')
    // })
    
    // it("report (ACCEPT)", async () => {
    //     let domain = 'google.com'
    //     let isScam = true
    //     let evidences = ['scd', 'sdvsdv']
    //     let comments = 'sdasbvf'
    //     let stakingAmount = await reportDomain.callStatic.stakingAmount();
    //     console.log('stakingAmount: ', stakingAmount.toString())
    //     let reportID = await reportDomain.callStatic.report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
    //     let tx = await reportDomain.connect(secondAdmin).report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
    //     await tx.wait()
        

    //     let isReported = await reportDomain.callStatic.isReported(domain, isScam)
    //     expect(isReported, "is reported scam should be true").to.eq(true)

    //     let isReported2 = await reportDomain.callStatic.isReported(domain, !isScam)
    //     expect(isReported2, "is reported legit should be false").to.eq(false)

        
    //     let lockedAmount = await reportDomain.lockedAmount()
    //     expect(lockedAmount.toString(), "incorrect lockek amount").to.eq(stakingAmount.toString())
        
    //     let initialBal = await secondAdmin.provider?.getBalance(secondAdmin.address)
    //     console.log('secondAdmin before', {initialBal: ethers.utils.formatEther(initialBal?.toString() || '0').toString()})

    //     let balance = await reportDomain.getBalance()
    //     expect(balance.toString(), "Balance should be 5ETH").to.eq(stakingAmount.toString());
    //     console.log({balance})

    //     tx = await reportDomain.validate(reportID, true, "my comments")
    //     await tx.wait()
    //     console.log("validated")
    //     lockedAmount = await reportDomain.lockedAmount()
    //     expect(lockedAmount.toString(), "incorrect locked amount").to.eq('0')
    //     console.log("locked amount is 0")
    //     balance = await reportDomain.getBalance()
    //     expect(balance?.toString(), "Balance should be 0").to.eq('0');
    //     console.log("balance is 0")
    //     let afterBal = await secondAdmin.provider?.getBalance(secondAdmin.address)
    //     console.log('secondAdmin after', {afterBal: ethers.utils.formatEther(afterBal?.toString() || '0').toString()})
    //     expect(afterBal?.toString(), 'second admin should have +5').to.eq(initialBal?.add(stakingAmount).toString())

    //     let tokenBal = await token.balanceOf(secondAdmin.address)
    //     let reward = await reportDomain.reward();
    //     console.log({tokenBal})
    //     expect(tokenBal.toString(), 'Should be rewarded').to.eq(reward.toString())
    // })

    // it("report (REJECT)", async () => {
    //     let domain = 'google.com'
    //     let isScam = false
    //     let evidences = ['scd', 'sdvsdv']
    //     let comments = 'sdasbvf'
    //     let stakingAmount = await reportDomain.callStatic.stakingAmount()
    //     let reportID = await reportDomain.callStatic.report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
    //     let tx = await reportDomain.connect(secondAdmin).report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})
    //     await tx.wait()

    //     let isReported = await reportDomain.callStatic.isReported(domain, isScam)
    //     expect(isReported, "is reported legit should be true").to.eq(true)

    //     let isReported2 = await reportDomain.callStatic.isReported(domain, !isScam)
    //     expect(isReported2, "is reported scam should be false").to.eq(false)

    //     let lockedAmount = await reportDomain.lockedAmount()
    //     expect(lockedAmount.toString(), "incorrect lockek amount").to.eq(stakingAmount.toString())
        
    //     let initialBal = await secondAdmin.provider?.getBalance(secondAdmin.address)
    //     console.log('secondAdmin before', {initialBal: ethers.utils.formatEther(initialBal?.toString() || '0').toString()})

    //     let balance = await reportDomain.getBalance()
    //     console.log({balance})
    //     expect(balance.toString(), "Balance should be 5ETH").to.eq(stakingAmount.toString());

    //     tx = await reportDomain.validate(reportID, false, "my comments")
    //     await tx.wait()

    //     lockedAmount = await reportDomain.lockedAmount()
    //     expect(lockedAmount.toString(), "incorrect lockek amount").to.eq('0') // lock released

    //     balance = await reportDomain.getBalance()
    //     expect(balance?.toString(), "Balance should be 0").to.eq('0');

    //     let afterBal = await secondAdmin.provider?.getBalance(secondAdmin.address)
    //     console.log('secondAdmin after', {afterBal: ethers.utils.formatEther(afterBal?.toString() || '0').toString()})
    //     expect(afterBal?.toString(), 'second admin should have +5').to.eq(initialBal?.toString())

    //     // token bal remains same as before
    //     let tokenBal = await token.balanceOf(secondAdmin.address)
    //     let reward = await reportDomain.reward();
    //     console.log({tokenBal})
    //     expect(tokenBal.toString(), 'Should be rewarded').to.eq(reward.toString())
    // })

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
        await expect(reportDomain.connect(secondAdmin).report(domain, isScam, evidences, comments, {value: stakingAmount.toString()})).to.be.revertedWith("Is Legit report already filed");
        
    })

});
