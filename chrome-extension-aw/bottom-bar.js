function bottomBar() {
    let awFooter = document.querySelector(".stripMenuLevelFooterContainer.menuOuterWrapper.mf-footer")
    let bBar = document.createElement('div')
    const buttonSave = "_ku_button_cache_save"
    const buttonRestore = "_ku_button_cache_restore"
    const fileInput = "_ku_cache_restore_file"
    bBar.innerHTML = `<div class="ku_bottom_bar">
AW Civlizer:
<button id="${buttonSave}">Save local cache to file</button>
<button id="${buttonRestore}">Restore local cache from file</button>
<input style="display:none" type="file" id="${fileInput}"><br>

    </div>`

    awFooter.prepend(bBar)
    document.getElementById(buttonSave).addEventListener('click', () => {
        let aTemp = document.createElement('a');
        aTemp.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage[localStorageKeyName])));
        aTemp.setAttribute('download', "AW-Civlizer-dump-" + (new Date().toDateString().replace(/ /g, '-')));
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
                        localStorage[localStorageKeyName] = JSON.parse(reader.result)
                    }
                }
            } catch (err) {
                console.log(err)
                alert("Can't parse this file. It is not a valid AW Civilizer cache file")
            }

        }, false);

        if (file) {
            reader.readAsText(file);
        }
    })
}

isProfilePage() && bottomBar()