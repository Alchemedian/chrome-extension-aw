addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
    const url = new URL(request.url)
    let apiUrl = url.searchParams.get('apiurl')
    let response = await fetch(apiUrl)

    response = new Response(response.body, response)
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    // Append to/Add Vary header so browser will cache response correctly
    response.headers.append('Vary', 'Origin')
    return response
}
