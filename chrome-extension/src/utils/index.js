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
 */
export async function sendEvent(event) {
	return fetch("https://api.vigilancedao.org/event", {
		method: "POST",
		body: JSON.stringify(event),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	})
		.then(async (response) => {
			if (!response.ok) {
				console.error(
					"sendEvent: response not ok",
					response.status,
					await response.text()
				);
			}
		})
		.catch((error) => {
			console.warn("Error occured while sending event to server");
			console.error(error);
		});
}
