try {
  importScripts('./psl.min.js' /*, and so on */);
} catch (e) {
  console.error(e);
}

const env = {
    host: 'https://8md2nmtej9.execute-api.ap-northeast-1.amazonaws.com',
    alertPeriod: 4 * 30 * 86400 * 1000,
    SUBGRAPH_URL: "https://api.thegraph.com/subgraphs/name/venkatteja/vigilancedao"
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

function searchColumnIndex(columns, column) {
    return columns.findIndex((item, i)=>{
        return item.name == column
    })
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
    chrome.action.setIcon({ path: {16: "/images/icon16.png", 32: "/images/icon32.png"}})
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
        if(!url)
            return;

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

            // let tablelandURL = `${env.tablelandHost}SELECT%20*%20FROM%20${env.tableName}%20WHERE%20domain=%27${url}%27`
            // console.log({tablelandURL})
            // const tableData = await fetch(tablelandURL)
            // const tableDataContent = await tableData.json();
            // console.log({tableDataContent})
            let isScamVerified = false
            let isLegitVerified = false;
            let openScamReports = 0
            let now = new Date()
            let type = 'info'
            let msg = 'No reports/reviews'
            let description = ''

            let query =  `query {
                reports(
                    orderBy: id
                    orderDirection: desc
                    where: {domain: "${url}"}
                    first:1
                ){
                    id
                    domain
                    isScam
                    status
                }
            }`
            try {
                const rawResponse = await fetch(env.SUBGRAPH_URL, {
                    method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({query})
                });
                let data = await rawResponse.json()
                console.log('response', data)
                let reports = data.data.reports
                for(let i=0; i<reports.length; ++i) {
                    let report = reports[i]
                    if(report.status == 'ACCEPTED' && (!isScamVerified && !isScamVerified)) {
                        isLegitVerified = report.isScam ? false : true
                        isScamVerified = report.isScam ? true : false
                    }
                    if(!report.status || report.status == 'OPEN') {
                        if(report.isScam) {
                            openScamReports += 1
                        }
                    }
                }
            } catch(err) {
                console.warn("Error fetching domain information", domain, err)
                console.log('changing icon')
                chrome.action.setIcon({ path: {16: "/images/icon16.png", 32: "/images/icon32.png"}})
                chrome.action.setBadgeText({text: "⚠️"})
                chrome.action.setBadgeBackgroundColor({color: "#000000"});
                type = 'warning'
                msg = "Error fetching domain information"
                sendMessage(tab, 'domain', {isSuccess: true, domain: url, createdOn: createdOn ? createdOn.getTime() : 0, type, msg, description})
                return;
            }
            // if(tableDataContent.rows && tableDataContent.columns)
            //     tableDataContent.rows.forEach(row=>{
            //         let status = row[searchColumnIndex(tableDataContent.columns, 'status')]
            //         let isScam = row[searchColumnIndex(tableDataContent.columns, 'isScam')]
            //         if(isScam && status == 'ACCEPTED')
            //             isScamVerified = true
            //         if(!isScam && status == 'ACCEPTED')
            //             isLegitVerified = true
            //     })
            // console.log({isScamVerified, isLegitVerified})
            
            if(isScamVerified) {
                chrome.action.setIcon({ path: {19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png"}})
                chrome.action.setBadgeText({text: "❌"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
                type = 'error'
                msg = 'Verified as fraudulent domain'
            } else if(isLegitVerified) {
                chrome.action.setIcon({ path: {16: "/images/icon16.png", 32: "/images/icon32.png"}})
                chrome.action.setBadgeText({text: "✔️"});
                chrome.action.setBadgeBackgroundColor({color: "#05ed05"});
                type = 'success'
                msg = 'Verified as legit'
            } else if(createdOn && (now.getTime() - createdOn.getTime()) < env.alertPeriod) {
                console.log('changing icon')
                chrome.action.setIcon({ path: {19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png"}})
                openScamReports ? chrome.action.setBadgeText({text: openScamReports + ""}) : chrome.action.setBadgeText({text: "1"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
                type = 'warning'
                if(openScamReports > 0) {
                    msg = 'Domain registed recently and has `OPEN` fraud reports'
                    description = 'The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.'
                } else {
                    msg = 'Domain registed recently'
                    description = 'Majority of new domains are legit but some could be scam. Please maintain caution, especially while performing financial transactions.'
                }
            } else if(openScamReports) {
                console.log('changing icon')
                chrome.action.setIcon({ path: {19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png"}})
                openScamReports ? chrome.action.setBadgeText({text: openScamReports + ""}) : chrome.action.setBadgeText({text: "1"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
                type = 'warning'
                msg = 'Has `OPEN` fraud reports'
                description = 'The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.'
            } else {
                chrome.action.setIcon({ path: {16: "/images/icon16.png", 32: "/images/icon32.png"}})
                chrome.action.setBadgeText({text: "0"});
                chrome.action.setBadgeBackgroundColor({color: "#05ed05"});
            }
            sendMessage(tab, 'domain', {isSuccess: true, domain: url, createdOn: createdOn ? createdOn.getTime() : 0, type, msg, description})
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

async function sendMessage(tab, type, data) {
    return new Promise((resolve, reject) => {
        console.log('sending msg', type)
        chrome.tabs.sendMessage(tab.id, {
            type, data
        }, undefined, (response) => {
            console.log('recieved msg', response)
            resolve()
        });
    })
}

chrome.action.onClicked.addListener(function(tab){
    console.log('extension clickeddd', tab.id, chrome.tabs)
    sendMessage(tab, 'toggle', {})
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('msg in background', request, sender, sendResponse)
    if (request.type == "take-screenshot") {
        await sendMessage(sender.tab, 'toggle', {})
        await takeScreenshot(sender.tab)
        await sendMessage(sender.tab, 'toggle', {})
    } else if(request.type == 'connect-wallet') {
        await sendMessage(sender.tab, 'connect-wallet-2', {})
    } else if(request.type == 'wallet-connected') {
        await sendMessage(sender.tab, 'wallet-connected', request.data)
    } else if(request.type == 'switch-network') {
        await sendMessage(sender.tab, 'switch-network-2', request.data)
    } else if(request.type == 'chainID') {
        await sendMessage(sender.tab, 'chainID', request.data)
    } else if(request.type == 'submit-report') {
        await sendMessage(sender.tab, 'submit-report-2', request.data)
    } else if(request.type == 'transaction-update') {
        await sendMessage(sender.tab, 'transaction-update', request.data)
    } else if(request.type == 'get-stake-amount') {
        await sendMessage(sender.tab, 'get-stake-amount-2', request.data)
    } else if(request.type == 'stake-amount') {
        await sendMessage(sender.tab, 'stake-amount', request.data)
    }

    
});

function takeScreenshot(tab) {
    return new Promise((resolve, reject) => {
        let capturing = chrome.tabs.captureVisibleTab();
        capturing.then((imageUri) => {
            console.log('imageUri', imageUri);
            sendMessage(tab, 'screenshot', {isSuccess: true, imageUri})
            sendMessage(tab, 'screenshot', {isSuccess: true, imageUri})
            resolve()
        }, (error) => {
            console.log(`Error: ${error}`);
            sendMessage(tab, 'screenshot', {isSuccess: false, error})
            resolve()
        });
    })
}
