import express, { json } from 'express';
import helmet from 'helmet';
import { PoolClient } from 'pg';
import pool from './db';
import { BasicDomainInfo, DomainInfo, DomainScamInfo } from "../../important-types";
const whois = require('whois-json');

const app = express();
app.use(json());
app.use(helmet());

app.post('/domain-info', async (req, res) => {
  // await captureWebsite.file('https://cryptnesis.com/', 'screenshot.png');

  let domain = req.body.domain
  console.log('domain', domain)
  if(!domain) {
    res.status(400).send({})
    return;
  }

  try {
    let client = await pool.connect()
    let output = await getDomainInfo(client, domain)
    client.release()
    res.json(output);
  } catch(err) {
    console.log('get domain details', err)
    res.status(500).send({})
  }
  return;
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
		domainInfo.createdon = fromDb.createdon;
		domainInfo.updatedon = fromDb.updatedon;
		domainInfo.recordCreatedOn = fromDb.recordCreatedOn;
		domainInfo.isValid = fromDb.isValid;
	} else {
		const results = await whois(domain);
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


export { app };

if (process.env.SERVER_TYPE = 'express') {
	app.listen(4000, () => {
		console.log('server listening on 4000')
	})
}
