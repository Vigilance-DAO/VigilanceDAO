// @ts-check
/// <reference types="chrome" />
/// <reference types="psl" />
/// <reference lib="webworker" />

import { API_ENDPOINT, DOMAIN, USER_ID_KEY } from "../constants";
import { getUserId, sendEvent } from "./utils";
import { updateActionBadge, getStorageKey } from "./utils/background";

// ! For production uncomment these lines
console.log = function(){};
console.debug = function(){};
console.error = function(){};
console.warn = function(){};

try {
	importScripts("./psl.min.js" /*, and so on */);
} catch (e) {
	console.error(e);
}

const DONT_SHOW_AGAIN_DOMAINS_KEY = "dont_show_again_domains";
const env = {
	// host: "http://localhost:4000", // backend API endpoint
	host: API_ENDPOINT,
	alertPeriod: 4 * 30 * 86400 * 1000,
	SUBGRAPH_URL:
		"https://api.thegraph.com/subgraphs/name/venkatteja/vigilancedao",
};

/**
 * @returns {Promise<Array<string>>}
 */
function loadDontShowAgainDomains() {
	console.log("loadDontShowAgainDomains");
	return chrome.storage.sync
		.get(DONT_SHOW_AGAIN_DOMAINS_KEY)
		.then((items) => {
			/**
			 * @type {Array<string>} 
			 */
			const x = items[DONT_SHOW_AGAIN_DOMAINS_KEY] || []
			return x;
		})
		.catch((error) => {
			console.error(
				`Error while getting ${DONT_SHOW_AGAIN_DOMAINS_KEY}`,
				error
			);
			/**
			 * @type {Array<string>}
			 */
			const x = [];
			return x;
		});
}

/**
 * TODO
 * @param {any[]} columns
 * @param {any} column
 */
function searchColumnIndex(columns, column) {
	return columns.findIndex((item, i) => {
		return item.name == column;
	});
}

let inMemoryStorage = {};
/**
 * @type {string | null}
 */
let lastUrl = null;

/**
 * Returns domain registration date by reading chrome storage/API call
 * to our backend
 * API is used if there is no data in chrome storage
 * Once we get info from API, we save it in chrome storage
 *
 * @param {Record<string, import("./types").DomainStorageItem>} storageInfo - chrome storage info
 * @param {string} url - domain name
 * @returns {Promise<Date | null>} createdon
 * @deprecated
 */
async function getDomainRegistrationDate(storageInfo, url) {
	console.log("getDomainRegistrationDate", storageInfo);
	// unique key for this domain
	const key = getStorageKey(url);
	// check if we have it in chrome storage
	const itemInStorage = storageInfo[key];
	if (itemInStorage != undefined && itemInStorage.createdon) {
		console.log("not requesting. saved in db", storageInfo[key], key);

		return new Date(itemInStorage.createdon);
	} else {
		sendEvent({
			eventName: "Fetch /domain-info",
			eventData: {
				url,
			},
		});
		try {
			// fetch from our backend
			const rawResponse = await fetch(`${env.host}/domain-info`, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ domain: url }),
				credentials: "include",
			});
			/**
			 * @type {import("../../important-types").DomainInfo}
			 */
			const content = await rawResponse.json();
			console.log("bg", { content });
			if (content.domain) {
				let createdon = new Date(content.createdon);
				/**
				 * @type {Record<string, import("./types").DomainStorageItem>}
				 */
				let data = {};
				data[key] = content;
				// Update it in chrome storage
				chrome.storage.sync.set(data, function () {
					console.log("saved", data);
					console.log("Settings saved", key);
					inMemoryStorage = data;
				});
				return createdon;
			}
		} catch (err) {
			console.warn("error fetching domain reg date", err);
		}
	}
	return null;
}

let counter = {};

/**
 * returns the cleaned domain name of a tab
 * @param {chrome.tabs.Tab | string} tab
 * @returns {string | undefined}
 */
function getUrl(tab) {
	console.log("getUrl", tab);
	/**
	 * @type {string}
	 */
	let url;
	if (typeof tab == "string") {
		url = tab;
	} else if (tab.url != undefined) {
		url = tab.url;
	} else {
		return;
	}

	if (url == "") return undefined;

	try {
		const _url = new URL(url);

		console.debug("bg current url", _url);
		console.debug("bg current tab", tab);

		// @ts-expect-error
		var parsed = psl.parse(_url.hostname);
		if (parsed.error) {
			throw new Error(parsed.error.message);
		}
		let parsedUrl = parsed.domain;
		console.debug("bg url", parsedUrl);
		return parsedUrl || undefined;
	} catch (error) {
		console.error(error);
		console.log("The error was because of trying to construct", url);
		return undefined;
	}
}

/**
 * Query from blockchain to know about if there are
 * any reports from Vigilance DAO community
 *
 * @param {string} url domain name without any subdomains (e.g. just google.com, example.xyz)
 * @param {chrome.tabs.Tab} tab
 * @param {Date | null} createdOn
 * @returns {Promise<import("./types").DomainValidationInfo | undefined>}
 */
async function getDomainValidationInfo(url, tab, createdOn) {
	console.log("getDomainValidationInfo", url, tab, createdOn);
	/**
	 * @type {"info" | "warning"}
	 */
	let type = "info";
	let msg = "No reports/reviews";
	let description = "";
	let isScamVerified = false;
	let isLegitVerified = false;
	let openScamReports = 0;
	let query = `query {
        reports(
            orderBy: id
            orderDirection: desc
            where: {domain: "${url}"}
            first:1
        ){
            id
            domain
            isScam
            status
        }
    }`;
	try {
		const rawResponse = await fetch(env.SUBGRAPH_URL, {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query }),
		});
		let data = await rawResponse.json();
		console.log("response", data);
		let reports = data.data.reports;
		for (let i = 0; i < reports.length; ++i) {
			let report = reports[i];
			if (report.status == "ACCEPTED" && !isScamVerified && !isScamVerified) {
				isLegitVerified = report.isScam ? false : true;
				isScamVerified = report.isScam ? true : false;
			}
			if (!report.status || report.status == "OPEN") {
				if (report.isScam) {
					openScamReports += 1;
				}
			}
		}
	} catch (err) {
		console.warn("Error fetching domain information", url, err);
		console.log("changing icon");
		// Set chrome extension icon info to show the warning

		updateActionBadge("error");

		type = "warning";
		msg = "Error fetching domain information";
		// send msg to the tab about this info. So that it can show it to the user
		// in extension popup (index.html as of now)
		sendMessage(tab, "domain", {
			isSuccess: true,
			domain: url,
			createdOn: createdOn ? createdOn.getTime() : 0,
			type,
			msg,
			description,
		});

		sendMessage(tab, "domain-error", {
			domain: url,
			error : err
		})
		return;
	}

	return {
		isLegitVerified,
		isScamVerified,
		openScamReports,
		type,
		msg,
		description,
	};
}

/**
 * @param {string} createdOn
 */
function isSoftWarning(createdOn) {
	console.log("isSoftWarning", createdOn, new Date(createdOn));
	let now = new Date();
	return now.getTime() - new Date(createdOn).getTime() < env.alertPeriod;
}

/**
 * Fetches the both endpoints
 * @param {string} simplifiedUrl Pass through getUrl() to simplify a URL.
 * @returns {Promise<import("./types").DomainStorageItem>}
 */
async function fetchDomainInfo(simplifiedUrl) {
	console.log("fetchDomainInfo", simplifiedUrl);
	/**
	 * @type {import("./types").DomainStorageItem}
	 */
	let storageItem = {
		createdon: undefined,
		domain: undefined,
		isValid: undefined,
		recordCreatedOn: undefined,
		scamInfo: undefined,
		updatedon: undefined,
		validationInfo: {
			type: "info",
			msg: "No reports/reviews",
			description: "",
			isScamVerified: false,
			isLegitVerified: false,
			openScamReports: 0,
		},
	};

	if (storageItem.validationInfo == undefined) {
		return storageItem;
	}

	let query = `query {
        reports(
            orderBy: id
            orderDirection: desc
            where: {domain: "${simplifiedUrl}"}
            first:1
        ){
            id
            domain
            isScam
            status
        }
    }`;

	// fetch SUBGRAPH api
	const rawResponse = await fetch(env.SUBGRAPH_URL, {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query }),
	});
	let data = await rawResponse.json();
	console.log("subgraph response", data);

	let reports = data.data.reports;
	for (let i = 0; i < reports.length; ++i) {
		const report = reports[i];
		if (
			storageItem.validationInfo.isScamVerified &&
			report.status == "ACCEPTED"
		) {
			storageItem.validationInfo.isLegitVerified = report.isScam ? false : true;
			storageItem.validationInfo.isScamVerified = report.isScam ? true : false;
		}
		if ((!report.status || report.status == "OPEN") && report.isScam) {
			storageItem.validationInfo.openScamReports += 1;
		}
	}

	sendEvent({
		eventName: "Fetch /domain-info",
		eventData: {
			url: simplifiedUrl,
		},
	});
	// fetch /domain-info endpoint
	const response = await fetch(`${env.host}/domain-info`, {
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ domain: simplifiedUrl }),
		credentials: "include",
	});
	/**
	 * @type {import("../../important-types").DomainInfo}
	 */
	const content = await response.json();

	console.log("/domain-info response", content);

	if (content.domain) {
		storageItem = {
			...storageItem,
			...content,
		};
	}

	const key = getStorageKey(simplifiedUrl);
	// Update it in chrome storage
	chrome.storage.sync.set(
		{
			[key]: storageItem,
		},
		function () {
			console.log("saved key", key);
			console.log("saved", storageItem);
		}
	);
	return storageItem;
}

/**
 * Entry point for process the information about current tab domain
 *
 * @param {chrome.tabs.Tab} tab
 */
async function processTab(tab) {
	// if(tab.status=='complete') {
	//     chrome.tabs.query({
	//         active: true,
	//         currentWindow: true
	//       }, function(tabs) {
	//         var tab = tabs[0];
	//         var url = tab.url;
	//         console.log('url', tabs)
	//     });
	// }
	if (tab.url == undefined || tab.url == "") {
		return;
	}

	if (tab.url.startsWith("chrome://")) {
		updateActionBadge("reset");
		return;
	}

	const url = getUrl(tab);
	console.log("processTab", JSON.stringify({ url, lastUrl }));
	if (url == undefined || url != lastUrl) {
		// Set chrome extension icon info to show the loading
		updateActionBadge("loading");

		if (url == undefined) {
			return;
		}
		lastUrl = url;
	}

	// chrome.action.setBadgeTextColor({color: "black"});
	if (tab.status != "complete") {
		return;
	}

	console.log("processTab", tab.url);
	const key = getStorageKey(url); // a unique key for each domain in storage

	// use chrome.storage.sync API to load the data about domain
	// from chrome storage
	const keysToLoad = [key, DONT_SHOW_AGAIN_DOMAINS_KEY];
	/**
	 * Already existing items in the storage
	 * @type {import("./types").StorageResult}
	 */
	const storageItems = await chrome.storage.sync
		.get(keysToLoad)
		.catch((error) => {
			console.warn("Error while loading items from storage for", keysToLoad);
			console.warn(error);
			return {};
		});

	const { [DONT_SHOW_AGAIN_DOMAINS_KEY]: _unused, ...existingStorageItems } =
		storageItems;

	let now = new Date();

	/**
	 * Contains the information about the domain
	 * it will be saved to the storage
	 *
	 * @type {import("./types").DomainStorageItem}
	 */
	let storageItem = existingStorageItems[key] || (await fetchDomainInfo(url));

	const fromStorage = existingStorageItems[key] != undefined;
	let isUpdated = !fromStorage;
	const lastValidationStateUpdatedOn = storageItem.updatedon;

	// if it's from storage and the info was fetched 5minutes before,
	// revalidate the validationInfo property
	if (
		fromStorage &&
		(lastValidationStateUpdatedOn == undefined ||
			now.getTime() - new Date(lastValidationStateUpdatedOn).getTime() >=
				5 * 60 * 1000)
	) {
		// revalidate
		const _validationInfo = await getDomainValidationInfo(
			url,
			tab,
			storageItem.createdon == undefined ? null : new Date(storageItem.createdon)
		);
		if (_validationInfo != undefined) {
			isUpdated = true;
			storageItem.validationInfo = _validationInfo;
		}
	}

	if (isUpdated) {
		chrome.storage.sync.set(
			{
				[key]: storageItem,
			},
			function () {
				console.log("saved to storage", key, storageItem);
			}
		);
	}

	// This can be used to show alert.html popup in tab
	// content.js listens to this msg and shows the popup
	// if (
	// 	createdOn &&
	// 	(isSoftWarning(createdOn) || storageItem.validationInfo?.isScamVerified)
	// ) {
	// 	sendMessage(tab, "show-warning", {
	// 		domain: url,
	// 		createdOn: createdOn ? createdOn.getTime() : 0,
	// 		type: storageItem.validationInfo?.type,
	// 		msg: storageItem.validationInfo?.msg,
	// 		description: storageItem.validationInfo?.description,
	// 	});
	// }
	console.log(storageItem);

	// If we know from blockchain or our Backend API that a domain is scam
	// then we show the ❌ icon on extension
	if (storageItem.validationInfo?.isScamVerified) {
		updateActionBadge("scam");

		storageItem.validationInfo.type = "error";
		storageItem.validationInfo.msg = "Verified as fraudulent domain";
	} else if (storageItem.validationInfo?.isLegitVerified) {
		// If we know from blockchain or our Backend API that a domain is legit
		// then we show the ✔️ icon on extension
		updateActionBadge("legit");

		storageItem.validationInfo.type = "success";
		storageItem.validationInfo.msg = "Verified as legit";
	} else if (storageItem.createdon && isSoftWarning(storageItem.createdon)) {
		// if a domain is registered recently then we show the ⚠️ icon on extension
		console.log("changing icon");
		updateActionBadge("warning", {
			text: storageItem.validationInfo
				? storageItem.validationInfo.openScamReports.toString()
				: undefined,
		});

		if (storageItem.validationInfo) {
			storageItem.validationInfo.type = "warning";
			// if its recent and has open scam reports then we show the warning
			// with a custom msg
			if (storageItem.validationInfo.openScamReports > 0) {
				storageItem.validationInfo.msg =
					"Domain registed recently and has `OPEN` fraud reports";
				storageItem.validationInfo.description =
					"The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.";
			} else {
				storageItem.validationInfo.msg = "Domain registed recently";
				storageItem.validationInfo.description =
					"Majority of new domains are legit but some could be scam. Please maintain caution, especially while performing financial transactions.";
			}
		}
	} else if (storageItem.validationInfo?.openScamReports) {
		// domain not recently registered but has open scam reports
		console.log("changing icon");
		updateActionBadge("warning", {
			text: storageItem.validationInfo
				? storageItem.validationInfo.openScamReports.toString()
				: undefined,
		});

		storageItem.validationInfo.type = "warning";
		storageItem.validationInfo.msg = "Has `OPEN` fraud reports";
		storageItem.validationInfo.description =
			"The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.";
	} else {
		// Fallback
		updateActionBadge("reset");
	}

	// Update the tab with the validation info
	// index.html catches this info and shows it in the popup
	sendMessage(tab, "domain", {
		isSuccess: true,
		domain: url,
		createdOn: storageItem.createdon == undefined ? 0 : new Date(storageItem.createdon).getTime(),
		type: storageItem.validationInfo?.type,
		msg: storageItem.validationInfo?.msg,
		description: storageItem.validationInfo?.description,
	});

	if (
		storageItems[DONT_SHOW_AGAIN_DOMAINS_KEY] &&
		storageItems[DONT_SHOW_AGAIN_DOMAINS_KEY].includes(url)
	) {
		return;
	}

	/**
	 * @type {import("./types").ComputedDomainStorageItem}
	 */
	const computedStorageItem = {
		...storageItem,
		isNew: storageItem.createdon
			? isSoftWarning(storageItem.createdon)
			: false,
	};
	sendMessage(tab, "processing-finished", computedStorageItem);
}

// process tab on tab update
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
	console.log("tabs onUpdated", tabId, info, tab);
	if (info.url == undefined && info.status == undefined) {
		return;
	}
	processTab(tab);
});

// on tab switch
chrome.tabs.onActivated.addListener((activeInfo) => {
	console.log("tabs onActivated", activeInfo);

	chrome.tabs
		.get(activeInfo.tabId)
		.then((tab) => {
			console.log("url", tab.url);
			processTab(tab);
		})
		.catch(console.error);
});

/**
 * Send message to a tab
 * @param {chrome.tabs.Tab} tab tab to send message to
 * @param {string} type type of message (a unique string)
 * @param {unknown} data The payload to send
 * @returns {Promise<void>}
 */
async function sendMessage(tab, type, data) {
	return new Promise((resolve, reject) => {
		if (tab.id == undefined) {
			console.error("tab", tab);
			reject(new Error("tab.id is undefined"));
			return;
		}
		console.log("sending msg", type);
		chrome.tabs
			.sendMessage(
				tab.id,
				{
					type,
					data,
				}
				// undefined,
				// (response) => {
				// 	resolve();
				// }
			)
			.then(resolve)
			.catch(reject);
	});
}

// trigger to show index.html popup on clicking extension icon
// content.js processes this
chrome.action.onClicked.addListener(function (tab) {
	console.log("extension clickeddd", tab.id, chrome.tabs);
	sendMessage(tab, "toggle", {});
});

// index.html cannot directly communicate with content.js
// mainly used for some blockchain communications.
// so the below functions proxies the msg between index.html and content.js
// Look for `chrome.runtime.onMessage.addListener` in the code
// to see how the msgs are being recieved and sent
/**
 * @param {{ type: string; data: unknown; }} request
 * @param {chrome.runtime.MessageSender} sender
 * @param {(response?: any) => void} sendResponse
 */
async function processMsg(request, sender, sendResponse) {
	if (sender.tab == undefined) {
		console.error("sender", sender);
		throw new Error("sender.tab is undefined");
	}
	if (request.type == "take-screenshot") {
		await sendMessage(sender.tab, "toggle", {});
		await takeScreenshot(sender.tab);
		await sendMessage(sender.tab, "toggle", {});
	} else if (request.type == "connect-wallet") {
		await sendMessage(sender.tab, "connect-wallet-2", {});
	} else if (request.type == "wallet-connected") {
		await sendMessage(sender.tab, "wallet-connected", request.data);
	} else if (request.type == "switch-network") {
		await sendMessage(sender.tab, "switch-network-2", request.data);
	} else if (request.type == "chainID") {
		await sendMessage(sender.tab, "chainID", request.data);
	} else if (request.type == "submit-report") {
		await sendMessage(sender.tab, "submit-report-2", request.data);
	} else if (request.type == "transaction-update") {
		await sendMessage(sender.tab, "transaction-update", request.data);
	} else if (request.type == "get-stake-amount") {
		await sendMessage(sender.tab, "get-stake-amount-2", request.data);
	} else if (request.type == "stake-amount") {
		await sendMessage(sender.tab, "stake-amount", request.data);
	} else if (request.type == "alert-dont-show-again") {
		const dontShowAgainDomains = await loadDontShowAgainDomains();
		chrome.storage.sync.set({
			[DONT_SHOW_AGAIN_DOMAINS_KEY]: dontShowAgainDomains.concat(
				// @ts-expect-error
				request.data.url
			),
		});
	} else if (request.type == "close-website") {
		const currentTab = (
			await chrome.tabs.query({ active: true, currentWindow: true })
		)[0];
		if (currentTab.id == undefined) return;
		chrome.tabs.remove(currentTab.id);
	}
	return true;
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	console.log("msg in background", request, sender);
	processMsg(request, sender, sendResponse)
	return true;
});

/**
 * take screenshot of the tab
 *
 * @param {chrome.tabs.Tab} tab
 * @returns {Promise<void>}
 */
function takeScreenshot(tab) {
	return new Promise((resolve, reject) => {
		let capturing = chrome.tabs.captureVisibleTab();
		capturing.then(
			(imageUri) => {
				console.log("imageUri", imageUri);
				sendMessage(tab, "screenshot", { isSuccess: true, imageUri });
				sendMessage(tab, "screenshot", { isSuccess: true, imageUri });
				resolve();
			},
			(error) => {
				console.log(`Error: ${error}`);
				sendMessage(tab, "screenshot", { isSuccess: false, error });
				resolve();
			}
		);
	});
}

chrome.runtime.onInstalled.addListener(async (details) => {
	console.log('onInstalled', details);

	if (details.reason == "chrome_update" || details.reason == "shared_module_update") return;
	sendEvent({
		eventName: details.reason,
		...details
	});
	
	if (details.reason == 'install') {
		chrome.tabs.create({
			url: `${DOMAIN}/extension-installed?reason=${details.reason}`,
		});
	} else if (details.reason == "update") {
		// on update clear everything on storage other than
		// 	- userid
		// 	- dont show again domains
		// to avoid issues with mismatched types
		const userId = await getUserId();
		const dontShowAgainDomains = await loadDontShowAgainDomains();

		chrome.storage.sync
			.clear()
			.then(() => {
				console.log("storage.sync cleared");
			})
			.catch(console.error);

		/** @type {Record<string, unknown>} */
		const newItems = {};
		if (userId) {
			newItems[USER_ID_KEY] = userId;
		}
		if (dontShowAgainDomains.length > 0) {
			newItems[DONT_SHOW_AGAIN_DOMAINS_KEY] = dontShowAgainDomains;
		}
		chrome.storage.sync.set(newItems);
	}
});
