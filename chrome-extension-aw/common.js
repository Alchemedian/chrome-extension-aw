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
            let aWrapper = document.createElement('a')
            aWrapper.title = title
            aWrapper.target = "_blank"
            aWrapper.href = `https://www.ukpunting.com/index.php?action=adultwork;id=${uid}`
            aWrapper.style.fontSize = "20px"
            aWrapper.style.textDecoration = "none"
            let html = ""
            if (json.review_count == 0) {
                destinationDiv.classList.add('ku_ukp_review_item_no_reviews')
                aWrapper.style.fontSize = "15px"
                html += `No UKP Reviews 😢`
                if (scrape)
                    destinationDiv.style.background = '#eee'
            } else {
                html += '<span class="ku_ukp_review_item_label">UKP</span> '
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
            aWrapper.innerHTML = html
            destinationDiv.innerHTML = ''
            destinationDiv.appendChild(aWrapper)
            while (destinationDiv.offsetHeight > 30) {
                let fontSize = parseInt(aWrapper.style.fontSize)
                if (fontSize <= 5)
                    break;
                fontSize--
                aWrapper.style.fontSize = `${fontSize}px`
            }
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