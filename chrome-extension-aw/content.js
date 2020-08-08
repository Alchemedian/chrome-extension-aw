function isSearchPage() {
    return !!location.href.match(/\/Search.asp/)
}

function isProfilePage() {
    return /ViewProfile.asp/.test(location.href)
}

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
        let ukp = makeDiv('width:140px', '');
        let ukpButtonReviewSearch = document.createElement('button');
        ukpButtonReviewSearch.innerHTML = "UKP Reviews"
        ukpButtonReviewSearch.style.padding = "1px"
        ukpButtonReviewSearch.style.cursor = "pointer"
        ukpButtonReviewSearch.addEventListener('click', () => {
            event.preventDefault();
            window.open("https://www.ukpunting.com/index.php?action=adultwork;id=" + uid);
        })
        ukp.appendChild(ukpButtonReviewSearch)

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
        anchorTag.after(dhid)
        let ukpButton = document.createElement('button');
        ukpButton.style.padding = "1px"
        ukpButton.innerHTML = "UKP"
        ukpButton.style.cursor = "pointer"
        ukpButton.addEventListener('click', () => {
            event.preventDefault();
            document.getElementById(`ku_ukp_form_${uid}`).submit()
        })

        ukp.appendChild(ukpButton)
        anchorTag.after(ukp)

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
        var child = document.createElement("div");
        let loc = location.href;
        if (loc.match(/UserID=([0-9]+)/) && loc.match(/UserID=([0-9]+)/)[1]) {
            loc = location.protocol + `//www.adultwork.com/UserID=` + loc.match(/UserID=([0-9]+)/)[1];
        } else if (loc.length > 80) {
            loc = loc.split('?')[0] + "?..."
        }
        child.innerHTML = loc + "  &nbsp;&nbsp;" + String(new Date()).split(' ').slice(0, 4).join(' ');
        child.id = "ku_top_bar"
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
}

(function () {
    if (!isProfilePage()) {
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
    let images = []

    function imgify() {
        var html = "";
        var c = 0;

        function wrapImg(src) {
            let fileName = src.split(/(\\|\/)/g).pop()
            return `<div class='gallerywrapper' style='display:inline-flex;min-width: 375px;'>
                <div>
                    <img style='max-width:${(window.innerWidth - 200)}px;cursor:pointer' src='${src}' onclick="window.open('${src}')" data-file-name="${fileName}"/>
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
                    images.push(thumbToFull(x.src))
                }
            }
        })
        c = 0;
        document.querySelectorAll(".ImageBorder").forEach(function (x) {
            if (c++ < 55) {
                html += wrapImg(thumbToFull(x.src));
                images.push(thumbToFull(x.src))
            }
        })

        let imgIcon = new Image()
        imgIcon.src = "data:image/png;base64,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"

        function downloadImage(src, nameSuffix = '') {
            let image = new Image();
            image.crossOrigin = "anonymous";
            if (/^\/\//.test(src))
                src = location.protocol + src
            if (/^\//.test(src))
                src = location.protocol + '//www.adultwork.com' + src

            let uid = location.href.match(/UserID=([0-9]+)/)[1]
            let fileName = `aw_civilizer_${uid}_${nameSuffix}_` + image.src.split(/(\\|\/)/g).pop();
            // CORs proxy running off cloudflare -
            image.src = "https://cors-proxy.bwkake.workers.dev/?apiurl=" + encodeURIComponent(src);


            image.onload = function () {
                let canvas = document.createElement('canvas');
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;
                let context = canvas.getContext('2d')
                context.drawImage(this, 0, 0)
                context.drawImage(imgIcon, canvas.width - imgIcon.width, canvas.height - imgIcon.height)
                let fontSize = Math.round(Math.sqrt(canvas.width * canvas.height) / 30)
                context.font = fontSize
                    + "px Georgia";
                context.shadowColor = "rgba(255,255,255,1)";
                context.shadowBlur = fontSize;
                context.fillText("😋 " + document.querySelector('.PageHeading').innerText,
                    0, canvas.height - fontSize);

                let blob;
                if (image.src.indexOf(".jpg") > -1) {
                    blob = canvas.toDataURL("image/jpeg");
                } else if (image.src.indexOf(".png") > -1) {
                    blob = canvas.toDataURL("image/png");
                } else if (image.src.indexOf(".gif") > -1) {
                    blob = canvas.toDataURL("image/gif");
                } else {
                    blob = canvas.toDataURL("image/png");
                }
                let dd = document.createElement('div')
                dd.innerHTML = "<a download='" + fileName + "' href='" + blob + "'></a>";
                dd.querySelector('a').click()
            };
        }

        let child = document.createElement("div");
        child.id = "ku_gallery_images"
        child.innerHTML = html;

        let downloadButton = document.createElement('button')
        downloadButton.style.padding = "20px"
        downloadButton.style.fontSize = "20px"
        downloadButton.style.cursor = "pointer"
        downloadButton.style.position = "sticky";
        downloadButton.style.top = "-20px";
        downloadButton.style.zIndex = "1000";
        downloadButton.innerHTML = "Download All Images"
        downloadButton.id = "ku_download_all"
        downloadButton.addEventListener('click', () => {
            document.querySelector('#ku_download_all').setAttribute('disabled', true)
            setTimeout(() => document.querySelector('#ku_download_all').removeAttribute('disabled'), 5000)
            let uniqImages = {}
            images.forEach(src => {
                let fileName = src.split(/(\\|\/)/g).pop()
                let maxImg = { width: 0 }
                document.querySelectorAll(`img[data-file-name="${fileName}"]`).forEach(img => {
                    if (maxImg.width < img.width)
                        maxImg = img
                })
                uniqImages[maxImg.src] = { width: maxImg.width, height: maxImg.height }
            })
            Object.keys(uniqImages)
                .sort((a, b) => {
                    a = uniqImages[a].height / uniqImages[a].width
                    b = uniqImages[b].height / uniqImages[b].width
                    if (a > b)
                        return 1
                    if (a < b)
                        return -1
                    return 0
                })
                .forEach((src, i) => downloadImage(src, `000${i}`.substr(-3)))
        })
        document.querySelector("div.stripMenuLevelFooterContainer").before(downloadButton)
        document.querySelector("div.stripMenuLevelFooterContainer").before(child);


        function fullSizedGalleryImages() {
            document.querySelectorAll('td[background="images/border.gif"] a').forEach(anc => {
                let params = anc.href.replace(/.+\(+/, '').replace(/[)' ]/g, '').split(',').map(unescape)
                fetch(`https://www.adultwork.com/dlgViewGImage.asp?Image=${params[0]}&SN=${params[2]}`).then(y => y.text()).then(text => {
                    let needle = "else { document.images['TheImage'].src = '"
                    let start = text.indexOf(needle)
                    let src = text.substr(start + needle.length)
                    src = src.substr(0, src.indexOf("'"))
                    let div = document.createElement('div')
                    div.className = 'ku_gallery_large'
                    div.style.border = '1px solid #ccc'
                    div.style.display = 'inline-flex'
                    div.innerHTML = wrapImg(src)
                    images.push(src)
                    document.querySelector('#ku_gallery_images').append(div)
                })
            })
        }
        fullSizedGalleryImages()

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

                    function waitForDownloadAll() {
                        if (document.querySelector("#ku_download_all")) {
                            document.querySelector("#ku_download_all").after(child);
                        } else {
                            setTimeout(waitForDownloadAll, 100)
                        }
                    }
                    waitForDownloadAll()

                    images.push(src)
                }
            }
        };
        xhr.send();

    })()

})();
