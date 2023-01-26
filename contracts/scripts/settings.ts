import { ethers } from "hardhat";

async function run() {
    let result = await ethers.getSigners()
    let governanceAddress = "0x745C90B16e960D5AD5bF1646f5d9deF1dFc2Fdbf"
    console.log(result[0].address)
    async function setReportStakingAmount() {
        let amount = 0.01

        let amountWei = ethers.utils.parseEther(amount + '')
        console.log(amountWei.toString())

        let reportContractAddr = '0x68Db62ADCaADdb21cB000841f1F347A6d8bEED9b'
        let reportContract = await ethers.getContractAt('ReportDomain', reportContractAddr, result[0])
        const tx = await reportContract.setStakingAmount(amountWei.toString())
        console.log(tx.hash)
        await tx.wait()
    }

    async function setMinVotes() {
        let reportContract = await ethers.getContractAt('GovernanceBadgeNFT', governanceAddress, result[0])
        const tx = await reportContract.setMinVotes(1)
        console.log(tx.hash)
        await tx.wait()
        console.log('done')
    }

    async function voteValidator() {
        let wallet = "0x6426114c0C3531D90Ed8B9f7c09A0dc115F4aaee"
        let contract = await ethers.getContractAt('GovernanceBadgeNFT', governanceAddress, result[0])
        const tx = await contract.voteValidator(wallet)
        console.log(tx.hash)
        await tx.wait()
        console.log('done')
    }

    async function setValidatorStakingAmount() {
        let amount = 0.01
        let amountWei = ethers.utils.parseEther(amount + '')
        console.log(amountWei.toString())
        let contract = await ethers.getContractAt('GovernanceBadgeNFT', governanceAddress, result[0])
        const tx = await contract.setStakingAmount(amountWei.toString())
        console.log(tx.hash)
        await tx.wait()
        console.log('done')
    }

    // await setStakingAmount()
    // await setMinVotes()
    await voteValidator()
    // setValidatorStakingAmount()
}

run()