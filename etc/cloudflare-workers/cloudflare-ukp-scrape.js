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
        const ret = {
            positive_count: positive,
            negative_count: negative,
            neutral_count: neutral,
            review_count: neutral + negative + positive,
            order: getOrderOfReviews(text),
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


function getOrderOfReviews(content) {
    return runningParser(content, ['positive.gif', 'negative.gif', 'neutral.gif'])
        .reverse()
        .map(ele => {
            return ele
                .replace('positive.gif', '👍')
                .replace('negative.gif', '👎')
                .replace('negative.gif', '😐')
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