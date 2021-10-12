String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);}


if (isPicSearchPage()) {
    let elements = document.querySelectorAll("#tbl1Content tbody > tr > td table > tbody > tr > td a[title*='Click to view']");
    elements.forEach(ele => {
        var id = ele.href.replace("javascript:sG('","").replace("')","");

        replaceId(ele,id,"86", "18");
        replaceId(ele, id, "46", "68");
        replaceId(ele, id, "94", "08");
        replaceId(ele, id, "78", "28");
        replaceId(ele, id, "30", "88");
        replaceId(ele, id, "54", "58");
        replaceId(ele, id, "70", "38");
        replaceId(ele, id, "38", "78");
    })
}

function isPicSearchPage() {
    return /SearchPictures.asp/i.test(location.href)
}

function replaceId(ele,id, repeatnum, lastnum) {
    var skip = 2;
    id = id.replaceAt(skip, repeatnum);
    id = id.replaceAt(skip * 3, repeatnum);
    id = id.replaceAt(skip * 5, repeatnum);
    id = id.replaceAt(skip * 5, repeatnum);
    id = id.replaceAt(skip * 7, repeatnum);
    id = id.replaceAt(skip * 9, repeatnum);
    id = id.replaceAt(skip * 11, repeatnum);
    id = id.replaceAt(skip * 13, repeatnum);
    id = id.replaceAt(skip * 15, repeatnum);
    id = id.replaceAt(id.length - 2, lastnum);


    var url = `https://content.adultwork.com/cx/PG17/O/${id}.jpg`;
    let image = new Image();
    image.height = 100;
    image.style = "cursor:pointer";
    image.src = url;
    image.onload = () => {
        console.log(image.naturalWidth)
        if (image.naturalWidth < 2) {
            image.remove();
        }
    };
    image.onclick =() =>{
        window.open(image.src)
    };

    ele.parentElement.parentElement.before(image);
}


