import express, { json } from 'express';
import helmet from 'helmet';
import client from './discord-client';
import { ContractReport__Unknown, ContractReport, ContractReport_FraudType } from './types';

import domainInfo from './routes/domainInfo';
import contractInfo from './routes/contractInfo';

const cors = require('cors');

const app = express();
app.use(json());
app.use(helmet());
app.use(
	cors(),
);

app.post('/domain-info', domainInfo);
app.post("/contract-info", contractInfo);

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

export { app };

let isListening = false;
if (process.env.SERVER_TYPE == 'express' && !isListening) {
	app.listen(4000, () => {
		isListening = true;
		console.log('server listening on 4000')
	})
}
