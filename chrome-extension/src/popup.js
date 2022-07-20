console.debug(new Date(), 'pop opened')

function injectedFunction() {
    var div = document.createElement('div');
    div.innerHTML = '<div style="background: yellow;width: 100%;color: black;padding: 10px;text-align: center;position: fixed;z-index: 10000000000;"><b>This is a newly registered website. Please maintain caution, especailly if you do not know the person who shared this with you</b></div>'
    document.body.prepend(div)
}

chrome.tabs.query({active: true, lastFocusedWindow: true}, async (tabs) => {
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

    let domainRegisteredOnEl = document.getElementById('domainRegisteredOn')
    try {
        const rawResponse = await fetch('http://localhost:4000/domain-info', {
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
            let createdon = new Date(content.createdon)
            let updatedon = new Date(content.updatedon)
            domainRegisteredOnEl.textContent = createdon.toLocaleDateString()
            return;
        }
    } catch(err) {
        console.warn('error fetching domain info', err)
    }
    domainRegisteredOnEl.textContent = 'Not available'
    // use `url` here inside the callback because it's asynchronous!
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    });
}