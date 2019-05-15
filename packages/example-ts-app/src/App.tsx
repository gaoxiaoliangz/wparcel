import React from 'react'
import cat from './cat.gif'

interface AppProps {
  title: string
}

const App = ({ title }: AppProps) => {
  return (
    <div>
      <img src={cat} alt="cat" />
      <p>{title} works</p>
    </div>
  )
}

export default App
