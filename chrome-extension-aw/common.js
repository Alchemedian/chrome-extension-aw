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
        title = 'Up to date review counts :-)'
        destinationDiv.innerHTML = "Loading UKP Reviews..."
    } else {
        destinationDiv.style.background = ''
    }
    fetch(url)
        .then(y => y.json())
        .then(json => {
            let html = `<a title="${title}" style="text-decoration:none;font-size:13px" href='https://www.ukpunting.com/index.php?action=adultwork;id=${uid}' target='_blank'>`
            if (json.review_count == 0) {
                html += `No UKP Reviews 😢`
                if (scrape)
                    destinationDiv.style.background = '#eee'
            } else {
                html += 'UKP '
                if (json.positive_count)
                    html += `<span class="ku_ukp_review_item ku_ukp_review_item_positive">👍 ${json.positive_count}</span>`
                if (json.negative_count)
                    html += `<span class="ku_ukp_review_item ku_ukp_review_item_negative" >👎 ${json.negative_count}</span>`
                if (json.neutral_count)
                    html += `<span class="ku_ukp_review_item ku_ukp_review_item_neutral">😐 ${json.neutral_count}</span>`

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
    let ukp = makeDiv('', '', 'ku_ukp_search_buttons');

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
    ukpButton.className = "ku_ukp_button"
    ukpButton.innerHTML = "UKP"
    ukpButton.addEventListener('click', () => {
        event.preventDefault();
        document.getElementById(`ku_ukp_form_${uid}`).submit()
    })
    ukp.appendChild(ukpButton)

    let ukpGoogleButton = document.createElement('button');
    ukpGoogleButton.className = "ku_ukp_button"
    ukpGoogleButton.innerHTML = "Google UKP"

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


function timeAgo(d) {
    const diff = (new Date() - d) / 1000;
    if (diff < 60) {
        const v = Math.round(diff)
        return v + ' second' + (v === 1 ? '' : 's') + ' ago';
    } else if (diff < 60 * 60) {
        const v = Math.round(diff / 60)
        return v + ' minute' + (v === 1 ? '' : 's') + ' ago';
    } else if (diff < 60 * 60 * 24) {
        const v = Math.round(diff / (60 * 60))
        return v + ' hour' + (v === 1 ? '' : 's') + ' ago';
    } else if (diff < 60 * 60 * 24 * 30.436875) {
        const v = Math.round(diff / (60 * 60 * 24))
        return v + ' day' + (v === 1 ? '' : 's') + ' ago';
    } else if (diff < 60 * 60 * 24 * 30.436875 * 12) {
        const v = Math.round(diff / (60 * 60 * 24 * 30.436875))
        return v + ' month' + (v === 1 ? '' : 's') + ' ago';
    }
    const v = Math.round(diff / (60 * 60 * 24 * 30.436875 * 12))
    return v + ' year' + (v === 1 ? '' : 's') + ' ago';
}

if (isSearchPage() || isProfilePage()) {
    (function() {
        var temp = function() {
            document.querySelectorAll("*").forEach((x) => x.removeAttribute('onselectstart'))
            document.querySelectorAll(".unSelectable").forEach((x) => x.className = '')
        }
        setTimeout(temp, 250)
    })();

    (function() {
        var parent = document.getElementById("stripMenuLevel2Container");
        let topBar = document.createElement("div");
        let loc = location.href;
        if (loc.match(/UserID=([0-9]+)/i) && loc.match(/UserID=([0-9]+)/i)[1]) {
            loc = location.protocol + `//www.adultwork.com/` + loc.match(/UserID=([0-9]+)/i)[1];
        } else if (loc.length > 80) {
            loc = loc.split('?')[0] + "?..."
        }
        topBar.innerHTML = loc; // + "  &nbsp;&nbsp;" + String(new Date()).split(' ').slice(0, 4).join(' ');
        topBar.id = "ku_top_bar"
        topBar.style.border = "1px solid grey";
        topBar.style.backgroundColor = "grey";
        topBar.style.color = "white";
        topBar.style.height = "22px";
        topBar.style.lineHeight = "22px";
        parent.after(topBar);
        let hidePhoneButton = isSearchPage() ?
            `            
        <span id='ku_hide'>
        <input id="ku_check_phone" type="checkbox" ${JSON.parse(window.localStorage.hideNoPhone) ? 'checked' : ''}/>
        <label for="ku_check_phone">Only show results with a phone</label></span>
        ` : '';

        topBar.innerHTML += `${hidePhoneButton}
        <span id="ku_ukp_search"></span>
    <div id="ku_ukp_summary"></div>`
    })();
}

//Permission from Dear Leader Cummings, Highest Incarnation of the Revolutionary Tufton Street Comradeship:
// (() => {
//     const cummingsPass = ". <span style='color:red'>Commonsense exceptions apply if you wish to test your eyes or other body parts.</span>"
//     let cwarn = document.querySelector('#main-content-container > tbody > tr > td > form > div:nth-child(1) > table > tbody > tr > td > table > tbody > tr > td > p')
//     if (cwarn)
//         cwarn.innerHTML += cummingsPass
//     else {
//         cwarn = document.querySelector('#main-content-container > tbody > tr > td > div:nth-child(2) > center > table:nth-child(1) > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > p')
//         if (cwarn)
//             cwarn.innerHTML += cummingsPass
//     }
// })()