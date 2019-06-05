const proxy = require('http-proxy-middleware')

const target = 'http://www.zhihu.com'

module.exports = app => {
  app.use(proxy('/api', { target, changeOrigin: true }))
}
