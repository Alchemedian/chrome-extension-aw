function isSearchPage() {
    return !!location.href.match(/\/Search.asp/)
}

function isProfilePage() {
    return /ViewProfile.asp/i.test(location.href)
}

function getUKPsummary(uid, destinationDiv, apiOrScrape = 'api') {
    const scrape = apiOrScrape === 'scrape'
    let url = `https://ukp-aw2ukp-cors-proxy.bwkake.workers.dev/?awid=${encodeURIComponent(uid)}`
    let title = `Counts could be out of date :-(`
    if (scrape) {
        url = `https://ukp-scrape.bwkake.workers.dev/?awid=${encodeURIComponent(uid)}`
        title = 'Up to date information :-)'
        destinationDiv.style.background = `linear-gradient(90deg, rgba(4,254,4,1) 0%, rgba(38,182,38,1) 100%)`
    } else {
        destinationDiv.style.background = ''
    }
    fetch(url)
        .then(y => y.json())
        .then(json => {
            let html = `<a title="${title}" style="text-decoration:none;font-size:13px" href='https://www.ukpunting.com/index.php?action=adultwork;id=${uid}' target='_blank'>`
            if (json.review_count == 0) {
                html += `No UKP Reviews :-(`
                if (scrape)
                    destinationDiv.style.background = '#eee'
            } else {
                html += 'UKP '
                if (json.positive_count)
                    html += `<span style='padding:1px 10px;white-space:nowrap;color:green;border-radius:15px;background-color:#ccffcc'>👍 ${json.positive_count}</span>`
                if (json.negative_count)
                    html += `<span style='padding:1px 10px;white-space:nowrap;color:white;border-radius:15px;background-color:crimson'>👎 ${json.negative_count}</span>`
                if (json.neutral_count)
                    html += `<span style='padding:1px 10px;white-space:nowrap;color:black;border-radius:15px;background-color:#cccccc'>😐 ${json.neutral_count}</span>`

                if (scrape) {
                    let percent = Math.round(200 * (json.positive_count + .5 * json.neutral_count) / json.review_count)
                    let alpha = json.review_count < 4 ? .5 : 1
                    destinationDiv.style.background = `linear-gradient(90deg, rgba(0,254,0,${alpha}) 0%, rgba(255,0,0,${alpha}) ${percent}%)`
                }
            }
            html += "</a>"
            destinationDiv.innerHTML = html
        })
}

function ukpSearchButtons(uid) {
    let ukp = makeDiv('width:140px', '');
    // let ukpButtonReviewSearch = document.createElement('button');
    // ukpButtonReviewSearch.innerHTML = "UKP Reviews"
    // ukpButtonReviewSearch.style.padding = "1px"
    // ukpButtonReviewSearch.style.cursor = "pointer"
    // ukpButtonReviewSearch.addEventListener('click', () => {
    //     event.preventDefault();
    //     window.open("https://www.ukpunting.com/index.php?action=adultwork;id=" + uid);
    // })
    // ukp.appendChild(ukpButtonReviewSearch)

    let dhid = document.createElement('div')
    dhid.style.display = "none"
    dhid.innerHTML = `
            <form id="ku_ukp_form_${uid}" target="_blank" 
            action="https://www.ukpunting.com/index.php?action=searchposts2"
            method="post"
            >
            <input value="${uid}" name="query"/>
            </form>
            `
    document.querySelector('body').after(dhid)
    let ukpButton = document.createElement('button');
    ukpButton.style.padding = "1px"
    ukpButton.innerHTML = "UKP"
    ukpButton.style.cursor = "pointer"
    ukpButton.addEventListener('click', () => {
        event.preventDefault();
        document.getElementById(`ku_ukp_form_${uid}`).submit()
    })
    ukp.appendChild(ukpButton)

    let ukpGoogleButton = document.createElement('button');
    ukpGoogleButton.style.padding = "1px"
    ukpGoogleButton.innerHTML = "Google UKP"
    ukpGoogleButton.style.cursor = "pointer"
    ukpGoogleButton.addEventListener('click', () => {
        event.preventDefault();
        window.open("https://www.google.co.uk/search?q=" + encodeURIComponent('site:ukpunting.com ' + uid))
    })
    ukp.appendChild(ukpGoogleButton)

    return ukp
}

function makeDiv(style, html, className) {
    let div = document.createElement('div');
    if (className) {
        div.className = className
    }
    div.style = style;
    div.innerHTML = html;
    return div;
}


if (isSearchPage() || isProfilePage()) {
    (function () {
        var temp = function () {
            document.querySelectorAll("*").forEach((x) => x.removeAttribute('onselectstart'))
            document.querySelectorAll(".unSelectable").forEach((x) => x.className = '')
            document.querySelectorAll("*").forEach((x) => x.style.wordBreak = 'break-word')
        }
        setTimeout(temp, 250)
    })();

    (function () {
        var parent = document.getElementById("stripMenuLevel2Container");
        let topBar = document.createElement("div");
        let loc = location.href;
        if (loc.match(/UserID=([0-9]+)/i) && loc.match(/UserID=([0-9]+)/i)[1]) {
            loc = location.protocol + `//www.adultwork.com/` + loc.match(/UserID=([0-9]+)/i)[1];
        } else if (loc.length > 80) {
            loc = loc.split('?')[0] + "?..."
        }
        topBar.innerHTML = loc;// + "  &nbsp;&nbsp;" + String(new Date()).split(' ').slice(0, 4).join(' ');
        topBar.id = "ku_top_bar"
        topBar.style.border = "1px solid grey";
        topBar.style.backgroundColor = "grey";
        topBar.style.color = "white";
        topBar.style.height = "22px";
        topBar.style.lineHeight = "22px";
        parent.after(topBar);
        let hidePhoneButton = isSearchPage() ?
            `            
        <span style="margin-left:20px;height:18px" id='ku_hide'>
        <input id="ku_check_phone" type="checkbox" ${JSON.parse(window.localStorage.hideNoPhone) ? 'checked' : ''}/>
        <label style="font-size:10px;vertical-align:top;padding-top:3px;display:inline-block;line-height:14px" for="ku_check_phone">Only show results with a phone</label></span>
        ` : '';

        topBar.innerHTML += `${hidePhoneButton}
        <span id="ku_ukp_search"></span>
    <div id="ku_ukp_summary" style="border-radius:5px;padding:0 15px 0 15px;background-color:white;color:black;float: right;font-size: 10pt;"></div>`
    })();
}
