const version = 55

self.addEventListener('install', event => {
  // self.skipWaiting()

  // cache a cat SVG
  event.waitUntil(
    caches
      .open('static-v1')
      .then(cache => cache.add('/images/dog.jpg'))
      .then(() => {
        console.log('sw install completed')
      })
  )
})

self.addEventListener('activate', () => {
  console.log('sw activated')
  clients.claim()
})

const getTime = () => {
  const t = new Date()
  const tStr = `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}:${t.getMilliseconds()}`
  return tStr
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // serve the dog.jpg from the cache if the request is
  // same-origin and the path is '/images/cat.jpg'
  if (url.origin == location.origin && url.pathname == '/images/cat.jpg') {
    const dogCache = caches.match('/images/dog.jpg')
    event.respondWith(dogCache)
  }
})

self.addEventListener('message', event => {
  console.log(`sw:${version} received`, event.data)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'CHECK_VERSION') {
    console.log('version', version)
  }
})
