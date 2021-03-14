(function() {
    if (!isProfilePage()) {
        return;
    }
    let datePageLoad = new Date()

    try {
        document.getElementById("dPref").style.height = document.getElementById("dPref").children[0].offsetHeight + "px";
    } catch (e) {}

    //remove horizontal scroll
    if (document.body.offsetWidth > 1000)
        document.querySelector('html').style.overflowX = 'hidden'

    let profileId = location.href.match(/UserID=([0-9]+)/i)[1]
    let parsedData = parseProfileData(document.body.innerHTML)
    saveProfileData(profileId, parsedData, isProfilePage())


    /*
    Price history
    */

    let priceBands = {
        'halfHourly': 'tdRI0.5',
        'hourly': 'tdRI1',
        'hourlyOutcall': 'tdRO1'
    }

    Object.keys(priceBands).forEach(band => {
        let priceHistory = getPriceHistory(profileId, band)
        let priceTitle = []
        priceHistory.forEach(row => {
            priceTitle.push('£' + row[1] + ' ' + timeAgo(row[0]))
        })
        priceHistory.push([new Date() / 1, parsedData.rates[band]])

        let eleTimeDisplay = document.getElementById(priceBands[band])

        let minPrice = 1e99
        let maxPrice = 0
        priceHistory.forEach(x => {
            minPrice = Math.min(x[1], minPrice)
            maxPrice = Math.max(x[1], maxPrice)
        })

        if (!eleTimeDisplay)
            return
        if (minPrice == 1e99) {
            eleTimeDisplay.title = `Price history not available.\nCurrent price saved, for as long as you don't clear your browser cache`
            eleTimeDisplay.innerHTML += " ⚪"
            return
        }

        eleTimeDisplay.title = `Was: \n` + priceTitle.join("\n")
        if (minPrice != 1e99) {
            if (parsedData.rates[band] > minPrice) {
                eleTimeDisplay.style.color = "red"
                eleTimeDisplay.style.fontWeight = "bold"
                eleTimeDisplay.innerHTML += " ⬆"
            } else if (parsedData.rates[band] < maxPrice) {
                eleTimeDisplay.style.color = "green"
                eleTimeDisplay.style.fontWeight = "bold"
                eleTimeDisplay.innerHTML += " ⬇"
            } else if (minPrice == maxPrice) {
                eleTimeDisplay.style.fontWeight = "bold"
                eleTimeDisplay.innerHTML += " ✓"
            }
        }

    })



    let profileName = document.querySelector('.PageHeading').innerText
    getUKPsummary(profileId, document.querySelector('#ku_ukp_summary'), 'scrape')
    let ukpSearch = ukpSearchButtons(profileId)
    document.querySelector('#ku_ukp_search').append(ukpSearch)

    let divCovid = document.createElement('div')
    divCovid.id = 'ku_bar_covid_profile'
    document.getElementById('ku_top_bar').after(divCovid)
    let region1 = document.querySelector('[itemprop="addressRegion"]') ? document.querySelector('[itemprop="addressRegion"]').innerText : ''

    let postCode = document.head.innerHTML.match(/&PostCode=([^&,']+)/)
    if (postCode && postCode[0] && postCode[1]) {
        postCode = postCode[1]
        postCodeOutward(postCode)
            .then(adminDistricts => {
                adminDistricts.slice(0, 5).forEach(ad => {
                    covidData(ad, document.querySelector('#ku_bar_covid_profile'))
                })
            })
    } else {
        let region2 = document.querySelector('[itemprop="addressLocality"]') ? document.querySelector('[itemprop="addressLocality"]')
            .innerText.replace(/,/g, '') : ''
        covidData(region1,
            document.querySelector('#ku_bar_covid_profile'),
            region2
        )
    }

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
                a += `<div id='ku_removed_content_${i}' class='ku_removed_content'>Removed very long pretentious textual crap. <button id='${randId}'>Show Full Text</button></div>`
                document.getElementById(eleId).innerHTML = a;
                document.getElementById(eleId).setAttribute('data-content-html', html);
                document.getElementById(randId).addEventListener('click', function() {
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

    let imagesDict = {}

    function wrapImg(src, emoji = '', divClass = '') {
        let fileName = src ? src.split(/(\\|\/)/g).pop() : String((new Date()) / 1) + String(Math.random()).replace("0.", "")
        let maxWidth = window.localStorage.ku_gallery_max_width ?
            window.localStorage.ku_gallery_max_width : window.innerWidth - 200

        return `<div class='ku_gallerywrapper'>
            <div class='${divClass}'>
                <img class='ku_gallerywrapper_img' style='max-width:${maxWidth}px;' src='${src}' onclick="window.open('${src}')" data-file-name="${fileName}"/>
                    <div class='ku_reverse_img_search'>
                    <span class="emoji">${emoji}</span>
                        <button onclick="window.open('https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(src)}');window.open('https://www.google.com/searchbyimage?&image_url=${encodeURIComponent(src)}')">Image Search</button>
                    </div>                    
            </div>
        </div>`;
    }

    function imgify() {
        var html = "";
        var c = 0;

        document.querySelectorAll("img.border").forEach(function(x) {
            if (x.parentElement && x.parentElement.href && /(sIWishlist|:sI|:vSI)/.test(x.parentElement.href)) {

            } else {
                html += wrapImg(thumbToFull(x.src))
                imagesDict[x.src] = 'lead'
            }
        })

        // disabled video thumbs - getting full size below
        // document.querySelectorAll(".cp__video__thumb img")
        //     .forEach(el => {
        //         html += wrapImg(el.src)
        //         images.push(el.src)
        //     })

        c = 0;
        document.querySelectorAll(".ImageBorder").forEach(function(x) {
            if (c++ < 55) {
                html += wrapImg(thumbToFull(x.src));
                imagesDict[x.src] = 'via_thumbnail'
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


            image.onload = function() {
                let canvas = document.createElement('canvas');
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;
                let context = canvas.getContext('2d')
                context.drawImage(this, 0, 0)
                context.globalAlpha = 0.15;

                let overlayRatio = .05;
                let widthOverlay = canvas.width * overlayRatio;
                let heightOverlay = widthOverlay * imgIcon.height / imgIcon.width; //preserve aspect ratio

                context.shadowBlur = widthOverlay;

                context.drawImage(imgIcon, canvas.width - widthOverlay, canvas.height - heightOverlay,
                    widthOverlay / imgIcon.width * 50, heightOverlay / imgIcon.height * 50);


                // let fontSize = Math.round(Math.sqrt(canvas.width * canvas.height) / 30)
                // context.font = fontSize +
                //     "px Georgia";
                // context.shadowColor = "rgba(255,255,255,1)";
                // context.shadowBlur = fontSize;
                // context.fillText("😋 " + profileName,
                //     0, canvas.height - fontSize);

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
        divGallery.innerHTML = html

        //movie preview images, full size
        function fullSizeMovieImages() {
            let videoUrl = {}
            document.querySelectorAll('.iframe-lightbox-link.iframe-lightbox-link--is-binded[data-src]')
                .forEach(ele => {
                    videoUrl[ele.getAttribute('data-src')] = 1
                })

            Object.keys(videoUrl).forEach(url => {
                if (url) {
                    /*
                    // commented out as twitter og img has been removed
                                        fetch("https://cors-proxy.bwkake.workers.dev/?apiurl=" +
                                            encodeURIComponent(url)).then(x => x.text()).then(txt => {
                                            let dtemp = document.createElement('div')
                                            dtemp.innerHTML = txt
                                            let meta = dtemp.querySelector('meta[name="twitter:image"]')
                                            if (meta) {
                                                let src = meta.getAttribute('content')
                                                if (src) {
                                                    divGallery.innerHTML += wrapImg(src, '🎦', 'ku_movie_image')
                                                    imagesDict[src] = 'video'
                                                }
                                            }
                                        })
                    */
                    graphQLVideoImageLoad(url, function(src) {
                        if (src) {
                            divGallery.innerHTML += wrapImg(src, '🎦', 'ku_movie_image')
                            imagesDict[src] = 'video'
                        }

                    })

                }
            })
        }
        fullSizeMovieImages()



        let downloadAllButton = document.createElement('button')
        downloadAllButton.innerHTML = "Download All Images"
        downloadAllButton.id = "ku_download_all"

        function disableDownloadAllButton(n = 5000) {
            document.querySelector('#ku_download_all').setAttribute('disabled', true)
            setTimeout(() => document.querySelector('#ku_download_all').removeAttribute('disabled'), n)
        }
        downloadAllButton.addEventListener('click', () => {
            disableDownloadAllButton()
            downloadScreenshot()
            let uniqImages = {}
            Object.keys(imagesDict).forEach(src => {
                let fileName = src.split(/(\\|\/)/g).pop()
                let maxImg = { width: 0 }
                document.querySelectorAll(`img[data-file-name="${fileName}"]`).forEach(img => {
                    if (maxImg.width < img.width)
                        maxImg = img
                })
                uniqImages[maxImg.src] = { width: maxImg.width, height: maxImg.height, type: imagesDict[src] }
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
                .forEach((src, i) => downloadImage(src, `000${i}`.substr(-3) + `_${uniqImages[src].type}_`))
        })
        document.querySelector("div.stripMenuLevelFooterContainer").before(downloadAllButton)

        let screenshotButton = document.createElement('button')
        screenshotButton.innerHTML = "Screenshot"
        screenshotButton.id = "ku_download_screenshot"
        screenshotButton.addEventListener('click', (e) => {
            downloadScreenshot()
        })
        document.querySelector("div.stripMenuLevelFooterContainer").before(screenshotButton)

        //img size slider:
        let imgSizeSliderContainer = document.createElement('div')
        imgSizeSliderContainer.className = 'ku_gallery_slider'
        let maxWidth = window.localStorage.ku_gallery_max_width ?
            window.localStorage.ku_gallery_max_width : window.innerWidth - 200

        let imgSizeSlider = document.createElement('input')
        imgSizeSlider.type = 'range'
        imgSizeSlider.min = 150
        imgSizeSlider.step = 25
        imgSizeSlider.max = Math.ceil(window.innerWidth / 100) * 100
        imgSizeSlider.value = maxWidth
        imgSizeSlider.addEventListener('input', function() {
            document.querySelectorAll('.ku_gallerywrapper_img').forEach(ele => {
                ele.style.maxWidth = this.value + 'px'
                window.localStorage.ku_gallery_max_width = this.value
            })
        })

        imgSizeSliderContainer.appendChild(imgSizeSlider)
        document.querySelector("div.stripMenuLevelFooterContainer").before(imgSizeSliderContainer)

        document.querySelector("div.stripMenuLevelFooterContainer").before(divGallery);

        function downloadScreenshot() {
            let element = document.querySelector('td div[align=center]')
            element.style.backgroundColor = "#ffffff"
            let scr = { x: window.scrollX, y: window.scrollY }
            html2canvas(element, {
                useCORS: true,
                onrendered: function(canvas) {
                    let context = canvas.getContext('2d')
                    context.drawImage(imgIcon, canvas.width - imgIcon.width, canvas.height - imgIcon.height)
                    context.font = "26px Arial";
                    // let date = String(new Date()).split(1900 + (new Date()).getYear())[0] + (1900 + (new Date()).getYear())
                    let date = datePageLoad.toLocaleString('gb')
                    context.fillText(date, 5, canvas.height - 5)
                    let a = document.createElement('a')
                    a.download = `${fileSavePrefix()}_profile_capture.jpg`
                    a.href = canvas.toDataURL("image/jpg")
                    a.click()
                    window.scrollTo(scr.x, scr.y)

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
                    div.innerHTML = wrapImg(src)
                    imagesDict[src] = 'gallery_via_viewer'
                    document.querySelector('#ku_gallery_images').append(div)
                })
            })
        }
        fullSizedGalleryImages()

    }

    setTimeout(() => {
        imgify(), removeLongTextualCrap()
    }, 300);

    //add call and whatsapp link
    setTimeout(() => {
        document.querySelectorAll('[itemprop=telephone]').forEach(ele => {
            let telFull = ele.innerText.replace(/^0/, '+44')

            let tel = document.createElement('a')
            tel.setAttribute('target', '_blank')
            tel.className = 'ku_prof_tel'
            tel.innerHTML = '☎️ Call'
            tel.setAttribute('href', `tel:${telFull}`)
            ele.append(tel)

            let wa = document.createElement('a')
            wa.setAttribute('target', '_blank')

            wa.setAttribute('href', `https://wa.me/${telFull}`)
            wa.className = "ku_prof_whatsapp"
            wa.innerHTML = `<img class="whatsapp" alt="WhatsApp" title="WhatsApp" src='https://web.whatsapp.com/img/favicon/1x/favicon.png' /> WhatsApp`
            ele.append(wa)
        })
    }, 300)

    function thumbToFull(img) {
        return img.replace('/t/', '/f/').replace('/thumbnails/', '/images/');
    }


    //verification pic
    function getVerificationPicture() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/dlgVerificationPhoto.asp?SelUserID=' + profileId);
        xhr.onload = function() {
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
                    var child = document.createElement("div");
                    child.innerHTML = html;

                    function waitForDownloadAll() {
                        if (document.querySelector("#ku_download_all")) {
                            // document.querySelector("#ku_download_all").after(child);
                            document.querySelector('#ku_gallery_images').prepend(child)
                        } else {
                            setTimeout(waitForDownloadAll, 300)
                        }
                    }
                    waitForDownloadAll()

                    imagesDict[src] = 'verification'
                }
            }
        };
        xhr.send();

    }

    getVerificationPicture()

})();