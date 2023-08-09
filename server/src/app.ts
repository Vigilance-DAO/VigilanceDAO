import express, { json } from 'express';
import helmet from 'helmet';

import domainInfo from './routes/domainInfo';
import contractInfo from './routes/contractInfo';
import submitContractReport from './routes/submitContractReport';

const cors = require('cors');

const app = express();
app.use(json());
app.use(helmet());
app.use(
	cors(),
);

app.post('/domain-info', domainInfo);
app.post("/contract-info", contractInfo);
app.post("/submit-contract-report", submitContractReport);
app.use((_, res, _2) => {
	res.status(404).json({ error: 'NOT FOUND' });
});

export { app };

let isListening = false;
if (process.env.SERVER_TYPE == 'express' && !isListening) {
	app.listen(4000, () => {
		isListening = true;
		console.log('server listening on 4000')
	})
}
