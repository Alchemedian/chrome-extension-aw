(function () {
    if (!isProfilePage()) {
        return;
    }
    try {
        document.getElementById("dPref").style.height = document.getElementById("dPref").children[0].offsetHeight + "px";
    } catch (e) { }

    //remove stupid banner
    document.querySelectorAll('table p a').forEach(a => {
        if (/refer\.adultwork\.com/.test(a.href))
            a.remove()
        else if (/adultwork\.com\/shop\.asp/i.test(a.href))
            a.remove()
        else if (/adultwork\.com\/insider/i.test(a.href))
            a.remove()
        else if (/adultwork\.com\/TV/i.test(a.href))
            a.remove()
        else if (/adultwork\.com\/Vouchers\.asp/i.test(a.href))
            a.remove()
    })

    let profileId = location.href.match(/UserID=([0-9]+)/i)[1]
    let profileName = document.querySelector('.PageHeading').innerText
    getUKPsummary(profileId, document.querySelector('#ku_ukp_summary'), 'scrape')
    let ukpSearch = ukpSearchButtons(profileId)
    ukpSearch.style.display = "inline"
    ukpSearch.style.marginLeft = "10px"
    ukpSearch.style.float = "right"
    document.querySelector('#ku_ukp_search').append(ukpSearch)

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

    function removeDuplicateGalleryImages() {
        document.querySelectorAll('#ku_gallery_images img')
            .forEach(gImg => {
                let imgs = document.querySelectorAll(`#ku_gallery_images img[data-file-name="${gImg.getAttribute('data-file-name')}"]`)
                if (imgs.length > 1) {
                    let maxWidth = 0
                    imgs.forEach(img => {
                        maxWidth = Math.max(maxWidth, img.naturalWidth)
                    })
                    imgs.forEach(img => {
                        let display = img.naturalWidth !== maxWidth ? 'none' : ''
                        img.parentElement.parentElement.style.display = display
                    })
                }
            })
    }

    for (timeout = 500; timeout < 10000; timeout += 500) {
        setTimeout(removeDuplicateGalleryImages, timeout)
    }

    let images = []

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

    function imgify() {
        var html = "";
        var c = 0;

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
        imgIcon.src = iconBase64

        function fileSavePrefix() {
            return `aw_civilizer_${profileId}_${profileName.replace(/\W/g, '-')}`
        }

        function downloadImage(src, nameSuffix = '') {
            let image = new Image();
            image.crossOrigin = "anonymous";
            if (/^\/\//.test(src))
                src = location.protocol + src
            if (/^\//.test(src))
                src = location.protocol + '//www.adultwork.com' + src

            let fileName = `${fileSavePrefix()}_${nameSuffix}_` + src.split(/(\\|\/)/g).pop();
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
                context.fillText("😋 " + profileName,
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

        let divGallery = document.createElement("div");
        divGallery.id = "ku_gallery_images"
        divGallery.innerHTML = html;

        let downloadAllButton = document.createElement('button')
        downloadAllButton.style.padding = "20px"
        downloadAllButton.style.fontSize = "20px"
        downloadAllButton.style.cursor = "pointer"
        downloadAllButton.style.position = "sticky";
        downloadAllButton.style.top = "-20px";
        downloadAllButton.style.float = "right";
        downloadAllButton.style.zIndex = "1000";
        downloadAllButton.style.userSelect = "none";
        downloadAllButton.innerHTML = "Download All Images"
        downloadAllButton.title = "Right click to download only screenshot"
        downloadAllButton.id = "ku_download_all"
        downloadAllButton.addEventListener('contextmenu', (e) => {
            disableDownloadAllButton(2000)
            downloadScreenshot()
            e.preventDefault()
            return false
        })
        function disableDownloadAllButton(n = 5000) {
            document.querySelector('#ku_download_all').setAttribute('disabled', true)
            setTimeout(() => document.querySelector('#ku_download_all').removeAttribute('disabled'), n)
        }
        downloadAllButton.addEventListener('click', () => {
            disableDownloadAllButton()
            downloadScreenshot()
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
        document.querySelector("div.stripMenuLevelFooterContainer").before(downloadAllButton)
        document.querySelector("div.stripMenuLevelFooterContainer").before(divGallery);


        function downloadScreenshot() {
            let element = document.querySelector('td div[align=center]')
            element.style.backgroundColor = "#ffffff"
            html2canvas(element, {
                useCORS: true,
                onrendered: function (canvas) {
                    let context = canvas.getContext('2d')
                    context.drawImage(imgIcon, canvas.width - imgIcon.width, canvas.height - imgIcon.height)
                    let a = document.createElement('a')
                    a.download = `${fileSavePrefix()}_profile_capture.jpg`
                    a.href = canvas.toDataURL("image/jpg")
                    a.click()
                }
            })
        }

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
    function getVerificationPicture() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/dlgVerificationPhoto.asp?SelUserID=' + profileId);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var a = xhr.responseText.match(/src=".+UserVeriPhotos[^"]+/g);
                var b = false;
                if (a && a[0]) {
                    b = a[0].split('"');
                }
                if (b && b[1]) {
                    var src = b[1].replace('/i/', '/');
                    let fileName = src.split(/(\\|\/)/g).pop()
                    let html = wrapImg(src)
                    // var html = "<img class='verif' data-file-name='" + fileName + "' style='max-width:" + (window.innerWidth - 200) + "px' src='" + src + "'/>";
                    var child = document.createElement("div");
                    child.innerHTML = html;

                    function waitForDownloadAll() {
                        if (document.querySelector("#ku_download_all")) {
                            document.querySelector("#ku_download_all").after(child);
                        } else {
                            setTimeout(waitForDownloadAll, 300)
                        }
                    }
                    waitForDownloadAll()

                    images.push(src)
                }
            }
        };
        xhr.send();

    }

    getVerificationPicture()

})();