import express, { json } from 'express';
import helmet from 'helmet';
import { PoolClient } from 'pg';
import pool from './db';
import {ethers}  from 'ethers';
import fetch from 'node-fetch';
import { BasicDomainInfo, DomainInfo, DomainScamInfo } from "../../important-types";
import client from './discord-client';
import { ContractReport__Unknown, ContractReport, ContractReport_FraudType } from './types';
const whois = require('whois-json');

const app = express();
app.use(json());
app.use(helmet());

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL;

const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);

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
  
  console.log("address", address);
  if (!address) {
    res.status(400).send({});
    return;
  }

  try {
    const client = await pool.connect();
    const output = await getContractInfo(client, address);
    client.release();
    res.json(output);
  } catch (err) {
    console.log("get contract details", err);
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
			return word.charAt(0).toUpperCase().concat(fraudType.slice(1));
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

async function getCreationDate(client: PoolClient, address: string): Promise<String> {
  try {
    
    const query = 'SELECT "creationDate" FROM "ContractAddresses" WHERE "address" LIKE $1';
    var contractData = await client.query(query, [address]);  
    
    if(contractData.rowCount == 0){
      const query1 = 'INSERT INTO "ContractAddresses"("address") VALUES($1)';
      await client.query(query1, [address]);
      contractData = await client.query(query, [address]);
    }
    
    var date = contractData.rows[0].creationDate;

    if (date == "NA") {
      const response = await fetch(
        `https://api.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${ETHERSCAN_API_KEY}`
      );
        
      const data:any = await response.json();
        
      if (data.result == null) {
        return date;
      }

      const txHash = data.result[0].txHash;

      const tx = await provider.getTransaction(txHash);
      if (tx?.blockHash) {
        const block = await provider.getBlock(tx.blockHash);
      if(block) {
          date = new Date(block.timestamp * 1000);
          date = date.toISOString().slice(0, 10);
        } 
      } 
      const query2 = 'UPDATE "ContractAddresses" SET "creationDate"=$1 WHERE "address" LIKE $2';
      await client.query(query2, [date, address]);
    }
    return date;

  } catch (error) {
    console.log(error);  
  }
  return "NA";
}

async function getContractInfo(client: PoolClient, address: string): Promise<any> {
  const now = new Date();

  var yesterday = new Date(now.setDate(now.getDate() - 1)).getTime() / 1000;
  var lastMonth = new Date(now.setDate(now.getDate() - 30)).getTime() / 1000;

  yesterday = Math.floor(yesterday);
  lastMonth = Math.floor(lastMonth);

  try {
    const query = 'SELECT COUNT(DISTINCT "from") FROM "Transactions" WHERE "to" LIKE $1 AND "timeStamp" > $2';

    const transactionsLast24Hours = await client.query(query, [address, yesterday]);

    const transactionsLast30Days = await client.query(query, [address, lastMonth]);

    const date = await getCreationDate(client,address);

    return { 
      userCount24hours: transactionsLast24Hours.rows[0].count,
      userCount30days: transactionsLast30Days.rows[0].count,
      creationDate: date
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
