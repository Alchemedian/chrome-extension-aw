addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)
    let apiUrl = url.searchParams.get('apiurl')
    let headers = new Headers({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"
    });


    let response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
    })

    response = new Response(response.body, response)
        // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
        // Append to/Add Vary header so browser will cache response correctly
    response.headers.append('Vary', 'Origin')
    return response
}