try {
  importScripts('./psl.min.js' /*, and so on */);
} catch (e) {
  console.error(e);
}

console.log('psl', psl)
function injectedFunction() {
    var div = document.createElement('div');
    div.innerHTML = '<div style="background: yellow;width: 100%;color: black;padding: 10px;text-align: center;position: fixed;z-index: 10000000000;opacity: 95%"><b>Warning: This is a newly registered website. Please maintain caution, especailly if you do not know the person who shared this with you</b></div>'
    document.body.prepend(div)
    console.log(document.body)
}


// chrome.tabs.query({active: true, lastFocusedWindow: true}, async (tabs) => {
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    console.log(tabId, info, tab)
    if(tab.status=='complete') {
        chrome.tabs.query({
            active: true,
            currentWindow: true
          }, function(tabs) {
            var tab = tabs[0];
            var url = tab.url;
            console.log('url', tabs)
        });
    }
    if(tab.url && tab.status=='complete') {
        let _url = tab.url;
        _url = new URL(_url);

        console.log('bg current url', _url)
        console.log('bg current tab', tab)

        var parsed = psl.parse(_url.hostname);
        let url = parsed.domain
        chrome.storage.sync.get([url], async (items) => {
            if(items[url]) {
                console.log('not requesting. saved in db', items[url], url)
            } else {
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
                    console.log('bg', {content})
                    if(content.domain) {
                        let createdon = new Date(content.createdon)
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
                        return;
                    }
                } catch(err) {
                    console.warn('error fetching domain info', err)
                }
            }
        })
        
    }
    // use `url` here inside the callback because it's asynchronous!
});
