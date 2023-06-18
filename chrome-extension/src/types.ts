import { DomainInfo } from "../../important-types";

export type DomainValidationType = "info" | "warning" | "error" | "success";

export interface DomainValidationInfo {
	isLegitVerified: boolean;
	isScamVerified: boolean;
	/**
	 * number of open scam reports
	 */
	openScamReports: number;
	type: DomainValidationType;
	/**
	 * message used to show to the user on UI
	 */
	msg: string;
	/**
	 * empty string for now
	 */
	description: string
}

/**
 * Object structure of each item stored in the storage like a cache
 */
export type DomainStorageItem = ({ validationInfo?: DomainValidationInfo } & Partial<DomainInfo>);

export interface ComputedDomainStorageItem extends DomainStorageItem {
	/**
	 * Indicates whether the domain's age is less than `alertPeriod` (defined in background.js).
	 */
	isNew?: boolean;
}


export type StorageResult = {
	dont_show_again_domains?: string[]
} & Record<string, DomainStorageItem>
