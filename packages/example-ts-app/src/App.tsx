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
    // TODO: 这个接口会 301，postman 里面请求不会，和 proxy-middleware 设置有关？
    // const testURL = '/api/v4/mqtt/auth'
    // const testURL = '/api/login/'
    // const testURL =
    //   'http://www.zhihu.com/api/v4/answers/704626001/root_comments?order=normal&limit=20&offset=0&status=open'
    const testURL =
      '/api/v4/answers/704626001/root_comments?order=normal&limit=20&offset=0&status=open'

    fetch(testURL, {
      // method: 'POST',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      // body: JSON.stringify({
      //   email: 'admin',
      //   password: '123456',
      // }),
    })
      .then(res => {
        if (res.status !== 404) {
          return console.log('proxy works')
        }
        throw res
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
