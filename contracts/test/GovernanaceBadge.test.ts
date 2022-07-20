import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import './fetch-polyfills'
import { connect, Connection } from "@tableland/sdk";

describe("GovernanceBadge NFT", function () {
    let governanceBadgeNFT: Contract;
    let superAdmin: SignerWithAddress;
    let secondAdmin: SignerWithAddress;

    before(async () => {
        let result = await ethers.getSigners()
        superAdmin = result[0]
        secondAdmin = result[1]

        let GovernanceBadgeNFT = await ethers.getContractFactory('GovernanceBadgeERC1155')
        governanceBadgeNFT = await upgrades.deployProxy(GovernanceBadgeNFT, [
            "Vigilance DAO",
            "VIGI-NFT",
            "uri"
        ]);
        await governanceBadgeNFT.deployed()
        console.log('governanceBadgeNFT address: ', governanceBadgeNFT.address)
        console.log({owner: await governanceBadgeNFT.callStatic.owner()})
    })

    it("check super admin NFT", async () => {
        let bal = await governanceBadgeNFT.callStatic.balanceOf(superAdmin.address, 0);
        console.log({bal})
        expect(bal, "Expected NFT balanace to be 1").to.eq(1)
    })

    it("Request validation", async () => {
        let stakingAmount = await governanceBadgeNFT.callStatic.stakingAmount();
        console.log({stakingAmount})
        let tx = await governanceBadgeNFT.connect(secondAdmin).requestValidatorRole({value: stakingAmount});
        await tx.wait()
        let validationRequestStake = await governanceBadgeNFT.callStatic.validationRequests(secondAdmin.address)
        console.log({validationRequestStake, address: secondAdmin.address})
        expect(validationRequestStake.toString(), "Expected stake to be correct").to.eq(stakingAmount.toString())
    })

    it("set validator", async () => {
        let tx = await governanceBadgeNFT.setValidator(secondAdmin.address);
        await tx.wait()
        let bal = await governanceBadgeNFT.callStatic.balanceOf(secondAdmin.address, 0);
        console.log({bal})
        expect(bal, "Expected NFT balanace to be 1").to.eq(1)
    })

    it("remove validator", async () => {
        let tx = await governanceBadgeNFT.removeValidator(secondAdmin.address);
        await tx.wait()
        let bal = await governanceBadgeNFT.callStatic.balanceOf(secondAdmin.address, 0);
        console.log({bal})
        expect(bal, "Expected NFT balanace to be 0").to.eq(0)
    })

    it("change stake amount", async () => {
        let newStakeAmount = ethers.utils.parseUnits('10')
        console.log({newStakeAmount})
        let tx = await governanceBadgeNFT.setStakingAmount(newStakeAmount.toString());
        await tx.wait()
        let stakingAmount = await governanceBadgeNFT.callStatic.stakingAmount();
        expect(stakingAmount.toString(), "Stake amount not as expected").to.eq(newStakeAmount.toString())
    })

    it("Request validation", async () => {
        let stakingAmount = await governanceBadgeNFT.callStatic.stakingAmount();
        console.log({stakingAmount})
        let tx = await governanceBadgeNFT.connect(secondAdmin).requestValidatorRole({value: stakingAmount});
        await tx.wait()
        let validationRequestStake = await governanceBadgeNFT.callStatic.validationRequests(secondAdmin.address)
        console.log({validationRequestStake, address: secondAdmin.address})
        expect(validationRequestStake.toString(), "Expected stake to be correct").to.eq(stakingAmount.toString())
    })

    it("remove validation", async () => {
        let tx = await governanceBadgeNFT.connect(secondAdmin).revokeValidationRequest();
        await tx.wait()
        let validationRequestStake = await governanceBadgeNFT.callStatic.validationRequests(secondAdmin.address)
        console.log({validationRequestStake, address: secondAdmin.address})
        expect(validationRequestStake.toString(), "Expected stake to be correct").to.eq('0')
    })
});
