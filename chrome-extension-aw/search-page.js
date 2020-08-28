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

    //replace useless words
    document.querySelectorAll('center td[colspan="2"]').forEach(ele => {
        ele.innerText = ele.innerText
            .replace(/[^\d]+/g, '')
        if (ele.innerText === "") {
            ele.innerText = "?"
        }
        ele.classList.add('ku_stylised_age')
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

        document.querySelectorAll(`.ku_ordpos`).forEach(ele => ele.style.backgroundColor = '')
        document.querySelectorAll(`#ku_ruler_${uid} .ku_ordpos:nth-child(${ord + 1})`)
            .forEach(ele => ele.style.backgroundColor = 'darkslategray')
    }

    function hideOverlayImage() {
        document.getElementsByClassName('ku_picture_overlay')[0].style.display = "none";
        document.querySelectorAll(`.ku_ordpos`).forEach(ele => ele.style.backgroundColor = '')
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

        fetch(location.protocol + '//www.adultwork.com/ViewProfile.asp?UserID=' + uid)
            .then(y => y.text())
            .then(profileHtml => {
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
                        // rulerContainer.addEventListener('mouseout', hideOverlayImage)
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
                    telSearch = telSearch + ' OR ' + telFull
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
                    /"A" Levels\n/.test(dPref) && services.push("<span title='Anal'>🍩</span>");
                    /French Kissing\n/.test(dPref) && services.push("<span title='French Kissing'>😘</span>");
                    /Foot Worship/.test(dPref) && services.push("<span title='Foot Worship'>👣</span>");
                    /Rimming \(giving\)/.test(dPref) && services.push("<span title='Rimming'>👅</span>");
                    /Massage/.test(dPref) && services.push("<span title='Massage'>💆‍♂️</span>");
                    /Hand Relief/.test(dPref) && services.push("<span title='Hand Relief'>✊</span>");
                    /Watersports \(Giving\)/.test(dPref) && services.push("<span title='Water Sports (Giving)'>🏄</span>");
                    /Bareback/.test(dPref) && services.push("bb");
                    profileDetails.append(makeDiv('',
                        price + '<div class="ku_details_likes">' + services.join(' ') + '</div>', 'ku_details_price_n_likes'));
                }

                let nation = profileHtml.match(/Nationality:.+/s);
                let divNation = document.createElement('div');
                divNation.className = 'ku_details_nationality'
                if (nation && nation[0]) {
                    nation = nation[0].split("\n")
                    if (nation[1]) {
                        nation = nation[1].match(/>(.+)</) && nation[1].match(/>(.+)</)[1]
                        nation = nation ? nation : '???'
                        divNation.innerHTML = nation;
                    }
                } else {
                    divNation.style = 'font-weight:bold;color:red'
                    divNation.innerHTML = 'No Nationality Found!';
                }
                profileDetails.append(divNation);

                let memberSince = profileHtml.match(/Member Since:.+/s);
                let memberSinceAgo = ''
                if (memberSince && memberSince[0]) {
                    memberSince = memberSince[0].split("\n")
                    if (memberSince[1]) {
                        memberSince = memberSince[1].match(/>(.+)</)[1]
                        let msDate = new Date(memberSince.split('/').reverse().join(' '))
                        memberSinceAgo = `, <br>joined ${timeAgo(msDate)}`
                    }
                }

                let lastLogin = profileHtml.match(/Last Login:.+/s);
                if (lastLogin && lastLogin[0]) {
                    lastLogin = lastLogin[0].split("\n")
                    if (lastLogin[1]) {
                        lastLogin = lastLogin[1].match(/>(.+)</)[1]
                        lastLogin = lastLogin.toLowerCase()
                        profileDetails.append(makeDiv(``,
                            `Online ${lastLogin}${memberSinceAgo}`, 'ku_details_seen_online'));

                    }
                }

                let ukpReviewDetails = document.createElement('div')
                ukpReviewDetails.className = "ku_review_details"
                ukpReviewDetails.id = `ku_ukp_review_summary_${uid}`
                ukpReviewDetails.innerHTML = `<a href='https://www.ukpunting.com/index.php?action=adultwork;id=${uid}' target='_blank'>UKP Reviews</a>`
                profileDetails.append(ukpReviewDetails)
                getUKPsummary(uid, ukpReviewDetails)
                let ukpReviewDetailsRefresh = document.createElement('div')
                ukpReviewDetailsRefresh.className = "ku_get_live_review_counts"
                ukpReviewDetailsRefresh.innerHTML = "🔄 Get live UKP data"

                ukpReviewDetailsRefresh.addEventListener('click', function() {
                    ukpReviewDetails.innerHTML = 'Loading...'
                    getUKPsummary(uid, ukpReviewDetails, 'scrape')
                    this.style.display = "none"
                })
                ukpReviewDetails.after(ukpReviewDetailsRefresh)


                anchorTag.after(profileDetails)
            })

        anchorTag.href = location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + uid;
        anchorTag.setAttribute('href', "https://www.adultwork.com/ViewProfile.asp?UserID=" + uid)
        anchorTag.target = "_blank";
        anchorTag.onclick = function() {
            window.open(location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + uid);
            return false;
        };

        anchorTag.after(ukpSearchButtons(uid))

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
}