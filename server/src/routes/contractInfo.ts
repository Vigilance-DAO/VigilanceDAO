import { Request, Response } from "express";
import { PoolClient } from "pg";
import {ethers}  from 'ethers';
import fetch from 'node-fetch';

import { poolContracts } from "../db";
import { sendMessage } from "../telegramBot.js";

enum Networks {
	ETHEREUM_MAINNET = 'ETHEREUM_MAINNET',
	POLYGON_MAINNET = 'POLYGON_MAINNET',
}
const _120days = 86400000 * 120;

function getEtherscanEndpoint(chain_id: string) {
	if (chain_id == Networks.ETHEREUM_MAINNET.valueOf()) {
		return 'https://api.etherscan.io/api'
	} else if (chain_id == Networks.POLYGON_MAINNET.valueOf()) {
		return 'https://api.polygonscan.com/api'
	} else {
		throw new Error('Invalid chain id')
	}
}

function getEtherscanAPIkey(chain_id: string) {
	if (chain_id == Networks.ETHEREUM_MAINNET.valueOf()) {
		return process.env.ETHERSCAN_API_KEY
	} else if (chain_id == Networks.POLYGON_MAINNET.valueOf()) {
		return process.env.POLYGONSCAN_API_KEY
	} else {
		throw new Error('Invalid chain id')
	}
}

function getProvider(chain_id: string) {
	if (chain_id == Networks.ETHEREUM_MAINNET.valueOf()) {
		return new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
	} else if (chain_id == Networks.POLYGON_MAINNET.valueOf()) {
		return new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
	} else {
		throw new Error('Invalid chain id')
	}
}

function getRiskRating(contractRecord: any) {
	console.log('contractRecord', contractRecord)
	if (!contractRecord) {
		return {
			riskRating: 'NA',
			feedback: []
		}
	}
	if (contractRecord.verified) {
		return {
			riskRating: 'LOW',
			feedback: ["Verified by Vigilance DAO"]
		}
	}
	let riskRating = 'MEDIUM';
	let feedback = [];
	if (!contractRecord.contractVerified) {
		feedback.push('Contract source code not verified');
	}
	// @todo // try proxy detection
	let now = new Date();
	if ((now.getTime() - new Date(contractRecord.creationDate).getTime()) < _120days) {
		feedback.push('Contract is newly deployed. Maintain caution.');
	}
	if (feedback.length == 0) {
		riskRating = 'LOW';
	}
	return {
		riskRating,
		feedback,
	}
}

async function getCreationDate(client: PoolClient, address: string, network: string): Promise<{
	riskRating: string,
	feedback: string[],
	name: string,
	date: string,
}> {
  try {
    const query = 'SELECT * FROM "ContractAddresses" WHERE "address" LIKE $1';
    var contractData = await client.query(query, [address]);  
    
    if(contractData.rowCount == 0){
		console.log('inserting new contract address', address);	
		const query1 = 'INSERT INTO "ContractAddresses"("address") VALUES($1)';
		await client.query(query1, [address]);
		contractData = await client.query(query, [address]);
    }
    
	let { riskRating, feedback } = getRiskRating(contractData.rows[0]);
    var date = contractData.rows[0].creationDate;
	var name = contractData.rows[0].contractName;
	var contractVerified = contractData.rows[0].contractVerified;

    if (date == "NA") {
		const ETHERSCAN_ENDPOINT = getEtherscanEndpoint(network);
		const _ETHERSCAN_API_KEY = getEtherscanAPIkey(network);
		const provider = getProvider(network);
		const response = await fetch(
			`${ETHERSCAN_ENDPOINT}?module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${_ETHERSCAN_API_KEY}`
		);
			
		const data:any = await response.json();
			
		console.log('data', data)
		if (data.result == null) {
			return {
				riskRating,
				feedback,
				date: 'NA',
				name: 'NA',
			};
		}

		const response2 = await fetch(`${ETHERSCAN_ENDPOINT}?module=contract&action=getsourcecode&address=${address}&apikey=${_ETHERSCAN_API_KEY}`)

		const data2:any = await response2.json();
		console.log('data2', data2)

		const txHash = data.result[0].txHash;

		const tx = await provider.getTransaction(txHash);
		if (tx?.blockHash) {
			const block = await provider.getBlock(tx.blockHash);
		if(block) {
			date = new Date(block.timestamp * 1000);
			date = date.toISOString().slice(0, 10);
			} 
		} 

		if (data2.result == null || data2.result.length == 0) {
			const query2 = 'UPDATE "ContractAddresses" SET "creationDate"=$1 WHERE "address" LIKE $2';
			client.query(query2, [date, address]);
			let riskInfo = getRiskRating({ verified: false, contractVerified: false, creationDate: date });
			riskRating = riskInfo.riskRating;
			feedback = riskInfo.feedback;
			return {
				riskRating,
				feedback,
				date,
				name: 'NA',
			}
		}

		contractVerified = data2.result[0].SourceCode ? true : false;

		name = data2.result[0].ContractName;
		console.log('name', name)
		const query2 = 'UPDATE "ContractAddresses" SET "creationDate"=$1, "contractName"=$3, "contractVerified"=$4 WHERE "address" LIKE $2';
		client.query(query2, [date, address, name, contractVerified]);
		let riskInfo = getRiskRating({ verified: false, contractVerified, creationDate: date });
		riskRating = riskInfo.riskRating;
		feedback = riskInfo.feedback;
    }
    return {
		riskRating,
		feedback,
		date,
		name,
	}

  } catch (error) {
    console.log(error);  
	sendMessage(`Error: getCreationDate API:\nAddress: ${address}\nNetwork: ${network}\nError: ${error}`)
  }
  return {
	riskRating: 'NA',
	feedback: [],
	date: 'NA',
	name: 'NA',
  };
}


async function getContractInfo(client: PoolClient, address: string, network: string): Promise<any> {
  const now = new Date();

  var yesterday = new Date(now.setDate(now.getDate() - 1)).getTime() / 1000;
  var lastMonth = new Date(now.setDate(now.getDate() - 30)).getTime() / 1000;

  yesterday = Math.floor(yesterday);
  lastMonth = Math.floor(lastMonth);

  try {
    const query = 'SELECT SUM("count") FROM "TransactionCount" WHERE "to" LIKE $1 AND "time" > $2 AND network = $3';
	let t1 = new Date().getTime();
    const transactionsLast24Hours = await client.query(query, [address, yesterday, network]);

    const transactionsLast30Days = await client.query(query, [address, lastMonth, network]);
	let t2 = new Date().getTime();
    const { riskRating, feedback, name, date } = await getCreationDate(client, address, network);
	let t3 = new Date().getTime();
	console.log('time taken', t2 - t1, t3 - t2)
    return { 
      userCount24hours: transactionsLast24Hours.rows[0].sum,
      userCount30days: transactionsLast30Days.rows[0].sum,
      creationDate: date,
	  name,
	  riskRating,
	  feedback,
    };   
  }catch (error) {
    console.log(error);
  }
  return null;
}

export default async function (req: Request, res: Response) {
  const address = req.body.address;
  const chain_id = req.body.chain_id;
  if (!address) {
	res.status(400).send({error: "Bad params"});
	return;
  }
  
  if (!chain_id || (chain_id != '1' && chain_id != '137')) {
	res.status(400).send({error: "Bad params"});
	return;
  }

  const network = chain_id == '1' ? 'ETHEREUM_MAINNET' : 'POLYGON_MAINNET';

  console.log("address", address);
  console.log("chain_id", chain_id);
  console.log("network", network);

  try {
    const client = await poolContracts.connect();
    const output = await getContractInfo(client, address, network);
    client.release();
    // res.json({
	// 	userCount24hours: 1000,
	// 	userCount30days: 100000,
	// 	creationDate: new Date((new Date().getTime() - 86400000)),
	// 	name: 'Dummy',
	// });
	res.json({...output, timestamp: new Date()});
  } catch (err) {
    console.log("get contract details", err);
	sendMessage(`Error: /contract-info API:\nAddress: ${address}\nChain ID: ${chain_id}\nError: ${err}`)
    res.status(500).send({});
  }
  return;
}
