addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
    const request = event.request
    const url = new URL(request.url)

    const cacheUrl = new URL(request.url)
    const cacheKey = new Request(cacheUrl.toString(), request)
    const cache = caches.default
        // Get this request from this zone's cache
    let response = await cache.match(cacheKey)
    if (!response) {
        let awid = url.searchParams.get('awid')
        let apiUrl = `https://www.ukpunting.com/index.php?action=adultwork;id=${awid}`
        let text = await (await fetch(apiUrl)).text()
        let positive = text.match(/positive\.gif/g)
        let negative = text.match(/negative\.gif/g)
        let neutral = text.match(/neutral\.gif/g)

        positive = positive ? positive.length : 0
        negative = negative ? negative.length : 0
        neutral = neutral ? neutral.length : 0
        let order = getOrderOfReviews(text)

        const ret = {
            positive_count: positive,
            negative_count: negative,
            neutral_count: neutral,
            review_count: neutral + negative + positive,
            order: order,
            dates: getReviewDates(text),
        }

        response = new Response(JSON.stringify(ret))
        response.headers.set('Content-Type', 'application/json');
        // Set CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*')
            // Cache-Control: public
            // response.headers.set('Cache-Control', 'public')
            //max-age=<seconds>
        response.headers.set('Cache-Control', ['public', 'max-age=3600'])
            // Append to/Add Vary header so browser will cache response correctly
        response.headers.append('Vary', 'Origin')
        event.waitUntil(cache.put(cacheKey, response.clone()))
    }

    return response
}

const reviewTypes = ['positive.gif', 'negative.gif', 'neutral.gif']

function getOrderOfReviews(content) {
    return runningParser(content, reviewTypes)
        .reverse()
        .map(ele => {
            return ele
                .replace('.gif', '')
        })

    function runningParser(haystack, needles) {
        let ret = []
        for (let i = 0; i < haystack.length; i++) {
            needles.forEach(needle => {
                if (haystack.substr(i, needle.length) === needle)
                    ret.push(needle)
            })
        }
        return ret
    }
}

function getReviewDates(haystack) {
    let dateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{2}, [0-9]{4},/
    let dateRegex2 = /(Today|Yesterday)/

    let positions = []
    for (let i = 0; i < haystack.length; i++) {
        reviewTypes.forEach(needle => {
            if (haystack.substr(i, needle.length) === needle)
                positions.push(i)
        })
    }
    let ret = []
    positions.forEach((pos, i) => {
        let len = positions[i + 1] ? positions[i + 1] - positions[i] : haystack.length
        let match = haystack.substr(pos, len).match(dateRegex)
        if (!match) {
            match = haystack.substr(pos, len).match(dateRegex2)
        }
        if (match && match[0])
            ret.push(match[0])

    })
    return ret.map(item => item.replace(/,$/, '')).reverse()
}