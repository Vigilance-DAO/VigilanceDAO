// @ts-check
/// <reference types="chrome" />
/// <reference types="psl" />
/// <reference lib="webworker" />

try {
	importScripts("./psl.min.js" /*, and so on */);
} catch (e) {
	console.error(e);
}

const env = {
	host: "http://localhost:4000", // backend API endpoint
	alertPeriod: 4 * 30 * 86400 * 1000,
	SUBGRAPH_URL:
		"https://api.thegraph.com/subgraphs/name/venkatteja/vigilancedao",
};

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

/**
 * Returns a unique key for a specific url
 * @param {string} url
 */
function getStorageKey(url) {
	return `vigil__${url}`;
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
		try {
			// fetch from our backend
			const rawResponse = await fetch(`${env.host}/domain-info`, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ domain: url }),
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
 * @param {chrome.tabs.Tab} tab
 * @returns {string | undefined}
 */
function getUrl(tab) {
	if (!tab.url) return;
	let _url = new URL(tab.url);

	console.debug("bg current url", _url);
	console.debug("bg current tab", tab);

	var parsed = psl.parse(_url.hostname);
	if (parsed.error) {
		throw new Error(parsed.error.message);
	}
	let url = parsed.domain;
	console.debug("bg url", url);
	return url || undefined;
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
		chrome.action.setIcon({
			path: { 16: "/images/icon16.png", 32: "/images/icon32.png" },
		});
		chrome.action.setBadgeText({ text: "⚠️" });
		chrome.action.setBadgeBackgroundColor({ color: "#000000" });
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
 * @param {Date} createdOn
 */
function isSoftWarning(createdOn) {
	let now = new Date();
	return now.getTime() - createdOn.getTime() < env.alertPeriod;
}

/**
 * Entry point for process the information about current tab domain
 *
 * @param {chrome.tabs.Tab} tab
 */
function processTab(tab) {
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
	const url = getUrl(tab);
	console.log("processTab", JSON.stringify({ url, lastUrl }));
	if (!url || url != lastUrl) {
		// Set chrome extension icon info to show the loading
		chrome.action.setIcon({
			path: { 16: "/images/icon16.png", 32: "/images/icon32.png" },
		});
		chrome.action.setBadgeText({ text: "..." });
		chrome.action.setBadgeBackgroundColor({ color: "yellow" });
		lastUrl = url || lastUrl;
		return;
	}
	// chrome.action.setBadgeTextColor({color: "black"});
	if (tab.url && tab.status == "complete") {
		const key = getStorageKey(url); // a unique key for each domain in storage

		// use chrome.storage.sync API to load the data about domain
		// from chrome storage
		chrome.storage.sync.get(
			[key],
			/**
			 * @param {Record<string, import("./types").DomainStorageItem>} items
			 */
			async (items) => {
				console.log(items);
				let createdOn = await getDomainRegistrationDate(items, url);

				let now = new Date();
				// data object to be sent to the tab and saved in storage
				/**
				 * @type {import("./types").DomainValidationInfo}
				 */
				let validationInfo = {
					type: "info",
					msg: "No reports/reviews",
					description: "",
					isScamVerified: false,
					isLegitVerified: false,
					openScamReports: 0,
				};

				let lastValidationStateUpdatedOn = items[key]?.updatedon;
				// to avoid calling the blockchain API again and again
				// min 5 min gap between each call for a domain
				if (
					lastValidationStateUpdatedOn &&
					now.getTime() - lastValidationStateUpdatedOn.getTime() < 5 * 60 * 1000
				) {
					// 5min
					validationInfo = items[key]?.validationInfo || validationInfo;
				} else {
					const _validationInfo = await getDomainValidationInfo(
						url,
						tab,
						createdOn
					);
					if (_validationInfo != undefined) {
						validationInfo = _validationInfo;
					}
					chrome.storage.sync.get(
						[key],
						/**
						 * @param {Record<string, import("./types").DomainStorageItem>} items
						 */
						async (items) => {
							console.log(items);
							if (!items[key]) items[key] = {};
							items[key].validationInfo = validationInfo;
							// save the data in chrome storage
							chrome.storage.sync.set(items, function () {
								console.log("storage set", items);
								console.log("validation info saved", key);
								inMemoryStorage = items;
							});
						}
					);
				}

				// This can be used to show alert.html popup in tab
				// content.js listens to this msg and shows the popup
				if (
					createdOn &&
					(isSoftWarning(createdOn) || validationInfo.isScamVerified)
				) {
					sendMessage(tab, "show-warning", {
						domain: url,
						createdOn: createdOn ? createdOn.getTime() : 0,
						type: validationInfo.type,
						msg: validationInfo.msg,
						description: validationInfo.description,
					});
				}

				// If we know from blockchain or our Backend API that a domain is scam
				// then we show the ❌ icon on extension
				if (validationInfo.isScamVerified) {
					chrome.action.setIcon({
						path: {
							19: "/images/alerticon19-red.png",
							38: "/images/alerticon38-red.png",
						},
					});
					chrome.action.setBadgeText({ text: "❌" });
					chrome.action.setBadgeBackgroundColor({ color: "#f96c6c" });
					validationInfo.type = "error";
					validationInfo.msg = "Verified as fraudulent domain";
				} else if (validationInfo.isLegitVerified) {
					// If we know from blockchain or our Backend API that a domain is legit
					// then we show the ✔️ icon on extension
					chrome.action.setIcon({
						path: { 16: "/images/icon16.png", 32: "/images/icon32.png" },
					});
					chrome.action.setBadgeText({ text: "✔️" });
					chrome.action.setBadgeBackgroundColor({ color: "#05ed05" });
					validationInfo.type = "success";
					validationInfo.msg = "Verified as legit";
				} else if (createdOn && isSoftWarning(createdOn)) {
					// if a domain is registered recently then we show the ⚠️ icon on extension
					console.log("changing icon");
					chrome.action.setIcon({
						path: {
							19: "/images/alerticon19-red.png",
							38: "/images/alerticon38-red.png",
						},
					});
					validationInfo.openScamReports
						? chrome.action.setBadgeText({
								text: validationInfo.openScamReports + "",
						  })
						: chrome.action.setBadgeText({ text: "1" });
					chrome.action.setBadgeBackgroundColor({ color: "#f96c6c" });
					validationInfo.type = "warning";
					// if its recent and has open scam reports then we show the warning
					// with a custom msg
					if (validationInfo.openScamReports > 0) {
						validationInfo.msg =
							"Domain registed recently and has `OPEN` fraud reports";
						validationInfo.description =
							"The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.";
					} else {
						validationInfo.msg = "Domain registed recently";
						validationInfo.description =
							"Majority of new domains are legit but some could be scam. Please maintain caution, especially while performing financial transactions.";
					}
				} else if (validationInfo.openScamReports) {
					// domain not recently registered but has open scam reports
					console.log("changing icon");
					chrome.action.setIcon({
						path: {
							19: "/images/alerticon19-red.png",
							38: "/images/alerticon38-red.png",
						},
					});
					validationInfo.openScamReports
						? chrome.action.setBadgeText({
								text: validationInfo.openScamReports + "",
						  })
						: chrome.action.setBadgeText({ text: "1" });
					chrome.action.setBadgeBackgroundColor({ color: "#f96c6c" });
					validationInfo.type = "warning";
					validationInfo.msg = "Has `OPEN` fraud reports";
					validationInfo.description =
						"The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.";
				} else {
					// Fallback
					chrome.action.setIcon({
						path: { 16: "/images/icon16.png", 32: "/images/icon32.png" },
					});
					chrome.action.setBadgeText({ text: "0" });
					chrome.action.setBadgeBackgroundColor({ color: "#05ed05" });
				}

				// Update the tab with the validation info
				// index.html catches this info and shows it in the popup
				sendMessage(tab, "domain", {
					isSuccess: true,
					domain: url,
					createdOn: createdOn ? createdOn.getTime() : 0,
					type: validationInfo.type,
					msg: validationInfo.msg,
					description: validationInfo.description,
				});
			}
		);
	}
}

// process tab on tab update
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
	console.log(tab);
	processTab(tab);
});

// on tab switch
chrome.tabs.onActivated.addListener((activeInfo) => {
	console.log({ activeInfo });
	chrome.tabs.query(
		{
			active: true,
			currentWindow: true,
		},
		function (tabs) {
			var tab = tabs[0];
			var url = tab.url;
			console.log("url", tabs);
			processTab(tabs[0]);
		}
	);
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
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	console.log("msg in background", request, sender, sendResponse);
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
	}
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
