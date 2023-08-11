import { randomUUID } from "node:crypto";

import { Request, Response } from "express";
import * as Mixpanel from "mixpanel";

import { COOKIE_USER_ID, TrackingEvent } from "../../../important-types";


const mixpanel = Mixpanel.init("059e33bfa6d7d402593dac5fa218f343");

function createUserId() {
	return randomUUID();
}

export default async function (
	req: Request<{}, unknown, TrackingEvent>,
	res: Response
) {
	const _userId = req.cookies[COOKIE_USER_ID];
	const { eventName, ...others } = req.body;

	let userId: string;
	if (typeof _userId == "undefined") {
		// create new
		userId = createUserId();
		res.cookie(COOKIE_USER_ID, userId, {
			sameSite: "lax",
			domain: "vigilancedao.org",
		});
	} else if (typeof _userId == "string") {
		userId = _userId;
	} else {
		res.status(400).send("cookie missing");
		return;
	}

	mixpanel.people.set(userId, {});
	mixpanel.track(eventName, others);
	res.status(200).send(eventName);
}
