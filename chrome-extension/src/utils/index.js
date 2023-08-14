// @ts-check
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
 * @param {import("../../../important-types").TrackingEvent} event
 * @returns {Promise<void>}
 */
export async function sendEvent(event) {
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

	const userId = await chrome.storage.sync
		.get(USER_ID_KEY)
		.then((result) => result[USER_ID_KEY])
		.catch(console.error);
	console.log("sendEvent userId", userId);
	event.userId = userId;

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
