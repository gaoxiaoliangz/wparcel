const getBaseConfig = require('../lib/get-base-config')

const config = getBaseConfig({
  features: {
    react: true,
    babel: true,
    sass: true
  }
})

console.log(config)
