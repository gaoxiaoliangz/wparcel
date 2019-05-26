import React, { useState } from 'react'
import cat from './cat.gif'
import './App.scss'
import Text from './Text'
import Title from './Title'

interface AppProps {
  title: string
}

const App = ({ title }: AppProps) => {
  const [count, updateCount] = useState(0)
  return (
    <div className="app">
      <img src={cat} alt="cat" />
      <Title content="ts app" />
      <Text content={`${title} works`} />
      clicked {count}{' '}
      <button
        onClick={() => {
          updateCount(count + 1)
        }}
      >
        +1
      </button>
    </div>
  )
}

export default App
