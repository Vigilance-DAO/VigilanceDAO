const FONT_NAME = "X_Roboto";
const FONT_WEIGHTS = {
	"400": "./fonts/Roboto-Regular.ttf",
	"700": "./fonts/Roboto-Bold.ttf",
};

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function chromeRuntimeGetUrlWrapped(url) {
	if (typeof chrome == "undefined" || chrome.runtime == undefined) {
		// We are running inside an injected script then (not a content script)
		// In that case, we have to communicate the content script and get the url
		const message = {
			reason: "runtime-get-url",
			relativeUrl: url,
		};
		return new Promise(function (resolve) {
			/**
			 * @param {MessageEvent<any>} event
			 */
			function handleMessage(event) {
				if (
					event.source === window &&
					event.data != undefined &&
					typeof event.data.response == "string"
				) {
					// if event.data.for is available, only resolve it if it matches with relativeUrl
					if (event.data.for && event.data.for != message.relativeUrl) {
						return;
					}

					// Remove the event listener once the response is received
					window.removeEventListener("message", handleMessage);
					resolve(event.data.response);
				}
			}

			// Listen for messages from the content script
			window.addEventListener("message", handleMessage);

			// Send the message to the content script
			window.postMessage(message, "*");
		});
	} else {
		return chrome.runtime.getURL(url);
	}
}

async function getFonts() {
	if (typeof chrome == "undefined") {
		return "";
	}

	const entries = Object.entries(FONT_WEIGHTS);

	return Promise.all(
		entries.map(async (entry) => {
			const [weight, value] = entry;

			return `@font-face {
  font-family: '${FONT_NAME}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url(${await chromeRuntimeGetUrlWrapped(value)}) format('ttf');
}`;
		})
	)
		.then((rules) => {
			return rules.join("\n");
		})
		.catch((error) => {
			console.error(error);
			return "";
		});
}

module.exports = {
	getFonts,
	chromeRuntimeGetUrlWrapped,
};
