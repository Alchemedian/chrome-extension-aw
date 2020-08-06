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
            return `<div class='gallerywrapper' style='display:inline-flex;min-width: 375px;'>
                <div>
                    <img style='max-width:${(window.innerWidth - 200)}px;cursor:pointer' src='${src}' onclick="window.open('${src}')"/>
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

        function downloadImage(src) {
            let image = new Image();
            image.crossOrigin = "anonymous";
            if (/^\/\//.test(src))
                src = location.protocol + src
            if (/^\//.test(src))
                src = location.protocol + '//www.adultwork.com' + src

            image.src = "https://yacdn.org/serve/" + src;
            let uid = location.href.match(/UserID=([0-9]+)/)[1];
            let fileName = `aw_civilizer_${uid}_` + image.src.split(/(\\|\/)/g).pop();
            image.onload = function () {
                let canvas = document.createElement('canvas');
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;
                canvas.getContext('2d').drawImage(this, 0, 0);
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
        downloadButton.style.padding = "20px 150px"
        downloadButton.style.margin = "25px"
        downloadButton.style.fontSize = "20px"
        downloadButton.style.cursor = "pointer"
        downloadButton.innerHTML = "Download All Images"
        downloadButton.id = "ku_download_all"
        downloadButton.addEventListener('click', () => {
            document.querySelector('#ku_download_all').setAttribute('disabled', true)
            setTimeout(() => document.querySelector('#ku_download_all').removeAttribute('disabled'), 5000)
            images.forEach(downloadImage)
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
