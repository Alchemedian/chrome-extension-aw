function isPicSearchPage() {
    return /SearchPictures.asp/i.test(location.href)
}

if (isPicSearchPage()) {
    revealPGImages()
}

function revealPGImages() {
    //make profile links open in new tab
    document.querySelectorAll("a.Label").forEach(a => {
        a.href = `https://www.adultwork.com/ViewProfile.asp?UserID=${a.href.replace(/[^0-9]/g,'')}`;
        a.target = "_blank"
    })

    let pgCache = {}

    let elements = document.querySelectorAll("#tbl1Content tbody > tr > td table > tbody > tr > td a[title*='Click to view']");
    elements.forEach(ele => {
        let id = ele.href.replace("javascript:sG('", "").replace("')", "");
        replaceIdSearchPicturesPage(ele, id, "86", "18");
        replaceIdSearchPicturesPage(ele, id, "46", "68");
        replaceIdSearchPicturesPage(ele, id, "94", "08");
        replaceIdSearchPicturesPage(ele, id, "78", "28");
        replaceIdSearchPicturesPage(ele, id, "30", "88");
        replaceIdSearchPicturesPage(ele, id, "54", "58");
        replaceIdSearchPicturesPage(ele, id, "70", "38");
        replaceIdSearchPicturesPage(ele, id, "38", "78");
    })

    function replaceIdSearchPicturesPage(ele, id, repeatnum, lastnum) {
        function replaceAt(str, index, replacement) {
            return str.substr(0, index) + replacement + str.substr(index + replacement.length)
        }
        let skip = 2;
        id = replaceAt(id, skip, repeatnum);
        id = replaceAt(id, skip * 3, repeatnum);
        id = replaceAt(id, skip * 5, repeatnum);
        id = replaceAt(id, skip * 5, repeatnum);
        id = replaceAt(id, skip * 7, repeatnum);
        id = replaceAt(id, skip * 9, repeatnum);
        id = replaceAt(id, skip * 11, repeatnum);
        id = replaceAt(id, skip * 13, repeatnum);
        id = replaceAt(id, skip * 15, repeatnum);
        id = replaceAt(id, id.length - 2, lastnum);

        let url = `https://content.adultwork.com/cx/PG17/O/${id}.jpg`;
        let image = new Image();
        image.height = 100;
        image.style = "cursor:pointer";
        image.src = url;
        image.onload = () => {
            if (image.naturalWidth < 2) {
                image.remove();
            }
        }
        if (image.naturalWidth > 25) {
            let aTag = ele.parentElement.parentElement.parentElement.querySelector('a.Label')
            if (aTag && aTag.href) {

                let profId = parseInt(aTag.href.replace(/[^0-9]/g, ''))
                if (!pgCache[profId]) {
                    pgCache[profId] = {}
                }
                pgCache[profId][url] = "pg"
            }
        }

        image.onclick = () => {
            window.open(image.src)
        }

        ele.parentElement.parentElement.before(image);
    }

    setTimeout(() => {
        let cLocStor = cachedLocalStorage()
            // console.log(pgCache)
        Object.keys(pgCache).forEach(profId => {
            if (cLocStor[profId]) {
                Object.keys(pgCache[profId]).forEach(url => {
                        if (!cLocStor[profId].g) {
                            cLocStor[profId].g = {}
                        }
                        cLocStor[profId].g[url] = 'pg'
                    })
                    // console.log(cLocStor[profId].g)
            }
        })
        cachedLocalStorage(cLocStor) //commit to local store
    }, 2200)
}