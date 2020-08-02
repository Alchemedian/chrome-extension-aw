function isSearchPage() {
    return !!location.href.match(/\/Search.asp/)
}

if (isSearchPage()) {
    //disable picture click
    document.querySelectorAll('.Padded a[onmousemove="overhere(event)"]').forEach(anc => {
        anc.style.cursor = "ew-resize"
        anc.addEventListener('click', () => event.preventDefault())
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

    function makeDiv(style, html, className) {
        let div = document.createElement('div');
        if (className) {
            div.className = className
        }
        div.style = style;
        div.innerHTML = html;
        return div;
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

        let src = `${profileImages[uid][0][ord]}`

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
            let om = ele.getAttribute('onmouseover')
            if (!ele.firstElementChild)
                return

            ele.firstElementChild.addEventListener('mousemove', () => {
                let ord = Math.floor(event.offsetX / ele.firstElementChild.width * (profileImages[uid][0].length))
                showOverlayImage(uid, ord)
            })
            ele.addEventListener('mouseout', hideOverlayImage)
        })
    }
    biggerHoverImages()

    document.querySelectorAll("a.label[href='#']").forEach(function (anchorTag) {
        var st = String(anchorTag.getAttribute('onclick')).match(/sU\(([0-9]+)/);
        if (st && st[1]) {
            fetch(location.protocol + '//www.adultwork.com/ViewProfile.asp?UserID=' + st[1]).then(y => y.text()).then(profileHtml => {
                profileImages[st[1]] = [parseProfileImages(profileHtml), 0]

                //add reverse image search
                let bYandex = document.createElement('button');
                bYandex.innerHTML = "Yandex"
                bYandex.addEventListener('click', () => {
                    window.open(`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(profileImages[st[1]][0][0])}`)
                    event.preventDefault()
                    return false;
                })
                let bGoogle = document.createElement('button');
                bGoogle.innerHTML = "Google"
                bGoogle.addEventListener('click', () => {
                    window.open(`https://www.google.com/searchbyimage?&image_url=${encodeURIComponent(profileImages[st[1]][0][0])}`)
                    event.preventDefault()
                    return false;
                })

                let rsearch = makeDiv('position:relative;bottom:52px', '')
                rsearch.appendChild(bYandex)
                rsearch.appendChild(bGoogle)
                let ancImg = document.querySelectorAll(`a[href="javascript:vU(${st[1]})"]`)
                if (ancImg && ancImg[0]) {
                    ancImg[0].after(rsearch)
                    let marginRight = 4

                    let dots = []
                    for (let i = 0; i < profileImages[st[1]][0].length; i++) {
                        let wd = 15;
                        if (profileImages[st[1]][0].length > 10) {
                            wd = 12;
                            marginRight = 2
                        }
                        if (profileImages[st[1]][0].length > 20) {
                            wd = Math.round(310 / profileImages[st[1]][0].length) - 2
                            marginRight = 1
                        }
                        if (profileImages[st[1]][0].length > 30) {
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
                        dot.addEventListener('mouseover', () => showOverlayImage(st[1], i))
                        dot.addEventListener('mouseout', hideOverlayImage)
                        dot.addEventListener('dblclick', () => {
                            let src = profileImages[st[1]][0][i]
                            window.open(`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(src)}`)
                            window.open(`https://www.google.com/searchbyimage?&image_url=${encodeURIComponent(src)}`)

                        })
                        dots.push(dot)
                    }
                    let rulerContainer = makeDiv(`text-align:center`, '', 'ku_ruler_container_' + st[1])
                    let ruler = makeDiv(`padding-top:17px;height: 7px;display: inline-flex`, '', 'ku_ruler')
                    ruler.id = "ku_ruler_" + st[1]
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
                let hour = profileHtml.match(/tdRI1[^<]+/)
                if (profileHtml && profileHtml[0]) {
                    let hourly = profileHtml.match(/tdRI1[^<]+/)
                    if (hourly) {
                        hourly = hourly[0].split('>')
                    }
                    hourly = hourly && hourly[1] ? hourly[1] : '???'
                    hourly = '£ ' + hourly + '/hr';
                    let services = [];
                    />Oral without Protection</.test(profileHtml) && services.push("<span title='OWO'>😋</span>");
                    />CIM</.test(profileHtml) && services.push("<span title='CIM'>👄</span>");
                    /&quot;A&quot; Levels/.test(profileHtml) && services.push("<span title='Anal'>🍩</span>");
                    />French Kissing</.test(profileHtml) && services.push("<span title='French Kissing'>😘</span>");
                    />Foot Worship</.test(profileHtml) && services.push("<span title='Foot Worship'>👣</span>");
                    />Rimming \(giving\)</.test(profileHtml) && services.push("<span title='Rimming'>👅</span>");
                    />Bareback</.test(profileHtml) && services.push("bb");
                    profileDetails.append(makeDiv(`cursor:default;border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                        hourly + '<div style="font-size:25px">' + services.join(' ') + '</div>'));
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

            anchorTag.href = location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + st[1];
            anchorTag.setAttribute('href', "https://www.adultwork.com/ViewProfile.asp?UserID=" + st[1])
            anchorTag.target = "_blank";
            anchorTag.onclick = function () {
                window.open(location.protocol + "//www.adultwork.com/ViewProfile.asp?UserID=" + st[1]);
                return false;
            };
            let ukp = makeDiv('width:140px', '');
            let ukpButtonReviewSearch = document.createElement('button');
            ukpButtonReviewSearch.innerHTML = "UKP Reviews"
            ukpButtonReviewSearch.style.padding = "1px"
            ukpButtonReviewSearch.addEventListener('click', () => {
                event.preventDefault();
                window.open("https://www.ukpunting.com/index.php?action=adultwork;id=" + st[1]);
            })
            ukp.appendChild(ukpButtonReviewSearch)

            let dhid = document.createElement('div')
            dhid.style.display = "none"
            dhid.innerHTML = `
            <form id="ku_ukp_form_${st[1]}" target="_blank" 
            action="https://www.ukpunting.com/index.php?action=searchposts2"
            method="post"
            >
            <input value="${st[1]}" name="query"/>
            </form>
            `
            anchorTag.after(dhid)
            let ukpButton = document.createElement('button');
            ukpButton.style.padding = "1px"
            ukpButton.innerHTML = "UKP"
            ukpButton.addEventListener('click', () => {
                event.preventDefault();
                document.getElementById(`ku_ukp_form_${st[1]}`).submit()
            })

            ukp.appendChild(ukpButton)
            anchorTag.after(ukp)
        }
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
}

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
    var child = document.createElement("div");
    let loc = location.href;
    if (loc.match(/UserID=([0-9]+)/) && loc.match(/UserID=([0-9]+)/)[1]) {
        loc = location.protocol + `//www.adultwork.com/UserID=` + loc.match(/UserID=([0-9]+)/)[1];
    } else if (loc.length > 80) {
        loc = loc.split('?')[0] + "?..."
    }
    child.innerHTML = loc + "  &nbsp;&nbsp;" + String(new Date()).split(' ').slice(0, 4).join(' ');
    child.style.border = "1px solid grey";
    child.style.backgroundColor = "grey";
    child.style.color = "white";
    parent.after(child);
    let hidePhoneButton = isSearchPage() ?
        `
        <span style="margin-left:20px;height:18px" id='ku_hide'>
        <input id="ku_check_phone" type="checkbox" ${JSON.parse(window.localStorage.hideNoPhone) ? 'checked' : ''}/>
        <label style="font-size:10px;vertical-align:top;padding-top:3px;display:inline-block" for="ku_check_phone">Only show results with a phone</label></span>
        ` : '';

    child.innerHTML += `${hidePhoneButton}
    <div style="float: right;background-color: orange;font-size: 7pt;padding: 2px">    
    KUCK Vision</div>`
    if (isSearchPage())
        document.getElementById('ku_hide').addEventListener('click', hideNoPhone)
})();

(function () {
    if (!/ViewProfile/.test(location.href)) {
        return;
    }
    try {
        document.getElementById("dPref").style.height = document.getElementById("dPref").children[0].offsetHeight + "px";
    } catch (e) { }

    function removeLongTextualCrap() {
        let maxLen = 2000;
        for (let i = 1; i < 24; i++) {
            let eleId = 'content' + i;
            let ele = document.getElementById(eleId);
            if (ele && ele.innerHTML.length > maxLen * 2) {
                let html = ele.innerHTML;
                let a = html.slice(0, maxLen)
                let b = html.slice(maxLen)
                if (b.indexOf('>') < b.indexOf('<')) {
                    a += b.slice(0, b.indexOf('>') + 1)
                }
                let randId = `restore_button_${i}`;
                a += `<div id='removed_content_${i}' style='background-color: black;color: white;margin: 20px;font-size: 20px;padding: 20px;border-radius: 5px;'>Removed very long pretentious textual crap. <button id='${randId}'>Show Full Text</button></div>`
                document.getElementById(eleId).innerHTML = a;
                document.getElementById(eleId).setAttribute('data-content-html', html);
                document.getElementById(randId).addEventListener('click', function () {
                    document.getElementById('content' + i).innerHTML = document.getElementById('content' + i).getAttribute('data-content-html');
                    return false;
                })
            }
        }
    }

    function imgify() {
        var html = "";
        var c = 0;

        function wrapImg(src) {
            return `<div class='gallerywrapper' style='display:inline-flex;min-width: 375px;'>
                <div>
                    <img style='max-width:${(window.innerWidth - 200)}px' src='${src}'/>
                        <div style="position: relative;top: -40px;height: 40px;right: -40px;">
                            <button style="margin:9px" onclick="window.open('https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(src)}')">Search On Yandex</button>
                            <button style="margin:9px" onclick="window.open('https://www.google.com/searchbyimage?&image_url=${encodeURIComponent(src)}')">Search On Google</button>
                        </div>
                </div>
            </div>`;
        }


        document.querySelectorAll("img.border").forEach(function (x) {
            if (x.parentElement && x.parentElement.href && /(sIWishlist|:sI|:vSI)/.test(x.parentElement.href)) {

            } else {
                if (c++ < 55) {
                    html += wrapImg(thumbToFull(x.src))

                }
            }
        })
        c = 0;
        document.querySelectorAll(".ImageBorder").forEach(function (x) {
            if (c++ < 55) {
                html += wrapImg(thumbToFull(x.src));
            }
        })
        var child = document.createElement("div");
        child.innerHTML = html;
        document.querySelector("div.stripMenuLevelFooterContainer").before(child);

    }
    setTimeout(() => {
        imgify(), removeLongTextualCrap()
    }, 300);

    function thumbToFull(img) {
        return img.replace('/t/', '/f/').replace('/thumbnails/', '/images/');
    }

    //verification pic
    (function () {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/dlgVerificationPhoto.asp?SelUserID=' + location.href.match(/UserID=([0-9]+)/)[1]);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var a = xhr.responseText.match(/src=".+UserVeriPhotos[^"]+/g);
                var b = false;
                if (a && a[0]) {
                    b = a[0].split('"');
                }
                if (b && b[1]) {
                    var src = b[1].replace('/i/', '/');
                    var html = "<img class='verif' style='max-width:" + (window.innerWidth - 200) + "px' src='" + src + "'/>";
                    var child = document.createElement("div");
                    child.innerHTML = html;
                    document.querySelector("div.stripMenuLevelFooterContainer").before(child);
                }
            }
        };
        xhr.send();

    })()

})();
