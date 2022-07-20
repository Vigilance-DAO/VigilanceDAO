import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import './fetch-polyfills'
import { connect, Connection } from "@tableland/sdk";

describe("ReportDomain", function () {
    let governanceBadgeNFT: Contract;
    let reportDomain: Contract;
    let token: Contract;
    let superAdmin: SignerWithAddress;
    let secondAdmin: SignerWithAddress;
    let tableland: Connection;

    before(async () => {
        // tableland = await connect({ network: "custom", host: 'http://localhost:8545', contract: '0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68', chain: 'custom', chainId: 200});
    
        let result = await ethers.getSigners()
        superAdmin = result[0]
        secondAdmin = result[1]
        console.log(superAdmin.address)

        let Token = await ethers.getContractFactory('Token')
        token = await upgrades.deployProxy(Token, [
            "Vigilance Token",
            "VIGI"
        ]);
        await token.deployed()
        console.log('token address: ', token.address)

        let GovernanceBadgeNFT = await ethers.getContractFactory('GovernanceBadgeERC1155')
        governanceBadgeNFT = await upgrades.deployProxy(GovernanceBadgeNFT, [
            "Vigilance DAO",
            "VIGI-NFT",
            "uri"
        ]);
        await governanceBadgeNFT.deployed()
        console.log('governanceBadgeNFT address: ', governanceBadgeNFT.address)

        let polygonTestnetAddress = "0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68"
        let ReportDomain = await ethers.getContractFactory('ReportDomain')
        reportDomain = await upgrades.deployProxy(ReportDomain, [
            governanceBadgeNFT.address,
            token.address,
            polygonTestnetAddress
        ]);
        await reportDomain.deployed()
        
        console.log('reportDomain address: ', reportDomain.address)
    })

    it("report", async () => {
        let domain = 'google.com'
        let isScam = true
        let evidences = ['scd', 'sdvsdv']
        let comments = 'sdasbvf'
        let tx = await reportDomain.report(domain, isScam, evidences, comments)
        await tx.wait()
        let tableName = (await reportDomain.callStatic.metadataTable())
        console.log(tableName)
        // console.log(tableland)
        // const readRes = await tableland.read(`SELECT * FROM ${tableName};`);
        // console.log(readRes)
    })
});
