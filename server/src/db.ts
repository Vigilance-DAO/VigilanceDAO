import Pool from 'pg-pool';

var pool = new Pool({
    host: 'neev-db-prod.c9vbauzdstix.us-east-2.rds.amazonaws.com',
    port: 5432,
    user: 'neevadmin',
    password: '21NeevAdmin21',
    database: 'vigilancedao_test',
    max: 20, // set pool max size to 20
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 10000, // return an error after 1 second if connection could not be established
    maxUses: 7500
})


export default pool;