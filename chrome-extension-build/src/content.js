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

function toggle(){
    if(iframe.style.width == "0px"){
        iframe.style.width="100%";
    }
    else{
        iframe.style.width="0px";
    }

    // console.log('runtime', chrome.runtime.sendMessage)
    // chrome.runtime.sendMessage({type: "take-screenshot"}, function(response) {
    //     console.log('message cb', response);
    // });
}

