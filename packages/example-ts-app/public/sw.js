const version = 61

const once = (target, eventKey, handler) => {
  let called = false
  const finalHandler = e => {
    called = true
    const result = handler(e)
    if (called) {
      return
    }
    target.removeEventListener(eventKey, finalHandler)
    return result
  }
  target.addEventListener(eventKey, finalHandler)
}

self.addEventListener('install', event => {
  // self.skipWaiting()

  // cache a cat SVG
  event.waitUntil(
    caches
      .open('static-v1')
      .then(cache =>
        Promise.all([
          cache.add('/images/cat.jpg'),
          cache.add('/images/dog.jpg'),
        ])
      )
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

self.addEventListener('message', async event => {
  console.log(event)
  console.log(`sw:${version} received`, event.data)
  console.log('clientId', event.clientId)
  console.log('clients', clients)

  const client = await clients.get(event.source.id)

  console.log('client', client)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
    once(self, 'activate', () => {
      client.postMessage({
        type: 'SW_ACTIVATED',
      })
      // console.log('tell client')
    })
  }
  if (event.data && event.data.type === 'CHECK_VERSION') {
    console.log('version', version)
  }
})
