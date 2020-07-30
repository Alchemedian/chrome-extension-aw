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
        let imgs = []
        body.match(/switchImage\([^)]+\)/g) && body.match(/switchImage\([^)]+\)/g).forEach(item => {
            let img = unescape(item.split(',')[1].replace(/ /g, '').replace(/'/g, ''))
            if (img)
                imgs.push(`https://content.adultwork.com/ci/l/${img}`)
        })
        body.match(/[^"]+\/thumbnails\/[^"]+/g) && body.match(/[^"]+\/thumbnails\/[^"]+/g).slice(0, 50).forEach(item => {
            let img = item;
            if (!/\/m\//.test(img))
                img = img.replace('thumbnails', 'images')
            imgs.push(img)
        })
        return imgs
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

    function biggerHoverImages() {
        document.body.appendChild(
            makeDiv(`display:none;position:absolute;top:0;right:0;z-index:1000;border:1px solid violet;padding:2px;background-color:#222`,
                '', 'pictureOverlay'))

        document.querySelectorAll('.Padded a[onMouseover]').forEach(ele => {
            let uid = ele.href.match(/[0-9]+/)[0];
            let om = ele.getAttribute('onmouseover')

            ele.firstElementChild.addEventListener('mousemove', () => {

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

                let ord = Math.floor(event.offsetX / ele.firstElementChild.width * (profileImages[uid][0].length))
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

            })
            ele.addEventListener('mouseout', () => {
                document.getElementsByClassName('pictureOverlay')[0].style.display = "none";
                document.querySelectorAll(`.ku_ordpos`).forEach(ele => ele.style.backgroundColor = '')
            })

        })
    }
    biggerHoverImages()

    document.querySelectorAll("a.label[href='#']").forEach(function (anchorTag) {
        var st = String(anchorTag.getAttribute('onclick')).match(/sU\(([0-9]+)/);
        if (st && st[1]) {
            fetch('https://www.adultwork.com/ViewProfile.asp?UserID=' + st[1]).then(y => y.text()).then(y => {
                profileImages[st[1]] = [parseProfileImages(y), 0]

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

                let rsearch = makeDiv('position:relative;bottom:40px', '')
                rsearch.appendChild(bYandex)
                rsearch.appendChild(bGoogle)
                let ancImg = document.querySelectorAll(`a[href="javascript:vU(${st[1]})"]`)
                if (ancImg && ancImg[0]) {
                    ancImg[0].after(rsearch)

                    let stepDivs = ""
                    for (let i = 0; i < profileImages[st[1]][0].length; i++) {
                        stepDivs += `<div class="ku_ordpos" style="display: flex;
                    width: 100%;
                    height:100%;
                    border:1px solid #ccc;
                    border-radius:10px;
                    "></div>`
                    }
                    let ruler = makeDiv(`padding-top:5px;height: 10px;display: flex;pointer-events: none;`, stepDivs, 'ku_ruler')
                    ruler.id = "ku_ruler_" + st[1]
                    ancImg[0].after(ruler)
                }


                let tel = y.match(/"telephone".+/g)
                if (tel && tel[0]) {
                    let tels = tel[0].match(/"telephone".+/g)[0].match(/[0-9+]+/g)
                    if (tels.length == 2 && tels[1].substr(-10) == tels[0].substr(-10)) {
                        tels.pop()
                    }
                    tel = tels.join(', ')
                    tel = tel.replace(/\+44/g, '0')
                    anchorTag.after(makeDiv(`background-color: green;color: white;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                        `<div class='telexists'>☎️ ${tel}</div>`
                    ))
                } else {
                    anchorTag.after(makeDiv(`visibility:hidden`,
                        `<div class='nophone'></div>`
                    ))
                }
                let hour = y.match(/tdRI1[^<]+/)
                if (y && y[0]) {
                    let hourly = y.match(/tdRI1[^<]+/)
                    if (hourly) {
                        hourly = hourly[0].split('>')
                    }
                    hourly = hourly && hourly[1] ? hourly[1] : '???'
                    hourly = '£ ' + hourly + '/hr';
                    let services = [];
                    />Oral without Protection</.test(y) && services.push("<span title='OWO'>😋</span>");
                    />CIM</.test(y) && services.push("<span title='CIM'>👄</span>");
                    /&quot;A&quot; Levels/.test(y) && services.push("<span title='Anal'>🍩</span>");
                    />French Kissing</.test(y) && services.push("<span title='French Kissing'>😘</span>");
                    />Foot Worship</.test(y) && services.push("<span title='Foot Worship'>👣</span>");
                    />Rimming \(giving\)</.test(y) && services.push("<span title='Rimming'>👅</span>");
                    />Bareback</.test(y) && services.push("bb");
                    anchorTag.after(makeDiv(`cursor:default;border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                        hourly + '<div style="font-size:25px">' + services.join(' ') + '</div>'));
                }

                let nation = y.match(/Nationality:.+/s);
                if (nation && nation[0]) {
                    nation = nation[0].split("\n")
                    if (nation[1]) {
                        nation = nation[1].match(/>(.+)</) && nation[1].match(/>(.+)</)[1]
                        nation = nation ? nation : '???'
                        anchorTag.after(makeDiv(`border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                            nation));
                    }
                }

                let lastLogin = y.match(/Last Login:.+/s);
                if (lastLogin && lastLogin[0]) {
                    lastLogin = lastLogin[0].split("\n")
                    if (lastLogin[1]) {
                        lastLogin = lastLogin[1].match(/>(.+)</)[1]
                        anchorTag.after(makeDiv(`border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                            'Online: ' + lastLogin, 'c_online'));
                    }
                }

            })

            anchorTag.href = "https://www.adultwork.com/ViewProfile.asp?UserID=" + st[1];
            anchorTag.setAttribute('href', "https://www.adultwork.com/ViewProfile.asp?UserID=" + st[1])
            anchorTag.target = "_blank";
            anchorTag.onclick = function () {
                window.open("https://www.ukpunting.com/index.php?action=adultwork;id=" + st[1]);
                // window.open("https://drive.google.com/drive/search?q=" + st[1]);
                window.open("https://www.adultwork.com/ViewProfile.asp?UserID=" + st[1]);
                return false;
            };
        }
    })
    document.querySelectorAll('img.Border').forEach(function (x) {
        x.src = String(x.src).replace('/t/', '/i/')
    })

    function hideNoPhone() {
        window.localStorage.hideNoPhone = String(document.getElementById('ku_check_phone').checked)
        let show = JSON.parse(window.localStorage.hideNoPhone) ? 'none' : '';
        window.document.querySelectorAll('.nophone').forEach(ele => {
            let tdOne = ele.parentElement
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
        loc = `https://www.adultwork.com/UserID=` + loc.match(/UserID=([0-9]+)/)[1];
    }
    child.innerHTML = loc + "  " + String(new Date()).split(' ').slice(0, 4).join(' ');
    child.style.border = "1px solid grey";
    child.style.backgroundColor = "grey";
    child.style.color = "white";
    parent.after(child);
    let hidePhoneButton = isSearchPage() ?
        `
        <span style="margin-left:20px;height:18px" id='ku_hide'>
        <input id="ku_check_phone" type="checkbox" ${JSON.parse(window.localStorage.hideNoPhone) ? 'checked' : ''}/>
        <label style="font-size:10px;" for="ku_check_phone">Only show results with a phone</label></span>
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
