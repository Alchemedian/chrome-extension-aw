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
        div.style.background = "black"
        div.style.color = "white"
        div.style.padding = "2px"
        div.style.cursor = "pointer"
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
    //disable picture hover tooltip
    document.getElementById('ToolTip').style.display = "none";

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
        let eleOverlay = document.getElementsByClassName('pictureOverlay')[0]
        if (event.pageX < window.innerWidth / 2) {
            eleOverlay.style.left = (window.innerWidth / 2) + "px"
        } else {
            eleOverlay.style.left = 0
        }
        eleOverlay.style.top = window.scrollY + "px"
        eleOverlay.style.display = "block"
        if (!profileImages[uid])
            return;

        let src = `${profileImages[uid][ord]}`

        eleOverlay.style.backgroundSize = "contain"
        eleOverlay.style.backgroundRepeat = "no-repeat"
        eleOverlay.style.backgroundPosition = "center center"
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
        document.getElementsByClassName('pictureOverlay')[0].style.display = "none";
        document.querySelectorAll(`.ku_ordpos`).forEach(ele => ele.style.backgroundColor = '')
    }

    function biggerHoverImages() {
        document.body.appendChild(
            makeDiv(`display:none;
            position:absolute;
            top:0;
            right:0;
            z-index:1000;
            border:1px solid violet;
            padding:2px;
            background-color:#222`,
                '', 'pictureOverlay'))

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

    document.querySelectorAll("a.label[href='#']").forEach(function (anchorTag) {
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
                let tel = profileHtml.match(/"telephone".+/g)
                if (tel && tel[0]) {
                    let tels = tel[0].match(/"telephone".+/g)[0].match(/[0-9+]+/g)
                    if (tels.length == 2 && tels[1].substr(-10) == tels[0].substr(-10)) {
                        tels.pop()
                    }
                    tel = tels.join(', ')
                    tel = tel.replace(/\+?44/g, '0')
                    let telSearch = tel.split(",")[0]
                    telSearch = telSearch + ' OR ' + telSearch.replace(/^0/, '+44')
                    profileDetails.append(makeDiv(`background-color: green;color: white;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                        `<div class='telexists'>☎️ ${tel}
                        <a style="text-align:center;color:white;display:block;padding-bottom:4px;" href="https://www.google.co.uk/search?q=${encodeURIComponent(telSearch)}" target="_blank">Google It</a>
                        </div>`
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
                    /Bareback/.test(dPref) && services.push("bb");
                    profileDetails.append(makeDiv(`cursor:default;border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px;font-size:9px`,
                        price + '<div style="font-size:25px">' + services.join(' ') + '</div>'));
                }

                let nation = profileHtml.match(/Nationality:.+/s);
                if (nation && nation[0]) {
                    nation = nation[0].split("\n")
                    if (nation[1]) {
                        nation = nation[1].match(/>(.+)</) && nation[1].match(/>(.+)</)[1]
                        nation = nation ? nation : '???'
                        profileDetails.append(makeDiv(`border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                            nation));
                    }
                }


                let lastLogin = profileHtml.match(/Last Login:.+/s);
                if (lastLogin && lastLogin[0]) {
                    lastLogin = lastLogin[0].split("\n")
                    if (lastLogin[1]) {
                        lastLogin = lastLogin[1].match(/>(.+)</)[1]
                        profileDetails.append(makeDiv(`border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                            'Online: ' + lastLogin, 'c_online'));

                    }
                }
                anchorTag.after(profileDetails)
            })

        anchorTag.href = location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + uid;
        anchorTag.setAttribute('href', "https://www.adultwork.com/ViewProfile.asp?UserID=" + uid)
        anchorTag.target = "_blank";
        anchorTag.onclick = function () {
            window.open(location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + uid);
            return false;
        };

        anchorTag.after(ukpSearchButtons(uid))

    })
    document.querySelectorAll('img.Border').forEach(function (x) {
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
    for (let i = 1; i < 30; i++) {
        setTimeout(hideNoPhone, i * 200);
    }
    document.getElementById('ku_hide').addEventListener('click', hideNoPhone)
}