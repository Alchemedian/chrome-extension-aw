addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
    const request = event.request
    const url = new URL(request.url)
    let awid = url.searchParams.get('awid')
    let apiUrl = `https://www.ukpunting.com/aw2ukp.php?id=${awid}`

    const cacheUrl = new URL(request.url)
    const cacheKey = new Request(cacheUrl.toString(), request)
    const cache = caches.default
    // Get this request from this zone's cache
    let response = await cache.match(cacheKey)
    if (!response) {
        response = await fetch(apiUrl)
        response = new Response(response.body, response)
        // Set CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*')
        // Cache-Control: public
        // response.headers.set('Cache-Control', 'public')
        //max-age=<seconds>
        response.headers.set('Cache-Control', ['public', 'max-age=604800'])
        // Append to/Add Vary header so browser will cache response correctly
        response.headers.append('Vary', 'Origin')
        // await cache.put(cacheKey, response.clone())
        event.waitUntil(cache.put(cacheKey, response.clone()))
    }

    return response
}
