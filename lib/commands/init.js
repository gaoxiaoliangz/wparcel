const path = require('path')
const { copyFileWithExistenceCheck, resolveProject } = require('../utils')

function init(argv) {
  if (argv.ts) {
    const result = copyFileWithExistenceCheck(
      path.resolve(__dirname, `../boilerplate/tsconfig.json`),
      resolveProject('tsconfig.json')
    )
    result && console.log('tsconfig.json is generated')
  } else {
    const filesToCopy = ['dev-server.config.js', 'webpack.config.js']
    filesToCopy.forEach(filename => {
      const src = path.resolve(__dirname, `../boilerplate/${filename}`)
      const target = resolveProject(filename)
      copyFileWithExistenceCheck(src, target)
    })
  
    console.info('\nInit complete')
    console.info(`
    Next
    1. Create a index.js in src folder
    2. Create index.html in root, and include '/static/main.js' in script
    3. run 'jellyweb serve'
  `)
  }
}

module.exports = init
