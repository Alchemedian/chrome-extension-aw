function bottomBar() {
    let awFooter = document.querySelector(".stripMenuLevelFooterContainer.menuOuterWrapper.mf-footer")
    let bBar = document.createElement('div')
    const buttonSearch = "_ku_button_cache_search_tel"
    const buttonSave = "_ku_button_cache_save"
    const buttonRestore = "_ku_button_cache_restore"
    const fileInput = "_ku_cache_restore_file"
    bBar.innerHTML = `<div class="ku_bottom_bar">
${APP_NAME}:
<button id="${buttonSearch}">Search cache for phone number</button>
<span class="ku_spacer_with_vertical_line"></span>
<button id="${buttonSave}">Save local cache to file</button>
<button id="${buttonRestore}">Restore local cache from file</button>
<input style="display:none" type="file" id="${fileInput}"><br>

    </div>`

    awFooter.prepend(bBar)

    document.getElementById(buttonSearch).addEventListener('click', () => {
        let telNum = prompt(`Search ${APP_NAME} cache for a phone number`)
        if (telNum) {
            let telFull = telNum
                .replace(/ /g, '')
                .replace(/^0/, '+44')
                .replace(/^/, '+')
                .replace(/^\++/, '+')
            let matches = findProfilesByPhoneNumber(telFull)
            if (matches) {
                alert(telFull + " matched: " + Object.keys(matches).join(", "))
            } else {
                alert(`No matches found for ${telFull}`)
            }
        }
    })


    document.getElementById(buttonSave).addEventListener('click', () => {
        let aTemp = document.createElement('a');
        aTemp.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage[LOCAL_STORAGE_KEY_NAME])));
        aTemp.setAttribute('download', "AW-Civlizer-dump-" + (new Date().toDateString().replace(/ /g, '-') + ".civilizer"));
        aTemp.click();
    })

    document.getElementById(buttonRestore).addEventListener('click', () => {
        document.getElementById(fileInput).style.display = "";
    })

    document.getElementById(fileInput).addEventListener('change', () => {

        const [file] = document.querySelector(`input#${fileInput}[type=file]`).files;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            try {
                let test = JSON.parse(LZString.decompress(JSON.parse(reader.result)))
                if (test) {
                    if (confirm("This will rewrite your existing local cache.")) {
                        localStorage[LOCAL_STORAGE_KEY_NAME] = JSON.parse(reader.result)
                    }
                }
            } catch (err) {
                console.log(err)
                alert(`Can't parse this file. It is not a valid ${APP_NAME} cache file`)
            }

        }, false);

        if (file) {
            reader.readAsText(file);
        }
    })
}

isProfilePage() && bottomBar()