console.log('psl', psl)

  
let url = window.location.host

function injectedFunction() {
    var div = document.createElement('div');
    div.innerHTML = '<div style="background: yellow;top:0;width: 100%;color: black;padding: 10px;text-align: center;position: fixed;z-index: 10000000000;opacity: 95%"><b>Warning: This is a newly registered website. Please maintain caution, especailly if you do not know the person who shared this with you</b></div>'
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
                let createdon = new Date(items[url].createdon)
                let now = new Date()
                if((now.getTime() - createdon.getTime()) < 4 * 30 * 86400 * 1000) {
                    console.log('Vigilance DAO: domain is new. trigger.')
                    injectedFunction()
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