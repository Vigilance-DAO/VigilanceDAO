// @ts-check
const mixpanel = require("mixpanel-browser");
const { MIXPANEL_PROJECT_ID } = require("../privateenv");
const { getFonts, chromeRuntimeGetUrlWrapped } = require("./fonts");

const ContractInfoAPIURL =
	"https://8md2nmtej9.execute-api.ap-northeast-1.amazonaws.com/contract-info";

/**
 * @param {MetaMaskRequest} params
 * @returns {params is ETH_SendTransactionRequest}
 */
function isSendTransactionRequest(params) {
	return params.method == "eth_sendTransaction";
}

/**
 * @param {BasicContractInfo} basicInfo
 * @returns {Promise<ContractInfo | null>}
 */
function fetchContractInfo(basicInfo) {
	console.log("fetchContractInfo", basicInfo);
	return fetch(ContractInfoAPIURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(basicInfo),
	})
		.then((response) => response.json())
		.catch((error) => {
			console.error(error);
			return null;
		});
}

/**
 * @type {<E extends Element = Element>(shadowRoot: ShadowRoot, selector: string) => E}
 */
function querySelector(shadowRoot, selector) {
	const element = shadowRoot.querySelector(selector);

	if (element == null) {
		throw new Error(`No element found for ${selector}`);
	}

	// @ts-expect-error
	return element;
}

const financialAlertDialog = document.createElement("dialog");
let financialAlertDialogInnerHtml = "";

/**
 * @param {FinancialAlertInfo} alertInfo
 */
async function createFinancialAlertDialog(alertInfo) {
	console.log("createFinancialAlertDialog", alertInfo);
	if (alertInfo == undefined) {
		console.error(
			"createFinancialAlertDialog: alertInfo parameter is required"
		);
		return;
	}

	const INNER_BORDER_RADIUS = 10;
	const BORDER_WIDTH = 10;
	const OUTER_BORDER_RADIUS = INNER_BORDER_RADIUS + BORDER_WIDTH;

	if (financialAlertDialogInnerHtml == "") {
		financialAlertDialog.style.borderRadius =
			OUTER_BORDER_RADIUS.toString().concat("px");
		financialAlertDialog.style.zIndex = "10000";
		financialAlertDialog.style.position = "absolute";
		financialAlertDialog.style.top = "10px";
		financialAlertDialog.style.right = "clamp(10px, 3vw, 30px)";
		financialAlertDialog.style.left = "auto";
		financialAlertDialog.style.height = "fit-content";
		financialAlertDialog.style.border = "none";
		financialAlertDialog.style.padding = "0";
		financialAlertDialog.style.background =
			"linear-gradient(to bottom, hsl(265, 100%, 40%), hsl(265, 94%, 19%))";

		/**
		 * @type {string[]}
		 */
		const innerHTMLParts = new Array(3).fill("");
		// part 0 -> fonts
		// part 1 -> css variables
		// part 2 -> financial-alert component content

		innerHTMLParts[0] = `<style>${await getFonts()}</style>`;
		innerHTMLParts[1] = `<style>:host { --border: ${BORDER_WIDTH}px; --inner-border-radius: ${INNER_BORDER_RADIUS}px; }</style>`;
		const url = await chromeRuntimeGetUrlWrapped("static/financial-alert.html");
		innerHTMLParts[2] = await fetch(url)
			.then((response) => response.text())
			.catch((e) => {
				console.error("Error while loading html from financial-alert.html", e);
				return "";
			});

		financialAlertDialogInnerHtml = innerHTMLParts.join("");
	}

	financialAlertDialog.innerHTML = "";
	const div = document.createElement("div");
	const shadowRoot = div.attachShadow({ mode: "closed" });
	financialAlertDialog.appendChild(div);

	shadowRoot.innerHTML = financialAlertDialogInnerHtml;

	const select = querySelector.bind(null, shadowRoot);

	const contractInfoElement = select(".contract-info");
	const contractCreatedOnElement = select(".contract-created-on");
	const transactionsIn24hoursElement = select(".transactions-in-day");
	const transactionsIn30daysElement = select(".transactions-in-month");
	const drainedAccountsValueElement = select(".drained-info .value");

	const proceedButton = select("#proceed-btn");
	const closeButton = select("#close-btn");

	let formattedTransactionsIn30days = alertInfo.transactionsIn30days.toString();
	if (alertInfo.transactionsIn30days >= 1000) {
		formattedTransactionsIn30days = Math.floor(
			alertInfo.transactionsIn30days / 1000
		)
			.toString()
			.concat("K");
	}

	contractInfoElement.innerHTML = alertInfo.contract;
	contractCreatedOnElement.innerHTML = alertInfo.createdOn;
	transactionsIn24hoursElement.innerHTML =
		alertInfo.transactionsIn24hours.toString();
	transactionsIn30daysElement.innerHTML = formattedTransactionsIn30days;
	drainedAccountsValueElement.innerHTML = alertInfo.drainedAccountsValue;
	proceedButton.addEventListener("click", alertInfo.proceedButtonClickListener);
	closeButton.addEventListener("click", alertInfo.cancelButtonClickListener);

	financialAlertDialog.className = "____vigilance-dao-dialog____";
	document.body.appendChild(financialAlertDialog);
	financialAlertDialog.show();
}

/**
 * Formats a ISO date string (2023-07-06T08:58:10.102Z) --> "06 Jul 2023"
 * @param {string} dateString
 */
function formatDate(dateString) {
	return new Date(dateString).toLocaleDateString("en-GB", {
		year: "numeric",
		month: "short",
		day: "2-digit",
	});
}

/**
 * Formats a long text into truncated format
 * @example 0x2ef4a574b72e1f555185afa8a09c6d1a8ac4025c --> 0x2e...025c
 * @param {string} text
 * @returns {string}
 */
function truncateText(text) {
	return text.slice(0, 4).concat("...", text.slice(-4));
}

(function () {
	if (window.ethereum == undefined) {
		console.warn("Metamask extension is not installed");
		return;
	}

	// @ts-expect-error
	const metamaskRequest = window.ethereum.request;
	/**
	 * @param {MetaMaskRequest} params
	 */
	// @ts-expect-error
	window.ethereum.request = (params) => {
		return /** @type {Promise<void>} */ (
			new Promise(async (continueRequest, reject) => {
				if (window.ethereum == undefined || !isSendTransactionRequest(params)) {
					continueRequest();
					return;
				}

				// @ts-expect-error
				const chainId = window.ethereum.networkVersion;

				const { to, from, value, data } = params.params[0];
				mixpanel.init(MIXPANEL_PROJECT_ID, { debug: true });
				mixpanel.identify(from);
				mixpanel.track("Transaction", {
					"toAddress": to,
					"value": value,
					"data": data,
					chainId,
				});

				const contractInfo = await fetchContractInfo({
					address: to,
					chain_id: chainId,
				});

				if (contractInfo == null) {
					// TODO decide what to do at this point
					continueRequest();
					return;
				}
				
				let contractDisplay = truncateText(to);
				if (contractInfo.name) {
					contractDisplay = contractDisplay.concat(
						" (",
						contractInfo.name,
						")"
					);
				}

				createFinancialAlertDialog({
					createdOn: formatDate(contractInfo.creationDate),
					contract: contractDisplay,
					transactionsIn24hours: contractInfo.userCount24hours,
					transactionsIn30days: contractInfo.userCount30days,
					proceedButtonClickListener: () => {
						console.log("proceed btn clicked");
						financialAlertDialog.close();
						continueRequest();
					},
					cancelButtonClickListener: () => {
						financialAlertDialog.close();
						reject(new Error("Transaction cancelled by user."));
					},
					// TODO
					drainedAccountsValue: "High",
				});
			})
		).then(() => {
			return metamaskRequest({ ...params });
		});
	};

	// FOR TESTING
	// createFinancialAlertDialog({
	// 	contract: "Uniswap V3 Router 0x00...34244 [>]",
	// 	createdOn: new Date().toDateString(),
	// 	drainedAccountsValue: "High",
	// 	transactionsIn24hours: 102,
	// 	transactionsIn30days: 1000,
	// 	cancelButtonClickListener: () => {},
	// 	proceedButtonClickListener: () => {},
	// });
})();
