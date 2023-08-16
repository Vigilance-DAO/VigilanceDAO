// @ts-check
const createMetaMaskProvider = require("metamask-extension-provider");
const mixpanel = require("mixpanel-browser")
const { address, abi, API_ENDPOINT } = require("../constants");
const { MIXPANEL_PROJECT_ID } = require("../privateenv");
const { getFonts } = require("./fonts");
const { sendEvent, trackEventInContentScript } = require("./utils");

// ! For production uncomment these lines
console.log = function(){};
console.debug = function(){};
console.error = function(){};
console.warn = function(){};

// @ts-expect-error
console.log("psl", psl);
console.log("ethers", window.ethereum);
let domain = "";
// console.log('window', window)

// initialize mixpanel with Project ID.
mixpanel.init(MIXPANEL_PROJECT_ID, {debug: true});

const env = {
	host: API_ENDPOINT,
	alertPeriod: 4 * 30 * 86400 * 1000,
	rpcs: {
		polygonTestnet: 'https://polygon-mumbai.g.alchemy.com/v2/1faz4r-pcSp890xH8xfvX-ZIGTTIpG3N'
	}
};

let url = window.location.host;

/**
 * @type {<E extends HTMLElement = HTMLElement>(shadowRoot: ShadowRoot, selector: string) => E}
 */
function querySelector(shadowRoot, selector) {
	const element = shadowRoot.querySelector(selector);

	if (element == null) {
		throw new Error(`No element found for ${selector}`);
	}

	// @ts-expect-error
	return element;
}

/**
 * @param {string} type a unique string
 * @param {unknown} data the payload
 * @returns {Promise<any>}
 */
function sendMessageToBackground(type, data = undefined) {
	return chrome.runtime.sendMessage({ type, data });
}

function closeInternetVigilance() {
	const element = document.getElementById("internetVigilanceBackdrop");
	if (element == null) return;
	element.style.display = "none";
}

function closeInternetVigilanceWithNoMoreShow() {
	const element = document.getElementById("internetVigilanceBackdrop");
	if (element != null) {
		element.style.display = "none";
	}

	chrome.storage.sync.get(
		[url],
		/**
		 * @param {Record<string,import("./types").DomainStorageItem>} items
		 */
		function (items) {
			console.debug(
				"closeInternetVigilanceWithNoMoreShow",
				items,
				url,
				new Date()
			);
			if (items[url]) {
				const data = items[url];
				data.dontShowAgain = true;
				const save = {
					[url]: data,
				};
				chrome.storage.sync.set(save, function () {
					console.log("setting storage", save);
					console.log("saved dont show again", url);
				});
			}
		}
	);
}

// @ts-expect-error
let provider = createMetaMaskProvider();
provider.on(
	"chainChanged",
	/**
	 * @param {string} chainId
	 */
	(chainId) => {
		console.log("chainChanged", chainId);
		onUpdateChainID(parseInt(chainId));
	}
);
provider.on(
	"disconnect",
	/**
	 * @param {unknown} error
	 */
	(error) => {
		console.log("disconnect", error);
	}
);
provider.on(
	"connect",
	/** @param {{ chainId: string; }} connectInfo */
	(connectInfo) => {
		console.log("connect", connectInfo);
		onUpdateChainID(parseInt(connectInfo.chainId));
	}
);
provider.on(
	"accountsChanged",
	/**
	 * @param {string[]} accounts
	 */
	(accounts) => {
		console.log("accountsChanged", accounts);
		onAccountChange(accounts[0]);
	}
);

/**
 * @param {number} chainId
 */
function onUpdateChainID(chainId) {
	sendMessageToBackground("chainID", {
		chainId,
	}).then((response) => {
		console.log("message cb: onUpdateChainID", response);
	});
}

/**
 * @param {string} account
 */
function onAccountChange(account) {
	console.log("Account:", account);

	sendMessageToBackground("wallet-connected", { account }).then((response) => {
		console.log("message cb: onAccountChange", response);
	});
}

/**
 * @param {string} txName
 * @param {undefined} txHash
 * @param {boolean} isSuccess
 * @param {string | null} error
 */
function onTransactionUpdate(txName, txHash, isSuccess, error) {
	const data = {
		txName,
		txHash,
		isSuccess,
		error,
	};

	console.log("onTransactionUpdate:", data);
	sendMessageToBackground("transaction-update", data).then((response) => {
		console.log("message cb: onTransactionUpdate", response);
	});
}

async function getStakeAmount() {
	try {
		console.log('getStakeAmount')
		// @ts-expect-error
		if (!ethers) {
			alert("No provider found");
			return;
		}
		// @ts-expect-error
		let _provider = new _ethers.providers.JsonRpcProvider(env.rpcs.polygonTestnet);
		// let _provider = new ethers.providers.Web3Provider(provider, "any");
		// @ts-expect-error
		const contract = new ethers.Contract(address, abi, _provider);
		let stakeAmount = await contract.stakingAmount();
		console.log("stakeAmount", stakeAmount);
		// @ts-expect-error
		stakeAmount = parseFloat(ethers.utils.formatEther(stakeAmount));

		sendMessageToBackground("stake-amount", {
			stakeAmount,
		}).then((response) => {
			console.log("message cb: getStakeAmount", response);
		});
	} catch(err) {
		console.error('getStakeAmount error', err)
	}
}

/**
 * @param {string} domain
 * @param {any} isFraud
 * @param {any} txHash
 */
function trackSubmitReport(domain, isFraud, txHash) {
	return trackEventInContentScript({
		eventName: "Submit Report",
		eventData: {
			domain,
			isFraud,
			txHash,
		},
	});
}

/**
 * @param {{ domain: any; error: any; }} data
 */
function trackDomainError(data) {
	return trackEventInContentScript({
		eventName: "Domain Error",
		eventData: {
			domain: data.domain,
			error: data.error,
		},
	});
}

/**
 * @param {import("./types").ComputedDomainStorageItem} data
 */
function trackVisitedDomain(data) {
	return trackEventInContentScript({
		eventName: "Visited Domain",
		eventData: {
			"domain": data.domain,
			"createdOn": data.createdon,
			"hasScamReports":
				data.validationInfo == undefined
					? undefined
					: data.validationInfo.isScamVerified,
			"hasLegitReports":
				data.validationInfo == undefined
					? undefined
					: data.validationInfo.isLegitVerified,
			"IsCreatedRecently": data.isNew,
			"Report":
				data.validationInfo == undefined ? undefined : data.validationInfo.msg,
		},
	});
	// console.log("mixpanel track visited domain", err)
}

/**
 * We can't use inject.js as a content script because content scripts wouldn't
 * have access to window.ethereum or any other additional APIs.
 * To learn more:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#content_script_environment:~:text=However%2C%20content%20scripts,the%20redefined%20version.
 */
const addScriptTagInPage = async () => {
	const script = window.document.createElement("script");
	let url = chrome.runtime?.getURL("inject.js");
	console.log("url", url);
	script.src = url;
	(window.document.head || window.document.documentElement).appendChild(script);
};

addScriptTagInPage();

/**
 * @param {any} isFraud
 * @param {any} imageUrls
 * @param {any} comments
 * @param {string} stakeETH
 */
async function submitReport(isFraud, imageUrls, comments, stakeETH) {
	console.log("submitting report", {
		isFraud,
		imageUrls,
		comments,
		stakeETH,
		domain,
	});
	// let _provider = new ethers.providers.Web3Provider(provider, "any");
	// @ts-expect-error
	let _provider = new _ethers.providers.JsonRpcProvider(env.rpcs.polygonTestnet);
	// @ts-expect-error
	const contract = new ethers.Contract(address, abi, _provider);
	let tx;
	try {
		// @ts-expect-error
		let value = ethers.utils.hexValue(
			// @ts-expect-error
			ethers.utils.parseEther(stakeETH + "", 18)
		);
		// tx = await provider.send('report', [domain, isFraud, imageUrls, comments])
		let data = await contract.populateTransaction.report(
			domain,
			isFraud,
			imageUrls,
			comments
		);
		const transactionParameters = {
			to: address, // Required except during contract publications.
			from: provider.selectedAddress,
			value, // Only required to send ether to the recipient from the initiating external account.
			data: data.data,
		};

		const tx = await provider.request({
			method: "eth_sendTransaction",
			params: [transactionParameters],
		});

		let interval = setInterval(async () => {
			const receipt = await provider.request({
				method: "eth_getTransactionReceipt",
				params: [tx],
			});
			console.log("submitReport", receipt, receipt?.status);
			let status = parseInt(receipt?.status);
			if (status == 1 || status == 0) {
				onTransactionUpdate("submit-report", tx, true, null);
				clearInterval(interval);
				trackSubmitReport(domain, isFraud, tx);
			}
		}, 5000);
	} catch (err) {
		console.warn("error submit report", err);
		let error = "Something went wrong";
		if (err instanceof Error && typeof err.message == "string") {
			error = err.message;
		}
		onTransactionUpdate("submit-report", tx, false, error);
	}
}

async function connectWallet() {
	// @ts-expect-error
	console.log("connect wallet", ethers);
	console.log("provider", provider);
	// const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
	// const provider = await detectEthereumProvider()
	if (provider) {
		// Prompt user for account connections
		await checkNetwork();
		await provider.request({ method: 'eth_requestAccounts' });
		const account = provider.selectedAddress;
		onAccountChange(account);
	} else {
		alert("no provider");
	}
}

async function checkDomain() {
	console.log(url);
	// @ts-expect-error
	var parsed = psl.parse(url);
	console.log("checkDomain parsed url", parsed);

	if (parsed.error || parsed.domain == null) {
		return;
	}

	url = parsed.domain;
	domain = url;
	let count = 0;
	let interval = setInterval(() => {
		chrome.storage.sync.get(
			[url],
			/**
			 * @param {Record<string, import("./types").DomainStorageItem>} items
			 */
			function (items) {
				console.debug(items, url, new Date());
				const item = items[url];
				if (!item) return;

				clearInterval(interval);

				if (item.createdon == undefined) return;

				let dontShowAgain = item.dontShowAgain;
				let createdon = new Date(item.createdon);
				let now = new Date();
				if (dontShowAgain) {
					console.log("user opted to not show again");
					return;
				}
				if (now.getTime() - createdon.getTime() < env.alertPeriod) {
					console.log("Vigilance DAO: domain is new. trigger.");
				} else {
					console.log("Vigilance DAO: domain is old enough");
				}
			}
		);
		if (count > 100) {
			clearInterval(interval);
		}
		count += 1;
	}, 1000);
}

checkDomain();

/**
 * @param {string} chainID
 */
async function changeNetwork(chainID) {
	// @ts-expect-error
	let chainIDHex = ethers.utils.hexValue(chainID);
	await provider.request({
		method: "wallet_switchEthereumChain",
		params: [{ chainId: chainIDHex }], // chainId must be in hexadecimal numbers
	});
	let chainId = parseInt(provider.chainId);
	onUpdateChainID(chainId);
}

/**
 * @type {HTMLDivElement | null}
 */
let alertVerifiedContainer = null;
const CLOSE_ICON = `<svg class="icon icon-tabler icon-tabler-x" width="100%" height="100%" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <path d="M18 6l-12 12"></path>
   <path d="M6 6l12 12"></path>
</svg>`;

/**
 * Displays a Vigilance DAO logo in the bottom-right corner of the window.
 */
async function displayVerifiedAlert() {
	if (alertVerifiedContainer) return;

	alertVerifiedContainer = document.createElement("div");

	const innerHTMLParts = new Array(2);
	// part 0 -> fonts, css
	// part 1 -> html

	innerHTMLParts[0] = `
	<style>
		${await getFonts()}
		:host {
			z-index: 10000;
			position: fixed;
			bottom: clamp(10px, 2vh, 30px);
			right: clamp(10px, 3vw, 30px);
		}
		img.verified-icon {
			cursor: pointer;
			filter: drop-shadow(0px 0px 10px #00eb18);
		}
		span.close-icon {
			cursor: pointer;
			position: absolute;
			z-index: -1;
			top: -10px;
			right: -10px;
			width: 16px;
			height: 16px;
			transition: opacity .3s ease-in-out, transform .2s ease-in-out;
		}
		div.container span.close-icon {
			opacity: 0;
			pointer-events: none;
			transform: translate(-16px, 16px);
		}
		div.container:hover span.close-icon {
			opacity: 1;
			pointer-events: auto;
			transform: translate(0, 0);
		}
	</style>`.trim();

	const verifiedIconSrc = chrome.runtime.getURL("images/icon48.png");
	innerHTMLParts[1] = `
		<div class="container">
			<img class="verified-icon" src="${verifiedIconSrc}" title="Verified by Vigilance DAO" />
			<span class="close-icon" title="Close">
				${CLOSE_ICON}
			</span>
		</div>
	`;

	const shadowRoot = alertVerifiedContainer.attachShadow({ mode: "closed" });
	shadowRoot.innerHTML = innerHTMLParts.join("");
	const closeIcon = shadowRoot.querySelector(".close-icon");

	if (closeIcon) {
		closeIcon.addEventListener("click", () => {
			if (alertVerifiedContainer) {
				alertVerifiedContainer.remove();
				alertVerifiedContainer = null;
			}
		});
	}

	document.body.append(alertVerifiedContainer);
}

/**
 * @type {HTMLDialogElement}
 */
let alertDialog = document.createElement("dialog");

/**
 * @typedef AlertInfo
 * @prop {string} heading
 * @prop {string} description
 * @prop {string | undefined} category
 * @prop {string} domainCreatedOn
 * @prop {string} imageSrc
 * @prop {string} url
 *
 * @param {AlertInfo} alertInfo
 */
async function createAlertDialog(alertInfo) {
	if (alertDialog.innerHTML != "") return;

	alertDialog.style.borderRadius = "9px";
	alertDialog.style.zIndex = "10000";
	alertDialog.style.margin = "auto clamp(10px, 3vw, 30px) 25px auto";
	alertDialog.style.height = "fit-content";
	alertDialog.style.border = "none";
	alertDialog.style.padding = "0";

	const innerHTMLParts = new Array(3).fill("");
	// part 0 -> fonts
	// part 1 -> custom css variables
	// part 2 -> alert component content

	innerHTMLParts[0] = `<style>${getFonts()}</style>`;

	let borderColor = undefined;
	if (alertInfo.imageSrc.includes("dangerous.png")) {
		borderColor = "#b70606";
	} else if (alertInfo.imageSrc.includes("warning.png")) {
		borderColor = "#ffb800";
	}

	if (borderColor != undefined) {
		innerHTMLParts[1] = `<style>:host { --border-color: ${borderColor}; }</style>`;
	}

	innerHTMLParts[2] = await fetch(chrome.runtime.getURL("static/alert.html"))
		.then((response) => response.text())
		.catch((e) => {
			console.error("Error while loading html from alert.html", e);
			return "";
		});

	const div = document.createElement("div");
	const shadowRoot = div.attachShadow({ mode: "closed" });
	alertDialog.append(div);

	shadowRoot.innerHTML = innerHTMLParts.join("");
	const select = querySelector.bind(null, shadowRoot);

	const headingElement = select(".heading");
	const descriptionElement = select(".description");
	const categoryElement = select("#category");
	const createdOnElement = select("#domain-reg-date");
	const statusImgElement = select(".status-image");

	if (!(statusImgElement instanceof HTMLImageElement)) {
		throw new Error(".status-image is not an img element");
	}

	if (alertInfo.category == undefined && categoryElement.parentElement) {
		categoryElement.parentElement.remove();
	}
	createdOnElement.innerHTML = alertInfo.domainCreatedOn;
	headingElement.innerHTML = alertInfo.heading;
	descriptionElement.innerHTML = alertInfo.description;
	statusImgElement.src = alertInfo.imageSrc;

	shadowRoot.addEventListener("click", (event) => {
		console.log("dialog clicked", event);

		if (!(event.target instanceof HTMLElement)) {
			return;
		}

		const targetElement = event.target;
		const target = targetElement.id;

		if (target == "close-website") {
			sendMessageToBackground("close-website");
		} else if (target == "hide") {
			alertDialog.close();
		} else if (target == "dont-show-again") {
			sendMessageToBackground("alert-dont-show-again", {
				url: alertInfo.url,
			});
			alertDialog.close();
		}
	});
	alertDialog.className = "____vigilance-dao-dialog____";
	document.body.appendChild(alertDialog);
	alertDialog.showModal();
}

async function checkNetwork() {
	let chainId = provider.chainId;
	if (chainId != "0x13881") {
		await changeNetwork("0x13881");
	}
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	console.log("on message", msg, sender);

	if (msg == undefined || typeof msg.type != "string") {
		return;
	}

	if (msg.type == "toggle") {
		toggle();
		sendResponse();
	}

	let type = msg.type;
	console.log('content js msg recieved', type)
	if (msg.type == "connect-wallet-2") {
		connectWallet();
	} else if (msg.type == "switch-network-2") {
		changeNetwork(msg.data.chainID);
	} else if (msg.type == "submit-report-2") {
		submitReport(
			msg.data.isFraud,
			msg.data.imageUrls,
			msg.data.comments,
			msg.data.stakeETH
		);
	} else if (msg.type == "get-stake-amount-2") {
		getStakeAmount();
	} else if (msg.type == "processing-finished") {
		console.log("processing-finished", msg.data);
		/**
		 * @type {import("./types").ComputedDomainStorageItem}
		 */
		const data = msg.data;
		trackVisitedDomain(data)

		if (
			data.validationInfo != undefined &&
			data.validationInfo.isLegitVerified
		) {
			displayVerifiedAlert();
			return;
		}

		let heading = "";
		let description = "";
		let category;
		let imageSrc = chrome.runtime.getURL("images/icon128.png");
		if (data.scamInfo == undefined) {
			// @ts-expect-error
			data.scamInfo = {};
		}

		if (data.createdon == undefined || data.domain == undefined) return;

		if (data.isNew) {
			heading = "Be Cautious";
			description =
				"New domains can be risky; scammers may use them for fraud. Be cautious, especially with money.";
			imageSrc = chrome.runtime.getURL("images/warning.png");
		} else if (
			data.validationInfo != undefined &&
			data.validationInfo.openScamReports > 0
		) {
			heading = "Likely Dangerous website";
			description =
				"We have reports that this could be a fraudulent website.";
			imageSrc = chrome.runtime.getURL("images/dangerous.png");
			if (data.scamInfo != undefined && data.scamInfo.attackType) {
				category = data.scamInfo.attackType;
			} else {
				category = "Unknown";
			}
		} else if (
			data.validationInfo != undefined &&
			data.validationInfo.isScamVerified
		) {
			heading = "Confirmed scamming website";
			description =
				"This website has been confirmed to be a scam. Avoid using it.";
			imageSrc = chrome.runtime.getURL("images/dangerous.png");
			if (data.scamInfo != undefined && data.scamInfo.attackType) {
				category = data.scamInfo.attackType;
			} else {
				category = "Unknown";
			}
		} else {
			return;
		}

		createAlertDialog({
			domainCreatedOn: new Date(data.createdon).toLocaleDateString("en-GB", {
				dateStyle: "long",
			}),
			description,
			category,
			heading,
			imageSrc,
			url: data.domain,
		});
	}
	else if(msg.type == "domain-error") {
		trackDomainError(msg.data)
	}
	return true;
});

var iframe = document.createElement("iframe");
iframe.style.background = "none";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.frameBorder = "none";
iframe.src = chrome.runtime.getURL("static/index.html");
document.body.appendChild(iframe);
// iframe.innerHTML
function toggle() {
	if (iframe.style.width == "0px") {
		iframe.style.width = "420px";
	} else {
		iframe.style.width = "0px";
	}
	// injectWindow()
	// console.log(iframe.innerHTML)
	// var div = document.createElement(iframe.innerHTML);

	// var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	// xhr.open('get', iframe.src, true);
	// xhr.onreadystatechange = function() {
	//     if (xhr.readyState == 4 && xhr.status == 200) {
	//         var div = document.createElement('div');
	//         div.className = 'myname'
	//         div.innerHTML = xhr.responseText
	//         document.body.prepend(div)
	//     }
	// }
	// xhr.send();

	// console.log('runtime', chrome.runtime.sendMessage)
	// chrome.runtime.sendMessage({type: "take-screenshot"}, function(response) {
	//     console.log('message cb', response);
	// });
}

window.addEventListener("message", (event) => {
	if (
		event.source != window ||
		event.data == undefined ||
		typeof event.data.reason != "string"
	) {
		return;
	}

	if (
		event.data.reason == "runtime-get-url" &&
		typeof event.data.relativeUrl == "string"
	) {
		window.postMessage(
			{
				for: event.data.relativeUrl,
				response: chrome.runtime.getURL(event.data.relativeUrl),
			},
			"*"
		);
		return;
	}

	if (
		event.data.reason == "send-event" &&
		typeof event.data.event != "undefined"
	) {
		sendEvent(event.data.event);
		return;
	}
});
