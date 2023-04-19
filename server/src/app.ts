import express, { json } from 'express';
import helmet from 'helmet';
import { PoolClient } from 'pg';
import pool from './db';
import { DomainInfo } from "../../important-types";
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

async function getDomainFromDb(client: PoolClient, domain: string): Promise<DomainInfo | null> {
  let query = 'SELECT * from domains where domain=$1'
  let values = [domain]
  try {
    let data = await client.query(query, values)
    if(data.rows.length && data.rows[0].isValid) {
      return data.rows[0]
    } else {
      return null;
    }
  } catch(err) {
    console.log('error', err)
  }
	return null;
}

async function getDomainInfo(client: PoolClient, domain: string): Promise<DomainInfo> {
  let fromDb = await getDomainFromDb(client, domain)
  if(fromDb) {
    return fromDb
  }
  var results = await whois(domain);
  let createdon: any = new Date(results.creationDate)
  let updatedon: any = new Date(results.updatedDate)
  console.log(domain, createdon, updatedon)

  let text = 'INSERT INTO domains(domain, createdon, updatedon) VALUES($1, $2, $3)'
  let values: any = [domain, createdon, updatedon]
  if(isNaN(createdon) || isNaN(updatedon)) {
    text = 'INSERT INTO domains(domain, "isValid") VALUES($1, $2)'
    values = [domain, false]
  }
  try {
    await client.query(text, values)
  } catch(err) {
    console.log('error', err)
  }
  
  return {
    domain,
    createdon,
    updatedon
  }
}


export { app };

if(process.env.SERVER_TYPE='express') {
  app.listen(4000, () => {
    console.log('server listening on 4000')
  })
}
