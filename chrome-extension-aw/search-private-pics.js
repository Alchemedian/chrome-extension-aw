function isPicSearchPage() {
    return /SearchPictures.asp/i.test(location.href)
}

if (isPicSearchPage()) {
    let elements = document.querySelectorAll("#tbl1Content tbody > tr > td table > tbody > tr > td a[title*='Click to view']");
    elements.forEach(ele => {
        var id = ele.href.replace("javascript:sG('", "").replace("')", "");
        replaceId(ele, id, "86", "18");
        replaceId(ele, id, "46", "68");
        replaceId(ele, id, "94", "08");
        replaceId(ele, id, "78", "28");
        replaceId(ele, id, "30", "88");
        replaceId(ele, id, "54", "58");
        replaceId(ele, id, "70", "38");
        replaceId(ele, id, "38", "78");
    })
}

function replaceId(ele, id, repeatnum, lastnum) {
    function replaceAt(str, index, replacement) {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length)
    }
    var skip = 2;
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

    var url = `https://content.adultwork.com/cx/PG17/O/${id}.jpg`;
    let image = new Image();
    image.height = 100;
    image.style = "cursor:pointer";
    image.src = url;
    image.onload = () => {
        if (image.naturalWidth < 2) {
            image.remove();
        }
    };
    image.onclick = () => {
        window.open(image.src)
    };

    ele.parentElement.parentElement.before(image);
}