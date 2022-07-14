import express, { json } from 'express';
import helmet from 'helmet';
import pool from './db';
const whois = require('whois-json');

const app = express();
app.use(json());
app.use(helmet());

app.post('/domain-info', async (req, res) => {
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

async function getDomainFromDb(client: any, domain: string) {
  let query = 'SELECT * from domains where domain=$1'
  let values = [domain]
  try {
    let data = await client.query(query, values)
    if(data.rows.length) {
      return data.rows[0]
    } else {
      return null;
    }
  } catch(err) {
    console.log('error', err)
  }
}

async function getDomainInfo(client: any, domain: string) {
  
  let fromDb = await getDomainFromDb(client, domain)
  if(fromDb) {
    return fromDb
  }
  var results = await whois(domain);
  let createdon = new Date(results.creationDate)
  let updatedon = new Date(results.updatedDate)
  console.log(domain, createdon, updatedon)
  const text = 'INSERT INTO domains(domain, createdon, updatedon) VALUES($1, $2, $3)'
  let values = [domain, createdon, updatedon]
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
