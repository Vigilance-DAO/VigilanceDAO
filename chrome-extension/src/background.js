try {
  importScripts('./psl.min.js' /*, and so on */);
} catch (e) {
  console.error(e);
}
const env = {
    host: 'https://8md2nmtej9.execute-api.ap-northeast-1.amazonaws.com',
    alertPeriod: 4 * 30 * 86400 * 1000
}

function injectedFunction() {
    var xhr= new XMLHttpRequest();
    xhr.open('GET', 'alert.html', true);
    xhr.onreadystatechange= function() {
        console.log('resp', this)
        if (this.readyState!==4) return;
        if (this.status!==200) return; // or whatever error handling you want
        
        var div = document.createElement('div');
        // div.innerHTML = '<div style="background: yellow;width: 100%;color: black;padding: 10px;text-align: center;position: fixed;z-index: 10000000000;opacity: 95%"><b>Warning: This is a newly registered website. Please maintain caution, especailly if you do not know the person who shared this with you</b></div>'
        div.innerHTML = this.responseText;
        document.body.prepend(div)
        console.log(document.body)
        // document.getElementById('y').innerHTML= this.responseText;
    };
    xhr.send();
}

function processTab(tab) {
    // if(tab.status=='complete') {
    //     chrome.tabs.query({
    //         active: true,
    //         currentWindow: true
    //       }, function(tabs) {
    //         var tab = tabs[0];
    //         var url = tab.url;
    //         console.log('url', tabs)
    //     });
    // }
    chrome.action.setIcon({ path: {16: "/src/images/icon16.png", 32: "/src/images/icon32.png"}})
    chrome.action.setBadgeText({text: "..."});
    chrome.action.setBadgeBackgroundColor({color: "yellow"});
    // chrome.action.setBadgeTextColor({color: "black"});
    if(tab.url && tab.status=='complete') {
        let _url = tab.url;
        _url = new URL(_url);

        console.log('bg current url', _url)
        console.log('bg current tab', tab)

        var parsed = psl.parse(_url.hostname);
        let url = parsed.domain
        console.log('bg url', url)
        chrome.storage.sync.get([url], async (items) => {   
            let createdOn = null
            if(items[url]) {
                console.log('not requesting. saved in db', items[url], url)
                createdOn = new Date(items[url].createdon)
            } else {
                try {
                    const rawResponse = await fetch(`${env.host}/domain-info`, {
                        method: 'POST',
                        headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({domain: parsed.domain})
                    });
                    const content = await rawResponse.json();
                    console.log('bg', {content})
                    if(content.domain) {
                        let createdon = new Date(content.createdon)
                        createdOn = createdon
                        let now = new Date()
                        let data = {}
                        data[parsed.domain] = content
                        chrome.storage.sync.set(data, function() {
                            console.log('Settings saved', url);
                        });
                        // if((now.getTime() - createdon.getTime()) < 4 * 30 * 86400 * 1000) {
                        //     // chrome.scripting.executeScript({
                        //     //     target: { tabId },
                        //     //     function: injectedFunction
                        //     // });
                        // }
                    }
                } catch(err) {
                    console.warn('error fetching domain info', err)
                }
            }
            let now = new Date()
            if(createdOn && (now.getTime() - createdOn.getTime()) < env.alertPeriod) {
                console.log('changing icon')
                chrome.action.setIcon({ path: {19: "/src/images/alerticon19-red.png", 38: "/src/images/alerticon38-red.png"}})
                chrome.action.setBadgeText({text: "1"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
                // chrome.action.setBadgeTextColor({color: "white"});
            } else {
                chrome.action.setIcon({ path: {16: "/src/images/icon16.png", 32: "/src/images/icon32.png"}})
                chrome.action.setBadgeText({text: "0"});
                chrome.action.setBadgeBackgroundColor({color: "#05ed05"});
                // chrome.action.setBadgeTextColor({color: "black"});
            }
        })
        
    }
}

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    console.log(tab)
    processTab(tab)
    // use `url` here inside the callback because it's asynchronous!
});

// chrome.tabs.query({active: true, lastFocusedWindow: true}, async (tabs) => {
//     console.log('tab query', tabs)
//     processTab(tabs[0])
// })

chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log({activeInfo});
    chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
        console.log('url', tabs)
        processTab(tabs[0])
    });
});