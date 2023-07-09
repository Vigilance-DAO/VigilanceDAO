interface ETH_SendTransactionRequestParamsItem {
	gas: string;
	value: string;
	from: string;
	to: string;
	data: string;
}

interface ETH_SendTransactionRequest {
	method: "eth_sendTransaction";
	params: ETH_SendTransactionRequestParamsItem[];
}

interface MetaMaskRequest {
	method: string;
}

type RiskRating = "LOW" | "MEDIUM" | "HIGH";

interface ContractInfo {
	userCount24hours: number;
	userCount30days: number;
	creationDate: string | null;
	name: string;
	riskRating: RiskRating;
}

interface BasicContractInfo {
	address: string;
	chain_id: string;
}

/**  
 * Example ETH_SendTransactionRequest
 * {
    "method": "eth_sendTransaction",
    "params": [
        {
            "gas": "0x1141c",
            "value": "0x3782dace9d900000",
            "from": "0x49df7fdcb70b24aead2b28ac1813582b99279304",
            "to": "0x2ef4a574b72e1f555185afa8a09c6d1a8ac4025c",
            "data": "0xa5e5657100000000000000000000000021804205c744dd98fbc87898704564d5094bb16700000000000000000000000049df7fdcb70b24aead2b28ac1813582b992793040000000000000000000000000000000000000000000000000000000000000038"
        }
    ]
}
 * 
 */

interface FinancialAlertInfo {
	contract: string;
	createdOn?: string;
	drainedAccountsValue: RiskRating;
	transactionsIn24hours: number;
	transactionsIn30days: number;
	cancelButtonClickListener: () => void;
	proceedButtonClickListener: () => void;
}
