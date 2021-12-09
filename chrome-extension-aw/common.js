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

                let gn = starRating == 1 ? '' : 's';
                html += `<span class="ku_ukp_review_item ku_ukp_review_item_probability ku_tooltip">                
                <div class="ku_stars" style="--rating: ${starRating};border: 0;margin: 0;padding: 0;" >
                <span class="ku_tooltiptext ku_tooltiptext_small"><b>${starRating} Star${gn}</b><br> ${probabilityGoodPercent}% chance of a +ve experience</span> </span>`

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
        window.open("https://www.google.co.uk/search?q=" + encodeURIComponent(`adultwork "${uid}"`))
    })
    ukp.appendChild(googleButton)

    let ukpGoogleButton = document.createElement('button');
    ukpGoogleButton.className = "ku_oogle_button"
    ukpGoogleButton.innerHTML = "Google UKP"

    ukpGoogleButton.addEventListener('click', () => {
        event.preventDefault();
        window.open("https://www.google.co.uk/search?q=" + encodeURIComponent(`site:ukpunting.com "${uid}"`))
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

function cloneAndReplaceUnSelectableElement(ele) {
    let eleParent = ele.parentElement
    let eleNew = document.createElement(ele.nodeName)
    eleNew.id = ele.id
    eleNew.className = ele.className.replace(/unSelectable/ig, ' ')
    eleNew.innerHTML = ele.innerHTML
    eleParent.removeChild(ele)
    eleParent.appendChild(eleNew)
}

function timeAgo(d) {
    const diff = (new Date() - d) / 1000;
    let v
    if (diff < 60) {
        v = Math.round(diff)
        return v + ' second' + (v === 1 ? '' : 's') + ' ago';
    } else if (diff < 60 * 60) {
        v = Math.round(diff / 60)
        return v + ' minute' + (v === 1 ? '' : 's') + ' ago';
    } else if (diff < 60 * 60 * 24) {
        v = Math.round(diff / (60 * 60))
        return v + ' hour' + (v === 1 ? '' : 's') + ' ago';
    } else if (diff < 60 * 60 * 24 * 30.436875) {
        v = Math.round(diff / (60 * 60 * 24))
        return v + ' day' + (v === 1 ? '' : 's') + ' ago';
    } else if (diff < 60 * 60 * 24 * 30.436875 * 12) {
        v = Math.round(diff / (60 * 60 * 24 * 30.436875))
        return v + ' month' + (v === 1 ? '' : 's') + ' ago';
    }
    v = Math.round(diff / (60 * 60 * 24 * 30.436875 * 12))
    return v + ' year' + (v === 1 ? '' : 's') + ' ago';
}

if (isSearchPage() || isProfilePage()) {
    (function() {
        document.querySelectorAll("[unselectable]")
            .forEach(cloneAndReplaceUnSelectableElement)
        document.querySelectorAll(".unSelectable")
            .forEach(cloneAndReplaceUnSelectableElement)
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
        topBar.addEventListener('dblclick', () => {
            let telNum = prompt(`Search ${APP_NAME} cache for a phone number`)
            if (telNum) {
                let telFull = telNum
                    .replace(/ /g, '')
                    .replace(/^0/, '+44')
                    .replace(/^/, '+')
                    .replace(/^\++/, '+')
                let matches = findProfilesByPhoneNumber(telFull)
                if (matches) {
                    alert(telFull + " matched: " + Object.keys(matches).join(", "))
                } else {
                    alert(`No matches found for ${telFull}`)
                }
            }
        })

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
        Cases: <span class="ku_tooltip">${Number(formatted.casesTotal).toLocaleString()}
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


function graphQLVideoImageLoad(pageURL, callback) {
    let guidReg = /[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    let matches = pageURL.match(guidReg)
    let guid
    if (matches && matches[0]) {
        guid = matches[0]
    } else {
        return
    }
    fetch("https://webapi.adultwork.com/graphql", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://m.adultwork.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        // "body": "{\"operationName\":\"IMovieViewPageData\",\"variables\":{\"externalId\":\"" + guid + "\",\"imagePreset\":\"WH960\",\"tilePreset\":\"WH360X200\"},\"query\":\"query IMovieViewPageData($externalId: Uuid!, $imagePreset: Preset!, $tilePreset: Preset!) {\\n  viewMovie: movie(externalId: $externalId) {\\n    ...IMoviePlayerPageMovie\\n    __typename\\n  }\\n  userMovies: relatedUserMoviesByMovieFilterable(\\n    externalId: $externalId\\n    first: 18\\n  ) {\\n    ...IMovieViewPageMovieConnection\\n    __typename\\n  }\\n  latestMovies: hPNewMoviesFilterable(first: 12, where: {price: {gt: 0.00}}) {\\n    ...IMovieViewPageMovieConnection\\n    __typename\\n  }\\n  featuredMovies: hPFeaturedMoviesFilterable(\\n    first: 12\\n    where: {price: {gt: 0.00}}\\n  ) {\\n    ...IMovieViewPageMovieConnection\\n    __typename\\n  }\\n  relatedMovies: relatedMoviesFilterable(externalId: $externalId, first: 4) {\\n    ...IMovieViewPageMovieConnection\\n    __typename\\n  }\\n}\\n\\nfragment IMovieViewPageMovieConnection on MovieConnection {\\n  pageInfo {\\n    hasNextPage\\n    hasPreviousPage\\n    startCursor\\n    endCursor\\n    __typename\\n  }\\n  nodes {\\n    ...IMovieViewPageTileMovie\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMovieViewPageTileMovie on Movie {\\n  userID\\n  title\\n  imageURL(format: JPG, preset: $tilePreset)\\n  duration\\n  externalID\\n  priceVAT {\\n    creditsGross\\n    __typename\\n  }\\n  profile {\\n    nickname\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageCategories on Movie {\\n  categories {\\n    categoryID\\n    category\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageCollection on Movie {\\n  collection {\\n    name\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageFileData on FileData {\\n  uRL\\n  hasAudio\\n  thumbnailTrackURL\\n  __typename\\n}\\n\\nfragment IMoviePlayerPagePriceVat on Movie {\\n  priceVAT {\\n    creditsGross\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageServices on OfferedServices {\\n  isEscort\\n  isWebcam\\n  isPhoneChat\\n  isSMSChat\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageProfile on Profile {\\n  userID\\n  nickname\\n  age\\n  verified\\n  primaryImage {\\n    imageURL(format: JPG, preset: SMSQ48)\\n    __typename\\n  }\\n  gender\\n  orientation\\n  ratings {\\n    total\\n    __typename\\n  }\\n  services {\\n    ...IMoviePlayerPageServices\\n    __typename\\n  }\\n  escort {\\n    ...IMoviePlayerPageServiceAvailability\\n    __typename\\n  }\\n  availableNowWebCam\\n  availableNowPhoneChat\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageGender on Movie {\\n  contentGender {\\n    gender\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageServiceAvailability on EscortDetails {\\n  availableToday\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageMovie on Movie {\\n  externalID\\n  title\\n  imageFileName\\n  imageURL(format: JPG, preset: $imagePreset)\\n  thumbnailURL\\n  description\\n  duration\\n  createdDate\\n  movieViewToken\\n  ...IMoviePlayerPagePriceVat\\n  ...IMoviePlayerPageGender\\n  ...IMoviePlayerPageCollection\\n  profile {\\n    ...IMoviePlayerPageProfile\\n    __typename\\n  }\\n  ...IMoviePlayerPageCategories\\n  fileData {\\n    ...IMoviePlayerPageFileData\\n    __typename\\n  }\\n  __typename\\n}\\n\"}",
        "body": "{\"operationName\":\"IMovieViewPageData\",\"variables\":{\"externalId\":\"" + guid + "\",\"imagePreset\":\"WH480\",\"tilePreset\":\"WH390X165\"},\"query\":\"query IMovieViewPageData($externalId: Uuid!, $imagePreset: Preset!, $tilePreset: Preset!) {\\n  viewMovie: movie(externalId: $externalId) {\\n    ...IMoviePlayerPageMovie\\n    __typename\\n  }\\n  userMovies: relatedUserMoviesByMovieFilterable(\\n    externalId: $externalId\\n    first: 18\\n  ) {\\n    ...IMovieViewPageMovieConnection\\n    __typename\\n  }\\n  latestMovies: hPNewMoviesFilterable(first: 12, where: {price: {gt: 0.00}}) {\\n    ...IMovieViewPageMovieConnection\\n    __typename\\n  }\\n  featuredMovies: hPFeaturedMoviesFilterable(\\n    first: 12\\n    where: {price: {gt: 0.00}}\\n  ) {\\n    ...IMovieViewPageMovieConnection\\n    __typename\\n  }\\n  relatedMovies: relatedMoviesFilterable(externalId: $externalId, first: 4) {\\n    ...IMovieViewPageMovieConnection\\n    __typename\\n  }\\n}\\n\\nfragment IMovieViewPageMovieConnection on MovieConnection {\\n  pageInfo {\\n    hasNextPage\\n    hasPreviousPage\\n    startCursor\\n    endCursor\\n    __typename\\n  }\\n  nodes {\\n    ...IMovieViewPageTileMovie\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMovieViewPageTileMovie on Movie {\\n  userID\\n  title\\n  imageURL(format: JPG, preset: $tilePreset)\\n  duration\\n  externalID\\n  priceVAT {\\n    creditsGross\\n    __typename\\n  }\\n  profile {\\n    nickname\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageCategories on Movie {\\n  categories {\\n    categoryID\\n    category\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageCollection on Movie {\\n  collection {\\n    name\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageFileData on FileData {\\n  uRL\\n  hasAudio\\n  thumbnailTrackURL\\n  __typename\\n}\\n\\nfragment IMoviePlayerPagePriceVat on Movie {\\n  priceVAT {\\n    creditsGross\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageServices on OfferedServices {\\n  isEscort\\n  isWebcam\\n  isPhoneChat\\n  isSMSChat\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageProfile on Profile {\\n  userID\\n  nickname\\n  age\\n  verified\\n  primaryImage {\\n    imageURL(format: JPG, preset: SMSQ48)\\n    __typename\\n  }\\n  gender\\n  orientation\\n  ratings {\\n    total\\n    __typename\\n  }\\n  services {\\n    ...IMoviePlayerPageServices\\n    __typename\\n  }\\n  escort {\\n    ...IMoviePlayerPageServiceAvailability\\n    __typename\\n  }\\n  availableNowWebCam\\n  availableNowPhoneChat\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageGender on Movie {\\n  contentGender {\\n    gender\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageServiceAvailability on EscortDetails {\\n  availableToday\\n  __typename\\n}\\n\\nfragment IMoviePlayerPageMovie on Movie {\\n  externalID\\n  title\\n  imageURL(format: JPG, preset: $imagePreset)\\n  thumbnailURL\\n  description\\n  duration\\n  createdDate\\n  movieViewToken\\n  ...IMoviePlayerPagePriceVat\\n  ...IMoviePlayerPageGender\\n  ...IMoviePlayerPageCollection\\n  profile {\\n    ...IMoviePlayerPageProfile\\n    __typename\\n  }\\n  ...IMoviePlayerPageCategories\\n  fileData {\\n    ...IMoviePlayerPageFileData\\n    __typename\\n  }\\n  __typename\\n}\\n\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(x => x.json()).then(json => {
        callback(json.data.viewMovie.imageURL)
    })


}


function parseProfileData(profileHtml) {
    let profileData = { ts: new Date() / 1 }
    let divProfileHTML = document.createElement('div')
    divProfileHTML.innerHTML = profileHtml

    let tel = getCanonicalPhone(profileHtml)
    if (tel) {
        profileData.tel = tel
    }
    if (profileHtml && profileHtml[0]) {
        profileData.rates = {}
        let hourly = divProfileHTML.querySelector('#tdRI1')
        hourly = hourly ? hourly.innerText : '?'
        profileData.rates.hourly = hourly

        let halfHourly = divProfileHTML.querySelector('#tdRI0\\.5')
        halfHourly = halfHourly ? halfHourly.innerText : '?'
        profileData.rates.halfHourly = halfHourly

        let hourlyOutcall = divProfileHTML.querySelector('#tdRO1')
        if (hourlyOutcall && hourlyOutcall.innerText) {
            profileData.rates.hourlyOutcall = hourlyOutcall.innerText
        }

        profileData.services = []
        profileData.misc = {}

        Object.keys(ACRONYM_TO_SERVICE_REGEX).forEach(acronym => {
            let regArray = ACRONYM_TO_SERVICE_REGEX[acronym][0]
            let qSelector = ACRONYM_TO_SERVICE_REGEX[acronym][2]
            let eleSelected = divProfileHTML.querySelector(qSelector)
            let eleText = eleSelected ? eleSelected.innerText : '';
            if (!Array.isArray(regArray))
                regArray = [regArray]
            for (let i = 0; i < regArray.length; i++) {
                let matchType = Object.prototype.toString.call(regArray[i])
                if (matchType == '[object RegExp]') {
                    if (regArray[i].test(eleText)) {
                        profileData.services.push(acronym)
                        break
                    }
                } else if (matchType == '[object Function]') {
                    let txt = regArray[i](eleText)
                    if (txt) {
                        profileData.services.push(acronym)
                        profileData.misc[acronym] = txt
                        break
                    }
                }
            }
        })
    }

    let nationality;
    divProfileHTML.querySelectorAll('td.Label').forEach(ele => {
        if (ele.innerText.match(/Nationality/)) {
            nationality = ele.parentElement.querySelector('td:nth-child(2)').innerText
        }
    })
    let name = ""
    let profileName = divProfileHTML.querySelector('[itemprop="name"]')
    if (profileName && profileName.innerText) {
        name = profileName.innerText
    }

    profileData.nationality = nationality
    profileData.name = name
    return profileData
}

function cachedLocalStorage(dataSave = false, getFresh = false) {
    if (!cachedLocalStorage.cache || getFresh) {
        if (localStorage[LOCAL_STORAGE_KEY_NAME]) {
            cachedLocalStorage.cache = JSON.parse(LZString.decompress(localStorage[LOCAL_STORAGE_KEY_NAME]))
        } else {
            cachedLocalStorage.cache = {}
        }
    }
    if (dataSave) {
        cachedLocalStorage.cache = dataSave
        if (cachedLocalStorage.setTimeout) {
            clearTimeout(cachedLocalStorage.setTimeout)
        }
        cachedLocalStorage.setTimeout = setTimeout(() => {
            //clean up duplicate data:
            Object.keys(dataSave).forEach(id => { dataSave[id].d = removeRepeatedData(dataSave[id].d) })
            cachedLocalStorage.setTimeout = false;
            localStorage[LOCAL_STORAGE_KEY_NAME] = LZString.compress(JSON.stringify(dataSave))
        }, 100)
    }

    return cachedLocalStorage.cache
}

function removeRepeatedData(arr) {
    let retArr = []
    let lastElement = {}
    arr.forEach((row) => {
        let rowCopy = {...row }
        delete rowCopy.ts
        delete lastElement.ts
        if (row.name == "" && lastElement.name !== "") {
            row.name = lastElement.name
        }
        if (JSON.stringify(lastElement) !== JSON.stringify(rowCopy)) {
            retArr.push(row)
        }
        lastElement = {...row }
    })
    return retArr
}

function saveProfileData(uid, data, onProfilePage = false, gallery = {}) {
    try {
        let store = {}
        if (cachedLocalStorage()) {
            store = cachedLocalStorage()
        }
        store[uid] = store[uid] ? store[uid] : {
            d: [],
            c: 0, // total profile views count, including in search results
            p: 0, // total profile page visits
            g: {},
        }
        store[uid].d = store[uid].d.sort((a, b) => {
            if (a.ts > b.ts)
                return 1
            if (a.ts < b.ts)
                return -1
            return 0
        })


        if (store[uid].d.length == 0 ||
            store[uid].d.slice(-1)[0].ts < data.ts - 24 * 60 * 60 * 1000 ||
            historyChanged(store[uid].d.slice(-1)[0], data)
        ) {
            store[uid].d.push(data)
        }

        function historyChanged(a, b) {
            return JSON.stringify({...a, ts: 1 }) !== JSON.stringify({...b, ts: 1 })
        }

        //limit to 100 records
        store[uid].d.slice(-100)

        store[uid].c++;
        if (onProfilePage) {
            store[uid].p++;
            store[uid].g = {...store[uid].g, ...gallery }
        }


        cachedLocalStorage(store)
    } catch (e) {
        console.log(e)
    }

}

function getProfileHistory(id) {
    let store = {}
    if (cachedLocalStorage()) {
        store = cachedLocalStorage()
    }
    if (store[id] && store[id].d) {
        store[id].d = store[id].d.sort((a, b) => {
            if (a.ts > b.ts)
                return 1
            if (a.ts < b.ts)
                return -1
            return 0
        })
    }

    return store[id] ? store[id] : {}
}

function getProfileHistoryByKey(id, key = 'tel') {
    let profileHistory = getProfileHistory(id)
    let ret = {}
    if (profileHistory && profileHistory.d) {
        profileHistory.d.forEach(x => {
            if (x[key]) {
                ret[x[key]] = 1
            }
        })
    }
    return Object.keys(ret)
}

function getPriceHistory(id, band = 'hourly') {
    let history = getProfileHistory(id)
    let prices = []
    if (history.d) {
        let last = ""
        history.d.forEach(row => {
            if (!row.rates)
                return;
            if (last != row.rates[band]) {
                prices.push([row.ts, row.rates[band]])
            }
            last = row.rates[band]
        })
    }
    return prices
}

function getLastHistoricPhone(id) {
    let history = getProfileHistory(id)
    if (history.d) {
        for (let i = 0; i < history.d.length; i++) {
            if (history.d[i].tel) {
                return [history.d[i].tel, String(new Date(history.d[i].ts).toLocaleString())]
            }
        }
    }
    return ""
}

function wrapWhatsappLink(telFull) {
    let wa = document.createElement('a')
    wa.setAttribute('target', '_blank')
    wa.setAttribute('href', `https://wa.me/${telFull}`)
    wa.className = "ku_prof_whatsapp"
    wa.innerHTML = `<img class="whatsapp" alt="WhatsApp" title="WhatsApp" src='https://www.google.com/s2/favicons?domain=web.whatsapp.com' /> WhatsApp`
    return wa
}

function wrapNumberSearch(telFull, profileId) {
    let search = document.createElement('span')
    let linkedProfiles = findProfilesByPhoneNumber(telFull)
    search.className = "ku_prof_number_assoc"

    if (Object.keys(linkedProfiles).length > 1) {
        let links = []
        Object.keys(linkedProfiles).filter(r => r != profileId).forEach(pid => {
            links.push(`<a class='ku_prof_number_assoc_a' target='_blank' href='/ViewProfile.asp?UserID=${pid}'>${pid}</a>`)
        })
        search.innerHTML = " Number also on: " + links.join(', ')
    }
    return search
}

function findProfilesByPhoneNumber(telFull) {
    if (telFull == '+')
        return {}
    let telLookup = {}
    Object.keys(cachedLocalStorage()).forEach(profId => {
        cachedLocalStorage()[profId].d.forEach(row => {
            if (row['tel']) {
                if (!telLookup[row['tel']]) {
                    telLookup[row['tel']] = {}
                }
                telLookup[row['tel']][profId] = 1
            }
        })
    })
    return telLookup[telFull]
}

function getCanonicalPhone(html, countryCode = true) {
    let canonical = false
    let regex = /^(\+44|0)\d{10}$/
    if (html.match(regex)) {
        canonical = html.match(regex)[0].replace(/^0/, '+44')
    }
    // let tel = html.match(/"telephone".+/g)
    let tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    let telElement = tempDiv.querySelector('[itemprop="telephone"]')
    let tel = telElement ? telElement.innerText : ''

    if (tel && tel.match(/[0-9+]+/g)) {
        let tels = tel.match(/[0-9+]+/g)
        if (tels.length == 2 && tels[1].substr(-10) == tels[0].substr(-10)) {
            tels.pop()
        }
        tel = tels.join(', ')
        tel = tel.replace(/^\+?44/g, '0')
        let telSearch = tel.split(",")[0]
        let telFull = telSearch.replace(/^0/, '+44')
        canonical = telFull
    }
    if (canonical) {
        if (countryCode) {
            return canonical
        } else {
            return getShortPhone(canonical)
        }
    }
    return ""
}

function getShortPhone(longPhone) {
    return String(longPhone).replace(/^\+44/, '0')
}

function googlePhoneQueryExpansion(phone) {
    let telSearch = getCanonicalPhone(phone, false)
    let telFull = getCanonicalPhone(phone)
    return `${telSearch}  OR ${telFull} OR "${telSearch.substr(0,5) +' '+telSearch.substr(5)}" OR "${telSearch.substr(0,5) +' '+telSearch.substr(5,3)+' '+telSearch.substr(8)}"`
}