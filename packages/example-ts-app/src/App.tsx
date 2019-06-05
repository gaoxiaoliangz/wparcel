import React, { useEffect } from 'react'
import cat from './cat.gif'
import './App.scss'
import Text from './Text'
import Title from './Title'
import axios from 'axios'

interface AppProps {
  title: string
  hasUpdate: boolean
  updateApp: any
}

// eslint-disable-next-line
const service1 = () => {
  // TODO: 这个接口会 301，postman 里面请求不会，和 proxy-middleware 设置有关？
  return axios.post('/api/v4/mqtt/auth')
}

const service2 = () => {
  return axios.get(
    '/api/v4/answers/704626001/root_comments?order=normal&limit=20&offset=0&status=open'
  )
}

let mark = 0

// eslint-disable-next-line
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

const on = (target, eventKey, handler, mark) => {
  const destroyFn = () => {
    target.removeEventListener(eventKey, handler2)
    console.log('destroyed')
  }
  const handler2 = e => {
    console.log('on mark', mark)
    handler(destroyFn)(e)
  }
  target.addEventListener(eventKey, handler2)
}

const App = ({ hasUpdate, updateApp }: AppProps) => {
  useEffect(() => {
    service2().catch(() => {
      console.log('proxy not working')
    })
  }, [])

  // const postMessageToSW = data => {
  //   if (
  //     navigator.serviceWorker.controller &&
  //     navigator.serviceWorker.controller.state === 'activated'
  //   ) {
  //     navigator.serviceWorker.controller.postMessage(data)
  //   } else {
  //     if (navigator.serviceWorker.controller) {
  //       console.log(
  //         "service worker is not activated, it's in the state of",
  //         navigator.serviceWorker.controller.state
  //       )
  //     } else {
  //       console.log('no service worker found')
  //     }
  //   }
  // }

  const checkNewVersion = () => {
    return navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        const activateNewVersion = () => {
          console.log('new version found')
          const useNewVersion = confirm('Use new version?') // eslint-disable-line
          if (useNewVersion) {
            reg.waiting.postMessage({
              type: 'SKIP_WAITING',
            })
          }
        }

        // @ts-ignore
        return reg.update().then(() => {
          if (reg.installing) {
            console.log('installing')
            return new Promise(resolve => {
              on(
                reg.installing,
                'statechange',
                destroy => e => {
                  console.log('statechange', e.target.state)
                  if (e.target.state === 'installed') {
                    activateNewVersion()
                    resolve()
                    return
                  }
                  if (e.target.state === 'activated') {
                    console.log('installing:activated')
                    resolve(checkNewVersion())
                    destroy()
                  }
                },
                mark++
              )
            })
          }
          if (reg.waiting) {
            return activateNewVersion()
          }
          console.log('No update found')
        })
      })
      .catch(() => {
        console.log('reg failed')
      })
  }

  return (
    <div className="app">
      <img src={cat} alt="cat" />
      <img src="/images/cat.jpg" alt="animal" />
      <Title content="ts-app" />
      <Text content="works" />
      <h3>Service worker</h3>
      {/* <div>
        {hasUpdate ? (
          <button
            onClick={() => {
              if (updateApp) updateApp()
            }}
          >
            Update to new version
          </button>
        ) : (
          'No update found'
        )}
      </div> */}
      <div>
        <button onClick={checkNewVersion}>Check for new version</button>
      </div>
      {/* <div>
        <button
          onClick={() => {
            postMessageToSW({
              type: 'CHECK_VERSION',
            })
          }}
        >
          Check version
        </button>
      </div> */}
    </div>
  )
}

export default App
