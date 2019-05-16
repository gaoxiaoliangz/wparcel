import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

const renderApp = () => {
  ReactDOM.render(<App title="ts app" />, document.getElementById('root'))
}

renderApp()

console.log('env', process.env.NODE_ENV)

// module.hot.accept(App, renderApp)
