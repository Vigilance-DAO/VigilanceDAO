import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";

export async function deployQV(weth: Contract, votePriceEther = "0.001", validationFeesEther = "0.001", rewardAmountEther = "1") {
    let signers = await ethers.getSigners();
    const user = signers[0];

    console.log("Deploying GovernanceBadgeNFT....")
    let GovernanceBadgeNFT = await ethers.getContractFactory("GovernanceBadgeNFT");
    let governanceBadgeNFT = await upgrades.deployProxy(
        GovernanceBadgeNFT,
        ["Vigilance DAO", "VIGI-NFT", "uri", '1000000000000000', 1],
        { timeout: 180000 }
    );
    await governanceBadgeNFT.deployed();
    console.log("governanceBadgeNFT address: ", governanceBadgeNFT.address);

    console.log("Deploying Treasury....")
    let treasury = await ethers.getContractFactory("Treasury");
    let treasuryContract = await upgrades.deployProxy(treasury, []);
    treasuryContract = await treasuryContract.deployed();
    console.log("treasuryContract address: ", treasuryContract.address)

    console.log("Deploying RewardToken....")
    let rewardToken = await ethers.getContractFactory("RewardToken");
    let rewardTokenContract = await upgrades.deployProxy(rewardToken, [
        weth.address,
        "Vote Token",
        "VDV",
    ]);
    rewardTokenContract = await rewardTokenContract.deployed();
    console.log("rewardTokenContract address: ", rewardTokenContract.address);

    const votePrice = ethers.utils.parseUnits(votePriceEther, 18);
    const validationFees = ethers.utils.parseUnits(validationFeesEther, 18).toString();
    const rewardAmount = ethers.utils.parseUnits(rewardAmountEther, 18).toString();

    console.log("Deploying VoteModule....")
    const VoteModule = await ethers.getContractFactory("VoteModule");
    let voteModule = await VoteModule.deploy(
        governanceBadgeNFT.address,
        votePrice,
        validationFees,
        rewardTokenContract.address,
        rewardAmount,
        treasuryContract.address,
        weth.address
    )
    voteModule = await voteModule.deployed();
    console.log("voteModule address: ", voteModule.address);

    console.log("Setting vote module in treasury, reward token and vote token....")
    const setVoteModuleInTreasury = await treasuryContract.setVoteModulesContract(voteModule.address);
    await setVoteModuleInTreasury.wait();


    const setVoteModuleInRT = await await rewardTokenContract.setVoteModulesContract(voteModule.address);
    await setVoteModuleInRT.wait();

    console.log("Setting complete")

    return {
        treasuryContract,
        voteModule,
        rewardTokenContract,
        governanceBadgeNFT
    }
}

export async function loadRewards(weth: Contract, treasuryContract: Contract, wethMint="100", treasuryMint="10") {
    let signers = await ethers.getSigners();
    const user = signers[0];

    console.log("Minting Eth to user .....")
    const amountToMint = ethers.utils.parseEther(wethMint).toString();
    let tx = await weth.connect(user).deposit({value: amountToMint});
    tx = await tx.wait();
    console.log("Minted Eth to user successfully")

    console.log("Filling up the treasury ....")
    const amountToFill = ethers.utils.parseEther(treasuryMint).toString();
    tx = await weth.connect(user).transfer(treasuryContract.address, amountToFill);
    tx = await tx.wait();
    console.log("Treasury filled successfully")
}