const fs = require('fs')
const path = require('path')
const { resolveApp } = require('../lib')
const { printErrorAndExit } = require('../lib/utils')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const exampleConfig = fs.readFileSync(path.join(__dirname, 'webpack.config.js'), {
  encoding: 'utf8'
})

function endsWith(str1, str2) {
  return str1.indexOf(str2) === str1.length - str2.length
}

function writeToDisc(dest) {
  if (fs.existsSync(dest)) {
    rl.question('File webpack.config.js already exists, please type in a different name:\n', input => {
      let input2 = input
      if (!endsWith(input, '.js')) {
        input2 = `${input}.js`
      }
      writeToDisc(resolveApp(input2))
    })
  } else {
    fs.writeFileSync(dest, exampleConfig, {
      encoding: 'utf8'
    })
    console.log('Config successfully written to:\n', dest)
    rl.close()
  }
}

try {
  writeToDisc(resolveApp('webpack.config.js'))
} catch (error) {
  printErrorAndExit(error)
}
