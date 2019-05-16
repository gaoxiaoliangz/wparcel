import React from 'react'
import cat from './cat.gif'
import './App.scss'
import Text from './Text'

interface AppProps {
  title: string
}

const App = ({ title }: AppProps) => {
  return (
    <div className="app">
      <img src={cat} alt="cat" />
      <Text content={`${title} works`} />
    </div>
  )
}

export default App
