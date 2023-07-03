const mixpanel = require('mixpanel-browser');
const { MIXPANEL_PROJECT_ID } = require("../privateenv");

(function() {
    const metamaskRequest = window.ethereum.request;
    window.ethereum.request = async (params) => {
    if(params.method === "eth_sendTransaction") {
        const { to, from, value, data } = params.params[0];
        mixpanel.init(MIXPANEL_PROJECT_ID, {debug: true});
        mixpanel.identify(from);
        mixpanel.track("Transaction", { 
            "toAddress" : to,
            "value" : value,
            "data" : data
        });
    }  
    return await metamaskRequest({ ...params })
}
})();