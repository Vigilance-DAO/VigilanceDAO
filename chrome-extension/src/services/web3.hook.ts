import { stringify } from "querystring";
import { useEffect, useState } from "react";
import AlertMessageType from "../interfaces/AlertMessageType";

declare const chrome: any;

export interface Web3Hook_DomainInfo {
	domain: string;
	registeredOn: number;
	status: AlertMessageType;
	loading: boolean;
}

export const FOR_DEVELOPMENT = {
    domainInfo: {
        domain: 'google.com',
        registeredOn: 881690400000,
        status: {
            message: "Meant for testing",
            type: 'warning',
            description: ''
        },
        loading: false
    },
    account: {
        account: '0x6426114c0C3531D90Ed8B9f7c09A0dc115F4aaee',
        loading: false
    }
} as const;

export function useWeb3Hook() {
    const [account, setAccount] = useState({
        loading: false,
        account: ''
    })
    const [chainId, setChainId] = useState({
        chainId: parseInt(process.env.REACT_APP_DEFAULT_NETWORK),
        loading: false
    })
    const [reportTxInfo, setReportTxInfo] = useState({
        txHash: '',
        isSuccess: false,
        error: null,
        loading: false
    })
    const [stakeETH, setStakeETH] = useState({
        stakeETH: 0,
        loading: false
    })

    const [domainInfo, setDomainInfo] = useState<Web3Hook_DomainInfo>({
        domain: '',
        registeredOn: 0,
        status: {
            message: 'Loading...',
            type: 'warning',
            description: ''
        },
        loading: true
    })

    function sendMessage(type: string, data: any = {}) {
        if(chrome && chrome.runtime) {
            console.log('send message', type, data)
            chrome.runtime.sendMessage({type, data});
        } else {
            console.warn('no chrome to send message')
        }
    }

    function activateListeners() {
        if(chrome && chrome.runtime) {
            chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: any) => {
                console.log('react on message', msg, sender)
                if(msg && msg.type == "wallet-connected"){
                    console.log('react on message2', msg, sender)
                    let account = msg.data.account
                    setAccount({account, loading: false})
                } else if(msg && msg.type == 'chainID') {
            let chainId = msg.data.chainId
            setChainId({
                chainId,
                loading: false
            })
        } else if(msg && msg.type == 'transaction-update') {
            setReportTxInfo({
                txHash: msg.data.txHash,
                isSuccess: msg.data.isSuccess,
                error: msg.data.error,
                loading: false
            })
        } else if(msg && msg.type == 'stake-amount') {
            setStakeETH({
                stakeETH: msg.data.stakeAmount,
                loading: false
            })
        } else if(msg && msg.type == "domain"){
            setDomainInfo({
                domain: msg.data.domain,
                registeredOn: msg.data.createdOn,
                status: {
                    message: msg.data.msg,
                    type: msg.data.type,
                    description: msg.data.description
                },
                loading: false
            })
        }
            });
        }
    }

    useEffect(() => {
        if(window.location.hostname == 'localhost') {
            setDomainInfo(FOR_DEVELOPMENT.domainInfo)
            setAccount(FOR_DEVELOPMENT.account)

        }
    }, [])

    function connectWallet() {
        setAccount({account: '', loading: true})
        sendMessage("connect-wallet", {
            chainID: chainId
        })
    }

    function switchNetwork(chainId: number = parseInt(process.env.REACT_APP_DEFAULT_NETWORK)) {
        setChainId({
            chainId: 0,
            loading: true
        })
        sendMessage("switch-network", {
            chainID: chainId
        })
    }

    function submitReport(isFraud: boolean, imageUrls: string[], comments: string, stakeETH: number) {
        setReportTxInfo({
            txHash: '',
            isSuccess: false,
            error: null,
            loading: true
        })
        sendMessage("submit-report", {
            isFraud, imageUrls, comments, stakeETH
        })
    }

    function getStakeAmount() {
        setStakeETH({
            stakeETH: 0,
            loading: true
        })
        sendMessage("get-stake-amount", {})
    }

    return {
        account,
        chainId, 
        stakeETH,
        reportTxInfo,
        domainInfo,

        connectWallet,
        switchNetwork,
        submitReport,
        getStakeAmount,
        activateListeners
    }
}

export const chainInfo = [
//     {
//     chainId: 137,
//     fullName: 'Polygon Mainnet',
//     shortName: 'Mainnet',
//     explorer: 'https://polygonscan.com'
// }, 
{
    chainId: 80001,
    fullName: 'Polygon Mumbai',
    shortName: 'Mumbai',
    explorer: 'https://mumbai.polygonscan.com'
}]
