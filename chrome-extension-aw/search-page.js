if (isSearchPage()) {

    //hide featured members crap
    let featuredMembers = document.querySelector('.HomePageTabLink')
    if (featuredMembers && featuredMembers.innerText === "Featured Members") {
        let fmParent =
            featuredMembers.parentElement.parentElement.parentElement
            .parentElement.parentElement.parentElement.parentElement
        fmParent.style.display = "none"
        let div = document.createElement('div')
        div.id = "ku_featured_members_hidden"
        div.innerHTML = "<i>Featured Members</i> bullshit hidden. Click here to restore it."
        div.addEventListener('click', () => {
            document.getElementById('ku_featured_members_hidden').style.display = "none"
            fmParent.style.display = ""
        })
        setTimeout(() => {
            let tb = document.getElementById('ku_top_bar')
            if (tb)
                tb.after(div)
        }, 1000)
    }


    //disable picture click
    document.querySelectorAll('.Padded a[onmousemove="overhere(event)"]').forEach(anc => {
        anc.style.cursor = "wait"
        anc.addEventListener('click', () => {
            let uid = anc.getAttribute('href').match(/[0-9]+/)
            if (uid && uid[0])
                window.open(`${location.protocol}//www.adultwork.com/ViewProfile.asp?UserID=${uid[0]}`)

            event.preventDefault()
        })
    })

    //replace useless words around age on bio
    document.querySelectorAll('center td[colspan="2"]').forEach(ele => {
        if (/year old/.test(ele.innerText)) {
            let origText = ele.innerText
            ele.innerText = origText
                .replace(/[^\d]+/g, '')
            if (ele.innerText === "") {
                ele.innerText = "?"
            }
            ele.title = origText
            ele.classList.add('ku_stylised_age')
        }
    })

    let profileImages = {}

    function parseProfileImages(body) {
        let imgUniq = {}
        let domTemp = document.createElement('div')
        domTemp.innerHTML = body
        let wishList = domTemp.querySelectorAll("form[name=frmUserWishlist]")
        if (wishList && wishList[0]) {
            wishList[0].parentElement.removeChild(wishList[0])
        }

        domTemp.querySelectorAll("img.Border,td[background='images/border.gif'] img,img.ImageBorder")
            .forEach(el => {
                let img = el.src
                    .replace('/thumbnails/', '/images/')
                    .replace('/i/', '/l/')
                    .replace('/t/', '/l/')

                imgUniq[img] = 1
            })
        domTemp.querySelectorAll(".cp__video__thumb img")
            .forEach(el => {
                let img = el.src
                imgUniq[img] = 1
            })
        return Object.keys(imgUniq)
    }



    function showOverlayImage(uid, ord) {
        let eleOverlay = document.getElementsByClassName('ku_picture_overlay')[0]
        if (event.pageX < window.innerWidth / 2) {
            eleOverlay.style.left = (window.innerWidth / 2) + "px"
        } else {
            eleOverlay.style.left = 0
        }
        eleOverlay.style.top = window.scrollY + "px"

        if (!profileImages[uid])
            return;

        eleOverlay.style.display = "block"
        let src = `${profileImages[uid][ord]}`
        eleOverlay.style.backgroundImage = `url("${src}")`

        let mw = Math.floor(window.innerWidth / 2)
        let mh = Math.floor(window.innerHeight)

        eleOverlay.style.width = mw;
        eleOverlay.style.height = mh - 6;

        document.querySelectorAll(`.ku_ordpos`).forEach(ele => ele.classList.remove('ku_ordpos_hover'))
        document.querySelectorAll(`#ku_ruler_${uid} .ku_ordpos:nth-child(${ord + 1})`)
            .forEach(ele => ele.classList.add('ku_ordpos_hover'))
    }

    function hideOverlayImage() {
        document.getElementsByClassName('ku_picture_overlay')[0].style.display = "none";
        document.querySelectorAll(`.ku_ordpos`).forEach(ele => ele.classList.remove('ku_ordpos_hover'))
    }

    function biggerHoverImages() {
        document.body.appendChild(
            makeDiv('', '', 'ku_picture_overlay'))

        document.querySelectorAll('.Padded a[onMouseover]').forEach(ele => {
            let uid = ele.href.match(/[0-9]+/)[0];
            if (!ele.firstElementChild)
                return
            ele.firstElementChild.addEventListener('mousemove', () => {
                if (!profileImages[uid])
                    return
                let ord = Math.floor(event.offsetX / ele.firstElementChild.width * (profileImages[uid].length))
                showOverlayImage(uid, ord)
            })
            ele.addEventListener('mouseout', hideOverlayImage)
        })
    }
    biggerHoverImages()

    document.querySelectorAll("a.label[href='#']").forEach(function(anchorTag) {
        var st = String(anchorTag.getAttribute('onclick')).match(/sU\(([0-9]+)/);
        if (!st || !st[1])
            return;
        let uid = st[1]

        let fetchDelay = isVisibleInPageScroll(anchorTag) ?
            1 + Math.random() * 100 :
            700 + Math.floor(Math.random() * 400)
        setTimeout(() => embelishProfileBlurb(uid), fetchDelay)

        function embelishProfileBlurb(userId) {
            if (userId == 5741000) { return } //AW left a driver's licence in the html, blocking
            anchorTag.after(ukpSearchButtons(userId))
            let spacerDiv = document.createElement('div')
            spacerDiv.className = 'ku_spacer_placeholder'
            anchorTag.after(spacerDiv)
            let loadingDiv = document.createElement('div')
            loadingDiv.className = "ku_loader_profile_anim"
            loadingDiv.innerHTML = `Loading...`
            anchorTag.after(loadingDiv)


            fetch(location.protocol + '//www.adultwork.com/ViewProfile.asp?UserID=' + userId)
                .then(y => y.text())
                .then((html) => {
                    parseProfile(html)
                    saveProfileData(userId, parseProfileData(html), false)
                })

            function parseProfile(profileHtml) {
                /*
                TODO: use function parseProfileData in common.js to implement this
                */
                spacerDiv.parentNode.removeChild(spacerDiv)
                loadingDiv.parentNode.removeChild(loadingDiv)
                let divProfileHTML = document.createElement('div')
                divProfileHTML.innerHTML = profileHtml
                profileImages[userId] = parseProfileImages(profileHtml)
                let aImg = document.querySelectorAll(`a[href="javascript:vU(${userId})"`)
                if (aImg && aImg[0])
                    aImg[0].style.cursor = "ew-resize"
                let rsearch = makeDiv('position:relative;bottom:52px', '', 'ku_reverse_search_buttons')

                let reversSearchList = {
                    Yandex: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(profileImages[userId][0])}`,
                    Google: `https://www.google.com/searchbyimage?&image_url=${encodeURIComponent(profileImages[userId][0])}`,
                    // Bing: `https://www.bing.com/visualsearch/Microsoft/SimilarImages?&imgurl=${encodeURIComponent(profileImages[uid][0])}`
                }

                Object.keys(reversSearchList).forEach(key => {
                    let b = document.createElement('button');
                    b.innerHTML = key
                    b.addEventListener('click', () => {
                        window.open(reversSearchList[key])
                        event.preventDefault()
                        return false;
                    })
                    rsearch.appendChild(b)
                })

                let ancImg = document.querySelectorAll(`a[href="javascript:vU(${userId})"]`)
                if (ancImg && ancImg[0]) {
                    ancImg[0].after(rsearch)
                    let marginRight = 4

                    let dots = []
                    for (let i = 0; i < profileImages[userId].length; i++) {
                        let wd = 15;
                        if (profileImages[userId].length > 10) {
                            wd = 12;
                            marginRight = 2
                        }
                        if (profileImages[userId].length > 20) {
                            wd = Math.round(310 / profileImages[userId].length) - 2
                            marginRight = 1
                        }
                        if (profileImages[userId].length > 30) {
                            marginRight = 0
                        }
                        let dot = document.createElement('div')
                        dot.className = 'ku_ordpos'
                        dot.style.display = 'inline'
                        dot.style.width = `${wd}px`
                        dot.style.height = `${wd}px`
                        dot.style.borderRadius = `${wd}px`
                        dot.style.border = `1px solid #ccc`
                        dot.style.marginRight = `${marginRight}px`
                        dot.addEventListener('mouseover', () => showOverlayImage(userId, i))
                        dot.addEventListener('mouseout', hideOverlayImage)
                        dot.addEventListener('dblclick', () => {
                            let src = profileImages[userId][i]
                            window.open(`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(src)}`)
                            window.open(`https://www.google.com/searchbyimage?&image_url=${encodeURIComponent(src)}`)
                                // window.open(`https://www.bing.com/visualsearch/Microsoft/SimilarImages?&imgurl=${encodeURIComponent(src)}`)
                        })
                        dot.addEventListener('contextmenu', (e) => {
                            let src = profileImages[userId][i]
                            e.preventDefault()
                            window.open(`${src}`)
                            return false
                        })
                        dots.push(dot)
                    }
                    let rulerContainer = makeDiv(`text-align:center`, '', 'ku_ruler_container_' + userId)
                    let ruler = makeDiv(`padding-top:17px;height: 7px;display: inline-flex`, '', 'ku_ruler')
                    ruler.title = "\nDouble click to reverse image search\nRight click to open in a new window\n"
                    ruler.id = "ku_ruler_" + userId
                    dots.forEach(dot => ruler.append(dot))
                    rulerContainer.appendChild(ruler)
                    ancImg[0].after(rulerContainer)
                }

                let profileDetails = document.createElement('div')
                profileDetails.className = "ku_details"
                let telFull = getCanonicalPhone(profileHtml)
                let historicPhone = ""

                let divTemp = document.createElement('div')
                divTemp.innerHTML = profileHtml
                let phoneDisplayed = Array.from(divTemp.querySelectorAll("b")).filter(x => x.innerText == "call me").length !== 0
                if (!telFull) {
                    let telHist = getLastHistoricPhone(userId)
                    if (telHist) {
                        telFull = telHist[0]
                        historicPhone = `<div class='ku_cached_phone' title="Saved: ${telHist[1]}">${APP_NAME} cached</div>`
                    }
                }
                if (telFull) {
                    let telShort = getShortPhone(telFull)
                    let telSearch = googlePhoneQueryExpansion(telFull)
                    let phoneShown = phoneDisplayed ? '<span class="ku_phone_shown" title="SW is displaying phone today">🟢</span>' : '<span class="ku_phone_shown" title="SW not displaying phone today">🔴</span>'
                    let qrLink = `http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(telFull)}&size=150x150&color=4C006F`
                    profileDetails.append(makeDiv(
                        phoneDisplayed ? '' : 'opacity: .5;background-color: gray;',
                        `<div class='ku_telephone_number'>
                        <span class='ku_qr_code' 
                        onclick="window.open('${qrLink}','ku_qr_code', 'height=200px,width=200px')">☎️</span>                        
                        <span class='${phoneDisplayed?'':'ku_tel_not_shown'}' title='${phoneDisplayed?'':'SW not displaying phone today'}'>${telShort}</span>
                        ${phoneShown}
                        <a href="https://www.google.co.uk/search?q=${encodeURIComponent(telSearch)}" target="_blank">Google It</a>
                        <a href="https://wa.me/${telFull}" target="_blank">Whatsapp</a>                        
                        </div>${historicPhone}`, 'ku_details_telephone'
                    ))
                }
                if (!phoneDisplayed) {
                    profileDetails.append(makeDiv(`visibility:hidden`,
                        `<div class='nophone'></div>`
                    ))
                }
                // profileDetails.append(makeDiv('', `<a style='color:black' href='https://my.adultwork.com/${userId}/' target='_blank'>my.aw site</a>`))
                if (profileHtml && profileHtml[0]) {
                    let hourly = divProfileHTML.querySelector('#tdRI1')
                    if (hourly) {
                        let comparison = `/hr <span title="Price history not available.\nCurrent price saved, for as long as you don't clear your browser cache">⚪</span>`
                        let minPrice = 1e99
                        let maxPrice = 0
                        let priceHistory = getPriceHistory(userId, 'hourly')
                        let priceTitle = ["Was:"]
                        priceHistory.forEach(row => {
                            priceTitle.push('£' + row[1] + ' ' + timeAgo(row[0]))
                        })
                        priceHistory.push([new Date() / 1, hourly.innerText])
                        priceHistory.forEach(x => {
                            minPrice = Math.min(x[1], minPrice)
                            maxPrice = Math.max(x[1], maxPrice)
                        })

                        if (minPrice != 1e99) {
                            if (hourly.innerText > minPrice) {
                                comparison = `/hr <span title="${priceTitle.join("\n")}" class="ku_price_change_search" style='color:red'>⬆</span>`
                            } else if (hourly.innerText < maxPrice) {
                                comparison = `/hr <span title="${priceTitle.join("\n")}" class="ku_price_change_search" style='color:green'>⬇</span>`
                            } else {
                                comparison = "/hr ✓"
                            }
                        }

                        hourly = hourly.innerText + comparison
                    } else {
                        hourly = '?'
                    }
                    // hourly = hourly ? hourly.innerText : '?'

                    let halfHourly = divProfileHTML.querySelector('#tdRI0\\.5')
                    halfHourly = halfHourly ? halfHourly.innerText : '?'

                    let price = `£${halfHourly}/30m £${hourly}`
                    if (hourly == '?' || halfHourly == '?') {
                        let hourlyOutcall = divProfileHTML.querySelector('#tdRO1')
                        if (hourlyOutcall && hourlyOutcall.innerText) {
                            price = `Outcall: £${hourlyOutcall.innerText}/hr`
                        }
                    }
                    let services = [];
                    let parsedProfile = parseProfileData(profileHtml)

                    parsedProfile.services.forEach(acronym => {
                        let pushHtml = `<span class='ku_tooltip'>${ACRONYM_TO_SERVICE_REGEX[acronym][1]}<span class='ku_tooltiptext'>${acronym}</span></span>`
                        if (parsedProfile.misc[acronym]) {
                            pushHtml = `<span class='ku_tooltip'>${ACRONYM_TO_SERVICE_REGEX[acronym][1]}<span class='ku_tooltiptext '>${acronym}: <span class='ku_tooltiptext_small_font'>${parsedProfile.misc[acronym]}</span></span></span>`
                        }
                        services.push(
                            pushHtml
                        );
                    })
                    profileDetails.append(makeDiv('',
                        price + '<div class="ku_details_likes">' + services.join(' ') + '</div>', 'ku_details_price_n_likes'));
                }


                let nationality;
                divProfileHTML.querySelectorAll('td.Label').forEach(ele => {
                    if (ele.innerText.match(/Nationality/)) {
                        nationality = ele.parentElement.querySelector('td:nth-child(2)').innerText
                    }
                })

                let divNationality = document.createElement('div');
                divNationality.className = 'ku_details_nationality'
                if (nationality) {
                    divNationality.style.backgroundImage = `url('${flagCdn(nationality)}')`
                        // divNationality.style.backgroundImage = `url('${flagCdn(nationality)}')`
                    divNationality.innerHTML = nationality;
                } else {
                    divNationality.style = 'font-weight:bold;color:red;padding-left:5px'
                    divNationality.innerHTML = 'No Nationality Found';
                }

                profileDetails.append(divNationality);

                let memberSince = profileHtml.match(/Member Since:.+/s);
                let memberSinceAgo = ''
                if (memberSince && memberSince[0]) {
                    memberSince = memberSince[0].split("\n")
                    if (memberSince[1]) {
                        memberSince = memberSince[1].match(/>(.+)</)[1]
                        let msDate = new Date(memberSince.split('/').reverse().join(' '))
                        memberSinceAgo = `, joined ${timeAgo(msDate)}`
                    }
                }

                let lastLogin = profileHtml.match(/Last Login:.+/s);
                if (lastLogin && lastLogin[0]) {
                    lastLogin = lastLogin[0].split("\n")
                    if (lastLogin[1]) {
                        lastLogin = lastLogin[1].match(/>(.+)</)[1]
                        lastLogin = lastLogin.toLowerCase()
                        let dateRegex = new RegExp('[0-9]{2}/[0-9]{2}/[0-9]{4}')
                        if (dateRegex.test(lastLogin)) {
                            let loginDate = new Date(lastLogin.split('/').reverse().join(' '))
                            lastLogin = timeAgo(loginDate)
                            if ((new Date() - loginDate) / 60 / 60 / 24 / 1000 > 4) {
                                let style = 'color:red;'
                                if ((new Date() - loginDate) / 60 / 60 / 24 / 1000 > 7)
                                    style += 'font-weight:bold;'
                                lastLogin = `<span style='${style}'>${lastLogin}</span>`

                            }
                        }
                        profileDetails.append(makeDiv(``,
                            `Online ${lastLogin}${memberSinceAgo}`, 'ku_details_seen_online'));

                    }
                }

                let ukpReviewDetails = document.createElement('div')
                ukpReviewDetails.classList.add("ku_review_details")
                ukpReviewDetails.classList.add('ku_review_details_to_fetch')
                ukpReviewDetails.id = `ku_ukp_review_summary_${userId}`
                ukpReviewDetails.innerHTML = `<a href='https://www.ukpunting.com/index.php?action=adultwork;id=${userId}' target='_blank'>UKP Reviews</a>`
                profileDetails.append(ukpReviewDetails)

                anchorTag.after(profileDetails)

                updateUKPReviewCountsIfVisible()
            }

            anchorTag.href = location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + userId;
            anchorTag.setAttribute('href', "https://www.adultwork.com/ViewProfile.asp?UserID=" + userId)
            anchorTag.target = "_blank";
            anchorTag.onclick = function() {
                window.open(location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + userId);
                return false;
            };
        }

    });
    document.querySelectorAll('img.Border').forEach(function(x) {
        x.src = String(x.src).replace('/t/', '/i/')
    })

    function hideNoPhone() {
        window.localStorage.hideNoPhone = String(document.getElementById('ku_check_phone') && document.getElementById('ku_check_phone').checked)
        let show = JSON.parse(window.localStorage.hideNoPhone) ? 'none' : '';
        window.document.querySelectorAll('.nophone').forEach(ele => {
            if (show === 'none') {
                if (!ele.parentElement.parentElement.querySelector('.ku_hide_phone_transition')) {
                    if (ele.getAttribute('hidden') !== "true") {
                        let divAnim = document.createElement('div')
                        divAnim.className = "ku_hide_phone_transition"
                        divAnim.innerHTML = "No Phone. Hiding..."
                        ele.setAttribute('hidden', false)
                        ele.parentElement.parentElement.prepend(divAnim)
                        setTimeout(() => {
                            let divAnim2 = ele.parentElement.parentElement.querySelector('.ku_hide_phone_transition')
                            if (divAnim2)
                                divAnim2.parentNode.removeChild(divAnim2)
                            ele.setAttribute('hidden', true)
                            showBlock(show, ele)
                            updateUKPReviewCountsIfVisible()
                        }, 90)
                    }
                }
                document.querySelector('#ku_phone_hidden_count').innerHTML =
                    ` (${document.querySelectorAll('.nophone').length} hidden)`
                document.querySelector('#ku_top_bar').style.position = "sticky"

            } else {
                ele.setAttribute('hidden', false)
                showBlock(show, ele)
                document.querySelector('#ku_phone_hidden_count').innerHTML = ''
                document.querySelector('#ku_top_bar').style.position = ""
            }
        })

        function showBlock(display, ele) {
            let tdOne = ele.parentElement
                .parentElement
                .parentElement
                .parentElement
                .parentElement
                .parentElement
                .parentElement
                .parentElement;
            tdOne.style.display = display;
            tdOne.nextElementSibling.nextElementSibling.style.display = display;
            tdOne.nextElementSibling.style.display = display;
        }
    }

    // phone number info only becomes available after async calls
    for (let i = 1; i < 150; i++) {
        setTimeout(hideNoPhone, i * 400);
    }
    document.getElementById('ku_hide').addEventListener('click', hideNoPhone)


    //on scroll, load UKP review data
    window.addEventListener('scroll', updateUKPReviewCountsIfVisible);
    window.addEventListener('resize', updateUKPReviewCountsIfVisible);

    function updateUKPReviewCountsIfVisible() {
        document.querySelectorAll('.ku_review_details_to_fetch').forEach(ele => {
            if (isVisibleInPageScroll(ele)) {
                let uid = ele.id.replace('ku_ukp_review_summary_', '')
                ele.innerHTML = 'Loading...'
                getUKPsummary(uid, ele, 'scrape')
                    // getUKPsummary(uid, ele, 'api')
                ele.classList.remove('ku_review_details_to_fetch')
            }
        })
    }

    function isVisibleInPageScroll(ele) {
        let offset = cumulativeOffset(ele)
        return (offset.top > window.scrollY) &&
            (offset.top < window.scrollY + window.innerHeight)

    }

}