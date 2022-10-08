const version = "v1"
const resources = [
    "/",
    "index.html"
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(version).then(async function(cache) {
            await cache.addAll(resources)
        })
    )
})