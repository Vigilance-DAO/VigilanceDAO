import { randomUUID } from "node:crypto";

import { Request, Response } from "express";
import * as Mixpanel from "mixpanel";

import { TrackingEvent } from "../../../important-types";

let mixpanel: undefined | Mixpanel.Mixpanel = undefined;
if (process.env.MIXPANEL_TOKEN) {
	mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
} else {
	console.warn("env.MIXPANEL_TOKEN is not defined");
}

function createUserId() {
	return randomUUID();
}

export default async function (
	req: Request<{}, unknown, TrackingEvent>,
	res: Response
) {
	const _userId = req.body.userId;
	const { eventName, ...others } = req.body;
	console.log("event", {
		_userId,
		eventName,
		others,
	});
	let userId: string;
	if (typeof _userId == "undefined") {
		// create new
		userId = createUserId();
	} else if (typeof _userId == "string") {
		userId = _userId;
	} else {
		return;
	}

	console.log("final userid", userId);

	if (mixpanel == undefined) {
		console.warn("Mixpanel is not initialized. Events cannot be sent.");
	} else {
		// mixpanel.people.set(userId, {});
		mixpanel.track(eventName, { ...others, distinct_id: userId });
	}

	res.status(200).send(userId);
}
