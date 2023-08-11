// Includes types used by two or more projects above.

export interface BasicDomainInfo {
	domain: string;
	createdon: Date,
	updatedon: Date,
	recordCreatedOn?: string,
	isValid?: boolean
}

export interface DomainScamInfo {
	isScam: boolean;
	source: string;
	attackType?: string;
	updatedOn: string;
}

export interface DomainInfo extends BasicDomainInfo {
	scamInfo?: DomainScamInfo;
}

export interface TrackingEvent {
	eventName: string;
	userId?: string;
	accountId?: string;
	eventData?: Record<string, unknown>;
}

export const COOKIE_USER_ID = "user-id";
