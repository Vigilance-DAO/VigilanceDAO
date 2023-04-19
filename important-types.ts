// Includes types used by two or more projects above.

/**
 * Body structure of the response returned by /domain-info endpoint
 */
export interface DomainInfo {
	domain: string;
	createdon: string,
	updatedon: string,
	recordCreatedOn?: string,
	isValid?: boolean
}
