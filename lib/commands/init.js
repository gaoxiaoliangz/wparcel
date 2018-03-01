const path = require('path')
const { copyFileWithExistenceCheck, resolveProject, print } = require('../utils')

function init(argv) {
  if (argv.ts) {
    const result = copyFileWithExistenceCheck(
      path.resolve(__dirname, `../boilerplate/tsconfig.json`),
      resolveProject('tsconfig.json')
    )
    result && print.info('tsconfig.json is generated')
  } else {
    const filesToCopy = ['webpackDevServer.config.js', 'jellyweb.config.dev.js', 'jellyweb.config.prod.js']
    filesToCopy.forEach(filename => {
      const src = path.resolve(__dirname, `../boilerplate/${filename}`)
      const target = resolveProject(filename)
      copyFileWithExistenceCheck(src, target)
    })
  
    print.info('Config files have been created')
    print.log(`
Next step
1. Create a index.js in src folder
2. Create index.html in root, and include '/static/main.js' in script
3. run 'jellyweb serve'`)
  }
}

module.exports = init
