import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import './fetch-polyfills'

describe("Overall testing", function () {
    let signedMultiCall: Contract;
    let token: Contract;
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

        let Token = await ethers.getContractFactory('Token')
        token = await upgrades.deployProxy(Token, [
            "Vigilance Token",
            "VIGI",
        ], {timeout: 180000});
        await token.deployed()
        console.log('token address: ', token.address)

        let SignedMultiCall = await ethers.getContractFactory('SignedMultiCall')
        signedMultiCall = await upgrades.deployProxy(SignedMultiCall, [
        ], {timeout: 180000});
        await signedMultiCall.deployed()
        
        console.log('signedMultiCall address: ', signedMultiCall.address)
    })

    it("Test token transfer", async function () {
        const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", superAdmin.provider);

        let amount = ethers.utils.parseEther('1')
        let tx1 = await token.reward(superAdmin.address, amount)
        await tx1.wait()
        let balance = await token.balanceOf(superAdmin.address)
        expect(balance.toString()).to.equal(amount.toString())

        let data = token.interface.encodeFunctionData('transfer', [secondAdmin.address, amount])
        const txData = {
            to: token.address,
            value: 0,
            nonce: await wallet.getTransactionCount(),
            data
        };
        // const unsignedTx = ethers.utils.parseTransaction(txData);

        const signedTx = await wallet.signTransaction(txData);
        const tx = ethers.utils.parseTransaction(signedTx);

        console.log(signedTx)

        let tx2 = await signedMultiCall.broadcastTransaction(token.address, signedTx)
        await tx2.wait()

        
        let balance2 = await token.balanceOf(secondAdmin.address)
        expect(balance2.toString()).to.equal(amount.toString())
    })

})