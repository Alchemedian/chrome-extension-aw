if (location.href.match(/Search/i)) {
    function makeDiv(style, html) {
        let div = document.createElement('div');
        div.style = style;
        div.innerHTML = html;
        return div;
    }

    function biggerHoverImages() {
        document.querySelectorAll('.Padded a[onMouseover]').forEach(ele =>{ 
            let om = ele.getAttribute('onmouseover')
            ele.setAttribute('onmouseover', om.replace('/ci/i/','/ci/f/')
            .replace('<img src=','<img style="max-width:600px;max-height:600px" src='))
        })
    }
    biggerHoverImages()

    document.querySelectorAll("a.label[href='#']").forEach(function(x) {
        var st = String(x.getAttribute('onclick')).match(/sU\(([0-9]+)/);
        if (st && st[1]) {
            fetch('https://www.adultwork.com/ViewProfile.asp?UserID=' + st[1]).then(y => y.text()).then(y => {
                let tel = y.match(/"telephone".+/g)
                if (tel && tel[0]) {
                    let tels = tel[0].match(/"telephone".+/g)[0].match(/[0-9+]+/g)
                    if (tels.length == 2 && tels[1].substr(-10) == tels[0].substr(-10)) {
                        tels.pop()
                    }
                    tel = tels.join(', ')
                    tel = tel.replace(/\+44/g, '0')
                    x.after(makeDiv(`background-color: green;color: white;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                        `<div class='telexists'>☎️ ${tel}</div>`
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
                    x.after(makeDiv(`cursor:default;border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                        hourly + '<div style="font-size:12px">' + services.join(' ') + '</div>'));
                }

                let nation = y.match(/Nationality:.+/s);
                if (nation && nation[0]) {
                    nation = nation[0].split("\n")
                    if (nation[1]) {
                        nation = nation[1].match(/>(.+)</) && nation[1].match(/>(.+)</)[1]
                        nation = nation ? nation : '???'
                        x.after(makeDiv(`border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                            nation));
                    }
                }

                let lastLogin = y.match(/Last Login:.+/s);
                if (lastLogin && lastLogin[0]) {
                    lastLogin = lastLogin[0].split("\n")
                    if (lastLogin[1]) {
                        lastLogin = lastLogin[1].match(/>(.+)</)[1]
                        x.after(makeDiv(`border:1px solid grey;border-radius: 5px;margin: 5px;padding: 2px;width:110px`,
                            'Online: ' + lastLogin));
                    }
                }

            })

            x.href = "https://www.adultwork.com/ViewProfile.asp?UserID=" + st[1];
            x.setAttribute('href', "https://www.adultwork.com/ViewProfile.asp?UserID=" + st[1])
            x.target = "_blank";
            x.onclick = function() {
                window.open("https://www.ukpunting.com/index.php?action=adultwork;id=" + st[1]);
                // window.open("https://drive.google.com/drive/search?q=" + st[1]);
                window.open("https://www.adultwork.com/ViewProfile.asp?UserID=" + st[1]);
                return false;
            };
        }
    })
    document.querySelectorAll('img.Border').forEach(function(x) {
        x.src = String(x.src).replace('/t/', '/i/')
    })
}

(function() {
    var temp = function() {
        document.querySelectorAll("*").forEach((x) => x.removeAttribute('onselectstart'))
        document.querySelectorAll(".unSelectable").forEach((x) => x.className = '')
        document.querySelectorAll("*").forEach((x) => x.style.wordBreak = 'break-word')
    }
    setTimeout(temp, 250)
})();

(function() {
    var parent = document.getElementById("stripMenuLevel2Container");
    var child = document.createElement("div");
    let loc = location.href;
    if(loc.match(/UserID=([0-9]+)/) && loc.match(/UserID=([0-9]+)/)[1]){
        loc = `https://www.adultwork.com/UserID=` + loc.match(/UserID=([0-9]+)/)[1];
    }
    child.innerHTML = loc + "  " + String(new Date()).split(' ').slice(0, 4).join(' ');
    child.style.border = "1px solid grey";
    child.style.backgroundColor = "grey";
    child.style.color = "white";
    parent.after(child);
    child.innerHTML += '<div style="float: right;background-color: orange;font-size: 7pt;padding: 2px">KUCK Vision</div>'
    
})();

(function() {
    if (!/ViewProfile/.test(location.href)) {
        return;
    }
    try {
        document.getElementById("dPref").style.height = document.getElementById("dPref").children[0].offsetHeight + "px";
    } catch (e) {}

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
                document.getElementById(randId).addEventListener('click', function() {
                    document.getElementById('content' + i).innerHTML = document.getElementById('content' + i).getAttribute('data-content-html');
                    return false;
                })
            }
        }
    }

    function imgify() {
        var html = "";
        var c = 0;
        document.querySelectorAll("img.border").forEach(function(x) {
            if (x.parentElement && x.parentElement.href && /(sIWishlist|:sI|:vSI)/.test(x.parentElement.href)) {

            } else {
                if (c++ < 55) {
                    html += "<img style='max-width:" + (window.innerWidth - 200) + "px' src='" + thumbToFull(x.src) + "'/>";
                }
            }
        })
        c = 0;
        document.querySelectorAll(".ImageBorder").forEach(function(x) {
            if (c++ < 55) {
                html += "<img class='tomato' style='max-width:" + (window.innerWidth - 200) + "px' src='" + thumbToFull(x.src) + "'/>";
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
    (function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/dlgVerificationPhoto.asp?SelUserID=' + location.href.match(/UserID=([0-9]+)/)[1]);
        xhr.onload = function() {
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
