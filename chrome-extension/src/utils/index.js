// @ts-check
import mixpanel from "mixpanel-browser";
import { API_ENDPOINT, USER_ID_KEY } from "../../constants";
import axios from "axios";

export async function subgraphQuery(query) {
  try {
    const SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/venkatteja/vigilancedao";
    const response = await axios.post(SUBGRAPH_URL, {
      query,
    });
    if (response.data.errors) {
      console.error(response.data.errors);
      throw new Error(`Error making subgraph query ${response.data.errors}`);
    }
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Could not query the subgraph ${error.message}`);
  }
}

/**
 * null -> error occured
 * undefined -> no user id saved
 * string -> user id
 */
function getUserId() {
	return chrome.storage.sync
		.get(USER_ID_KEY)
		.then(
			/** @returns {string | undefined} */
			(result) => {
				return result[USER_ID_KEY];
			}
		)
		.catch((err) => {
			console.error("Failed to read user id", err);
			return null;
		});
}

/**
 * Sends an event to Mixpanel. Can be used only in content.js
 * @param {import("../../../important-types").TrackingEvent} event
 * @returns {Promise<void>}
 */
export async function trackEventInContentScript(event) {
	if (event == undefined) return;

	const userId = await getUserId();
	if (userId == null) return;
	event.userId = userId;
	console.log("trackEventFromContentScript", event);

	mixpanel.identify(userId);
	mixpanel.track(event.eventName, {
		...event.eventData,
		accountId: event.accountId,
		userId: event.userId,
	});
}

/**
 * Sends an event to /event endpoint on the server
 * @param {import("../../../important-types").TrackingEvent} event
 * @returns {Promise<void>}
 */
export async function sendEvent(event) {
	if (event == undefined) return;
	
	if (typeof chrome == "undefined" || chrome.storage == undefined) {
		// means the function is called from an injected script
		// in that instance, pass the event to content script
		// and it will, then, send the event
		const message = {
			reason: "send-event",
			event,
		};

		window.postMessage(message, "*");
		return;
	}

	const userId = await getUserId();
	if (userId == null) return;

	event.userId = userId;
	console.log("sendEvent event", event);

	return fetch(`${API_ENDPOINT}/event`, {
		method: "POST",
		body: JSON.stringify(event),
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then(async (response) => {
			const body = await response.text();
			if (!response.ok) {
				console.error("sendEvent: response not ok", response.status, body);
				return;
			}

			if (userId != body) {
				return chrome.storage.sync
					.set({ [USER_ID_KEY]: body })
					.then(() => console.log("saved", USER_ID_KEY, "=", body));
			}
		})
		.catch((error) => {
			console.warn("Error occured while sending event to server");
			console.error(error);
		});
}
