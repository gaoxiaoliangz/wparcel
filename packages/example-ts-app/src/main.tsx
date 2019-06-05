import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as serviceWorker from './helpers/serviceWorker'

const renderApp = (props?) => {
  ReactDOM.render(
    <App
      {...props}
      updateApp={() => {
        serviceWorker.unregister()
        serviceWorker.register()
      }}
    />,
    document.getElementById('root')
  )
}

renderApp()

serviceWorker.register({
  onUpdate: registration => {
    renderApp({
      hasUpdate: true,
    })
  },
})

// @ts-ignore
module.hot.accept(App, renderApp)

console.log('env', process.env.NODE_ENV)
