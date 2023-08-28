
/**
 * @typedef ActionBadgeValues
 * @prop {string} [text]
 *
 *
 * @param {"loading" | "scam" | "legit" | "warning" | "reset" | "error"} key
 * @param {ActionBadgeValues} [values]
 */
export function updateActionBadge(key, values) {
	if (key != "warning" && typeof values != "undefined") {
		console.warn("Values object only has effect when key is 'warning'");
	}

	if (key == "loading") {
		chrome.action.setIcon({
			path: { 16: "/images/icon16.png", 32: "/images/icon32.png" },
		});
		chrome.action.setBadgeText({ text: "..." });
		chrome.action.setBadgeBackgroundColor({ color: "yellow" });
	} else if (key == "scam") {
		chrome.action.setIcon({
			path: {
				19: "/images/alerticon19-red.png",
				38: "/images/alerticon38-red.png",
			},
		});
		chrome.action.setBadgeText({ text: "❌" });
		chrome.action.setBadgeBackgroundColor({ color: "#f96c6c" });
	} else if (key == "legit") {
		chrome.action.setIcon({
			path: { 16: "/images/icon16.png", 32: "/images/icon32.png" },
		});
		chrome.action.setBadgeText({ text: "✔️" });
		chrome.action.setBadgeBackgroundColor({ color: "#05ed05" });
	} else if (key == "warning") {
		chrome.action.setIcon({
			path: {
				19: "/images/alerticon19-red.png",
				38: "/images/alerticon38-red.png",
			},
		});
		chrome.action.setBadgeText({ text: values?.text || "1" });
		chrome.action.setBadgeBackgroundColor({ color: "#f96c6c" });
	} else if (key == "reset") {
		chrome.action.setIcon({
			path: { 16: "/images/icon16.png", 32: "/images/icon32.png" },
		});
		chrome.action.setBadgeText({ text: "0" });
		chrome.action.setBadgeBackgroundColor({ color: "#05ed05" });
	} else if (key == "error") {
		chrome.action.setIcon({
			path: { 16: "/images/icon16.png", 32: "/images/icon32.png" },
		});
		chrome.action.setBadgeText({ text: "⚠️" });
		chrome.action.setBadgeBackgroundColor({ color: "#000000" });
	} else {
		console.error(`Invalid key for updateActionBadge: ${key}`);
		return;
	}
}

/**
 * Returns a unique key for a specific url
 * @param {string} url
 */
export function getStorageKey(url) {
	return `vigil__${url}`;
}
