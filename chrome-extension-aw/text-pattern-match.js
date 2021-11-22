function textPatternMatch(text, wordHierarchy) {
    const searchNeighbourCharacterThreshold = 100

    let textUnits = [text]
    for (let i = 0; i < textUnits.length; i++) {
        let txt = textUnits[i].toLowerCase()
        let matchPos = matchTextUnit(txt)
        if (matchPos) {
            const padding = 75
            let start = Math.max(matchPos - padding, 0)
            let end = matchPos + padding
            let snippet = (start !== 0 ? "…" : '') + textUnits[i].slice(start, end) + "…"
                // console.log(snippet)
            return snippet
        }
    }
    return false

    function matchTextUnit(txt) {
        let matchedPositions = []
        wordHierarchy.forEach(x => matchedPositions.push([])) //initate with blanks

        loopVertically:
            for (let vert = 0; vert < wordHierarchy.length; vert++) {
                let matched = false
                let positionsPrevious = []
                if (!matchedPositions[vert - 1]) {
                    positionsPrevious = [null]
                } else {
                    positionsPrevious = matchedPositions[vert - 1]
                }
                loopHorizontally:
                    for (let horiz = 0; horiz < wordHierarchy[vert].length; horiz++) {
                        for (let pos = 0; pos < positionsPrevious.length; pos++) {
                            let [contains, strPos] = strContains(txt, wordHierarchy[vert][horiz], positionsPrevious[pos])
                            if (contains) {
                                matched = true
                                strPos.forEach(x => matchedPositions[vert].push(x))
                                matchedPositions[vert] = matchedPositions[vert].filter((v, i, a) => a.indexOf(v) === i)
                            }
                        }
                    }
                if (!matched) {
                    return false
                }
            }
            // console.log(matchedPositions)
        let lowestCardinalArray = matchedPositions[0]
        matchedPositions.forEach(x => {
                if (x.length < lowestCardinalArray.length) {
                    lowestCardinalArray = x
                }
            })
            // console.log(lowestCardinalArray)

        let meanPos = 0;
        // lowestCardinalArray.forEach(x => meanPos += x)
        // meanPos = meanPos / lowestCardinalArray.length
        meanPos = lowestCardinalArray[0]
        return meanPos
    }


    function strContains(haystack, needle, near) {

        let haystackTrimmed, start = 0
        if (near) {
            start = Math.max(near - searchNeighbourCharacterThreshold, 0)
            let end = Math.min(near + searchNeighbourCharacterThreshold, haystack.length)
            haystackTrimmed = haystack.slice(start, end)
        } else {
            haystackTrimmed = haystack
        }
        let reg = RegExp(needle, 'g')
        let matchPos = []
        while (reg.exec(haystackTrimmed)) {
            matchPos.push(reg.lastIndex + start)
        }
        if (matchPos.length != 0) {
            return [true, matchPos]
        }
        return [false, -1]
    }
}


function isNba(text) {
    return textPatternMatch(text, [
        [/\bblacks?\b/],
        [/\bm(e|a)ns?\b/, 'blacks', /\bpeople\b/, /\bguys?\b/, /\bclients?\b/, /\bexperiences?\b/, /\bgentlem(e|a)n\b/, ],
        ['no', /don.?t/, "not"],
    ])
}

function extrasBby(text) {
    return textPatternMatch(text, [
        [/\bextras?\b/],
    ])

}