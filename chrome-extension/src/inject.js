const mixpanel = require('mixpanel-browser');
const { MIXPANEL_PROJECT_ID } = require("../privateenv");

(function() {
    const metamaskRequest = window.ethereum.request;
    window.ethereum.request = async (params) => {
    if(params.method === "eth_sendTransaction") {
        const { to, from, value, data } = params.params[0];
        mixpanel.init(MIXPANEL_PROJECT_ID, {debug: true});
        mixpanel.identify(from);
        const props = { 
            "toAddress" : to,
            "value" : value,
            "data" : data,
            "chainId" : window.ethereum.networkVersion
        }
        console.log('props', props)
        mixpanel.track("Transaction", props);
    }  
    return await metamaskRequest({ ...params })
}
})();