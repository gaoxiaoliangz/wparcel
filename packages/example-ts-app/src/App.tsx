import React, { useState, useEffect } from 'react'
import cat from './cat.gif'
import './App.scss'
import Text from './Text'
import Title from './Title'

interface AppProps {
  title: string
}

const App = ({ title }: AppProps) => {
  const [count, updateCount] = useState(0)
  useEffect(() => {
    // fullURL: 'https://www.zhihu.com/api/v4/mqtt/auth'
    const testURL = '/api/v4/mqtt/auth'

    fetch(testURL, {
      method: 'POST',
    })
      .then(res => {
        console.log('proxy works')
      })
      .catch(err => {
        console.log('proxy not working')
      })
  }, [])

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
