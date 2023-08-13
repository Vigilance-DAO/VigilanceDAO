import { randomUUID } from "node:crypto";

import { Request, Response } from "express";
import * as Mixpanel from "mixpanel";

import { COOKIE_USER_ID, TrackingEvent } from "../../../important-types";


const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN!);

function createUserId() {
	return randomUUID();
}

const _1year = 756864000000;

export default async function (
	req: Request<{}, unknown, TrackingEvent>,
	res: Response
) {
	const _userId = req.cookies[COOKIE_USER_ID];
	const { eventName, ...others } = req.body;
	console.log('event', {
		_userId, eventName, others
	})
	let userId: string;
	if (typeof _userId == "undefined") {
		// create new
		userId = createUserId();
	} else if (typeof _userId == "string") {
		userId = _userId;
	} else {
		res.status(400).send("cookie missing");
		return;
	}

	console.log('final userid', userId);

	res.cookie(COOKIE_USER_ID, userId, {
		sameSite: "lax",
		domain: "vigilancedao.org",
		maxAge: _1year,
	});

	// mixpanel.people.set(userId, {});
	mixpanel.track(eventName, {...others, distinct_id: userId});
	res.status(200).send(eventName);
}
