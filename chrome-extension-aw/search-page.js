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
            1 + Math.random() * 20 :
            200 + Math.floor(Math.random() * 400)
        setTimeout(() => embelishProfileBlurb(uid), fetchDelay)

        function embelishProfileBlurb(uid) {
            let spacerDiv = document.createElement('div')
            spacerDiv.className = 'ku_spacer_placeholder'
            anchorTag.after(spacerDiv)
            let loadingDiv = document.createElement('div')
            loadingDiv.className = "ku_loader_profile_anim"
            loadingDiv.innerHTML = `Loading...`
            anchorTag.after(loadingDiv)


            fetch(location.protocol + '//www.adultwork.com/ViewProfile.asp?UserID=' + uid)
                .then(y => y.text())
                .then(parseProfile)

            function parseProfile(profileHtml) {
                spacerDiv.parentNode.removeChild(spacerDiv)
                loadingDiv.parentNode.removeChild(loadingDiv)
                let divProfileHTML = document.createElement('div')
                divProfileHTML.innerHTML = profileHtml
                profileImages[uid] = parseProfileImages(profileHtml)
                let aImg = document.querySelectorAll(`a[href="javascript:vU(${uid})"`)
                if (aImg && aImg[0])
                    aImg[0].style.cursor = "ew-resize"

                //add reverse image search
                let bYandex = document.createElement('button');
                bYandex.innerHTML = "Yandex"
                bYandex.addEventListener('click', () => {
                    window.open(`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(profileImages[uid][0])}`)
                    event.preventDefault()
                    return false;
                })
                let bGoogle = document.createElement('button');
                bGoogle.innerHTML = "Google"
                bGoogle.addEventListener('click', () => {
                    window.open(`https://www.google.com/searchbyimage?&image_url=${encodeURIComponent(profileImages[uid][0])}`)
                    event.preventDefault()
                    return false;
                })

                let rsearch = makeDiv('position:relative;bottom:52px', '')
                rsearch.appendChild(bYandex)
                rsearch.appendChild(bGoogle)
                let ancImg = document.querySelectorAll(`a[href="javascript:vU(${uid})"]`)
                if (ancImg && ancImg[0]) {
                    ancImg[0].after(rsearch)
                    let marginRight = 4

                    let dots = []
                    for (let i = 0; i < profileImages[uid].length; i++) {
                        let wd = 15;
                        if (profileImages[uid].length > 10) {
                            wd = 12;
                            marginRight = 2
                        }
                        if (profileImages[uid].length > 20) {
                            wd = Math.round(310 / profileImages[uid].length) - 2
                            marginRight = 1
                        }
                        if (profileImages[uid].length > 30) {
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
                        dot.addEventListener('mouseover', () => showOverlayImage(uid, i))
                        dot.addEventListener('mouseout', hideOverlayImage)
                        dot.addEventListener('dblclick', () => {
                            let src = profileImages[uid][i]
                            window.open(`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(src)}`)
                            window.open(`https://www.google.com/searchbyimage?&image_url=${encodeURIComponent(src)}`)
                        })
                        dot.addEventListener('contextmenu', (e) => {
                            let src = profileImages[uid][i]
                            e.preventDefault()
                            window.open(`${src}`)
                            return false
                        })
                        dots.push(dot)
                    }
                    let rulerContainer = makeDiv(`text-align:center`, '', 'ku_ruler_container_' + uid)
                    let ruler = makeDiv(`padding-top:17px;height: 7px;display: inline-flex`, '', 'ku_ruler')
                    ruler.title = "\nDouble click to reverse image search\nRight click to open in a new window\n"
                    ruler.id = "ku_ruler_" + uid
                    dots.forEach(dot => ruler.append(dot))
                    rulerContainer.appendChild(ruler)
                    ancImg[0].after(rulerContainer)
                }

                let profileDetails = document.createElement('div')
                profileDetails.className = "ku_details"
                let tel = profileHtml.match(/"telephone".+/g)
                if (tel && tel[0]) {
                    let tels = tel[0].match(/"telephone".+/g)[0].match(/[0-9+]+/g)
                    if (tels.length == 2 && tels[1].substr(-10) == tels[0].substr(-10)) {
                        tels.pop()
                    }
                    tel = tels.join(', ')
                    tel = tel.replace(/\+?44/g, '0')
                    let telSearch = tel.split(",")[0]
                    let telFull = telSearch.replace(/^0/, '+44')
                    telSearch = `${telSearch}  OR ${telFull} OR "${telSearch.substr(0,5) +' '+telSearch.substr(5)}"`
                    let qrLink = `http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(telFull)}&size=150x150&color=4C006F`
                    profileDetails.append(makeDiv('',
                        `<div class='ku_telephone_number'><span class='ku_qr_code' 
                        onclick="window.open('${qrLink}','ku_qr_code', 'height=200px,width=200px')">☎️</span> ${tel}
                        <a href="https://www.google.co.uk/search?q=${encodeURIComponent(telSearch)}" target="_blank">Google It</a>
                        <a href="https://wa.me/${telFull}" target="_blank">Whatsapp</a>
                        </div>`, 'ku_details_telephone'
                    ))
                } else {
                    profileDetails.append(makeDiv(`visibility:hidden`,
                        `<div class='nophone'></div>`
                    ))
                }
                if (profileHtml && profileHtml[0]) {
                    let hourly = divProfileHTML.querySelector('#tdRI1')
                    hourly = hourly ? hourly.innerText : '?'

                    let halfHourly = divProfileHTML.querySelector('#tdRI0\\.5')
                    halfHourly = halfHourly ? halfHourly.innerText : '?'

                    let price = `£${halfHourly}/30m £${hourly}/hr`
                    if (hourly == '?' || halfHourly == '?') {
                        let hourly = divProfileHTML.querySelector('#tdRO1')
                        if (hourly && hourly.innerText) {
                            price = `Outcall: £${hourly.innerText}/hr`
                        }
                    }
                    let services = [];

                    let dPref = divProfileHTML.querySelectorAll('#dPref')[0].innerText;
                    /Oral without Protection\n/.test(dPref) && services.push("<span title='OWO'>😋</span>");
                    /CIM/.test(dPref) && services.push("<span title='CIM'>👄</span>");
                    /Swallow/.test(dPref) && services.push("<span title='Swallow'>💊</span>");
                    /"A" Levels\n/.test(dPref) && services.push("<span title='Anal'>🍩</span>");
                    /French Kissing\n/.test(dPref) && services.push("<span title='French Kissing'>😘</span>");
                    /Foot Worship/.test(dPref) && services.push("<span title='Foot Worship'>👣</span>");
                    /Rimming \(giving\)/.test(dPref) && services.push("<span title='Rimming'>👅</span>");
                    /Massage/.test(dPref) && services.push("<span title='Massage'>💆‍♂️</span>");
                    /Hand Relief/.test(dPref) && services.push("<span title='Hand Relief'>✊</span>");
                    /Strap On/.test(dPref) && services.push("<span title='Strap On'>👺</span>");
                    /Watersports \(Giving\)/.test(dPref) && services.push("<span title='Water Sports (Giving)'>🏄</span>");
                    /Bareback/.test(dPref) && services.push("bb");
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
                    divNationality.innerHTML = 'No Nationality Found!';
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
                ukpReviewDetails.id = `ku_ukp_review_summary_${uid}`
                ukpReviewDetails.innerHTML = `<a href='https://www.ukpunting.com/index.php?action=adultwork;id=${uid}' target='_blank'>UKP Reviews</a>`
                profileDetails.append(ukpReviewDetails)

                anchorTag.after(profileDetails)

                updateUKPReviewCountsIfVisible()
            }

            anchorTag.href = location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + uid;
            anchorTag.setAttribute('href', "https://www.adultwork.com/ViewProfile.asp?UserID=" + uid)
            anchorTag.target = "_blank";
            anchorTag.onclick = function() {
                window.open(location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + uid);
                return false;
            };

            anchorTag.after(ukpSearchButtons(uid))
        }

    })
    document.querySelectorAll('img.Border').forEach(function(x) {
        x.src = String(x.src).replace('/t/', '/i/')
    })

    function hideNoPhone() {
        window.localStorage.hideNoPhone = String(document.getElementById('ku_check_phone') && document.getElementById('ku_check_phone').checked)
        let show = JSON.parse(window.localStorage.hideNoPhone) ? 'none' : '';
        window.document.querySelectorAll('.nophone').forEach(ele => {
            let tdOne = ele.parentElement
                .parentElement
                .parentElement
                .parentElement
                .parentElement
                .parentElement
                .parentElement
                .parentElement;
            tdOne.style.display = show;
            tdOne.nextElementSibling.nextElementSibling.style.display = show;
            tdOne.nextElementSibling.style.display = show;
        })
    }

    // phone number info only becomes available after async calls
    for (let i = 1; i < 150; i++) {
        setTimeout(hideNoPhone, i * 400);
    }
    document.getElementById('ku_hide').addEventListener('click', hideNoPhone)


    //on scroll, load UKP review data
    window.addEventListener('scroll', updateUKPReviewCountsIfVisible)
    window.addEventListener('resize', updateUKPReviewCountsIfVisible)

    function updateUKPReviewCountsIfVisible() {
        document.querySelectorAll('.ku_review_details_to_fetch').forEach(ele => {
            if (isVisibleInPageScroll(ele)) {
                let uid = ele.id.replace('ku_ukp_review_summary_', '')
                ele.innerHTML = 'Loading...'
                getUKPsummary(uid, ele, 'scrape')
                ele.classList.remove('ku_review_details_to_fetch')
            }
        })
    }

    function isVisibleInPageScroll(ele) {
        let offset = cumulativeOffset(ele)
        return (offset.top > window.scrollY) &&
            (offset.top < window.scrollY + window.innerHeight)

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
    }

}