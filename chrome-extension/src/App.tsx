/*global chrome*/
import React, { useEffect } from "react";
import "./App.css";
import { Collapse } from "antd";
import "antd/dist/antd.css";
import { Web3Provider } from "@ethersproject/providers";
import { subgraphQuery } from "./utils/index";
import { FETCH_REPORTS_BY_DOMAIN } from "./queries/index";
import { MetaMask } from "@web3-react/metamask";
import { initializeConnector } from "@web3-react/core";
// import Web3Service from './services/web3.service';
import { useWeb3Hook } from "./services/web3.hook";
import Index from "./prebuild-components";

function getLibrary(provider: any) {
	return new Web3Provider(provider);
}

export interface AppContext {
	web3Hooks: ReturnType<typeof useWeb3Hook>;
}

// Web3
export const [metamaskConnector, hooks] = initializeConnector<MetaMask>(
	(actions) => new MetaMask({ actions })
);

export const Context = React.createContext<AppContext>({
	web3Hooks: {
		account: { account: "", loading: false },
		chainId: { chainId: 0, loading: false },
		reportTxInfo: { isSuccess: false, error: null, txHash: "", loading: false },
		stakeETH: { stakeETH: 0, loading: false },
		domainInfo: {
			domain: "",
			registeredOn: 0,
			status: {
				message: "Loading...",
				type: "warning",
				description: "",
			},
			loading: true,
		},

		switchNetwork: () => {},
		connectWallet: () => {},
		getStakeAmount: () => {},
		submitReport: () => {},
		activateListeners: () => {},
	},
});

function App() {
	// const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames} = hooks
	// const accounts = useAccounts()
	// const isActive = useIsActive()
	const _web3hook = useWeb3Hook();
	const {
		activateListeners,
		account: _account,
		chainId: _chainId,
		domainInfo,
		connectWallet,
	} = _web3hook;
	useEffect(() => {
		activateListeners();
	});

	const { Panel } = Collapse;
	const getStatus = async (domain: string) => {
		const data = await subgraphQuery(FETCH_REPORTS_BY_DOMAIN(domain));
		console.log("getStatus", data.isScam);
	};

	useEffect(() => {
		if (domainInfo.domain) {
			getStatus(domainInfo.domain);
		}
	}, [domainInfo]);

	return (
		<Context.Provider value={{ web3Hooks: _web3hook }}>
			<Index
				domainInfo={domainInfo}
				account={_account}
				connectWallet={connectWallet}
			/>
		</Context.Provider>
	);
}

export default App;
