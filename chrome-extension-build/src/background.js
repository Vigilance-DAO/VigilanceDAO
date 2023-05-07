(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

function getStorageKey(url) {
    return `vigil__${url}`
}

let inMemoryStorage = {}
let lastUrl = null

async function getDomainRegistrationDate(storageInfo, url) {
    const key = getStorageKey(url)
    if(storageInfo[key]) {
        console.log('not requesting. saved in db', storageInfo[key], key)
        return new Date(storageInfo[key].createdon)
    } else {
        try {
            const rawResponse = await fetch(`${env.host}/domain-info`, {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({domain: url})
            });
            const content = await rawResponse.json();
            console.log('bg', {content})
            if(content.domain) {
                let createdon = new Date(content.createdon)
                let data = {}
                data[key] = content
                chrome.storage.sync.set(data, function() {
                    console.log('Settings saved', key);
                    inMemoryStorage = data
                });
                return createdon
            }
        } catch(err) {
            console.warn('error fetching domain reg date', err)
        }
    }
    return null;
}

let counter = {}

function getUrl(tab) {
    if(!tab.url)
        return;
    let _url = tab.url;
    _url = new URL(_url);

    console.debug('bg current url', _url)
    console.debug('bg current tab', tab)

    var parsed = psl.parse(_url.hostname);
    let url = parsed.domain
    console.debug('bg url', url)
    return url
}

async function getDomainValidationInfo(url) {
    let type = 'info'
    let msg = 'No reports/reviews'
    let description = ''
    let isScamVerified = false
    let isLegitVerified = false;
    let openScamReports = 0
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
    
    return {
        isLegitVerified, isScamVerified, openScamReports, type, msg, description
    }
}

function isSoftWarning(createdOn) {
    let now = new Date()
    return (now.getTime() - createdOn.getTime()) < env.alertPeriod
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
    const url = getUrl(tab)
    console.log('processTab', JSON.stringify({url, lastUrl}))
    if(!url || url!=lastUrl) {
        chrome.action.setIcon({ path: {16: "/images/icon16.png", 32: "/images/icon32.png"}})
        chrome.action.setBadgeText({text: "..."});
        chrome.action.setBadgeBackgroundColor({color: "yellow"});
        lastUrl = url || lastUrl
        return;
    }
    // chrome.action.setBadgeTextColor({color: "black"});
    if(tab.url && tab.status=='complete') {
        const key = getStorageKey(url)
        chrome.storage.sync.get([key], async (items) => {   
            let createdOn = await getDomainRegistrationDate(items, url)
            
            let now = new Date()
            let validationInfo = {
                type: 'info',
                msg: 'No reports/reviews',
                description: '',
                isScamVerified: false,
                isLegitVerified: false,
                openScamReports: 0
            }
            
            
            let lastValidationStateUpdatedOn = items[key]?.validationInfo?.updatedOn
            if(lastValidationStateUpdatedOn && (now.getTime() - lastValidationStateUpdatedOn.getTime()) < 5 * 60 * 1000) { // 5min
                validationInfo = items[key]?.validationInfo
            } else {
                validationInfo = await getDomainValidationInfo(url)
                chrome.storage.sync.get([key], async (items) => { 
                    if(!items[key])
                        items[key] = {}
                    items[key].validationInfo = validationInfo
                    chrome.storage.sync.set(items, function() {
                        console.log('validation info saved', key);
                        inMemoryStorage = items
                    });
                })
            }

            if(createdOn && (isSoftWarning(createdOn) || validationInfo.isScamVerified)) {
                sendMessage(tab, 'show-warning', {domain: url, createdOn: createdOn ? createdOn.getTime() : 0, 
                    type: validationInfo.type, msg: validationInfo.msg, description: validationInfo.description})
            }

            if(validationInfo.isScamVerified) {
                chrome.action.setIcon({ path: {19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png"}})
                chrome.action.setBadgeText({text: "❌"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
                validationInfo.type = 'error'
                validationInfo.msg = 'Verified as fraudulent domain'
            } else if(validationInfo.isLegitVerified) {
                chrome.action.setIcon({ path: {16: "/images/icon16.png", 32: "/images/icon32.png"}})
                chrome.action.setBadgeText({text: "✔️"});
                chrome.action.setBadgeBackgroundColor({color: "#05ed05"});
                validationInfo.type = 'success'
                validationInfo.msg = 'Verified as legit'
            } else if(createdOn && isSoftWarning(createdOn)) {
                console.log('changing icon')
                chrome.action.setIcon({ path: {19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png"}})
                validationInfo.openScamReports ? chrome.action.setBadgeText({text: validationInfo.openScamReports + ""}) : chrome.action.setBadgeText({text: "1"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
                validationInfo.type = 'warning'
                if(validationInfo.openScamReports > 0) {
                    validationInfo.msg = 'Domain registed recently and has `OPEN` fraud reports'
                    validationInfo.description = 'The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.'
                } else {
                    validationInfo.msg = 'Domain registed recently'
                    validationInfo.description = 'Majority of new domains are legit but some could be scam. Please maintain caution, especially while performing financial transactions.'
                }
            } else if(validationInfo.openScamReports) {
                console.log('changing icon')
                chrome.action.setIcon({ path: {19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png"}})
                validationInfo.openScamReports ? chrome.action.setBadgeText({text: validationInfo.openScamReports + ""}) : chrome.action.setBadgeText({text: "1"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
                validationInfo.type = 'warning'
                validationInfo.msg = 'Has `OPEN` fraud reports'
                validationInfo.description = 'The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.'
            } else {
                chrome.action.setIcon({ path: {16: "/images/icon16.png", 32: "/images/icon32.png"}})
                chrome.action.setBadgeText({text: "0"});
                chrome.action.setBadgeBackgroundColor({color: "#05ed05"});
            }
            sendMessage(tab, 'domain', {isSuccess: true, domain: url, createdOn: createdOn ? createdOn.getTime() : 0, 
                type: validationInfo.type, msg: validationInfo.msg, description: validationInfo.description})
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

},{}]},{},[1]);
