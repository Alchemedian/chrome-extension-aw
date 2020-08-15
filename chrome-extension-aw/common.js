function isSearchPage() {
    return !!location.href.match(/\/Search.asp/)
}

function isProfilePage() {
    return /ViewProfile.asp/i.test(location.href)
}

function getUKPsummary(uid, destinationDiv) {
    fetch(`https://ukp-aw2ukp-cors-proxy.bwkake.workers.dev/?awid=${encodeURIComponent(uid)}`)
        .then(y => y.json())
        .then(json => {
            let html = `<a title="Counts could be out of date :-(" style="text-decoration:none" href='https://www.ukpunting.com/index.php?action=adultwork;id=${uid}' target='_blank'>`
            if (json.review_count == 0) {
                html += `No UKP Reviews :-(`
            } else {
                html += `UKP <span style='color:green;padding-right:6px'>👍 ${json.positive_count}</span>`
                if (json.negative_count)
                    html += `<span style='color:red;;padding-right:6px'>👎 ${json.negative_count}</span>`
                if (json.neutral_count)
                    html += `<span style='color:grey'>😐 ${json.neutral_count}</span>`
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