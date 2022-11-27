try {
  importScripts('./psl.min.js' /*, and so on */);
} catch (e) {
  console.error(e);
}
const env = {
    host: 'https://8md2nmtej9.execute-api.ap-northeast-1.amazonaws.com',
    alertPeriod: 4 * 30 * 86400 * 1000,
    tableName: 'domainreports_80001_438',
    tablelandHost: 'https://testnet.tableland.network/query?s='
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



async function getDomainValidationInfo(url) {
    
    let tablelandURL = `${env.tablelandHost}SELECT%20*%20FROM%20${env.tableName}%20WHERE%20domain=%27${url}%27`
    console.log({tablelandURL})
    const tableData = await fetch(tablelandURL)
    const tableDataContent = await tableData.json();
    console.log({tableDataContent})
    let isScamVerified = false
    let isLegitVerified = false;
    if(tableDataContent.rows && tableDataContent.columns)
        tableDataContent.rows.forEach(row=>{
            let status = row[searchColumnIndex(tableDataContent.columns, 'status')]
            let isScam = row[searchColumnIndex(tableDataContent.columns, 'isScam')]
            if(isScam && status == 'ACCEPTED')
                isScamVerified = true
            if(!isScam && status == 'ACCEPTED')
                isLegitVerified = true
        })
    console.log({isScamVerified, isLegitVerified})
    return {isScamVerified, isLegitVerified}
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
        if(!url)
            return;

        chrome.storage.sync.get([url], async (items) => {   
            const createdOn = await getDomainRegistrationDate(items, url)
            const {isScamVerified, isLegitVerified} = getDomainValidationInfo(url);
            
            let now = new Date()
            if(isScamVerified) {
                chrome.action.setIcon({ path: {19: "/src/images/alerticon19-red.png", 38: "/src/images/alerticon38-red.png"}})
                chrome.action.setBadgeText({text: "❌"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
            } else if(isLegitVerified) {
                chrome.action.setIcon({ path: {16: "/src/images/icon16.png", 32: "/src/images/icon32.png"}})
                chrome.action.setBadgeText({text: "✔️"});
                chrome.action.setBadgeBackgroundColor({color: "#05ed05"});
            } else if(createdOn && (now.getTime() - createdOn.getTime()) < env.alertPeriod) {
                console.log('changing icon')
                chrome.action.setIcon({ path: {19: "/src/images/alerticon19-red.png", 38: "/src/images/alerticon38-red.png"}})
                chrome.action.setBadgeText({text: "1"});
                chrome.action.setBadgeBackgroundColor({color: "#f96c6c"});
            } else {
                chrome.action.setIcon({ path: {16: "/src/images/icon16.png", 32: "/src/images/icon32.png"}})
                chrome.action.setBadgeText({text: "0"});
                chrome.action.setBadgeBackgroundColor({color: "#05ed05"});
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