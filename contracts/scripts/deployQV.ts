import { ethers } from "hardhat";
import { deployQV, loadRewards } from "./deployQVLib";


async function run() {

    let WETH = await ethers.getContractFactory("WETH");
    let weth = await ethers.getContractAt('WETH', "0x4200000000000000000000000000000000000006")

    let contracts = await deployQV(weth, "0.00001", "0.000012", "0.000015");
    let governanceBadgeNFT = contracts.governanceBadgeNFT;
    let rewardTokenContract = contracts.rewardTokenContract;
    let voteModule = contracts.voteModule;
    let treasuryContract = contracts.treasuryContract;

    console.log('deployed contracts')

    await loadRewards(weth, treasuryContract, "0.0005", "0.0005");
}

run();