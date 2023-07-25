import Pool from 'pg-pool';

var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // set pool max size to 20
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 10000, // return an error after 1 second if connection could not be established
    maxUses: 7500
})


export var poolContracts = new Pool({
    connectionString: process.env.DATABASE_URL_CONTRACTS,
    max: 20, // set pool max size to 20
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 10000, // return an error after 1 second if connection could not be established
    maxUses: 7500
})


export default pool;