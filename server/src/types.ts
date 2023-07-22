export type ContractReport_FraudType = "phishing" | "financial-loss" | string;

export type ContractReport = {
	fraudType: ContractReport_FraudType;
	info: string;
	address: string;
	name?: string;
	chainId: string;
}

export type ContractReport__Unknown = Partial<ContractReport> | undefined;
