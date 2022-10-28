import { ethers } from "hardhat";

async function run() {
    let result = await ethers.getSigners()
    console.log(result[0].address)
    async function setStakingAmount() {
        let amount = 0.01

        let amountWei = ethers.utils.parseEther(amount + '')
        console.log(amountWei.toString())

        let reportContractAddr = '0x68Db62ADCaADdb21cB000841f1F347A6d8bEED9b'
        let reportContract = await ethers.getContractAt('ReportDomain', reportContractAddr, result[0])
        const tx = await reportContract.setStakingAmount(amountWei.toString())
        console.log(tx.hash)
        await tx.wait()
    }

    let 
        let wallet = "0x625B892f34ACA436e1525e5405A8fb81eC5cc04d"
    // await setStakingAmount()
}

run()