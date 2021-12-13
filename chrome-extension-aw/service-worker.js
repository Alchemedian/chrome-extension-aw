chrome.runtime.onMessage.addListener(function(message, sender, response) {
    if (message.awid_to_phone) {
        let ret = { tel: '' }
        fetch(`https://my.adultwork.com/${message.awid_to_phone}/`)
            .then(response => response.text())
            .then(text => {
                let matches = text.match(/itemprop="telephone">(\+?[^<]+)/)
                if (matches && matches[1]) {
                    ret.tel = matches[1]
                }
                response(ret)
            })
            .catch(error => console.log("error", error))
        return true;
    }


});