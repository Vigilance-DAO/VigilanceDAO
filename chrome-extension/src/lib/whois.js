const whois = require('whois-json');

document.getElementById("myButton").addEventListener("click", myFunction);

function myFunction()  {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        console.log('tabs', tabs)
        let tab = tabs[0]
    // chrome.browserAction.onClicked.addListener(function (tab) {
        // for the current tab, inject the "inject.js" file & execute it
        chrome.tabs.executeScript(tab.id, {
            file: 'src/browserify-output/requirements.js'
        });
        chrome.tabs.executeScript(tab.id, {
            file: 'src/browserify-output/whois.js'
        });
    })
    // });

    

    // whois('google.com').then(data=>{
    //     console.log(data)
    // }).catch(err=>{
    //     console.error(err)
    // })

}

async function myFunction2() {
    
    const ENS = WhoisENS.default;
    const ens = new ENS({networkURL: 'https://eth.gateway.whoisens.org'});
    console.log(ens)
    console.log('extended', await ens.resolve())
    // console.log('getInfo', await ens.getInfo())
}
