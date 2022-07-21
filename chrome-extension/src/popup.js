console.debug(new Date(), 'pop opened')

const env = {
    host: 'https://8md2nmtej9.execute-api.ap-northeast-1.amazonaws.com',
    alertPeriod: 4 * 30 * 86400 * 1000
}

function injectedFunction() {
    var div = document.createElement('div');
    div.innerHTML = '<div style="background: yellow;width: 100%;color: black;padding: 10px;text-align: center;position: fixed;z-index: 10000000000;"><b>This is a newly registered website. Please maintain caution, especailly if you do not know the person who shared this with you</b></div>'
    document.body.prepend(div)
}

chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
    let url = tabs[0].url;
    url = new URL(url);

    // chrome.tabs.captureVisibleTab(null,{},function(dataUri){
    //     console.log(dataUri);
    // });

    console.log('current url', url)
    console.log('current tab', tabs[0])

    let element = document.getElementById('domain')
    var parsed = psl.parse(url.hostname);
    element.textContent = parsed.domain
    url = parsed.domain
    let domainRegisteredOnEl = document.getElementById('domainRegisteredOn')
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
                console.log({content})
                if(content.domain) {
                    createdOn = new Date(content.createdon)
                }
            } catch(err) {
                console.warn('error fetching domain info', err)
            }
        }

        if(createdOn) {
            domainRegisteredOnEl.textContent = createdOn.toLocaleDateString()
        } else {
            domainRegisteredOnEl.textContent = 'Not available'
        }
        let now = new Date()
        if(createdOn && (now.getTime() - createdOn.getTime()) < env.alertPeriod) {
            document.getElementById('alertCard').style.display = 'block'
        }
    })
    // use `url` here inside the callback because it's asynchronous!
});
