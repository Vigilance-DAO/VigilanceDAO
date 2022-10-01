// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { expect } from "chai";
// import { Contract } from "ethers";
// import { ethers, upgrades } from "hardhat";
// import './fetch-polyfills'
// import { connect, Connection } from "@tableland/sdk";

// describe("GovernanceBadge NFT", function () {
//     let governanceBadgeNFT: Contract;
//     let superAdmin: SignerWithAddress;
//     let secondAdmin: SignerWithAddress;
//     let validatorAddress: SignerWithAddress;

//     before(async () => {
//         let result = await ethers.getSigners()
//         superAdmin = result[0]
//         secondAdmin = result[1]
//         validatorAddress = result[2]

//         let GovernanceBadgeNFT = await ethers.getContractFactory('GovernanceBadgeERC1155')
//         governanceBadgeNFT = await upgrades.deployProxy(GovernanceBadgeNFT, [
//             "Vigilance DAO",
//             "VIGI-NFT",
//             "uri"
//         ]);
//         await governanceBadgeNFT.deployed()
//         console.log('governanceBadgeNFT address: ', governanceBadgeNFT.address)
//         console.log({owner: await governanceBadgeNFT.callStatic.owner()})
//     })

//     it("check super admin NFT", async () => {
//         let bal = await governanceBadgeNFT.callStatic.balanceOf(superAdmin.address, 1);
//         console.log({bal})
//         expect(bal, "Expected NFT balanace to be 1").to.eq(1)
//     })

//     it("Request validation", async () => {
//         let stakingAmount = await governanceBadgeNFT.callStatic.stakingAmount();
//         console.log({stakingAmount})
//         let tx = await governanceBadgeNFT.connect(validatorAddress).requestValidatorRole({value: stakingAmount});
//         await tx.wait()
//         let validationRequestStake = await governanceBadgeNFT.callStatic.validationRequests(validatorAddress.address)
//         console.log({validationRequestStake, address: validatorAddress.address})
//         expect(validationRequestStake.toString(), "Expected stake to be correct").to.eq(stakingAmount.toString())
//     })

//     // it("revoke validation", async () => {
//     //     let tx = await governanceBadgeNFT.connect(validatorAddress).revokeValidationRequest();
//     //     await tx.wait()
//     //     let validationRequestStake = await governanceBadgeNFT.callStatic.validationRequests(validatorAddress.address)
//     //     console.log({validationRequestStake, address: validatorAddress.address})
//     //     expect(validationRequestStake.toString(), "Expected stake to be correct").to.eq('0')
//     // })

//     it("set governor", async () => {
//         let tx = await governanceBadgeNFT.setGovernor(secondAdmin.address);
//         await tx.wait()
//         let bal = await governanceBadgeNFT.callStatic.balanceOf(secondAdmin.address, 0);
//         console.log({bal})
//         expect(bal, "Expected NFT balanace to be 1").to.eq(1)
//     })

//     it("vote validator", async () => {
//         let tx = await governanceBadgeNFT.voteValidator(validatorAddress.address);
//         await tx.wait()
//         let tx2 = await governanceBadgeNFT.connect(secondAdmin).voteValidator(validatorAddress.address);
//         await tx2.wait()
//         let bal = await governanceBadgeNFT.callStatic.balanceOf(validatorAddress.address, 1);
//         console.log({bal})
//         expect(bal, "Expected NFT balanace to be 1").to.eq(1)
//     })

//     it("remove validator", async () => {
//         let tx = await governanceBadgeNFT.removeValidator(validatorAddress.address);
//         await tx.wait()
//         let bal = await governanceBadgeNFT.callStatic.balanceOf(validatorAddress.address, 1);
//         console.log({bal})
//         expect(bal, "Expected NFT balanace to be 0").to.eq(0)
//     })

//     it("remove governor", async () => {
//         let tx = await governanceBadgeNFT.removeGovernor(secondAdmin.address);
//         await tx.wait()
//         let bal = await governanceBadgeNFT.callStatic.balanceOf(secondAdmin.address, 0);
//         console.log({bal})
//         expect(bal, "Expected NFT balanace to be 0").to.eq(0)
//     })

//     it("change stake amount", async () => {
//         let newStakeAmount = ethers.utils.parseUnits('10')
//         console.log({newStakeAmount})
//         let tx = await governanceBadgeNFT.setStakingAmount(newStakeAmount.toString());
//         await tx.wait()
//         let stakingAmount = await governanceBadgeNFT.callStatic.stakingAmount();
//         expect(stakingAmount.toString(), "Stake amount not as expected").to.eq(newStakeAmount.toString())
//     })

//     it("change minimum votes", async () => {
//         let newMinVotes = 10
//         console.log({newMinVotes})
//         let tx = await governanceBadgeNFT.setMinVotes(newMinVotes.toString());
//         await tx.wait()
//         let minVotes = await governanceBadgeNFT.callStatic.minVotes();
//         expect(minVotes.toString(), "min votes not as expected").to.eq(newMinVotes.toString())
//     })

    
// });
