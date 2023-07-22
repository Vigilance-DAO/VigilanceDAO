import express, { json } from 'express';
import helmet from 'helmet';
import { PoolClient } from 'pg';
import pool, { poolContracts } from './db';
import {ethers}  from 'ethers';
import fetch from 'node-fetch';
import { BasicDomainInfo, DomainInfo, DomainScamInfo } from "../../important-types";
import client from './discord-client';
import { ContractReport__Unknown, ContractReport, ContractReport_FraudType } from './types';
const whois = require('whois-json');
const cors = require('cors');
const { sendMessage } = require('./telegramBot');

const app = express();
app.use(json());
app.use(helmet());
app.use(
	cors(),
);

app.post('/domain-info', async (req, res) => {
	// await captureWebsite.file('https://cryptnesis.com/', 'screenshot.png');

	let domain = req.body.domain
	console.log('domain', domain)
	if (!domain) {
		res.status(400).send({})
		return;
	}

	try {
		let client = await pool.connect()
		let output = await getDomainInfo(client, domain)
		client.release()
		res.json(output);
	} catch (err) {
		console.log('get domain details', err)
		res.status(500).send({})
	}
	return;
});

app.post("/contract-info", async (req, res) => {
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
	res.json(output);
  } catch (err) {
    console.log("get contract details", err);
	sendMessage(`Error: /contract-info API:\nAddress: ${address}\nChain ID: ${chain_id}\nError: ${err}`)
    res.status(500).send({});
  }
  return;
});

function validateUnknownFinancialReport(
	reportBody: ContractReport__Unknown
): asserts reportBody is ContractReport {
	if (reportBody == undefined) {
		throw "body.report is undefined";
	}
	if (typeof reportBody != "object") {
		throw "Invalid value passed for body.report";
	}
	if (typeof reportBody.fraudType == undefined) {
		throw "body.report.fraudType is undefined";
	}
	if (typeof reportBody.info == undefined) {
		throw "body.report.info is undefined";
	}
	if (reportBody.info == "") {
		throw "body.report.info is empty";
	}
}

const TARGET_GUILD_NAME = process.env.DISCORD_TARGET_GUILD_NAME || "sahithyan's server";
const TARGET_CHANNEL_NAME = process.env.DISCORD_TARGET_CHANNEL_NAME || "lkfj";

if (TARGET_GUILD_NAME == "") {
	console.error("env.DISCORD_TARGET_GUILD_NAME is set to '' (empty string)");
}
if (TARGET_CHANNEL_NAME == "") {
	console.error("env.DISCORD_TARGET_CHANNEL_NAME is set to '' (empty string)");
}

/**
 * phishing -> Phishing
 * financial-loss -> Financial Loss
 */
function fraudTypeDisplayText(fraudType: ContractReport_FraudType): string {
	return fraudType
		.split("-")
		.map((word) => {
			// capitalize first letter
			return word.charAt(0).toUpperCase().concat(word.slice(1));
		})
		.join(" ");
}

app.post("/submit-contract-report", async (req, res) => {
	const userError = (message: string) => {
		res.status(400).send(message);
	};
	const internalError = (message: string) => {
		console.error(message);
		res.status(500).send("Internal Error Occured");
	}

	const reportBody: ContractReport__Unknown = req.body.report;

	try {
		validateUnknownFinancialReport(reportBody);
	} catch (errorMesage) {
		return userError(
			typeof errorMesage == "string" ? errorMesage : "Unknown error occured."
		);
	}

	if (
		reportBody.fraudType != "phishing" &&
		reportBody.fraudType != "financial-loss"
	) {
		console.warn(
			"Invalid value passed for body.report.fraudType",
			reportBody.fraudType
		);
	}

	const guilds = await client.guilds();
	if (guilds == null) {
		return internalError("Couldn't get guilds of the bot");
	}

	const targetGuild = guilds.find((guild) => guild.name == TARGET_GUILD_NAME);
	if (targetGuild == undefined) {
		return internalError(`The bot haven't joined ${TARGET_GUILD_NAME} guild yet.`);
	}

	const channels = await client.guildChannels(targetGuild.id);
	if (channels == null) {
		return internalError(`Couldn't get channels of ${targetGuild.name} guild`);
	}

	const targetChannel = channels.find(
		(channel) => channel.name == TARGET_CHANNEL_NAME
	);
	if (targetChannel == undefined) {
		return internalError(
			`${TARGET_CHANNEL_NAME} wasn't found in ${TARGET_GUILD_NAME} guild.`
		);
	}

	await client.sendMessage(targetChannel.id, {
		embeds: [
			{
				title: "Contract Report Received",
				description: [
					`**Reported address**: ${reportBody.address}`.concat(reportBody.name ? ` (${reportBody.name})` : ""),
					`**Report type**: ${fraudTypeDisplayText(reportBody.fraudType)}`,
					`**Report description**: ${reportBody.info}`,
				].join("\n"),
			},
		],
	});
	
	res.status(200).send("done");
});

app.use((_, res, _2) => {
	res.status(404).json({ error: 'NOT FOUND' });
});

async function getDomainCreatedInfoFromDb(client: PoolClient, domain: string): Promise<BasicDomainInfo | null> {
	const query = 'SELECT * from domains where domain=$1'

	try {
		const data = await client.query(query, [domain])
		if (data.rows.length && data.rows[0].isValid) {
			return data.rows[0] as BasicDomainInfo;
		} else {
			return null;
		}
	} catch (err) {
		console.log('error', err)
	}
	return null
}

async function getDomainScamInfoFromDb(client: PoolClient, domain: string): Promise<DomainScamInfo | null> {
	const query = 'SELECT "isScam", "fromSourceId", "attackType", "updatedOn" FROM "Edge" WHERE "destinationAddress"=$1';

	try {
		const data = await client.query(query, [domain]);
		if (data.rowCount > 0) {
			return data.rows[0] as DomainScamInfo;
		} else {
			return null;
		}
	} catch (err) {
		console.log("error", err);
	}

	return null;
}

async function getDomainInfo(client: PoolClient, domain: string): Promise<DomainInfo> {
	const domainInfo: DomainInfo = {
		domain,
	} as DomainInfo;

	const fromDb = await getDomainCreatedInfoFromDb(client, domain)
	if (fromDb) {
		console.log('loading from db', domain, fromDb)
		domainInfo.createdon = fromDb.createdon;
		domainInfo.updatedon = fromDb.updatedon;
		domainInfo.recordCreatedOn = fromDb.recordCreatedOn;
		domainInfo.isValid = fromDb.isValid;
	} else {
		const results = await whois(domain);
		console.log('reading new domain info', domain, results);
		domainInfo.createdon = new Date(results.creationDate)
		domainInfo.updatedon = new Date(results.updatedDate)
		domainInfo.isValid = true;

		let text = 'INSERT INTO domains(domain, createdon, updatedon) VALUES($1, $2, $3)'
		let values: any = [domain, domainInfo.createdon, domainInfo.updatedon]
		if (isNaN(domainInfo.createdon as any) || isNaN(domainInfo.updatedon as any)) {
			text = 'INSERT INTO domains(domain, "isValid") VALUES($1, $2)'
			values = [domain, false]
			domainInfo.isValid = false;
		}
		try {
			await client.query(text, values)
		} catch (err) {
			console.log('error', err)
		}
	}
	const scamInfoFromDb = await getDomainScamInfoFromDb(client, domain);
	if (scamInfoFromDb) {
		domainInfo.scamInfo = scamInfoFromDb;
	} else {
		// do nothing
	}

	return domainInfo;
}

function getEtherscanEndpoint(chain_id: string) {
	if (chain_id == Networks.ETHEREUM_MAINNET.valueOf()) {
		return 'https://api.etherscan.io/api'
	} else if (chain_id == Networks.POLYGON_MAINNET.valueOf()) {
		return 'https://api.polygonscan.com/api'
	} else {
		throw new Error('Invalid chain id')
	}
}

enum Networks {
	ETHEREUM_MAINNET = 'ETHEREUM_MAINNET',
	POLYGON_MAINNET = 'POLYGON_MAINNET',
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
	if ((now.getTime() - new Date(contractRecord.creationDate).getTime()) < 86400000 * 120) { // 120 days
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

export { app };

let isListening = false;
if (process.env.SERVER_TYPE == 'express' && !isListening) {
	app.listen(4000, () => {
		isListening = true;
		console.log('server listening on 4000')
	})
}
