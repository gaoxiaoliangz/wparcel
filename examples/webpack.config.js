const getBaseConfig = require('../lib/get-base-config')

const config = getBaseConfig({
  features: {
    react: {
      reactyes: 1
    },
    babel: {
      reactyes: 0,
      other: 2
    },
    sass: true,
    postcss: true
  }
})

// console.log(config)
