
declare const chrome: any;

export default class Web3Service {
    static account: string;
    static chainId: number = parseInt(process.env.REACT_APP_DEFAULT_NETWORK);

    static connectingWallet: boolean = false
    static onAccountUpdate: Function

    static switchingNetwork: boolean = false
    static onSwitchNetwork: Function

    static submittingReport = false;
    static onSubmitReport: Function

    static loadingStakeAmount = false
    static onStakeAmountUpdate: Function

    static supportedChains = process.env.REACT_APP_SUPPORTED_NETWORKS.split(',').map(i => parseInt(i))

    static sendMessage(type: string, data: any = {}) {
        if(chrome && chrome.runtime) {
            console.log('send message', type, data)
            chrome.runtime.sendMessage({type, data});
        } else {
            console.warn('no chrome to send message')
            this.connectingWallet = false
        }
    }

    static activateListeners() {
        if(chrome && chrome.runtime) {
            chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: any) => {
                console.log('react on message', msg, sender)
                if(msg && msg.type == "wallet-connected"){
                    console.log('react on message2', msg, sender)
                    this.account = msg.data.account
                    if(this.onAccountUpdate) 
                        this.onAccountUpdate(this.account)
                    this.connectingWallet = false
                } else if(msg && msg.type == 'chainID') {
                    this.chainId = msg.data.chainId
                    if(this.onSwitchNetwork) {
                        this.onSwitchNetwork()
                    }
                    this.switchingNetwork = false
                } else if(msg && msg.type == 'transaction-update') {
                    if(this.onSubmitReport) {
                        // txName, txHash, isSuccess, error
                        this.onSubmitReport(msg.data.txHash, msg.data.isSuccess, msg.data.error)
                    }
                    this.submittingReport = false
                } else if(msg && msg.type == 'stake-amount') {
                    if(this.onStakeAmountUpdate) {
                        this.onStakeAmountUpdate(msg.data.stakeAmount)
                    }
                    this.loadingStakeAmount = false
                }
            });
        }
    }

    static connectWallet() {
        this.connectingWallet = true
        this.sendMessage("connect-wallet", {
            chainID: this.chainId
        })
    }

    static switchNetwork(chainId: number = parseInt(process.env.REACT_APP_DEFAULT_NETWORK)) {
        this.switchingNetwork = true
        this.sendMessage("switch-network", {
            chainID: chainId
        })
    }

    static submitReport(isFraud: boolean, imageUrls: string[], comments: string, stakeETH: number) {
        this.submittingReport = true
        this.sendMessage("submit-report", {
            isFraud, imageUrls, comments, stakeETH
        })
    }

    static getStakeAmount() {
        this.loadingStakeAmount = true;
        this.sendMessage("get-stake-amount", {})
    }
    
}

// Web3Service.activateListeners()