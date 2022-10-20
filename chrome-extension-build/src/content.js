console.log('psl', psl)

const env = {
    host: 'https://8md2nmtej9.execute-api.ap-northeast-1.amazonaws.com',
    alertPeriod: 4 * 30 * 86400 * 1000
}

let url = window.location.host
function closeInternetVigilance() {
    document.getElementById("internetVigilanceBackdrop").style.display = 'none';
}

function closeInternetVigilanceWithNoMoreShow() {
    document.getElementById("internetVigilanceBackdrop").style.display = 'none';
    chrome.storage.sync.get([url], function(items) {
        console.debug('closeInternetVigilanceWithNoMoreShow', items, url, new Date())
        if(items[url]) {
            let data = items[url]
            data.dontShowAgain = true;
            let save = {}
            save[url] = data
            chrome.storage.sync.set(save, function() {
                console.log('saved dont show again', url);
            });
        }
    })
}

function injectedFunction(domain, createdOn) {
    var div = document.createElement('div');
    div.innerHTML = '<div style="background-color: rgb(0 0 0 / 45%); width: 100%; min-height: 100vh; position: absolute; top: 0; left: 0; font-family: sans-serif; line-height: 20px;z-index: 1000000000000000;" id="internetVigilanceBackdrop"> <div style="width: 350px; border: 10px solid #5e542d;padding: 10px; border-radius: 10px; background-color: #cfc290; font-weight: bold; position: fixed; top: 10px; right: 10px; color: black; font-size: 16px;"> <h1 style="margin: 10px 0; font-size: 20px;">Internet Vigilance</h1> <hr/> <p>Domain: <span id="domainName">Loading...</span></p> <p>Registered on: <span id="domainRegDate">Loading...</span></p> <p>Warning: This is a newly registered domain. While most newly built websites are safe, a few may be created for fraudulent purposes.</p> <p>Please do necessary research before perfoming any financial transactions or entering your passwords.</p> <button id="closeInternetVigilance" style="background: #5e542d; border: none; padding: 5px 20px; margin-bottom: 10px; color: white; font-size: 13px;">Close</button> <button id="closeInternetVigilanceWithNoMoreShow" style="background: #5e542d; border: none; padding: 5px 20px; margin-bottom: 10px; color: white; font-size: 13px;">Do not show for this website again.</button> </div> </div>'
    document.body.prepend(div)
    document.getElementById("closeInternetVigilance").onclick = closeInternetVigilance;
    document.getElementById("closeInternetVigilanceWithNoMoreShow").onclick = closeInternetVigilanceWithNoMoreShow;
    document.getElementById('domainName').innerHTML = domain
    document.getElementById('domainRegDate').innerHTML = createdOn.toLocaleDateString()
}

function injectWindow() {
    let div = document.createElement('div')
    div.innerHTML = '<div id="root"> <div class="App"> <div class="backdrop"></div> <header class="App-header"> <h1 class="ant-typography title" style="color:#fff;margin-top:15px;margin-bottom:5px">Internet Vigilance </h1> <div class="ant-typography" style="color:#fff;font-size:12px;text-align:center">Powered by Blockchain </div> <div class="ant-divider ant-divider-horizontal" style="margin:12px 0 24px;border-top:1px solid rgba(255,255,255,.2)" role="separator"></div> <div class="ant-space ant-space-vertical" style="display:flex;width:100%"> <div class="ant-space-item" style="margin-bottom:16px"> <div class="ant-card ant-card-bordered" style="width:100%;text-align:left"> <div class="ant-card-body"> <table style="width:100%"> <tbody> <tr> <td style="text-align:right;padding-bottom:10px"><button class="ant-btn ant-btn-round ant-btn-primary ant-dropdown-trigger" type="button" value="small"> <div class="ant-space ant-space-horizontal ant-space-align-center"> <div class="ant-space-item" style="margin-right:8px">Mumbai </div> <div class="ant-space-item"><span class="anticon anticon-down" aria-label="down" role="img"><svg aria-hidden="true" data-icon="down" fill="currentColor" focusable="false" height="1em" viewBox="64 64 896 896" width="1em"> <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"> </path> </svg></span></div> </div> </button></td> </tr> <tr> <td> <p><b>Domain:</b></p> </td> </tr> </tbody> </table> <p><b>Registered on: </b>NA</p> <div class="ant-alert ant-alert-warning" role="alert" data-show="true"><span class="anticon anticon-exclamation-circle ant-alert-icon" aria-label="exclamation-circle" role="img"><svg aria-hidden="true" data-icon="exclamation-circle" fill="currentColor" focusable="false" height="1em" viewBox="64 64 896 896" width="1em"> <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"> </path> </svg></span> <div class="ant-alert-content"> <div class="ant-alert-message"><b>Loading...</b></div> </div> </div> </div> </div> </div> <div class="ant-space-item" style="margin-bottom:16px"> <div class="ant-collapse ant-collapse-icon-position-start site-collapse-custom-collapse" style="width:100%"> <div class="ant-collapse-item site-collapse-custom-panel"> <div class="ant-collapse-header" role="button" aria-disabled="false" aria-expanded="false" tabindex="0"> <div class="ant-collapse-expand-icon"><span class="anticon anticon-caret-right ant-collapse-arrow" aria-label="caret-right" role="img"><svg aria-hidden="true" data-icon="caret-right" fill="currentColor" focusable="false" height="1em" viewBox="0 0 1024 1024" width="1em"> <path d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z"> </path> </svg></span></div><span class="ant-collapse-header-text"> <div><b style="font-size:15px">Review website</b> <p>Earn rewards 💰 by keeping the web safe</p> </div> </span> </div> </div> </div> </div> <div class="ant-space-item" style="margin-bottom:16px"> <div class="ant-collapse ant-collapse-icon-position-start site-collapse-custom-collapse" style="width:100%"> <div class="ant-collapse-item site-collapse-custom-panel"> <div class="ant-collapse-header" role="button" aria-disabled="false" aria-expanded="false" tabindex="0"> <div class="ant-collapse-expand-icon"><span class="anticon anticon-caret-right ant-collapse-arrow" aria-label="caret-right" role="img"><svg aria-hidden="true" data-icon="caret-right" fill="currentColor" focusable="false" height="1em" viewBox="0 0 1024 1024" width="1em"> <path d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z"> </path> </svg></span></div><span class="ant-collapse-header-text"> <div><b style="font-size:15px">My History</b></div> </span> </div> </div> </div> </div> <div class="ant-space-item"> <div class="ant-collapse ant-collapse-icon-position-start site-collapse-custom-collapse" style="width:100%"> <div class="ant-collapse-item site-collapse-custom-panel"> <div class="ant-collapse-header" role="button" aria-disabled="false" aria-expanded="false" tabindex="0"> <div class="ant-collapse-expand-icon"><span class="anticon anticon-caret-right ant-collapse-arrow" aria-label="caret-right" role="img"><svg aria-hidden="true" data-icon="caret-right" fill="currentColor" focusable="false" height="1em" viewBox="0 0 1024 1024" width="1em"> <path d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z"> </path> </svg></span></div><span class="ant-collapse-header-text"> <div><b style="font-size:15px">How does it work? 🤔</b></div> </span> </div> </div> </div> </div> </div> </header> </div> </div>'
    document.body.prepend(div)
}

async function checkDomain() {
    console.log(url)
    var parsed = psl.parse(url);
    console.log('parsed url', parsed)
    url = parsed.domain;
    let count = 0
    let interval = setInterval(() => {
        chrome.storage.sync.get([url], function(items) {
            console.debug(items, url, new Date())
            if(items[url]) {
                clearInterval(interval)
                let dontShowAgain = items[url].dontShowAgain
                let createdon = new Date(items[url].createdon)
                let now = new Date()
                if(dontShowAgain) {
                    console.log('user opted to not show again')
                    return;
                }
                if((now.getTime() - createdon.getTime()) < env.alertPeriod) {
                    console.log('Vigilance DAO: domain is new. trigger.')
                    injectedFunction(url, createdon)
                } else {
                    console.log('Vigilance DAO: domain is old enough')
                }
            }
        })
        if(count > 100) {
            clearInterval(interval)
        }
        count += 1
    }, 1000)
}

checkDomain()


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log('on message', msg, sender)
    if(msg && msg.type == "toggle"){
        toggle();
        sendResponse()
    }
});


var iframe = document.createElement('iframe'); 
iframe.style.background = "none";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.frameBorder = "none"; 
iframe.src = chrome.runtime.getURL("index.html")

document.body.appendChild(iframe);
// iframe.innerHTML
function toggle(){
    // if(iframe.style.width == "0px"){
    //     iframe.style.width="100%";
    // }
    // else{
    //     iframe.style.width="0px";
    // }
    injectWindow()
    // console.log(iframe.innerHTML)
    // var div = document.createElement(iframe.innerHTML);

    // var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    // xhr.open('get', iframe.src, true);
    // xhr.onreadystatechange = function() {
    //     if (xhr.readyState == 4 && xhr.status == 200) { 
    //         var div = document.createElement('div');
    //         div.className = 'myname'
    //         div.innerHTML = xhr.responseText
    //         document.body.prepend(div)
    //     } 
    // }
    // xhr.send();

    // console.log('runtime', chrome.runtime.sendMessage)
    // chrome.runtime.sendMessage({type: "take-screenshot"}, function(response) {
    //     console.log('message cb', response);
    // });
}

