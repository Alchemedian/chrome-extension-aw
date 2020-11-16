function isSearchPage() {
    return !!location.href.match(/\/Search.asp/)
}

function isProfilePage() {
    return /ViewProfile.asp/i.test(location.href)
}

function getUKPsummary(uid, destinationDiv, apiOrScrape = 'api') {
    const scrape = apiOrScrape === 'scrape'
    let url = `https://ukp-aw2ukp-cors-proxy.bwkake.workers.dev/?awid=${encodeURIComponent(uid)}`
    if (scrape) {
        url = `https://ukp-scrape.bwkake.workers.dev/?awid=${encodeURIComponent(uid)}`
        destinationDiv.innerHTML = "Loading UKP Reviews..."
    } else {
        destinationDiv.style.background = ''
    }
    fetch(url)
        .then(y => y.json())
        .then(json => {
            let aWrapper = document.createElement('a')
            let chronDiv = document.createElement('div')
            chronDiv.className = "ku_ukp_summary_chron"
            aWrapper.target = "_blank"
            aWrapper.href = `https://www.ukpunting.com/index.php?action=adultwork;id=${uid}`
            aWrapper.style.fontSize = "20px"
            aWrapper.style.textDecoration = "none"
            let html = ""
            let probabilityGood = (json.positive_count + 1) / (json.positive_count + json.negative_count + json.neutral_count + 2)
            let starRating = Math.round(probabilityGood * 50) / 10
            let probabilityGoodPercent = Math.round(probabilityGood * 100)
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

                html += `<span class="ku_ukp_review_item ku_ukp_review_item_probability ku_tooltip">${starRating} ⭐<span class="ku_tooltiptext ku_tooltiptext_small">${probabilityGoodPercent}% chances of a +ve experience</span> </span>`
                if (json.order) {
                    json.order.forEach((item, i) => {
                        let dat = json.dates && json.dates[i] ? json.dates[i] : ''
                        let spanItem = document.createElement('span')
                        spanItem.classList.add(`ku_ukp_timeline_${item}`)
                        spanItem.classList.add(`ku_tooltip`)
                        let leftRight = cumulativeOffset(destinationDiv).left > window.innerWidth / 2 ?
                            'right' : 'left'
                        spanItem.innerHTML = `<span class="ku_tooltiptext ku_tooltiptext_${leftRight}">${dat}</span>`
                        chronDiv.appendChild(spanItem)
                    })
                }


                if (scrape) {
                    let percent = Math.round(200 * (json.positive_count + .5 * json.neutral_count) / json.review_count)
                    let alpha = json.review_count < 4 ? .5 : 1
                    aWrapper.style.background = `linear-gradient(90deg, rgba(0,254,0,${alpha}) 0%, rgba(255,0,0,${alpha}) ${percent}%)`
                }
            }
            aWrapper.innerHTML = html
            destinationDiv.innerHTML = ''
            destinationDiv.appendChild(aWrapper)
            destinationDiv.appendChild(chronDiv)
            while (aWrapper.offsetHeight > 30) {
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
    let googleButton = document.createElement('button');
    googleButton.className = "ku_google_button"
    googleButton.innerHTML = "Google"
    googleButton.addEventListener('click', () => {
        event.preventDefault();
        // document.getElementById(`ku_ukp_form_${uid}`).submit()
        window.open("https://www.google.co.uk/search?q=" + encodeURIComponent('adultwork ' + uid))
    })
    ukp.appendChild(googleButton)

    let ukpGoogleButton = document.createElement('button');
    ukpGoogleButton.className = "ku_oogle_button"
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
        <label for="ku_check_phone">Only show results with a phone. <span id="ku_phone_hidden_count"></span></label></span>
        ` : '';

        topBar.innerHTML += `${hidePhoneButton}
        <span id="ku_ukp_search"></span>
    <div id="ku_ukp_summary"></div>`
    })();
}

function cumulativeOffset(ele) {
    let top = 0,
        left = 0;
    do {
        top += ele.offsetTop || 0;
        left += ele.offsetLeft || 0;
        ele = ele.offsetParent;
    } while (ele);

    return {
        top: top,
        left: left
    }
}


function covidData(county, destinationDiv, countySecondary) {
    if (!covidData.covidData) {
        covidData.covidData = 'waiting'
        fetch('https://news.files.bbci.co.uk/include/newsspec/codebuilddata/Weekly_cases_lookup_data.json')
            .then(y => y.json())
            .then(json => {
                covidData.covidData = json
                covidData(county, destinationDiv, countySecondary)
            })
    } else if (covidData.covidData === 'waiting') {
        setTimeout(() => covidData(county, destinationDiv, countySecondary), 100)
    } else {
        let dat = covidData.covidData
        let lcCounty = String(county).toLowerCase()
        let regionMatched = false;

        for (let i = 0; i < dat.length; i++) {
            let lcRegion = dat[i][1].toLowerCase()
            if (lcRegion === lcCounty) {
                parseCovidData(dat[i])
                regionMatched = true;
                break
            }
        }
        if (!regionMatched) {
            let matches = []
            for (let i = 0; i < dat.length; i++) {
                let lcRegion = dat[i][1].toLowerCase()
                if (lcRegion.indexOf(lcCounty) !== -1 || lcCounty.indexOf(lcRegion) !== -1) {
                    let one = lcRegion.split(' ')
                    let two = lcCounty.replace(/,/g, ' ').split(' ')
                    let intersection = one.filter(x => two.includes(x))
                    if (intersection.length !== 0) {
                        matches.push(dat[i])
                            // break
                    }
                }
            }
            if (matches.length > 0) {
                matches.slice(0, 5).forEach(parseCovidData)
                regionMatched = true
            }
        }
        if (!regionMatched && countySecondary) {
            covidData(countySecondary, destinationDiv)
        }
    }

    function parseCovidData(row) {
        let formatted = {
            region: row[1],
            casesTotal: row[2],
            casesToDate: row[9],
            casesNewThisWeekComparedToLast: row[11],
            casesLatestWeek: row[10],
            casesPer100k: row[12],
            casesPer100kNationalAverage: row[13],
        }

        let divRegion = document.createElement('div')

        let sign = formatted.casesNewThisWeekComparedToLast > 0 ? '+' : ''
        let redSign = formatted.casesNewThisWeekComparedToLast > 0 ? "color:red" : 'color:green'
        let pipe = `<span style='color:#eee'>|</span>`
        divRegion.innerHTML = `Covid cases per 100k in ${formatted.region}: ${formatted.casesPer100k} ${pipe} 
        National avg. ${formatted.casesPer100kNationalAverage} ${pipe}
        Cases: <span class="ku_tooltip">${formatted.casesTotal.toLocaleString()}        
        </span>
         ${pipe} 
        <span style='${redSign}'>${sign}${formatted.casesNewThisWeekComparedToLast}</span> from last week
        ${pipe}
        Updated ${formatted.casesToDate}
        `
        let id = 'hash_' + hashCode(divRegion.innerHTML)
        divRegion.id = id
        if (!document.querySelector(`#${id}`)) {
            destinationDiv.appendChild(divRegion)
        }
    }

    function hashCode(str) {
        var hash = 0;
        if (str.length == 0) {
            return hash;
        }
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        if (hash < 0)
            hash = `${hash}`.replace('-', '9')
        return hash;
    }
}

async function postCodeToName(postcode) {
    let url = 'https://api.postcodes.io/postcodes?q=' + encodeURIComponent(postcode)
    let data = await (await fetch(url)).json()
    return data.result[0].admin_district
}

/*
returns mutliple matches, e.g. N11 matches 3 admin districts
*/
async function postCodeOutward(postcode) {
    let url = 'https://api.postcodes.io/outcodes/' + encodeURIComponent(postcode)
    let data = await (await fetch(url)).json()
    return data.result.admin_district
}