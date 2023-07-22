// @ts-check
const mixpanel = require("mixpanel-browser");
const { MIXPANEL_PROJECT_ID } = require("../privateenv");
const { chromeRuntimeGetUrlWrapped } = require("./fonts");

	
const FortaAPIUrl = "https://api.forta.network/graphql";

const env = {
	host: "https://api.vigilancedao.org"
	// For developement
	// host: "http://localhost:4000",
};

const ContractInfoAPIURL = env.host.concat("/contract-info");

/**
 * @param {import("./inject").MetaMaskRequest} params
 * @returns {params is import("./inject").ETH_SendTransactionRequest}
 */
function isSendTransactionRequest(params) {
	return params.method == "eth_sendTransaction";
}

/**
 * @param {import("./inject").BasicContractInfo} basicInfo
 * @returns {Promise<import("./inject").ContractInfo | null>}
 */
function fetchContractInfo(basicInfo) {
	console.log("fetchContractInfo", basicInfo);

	const contractInfoApiFetch = fetch(ContractInfoAPIURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(basicInfo),
	}).then(
		/**
		 * @returns {Promise<import("./inject").ContractInfo>}
		 */
		async (response) => {
			if (response.ok) {
				return response.json();
			}
			throw await response.text();
		}
	);

	const fortaApiFetch = fetch(FortaAPIUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: `query Labels($input: LabelsInput) {
  labels(input: $input) {
    labels {
      label {
        label
        entity
        metadata
      }
      createdAt
    }
  }
}`,
			variables: {
				"input": {
					"labels": ["scammer"],
					"entities": [basicInfo.address],
				},
			},
		}),
	}).then(
		/**
		 * @returns {Promise<import("./inject").FortaApiResonseData>}
		 */
		async (response) => {
			if (response.ok) {
				return response.json();
			}
			throw await response.text();
		}
	);

	return Promise.allSettled([contractInfoApiFetch, fortaApiFetch])
		.then((resolvedArr) => {
			if (resolvedArr[0].status == "rejected") {
				console.error("request to /contract-info failed");
				return null;
			}

			const data = resolvedArr[0].value;
			console.log("contract info fetched", data);

			let fortaApiResult = null;
			resolvedArr[1].status == "fulfilled"
				? resolvedArr[1].value
				: resolvedArr[1].reason;
			if (resolvedArr[1].status == "fulfilled") {
				fortaApiResult = resolvedArr[1].value;
			} else {
				console.error("request to Forta API failed", resolvedArr[1].reason);
			}

			/**
			 * @type {import("./inject").ContractInfo}
			 */
			const d = {
				userCount24hours: 0,
				userCount30days: 0,
				creationDate: data.creationDate || null,
				feedback: Array.isArray(data.feedback) ? data.feedback : [],
				name: typeof data.name == "string" ? data.name : "NA",
				riskRating: data.riskRating || "MEDIUM",
			};

			if (data.userCount24hours) {
				let value = 0;
				if (typeof data.userCount24hours == "number") {
					value = data.userCount24hours;
				} else if (typeof data.userCount24hours == "string") {
					value = parseInt(data.userCount24hours);
					if (Number.isNaN(value)) value = 0;
				}

				d.userCount24hours = value;
			}
			if (data.userCount30days) {
				let value = 0;
				if (typeof data.userCount30days == "number") {
					value = data.userCount30days;
				} else if (typeof data.userCount30days == "string") {
					value = parseInt(data.userCount30days);
					if (Number.isNaN(value)) value = 0;
				}
				d.userCount30days = value;
			}
			if (fortaApiResult && fortaApiResult.data.labels.labels.length > 0) {
				// labelled as scammer by Forta
				d.feedback.push("Labelled as scammer by Forta");
			}

			console.log("contract info formatted", d);
			return d;
		})
		.catch((error) => {
			console.error(error);
			return null;
		});
}

/**
 * @param {import("../../server/src/types").ContractReport} report
 * @returns {Promise<string | undefined>} string --> error message, undefined --> successful
 */
function submitContractReport(report) {
	return fetch(env.host.concat("/submit-contract-report"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			report,
		}),
	})
		.then((response) => {
			if (response.ok) {
				return;
			}
			return response.text();
		})
		.then(
			(value) => (
				console.log("submitFinancialReport return value", value), value
			)
		)
		.catch((err) => {
			console.log("submitFinancialReport error", err);
			if (err instanceof Error) {
				return `${err.name}: ${err.message}`;
			}
			return "Unknown error occured";
		});
}

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
 * Calling this function with "disable" --> disables auto focusing on dialogs that maybe showing already.
 * "enable" --> reverses it.
 * @param {"disable" | "enable"} value
 */
function toggleOtherDialogs(value) {
	const dialogs = document.querySelectorAll("dialog[open], [role=dialog]");

	for (let i = 0; i < dialogs.length; i++) {
		const element = dialogs.item(i);
		if (element == null || element == undefined) {
			continue;
		}

		console.log(`setting inert=${value == "disable"}`, "on", element);
		if (value == "disable") {
			element.setAttribute("inert", "");
		} else {
			element.removeAttribute("inert");
		}
	}
}

/**
 * @param {"auto" | "reverse-auto"} action
 */
function toggleBodyScrollY(action) {
	if (action == "auto") {
		const oldOverflowY = document.body.style.overflowY;
		if (oldOverflowY != "auto") {
			document.body.dataset.oldOverflowY = oldOverflowY;

			const styleAttributeContent = document.body.getAttribute("style") || "";
			document.body.setAttribute(
				"style",
				styleAttributeContent.concat(";overflow-y: auto !important;")
			);
		}
		return;
	}
	if (action == "reverse-auto") {
		const oldOverflowY = document.body.dataset.oldOverflowY;
		if (oldOverflowY == undefined) return;

		document.body.style.overflowY = oldOverflowY;
		document.body.removeAttribute("data-old-overflow-y");
		return;
	}
}

const financialAlertDialog = document.createElement("dialog");
const FINANCIAL_ALERT_INNER_DIV_ID = "FINANCIAL_ALERT_INNER_DIV_ID";
const FINANCIAL_ALERT_INNER_DIV_SELECTOR = `div#${FINANCIAL_ALERT_INNER_DIV_ID}`;
const FINANCIAL_ALERT_IS_LOADING = "isLoading";
let financialAlertDialogInnerHtml = "";

function getFontLinks() {
	const link1 = document.createElement("link");
	link1.rel = "preconnect";
	link1.href = "https://fonts.googleapis.com";

	const link2 = document.createElement("link");
	link2.rel = "preconnect";
	link2.href = "https://fonts.gstatic.com";
	link2.crossOrigin = "";

	const link3 = document.createElement("link");
	link3.rel = "stylesheet";
	link3.href =
		"https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";

	return [link1, link2, link3];
}

/**
 * Creates the financial alert dialog and displays a loader inside
 */
async function createFinancialAlertDialog() {
	const INNER_BORDER_RADIUS = 10;
	const BORDER_WIDTH = 10;
	const OUTER_BORDER_RADIUS = INNER_BORDER_RADIUS + BORDER_WIDTH;

	if (financialAlertDialogInnerHtml == "") {
		const fontLinks = getFontLinks();
		document.head.appendChild(fontLinks[0]);
		document.head.appendChild(fontLinks[1]);
		document.head.appendChild(fontLinks[2]);

		financialAlertDialog.style.borderRadius =
			OUTER_BORDER_RADIUS.toString().concat("px");
		financialAlertDialog.style.zIndex = "20000";
		financialAlertDialog.style.top = "10px";
		financialAlertDialog.style.right = "clamp(10px, 3vw, 30px)";
		financialAlertDialog.style.left = "auto";
		financialAlertDialog.style.height = "fit-content";
		financialAlertDialog.style.border = "none";
		financialAlertDialog.style.padding = "0";
		financialAlertDialog.style.marginTop = "0";
		financialAlertDialog.style.background =
			"linear-gradient(to bottom, hsl(265, 100%, 40%), hsl(265, 94%, 19%))";
		financialAlertDialog.style.overflow = "hidden";

		financialAlertDialog.className = "____vigilance-dao-dialog____";

		/**
		 * @type {string[]}
		 */
		const innerHTMLParts = new Array(2).fill("");
		// part 0 -> css variables
		// part 1 -> financial-alert component content

		innerHTMLParts[0] = `<style>:host { --border: ${BORDER_WIDTH}px; --inner-border-radius: ${INNER_BORDER_RADIUS}px; }</style>`;
		const url = await chromeRuntimeGetUrlWrapped("static/financial-alert.html");
		innerHTMLParts[1] = await fetch(url)
			.then((response) => response.text())
			.catch((e) => {
				console.error("Error while loading html from financial-alert.html", e);
				return "";
			});

		financialAlertDialogInnerHtml = innerHTMLParts.join("");
	}

	let div = financialAlertDialog.querySelector(
		FINANCIAL_ALERT_INNER_DIV_SELECTOR
	);

	if (div == null) {
		div = document.createElement("div");
		div.id = FINANCIAL_ALERT_INNER_DIV_ID;
		financialAlertDialog.appendChild(div);
	}

	const shadowRoot = div.shadowRoot || div.attachShadow({ mode: "open" });
	shadowRoot.innerHTML = financialAlertDialogInnerHtml;

	document.body.appendChild(financialAlertDialog);

	const select = querySelector.bind(null, shadowRoot);

	const containerElement = select(".container");
	const loadingScreenElement = select(".loading-screen");
	containerElement.dataset[FINANCIAL_ALERT_IS_LOADING] = `${true}`;

	loadingScreenElement.addEventListener("animationend", (event) => {
		if (!(event.target instanceof HTMLElement)) {
			return;
		}
		event.target.remove();
	});

	toggleOtherDialogs("disable");
	financialAlertDialog.show();
}

/**
 * @param {import("./inject").FinancialAlertInfo} alertInfo
 */
function populateFinancialAlertWithData(alertInfo) {
	console.log("populateFinancialAlertWithData", alertInfo);
	if (alertInfo == undefined) {
		console.error(
			"populateFinancialAlertWithData: alertInfo parameter is required"
		);
		return;
	}
	if (financialAlertDialog.innerHTML == "") {
		console.error(
			"populateFinancialAlertWithData: financialAlertDialog haven't been created yet"
		);
		return;
	}

	const innerDiv = financialAlertDialog.querySelector(
		FINANCIAL_ALERT_INNER_DIV_SELECTOR
	);
	if (innerDiv == null || !(innerDiv instanceof HTMLDivElement)) {
		console.error(
			"populateFinancialAlertWithData: financialAlertDialog doesn't have inner div"
		);
		return;
	}
	const shadowRoot = innerDiv.shadowRoot;
	if (shadowRoot == null) {
		console.error(
			"populateFinancialAlertWithData: financialAlertDialog's inner div have closed shadowRoot"
		);
		return;
	}

	toggleBodyScrollY("auto");

	const select = querySelector.bind(null, shadowRoot);

	const containerElement = select(".container");
	const contractInfoElement = select(".contract-info");
	const contractCreatedOnContainerElement = select(
		".contract-created-on-container"
	);
	const contractCreatedOnElement = select(".contract-created-on");
	const transactionsIn24hoursElement = select(".transactions-in-day");
	const transactionsIn30daysElement = select(".transactions-in-month");
	const drainedAccountsValueElement = select(".drained-info .value");
	const feedbackIconElement = select(".feedback-icon");
	const feedbackContainerElement = select(".feedback-container");
	const feedbackListElement = select(".feedback-list");

	const proceedButton = select("#proceed-btn");
	const reportButton = select("#report-btn");
	const closeButton = select("#close-btn");

	const formElement = select("#report-form");
	const fraudTypeSelectElement = select("select[name=fraud-type]");
	const phishingInfoSectionContainer = select("div[data-show-if=phishing]");
	const phishingInfoElement = select("textarea[name=phishing-info]");
	const financialLossInfoSectionContainer = select(
		"div[data-show-if=financial-loss]"
	);
	const financialLossInfoElement = select("textarea[name=financial-loss-info]");
	const formResponseMessageElement = select(".form-response-message");
	const formSubmitButton = select("button.submit");

	let formattedTransactionsIn30days = alertInfo.transactionsIn30days.toString();
	if (alertInfo.transactionsIn30days >= 1000) {
		formattedTransactionsIn30days = Math.floor(
			alertInfo.transactionsIn30days / 1000
		)
			.toString()
			.concat("K");
	}

	contractInfoElement.innerHTML = alertInfo.contract;

	// hide date if undefined
	contractCreatedOnContainerElement.classList.toggle(
		"hidden",
		alertInfo.createdOn == undefined
	);
	if (alertInfo.createdOn != undefined) {
		contractCreatedOnElement.innerHTML = alertInfo.createdOn;
	}

	transactionsIn24hoursElement.innerHTML =
		alertInfo.transactionsIn24hours.toString();
	transactionsIn30daysElement.innerHTML = formattedTransactionsIn30days;
	drainedAccountsValueElement.innerHTML = alertInfo.drainedAccountsValue;
	// color is applied based on this property
	drainedAccountsValueElement.dataset["priority"] =
		alertInfo.drainedAccountsValue.toLowerCase();

	// hide feedback-icon if feedback is empty
	feedbackIconElement.classList.toggle(
		"hidden",
		alertInfo.feedback.length == 0
	);
	feedbackIconElement.addEventListener("click", () => {
		if (!(feedbackContainerElement instanceof HTMLDetailsElement)) {
			return;
		}

		feedbackContainerElement.open = !feedbackContainerElement.open;
	});
	feedbackContainerElement.classList.toggle(
		"hidden",
		alertInfo.feedback.length == 0
	);

	if (alertInfo.feedback.length != 0) {
		feedbackListElement.innerHTML = alertInfo.feedback
			.map((i) => `<li>${i}</li>`)
			.join("");
	}

	proceedButton.addEventListener("click", alertInfo.proceedButtonClickListener);
	closeButton.addEventListener("click", alertInfo.cancelButtonClickListener);
	reportButton.addEventListener("click", () => {
		formElement.classList.toggle("hidden");
	});

	if (!(formElement instanceof HTMLFormElement)) {
		console.error(formElement);
		throw new Error("formElement is expected to be a form element.");
	}

	if (!(fraudTypeSelectElement instanceof HTMLSelectElement)) {
		console.error(fraudTypeSelectElement);
		throw new Error(
			"fraudTypeSelectElement is expected to be a select element."
		);
	}
	if (!(financialLossInfoElement instanceof HTMLTextAreaElement)) {
		console.error(financialLossInfoElement);
		throw new Error(
			"financialLossInfoElement is expected to be a textarea element."
		);
	}
	if (!(phishingInfoElement instanceof HTMLTextAreaElement)) {
		console.error(phishingInfoElement);
		throw new Error(
			"phishingInfoElement is expected to be a textarea element."
		);
	}
	if (!(formSubmitButton instanceof HTMLButtonElement)) {
		console.error(formSubmitButton);
		throw new Error("formSubmitButton is expected to be a button element.");
	}

	/**
	 * @param {import("../../server/src/types").ContractReport_FraudType} sectionId
	 */
	function displayInfoSectionInForm(sectionId) {
		if (sectionId != "phishing" && sectionId != "financial-loss") {
			console.error(
				"displayInfoSectionInForm: invalid value for sectionId",
				sectionId
			);
			return;
		}

		phishingInfoSectionContainer.classList.toggle(
			"hidden",
			// false,
			sectionId != "phishing"
		);
		financialLossInfoSectionContainer.classList.toggle(
			"hidden",
			// false
			sectionId != "financial-loss"
		);
	}

	/**
	 * @param {string} message
	 * @param {"error" | "success"} type
	 */
	function showFormResponseMessage(message, type) {
		formResponseMessageElement.classList.toggle("error", type == "error");
		formResponseMessageElement.classList.toggle("success", type == "success");

		formResponseMessageElement.innerText = message;
	}

	displayInfoSectionInForm(fraudTypeSelectElement.value);

	fraudTypeSelectElement.addEventListener("change", () => {
		displayInfoSectionInForm(fraudTypeSelectElement.value);
	});

	formElement.addEventListener("submit", (event) => {
		event.preventDefault();

		let info = "";
		// phishingInfoElement.value;
		switch (fraudTypeSelectElement.value) {
			case "financial-loss":
				info = financialLossInfoElement.value;
				break;
			case "phishing":
				info = phishingInfoElement.value;
				break;
			default:
				console.warn(
					"unknown value for fraud type",
					fraudTypeSelectElement.value
				);
		}

		if (info == "") {
			showFormResponseMessage(
				"Provide some information about the fraud",
				"error"
			);
			return;
		}

		submitContractReport({
			...alertInfo.reportBasicBody,
			fraudType: fraudTypeSelectElement.value,
			info,
		}).then((v) => {
			if (v == undefined) {
				showFormResponseMessage("Successfully submitted", "success");
			} else {
				showFormResponseMessage(v, "error");
			}
		});
	});

	containerElement.dataset[FINANCIAL_ALERT_IS_LOADING] = `${false}`;
}

/**
 * Formats a ISO date string (2023-07-06T08:58:10.102Z) --> "06 Jul 2023"
 * @param {string | null} dateString
 */
function formatDate(dateString) {
	if (dateString == null) {
		return undefined;
	}
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

const SUPPORTED_CHAINS = ["1", "137"];

(function () {
	if (window.ethereum == undefined) {
		console.warn("Metamask extension is not installed");
		return;
	}

	// @ts-expect-error
	const metamaskRequest = window.ethereum.request;
	/**
	 * @param {import("./inject").MetaMaskRequest} params
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
				
				if (!SUPPORTED_CHAINS.includes(chainId)) {
					continueRequest();
					return;
				}

				await createFinancialAlertDialog();
				console.log("reciever's address (provided by metamask)", to);
				if (window._ethers == undefined) {
					console.warn("window._ethers is undefined.");
					continueRequest();
					return;
				}

				const checksumAddress = window._ethers.utils.getAddress(to);
				console.log("reciever's address (checksum)", checksumAddress);
				const contractInfo = await fetchContractInfo({
					address: checksumAddress,
					chain_id: chainId,
				});

				if (contractInfo == null) {
					// TODO decide what to do at this point
					continueRequest();
					return;
				}

				let contractDisplay = truncateText(checksumAddress);
				const shouldIncludeContractInfoName =
					contractInfo.name && contractInfo.name != "NA";

				if (shouldIncludeContractInfoName) {
					contractDisplay = contractDisplay.concat(
						" (",
						contractInfo.name,
						")"
					);
				}

				populateFinancialAlertWithData({
					createdOn: formatDate(contractInfo.creationDate),
					contract: contractDisplay,
					transactionsIn24hours: contractInfo.userCount24hours || 0,
					transactionsIn30days: contractInfo.userCount30days || 0,
					proceedButtonClickListener: () => {
						financialAlertDialog.close();
						financialAlertDialog.remove();
						toggleOtherDialogs("enable");
						toggleBodyScrollY("reverse-auto");
						
						continueRequest();
					},
					cancelButtonClickListener: () => {
						financialAlertDialog.close();
						financialAlertDialog.remove();
						toggleOtherDialogs("enable");
						toggleBodyScrollY("reverse-auto");
						reject(new Error("Transaction cancelled by user."));
					},
					drainedAccountsValue: contractInfo.riskRating,
					feedback: contractInfo.feedback,
					reportBasicBody: {
						address: checksumAddress,
						chainId,
						name: shouldIncludeContractInfoName ? contractInfo.name : undefined,
					},
				});
			})
		).then(() => {
			return metamaskRequest({ ...params });
		});
	};
})();

// FOR TESTING
//(async () => {
//	if (location.hostname != "sahithyan.dev") {
//		return;
//	}
//	await createFinancialAlertDialog();

//	await new Promise((resolve) => {
//		setTimeout(resolve, 1000);
//	});

//	populateFinancialAlertWithData({
//		contract: "Uniswap V3 Router 0x00...34244 [>]",
//		createdOn: formatDate(new Date().toString()),
//		drainedAccountsValue: "HIGH",
//		transactionsIn24hours: 102,
//		transactionsIn30days: 1000,
//		feedback: [
//			"Odit ab blanditiis corporis adipisci asperiores dolorem fugiat.",
//			"Vero modi accusamus suscipit pariatur voluptas fugiat.",
//			"Voluptatem porro suscipit qui.",
//		],
//		reportBasicBody: {
//			address: "0x2ef4a574b72e1f555185afa8a09c6d1a8ac4025c",
//			chainId: "137",
//			name: "Sahithyan Testing",
//		},
//		cancelButtonClickListener: () => {
//			financialAlertDialog.close();
//			financialAlertDialog.remove();
//		},
//		proceedButtonClickListener: () => {},
//	});
// })();
