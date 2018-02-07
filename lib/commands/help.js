const _ = require('lodash')
const print = require('../utils/print')
const { capFirstLetter } = require('../utils')
const features = require('../config-webpack/features')

const nameMap = {
  ESLint: 'eslint',
  GraphQL: 'graphql',
  Md5Hash: 'md5-hash'
}

const getType = val => {
  if (val instanceof RegExp) {
    return 'RegExp'
  }
  if (typeof val === 'string') {
    return 'String'
  }
  if (Array.isArray(val)) {
    return 'Array'
  }
  if (typeof val === 'function') {
    return 'Function'
  }
  return capFirstLetter(typeof val)
}

const indent = (size, char = ' ') => line => {
  return _.times(size, () => char).join('') + line
}

const processConfig = config => {
  if (_.isEmpty(config)) {
    return ['Not configurable', '']
  }
  return _.flattenDeep(Object.keys(config).map(k => {
    let content = config[k]
    const type = getType(content)
    try {
      content = _.isEmpty(content) ? content.toString() : JSON.stringify(content)
    } catch (error) {
      content = 'null'
    }
    content = indent(2)(`default: ${content}`)

    return [
      `${k}(${type})`,
      content,
      ''
    ]
  }))
}

const featuresDoc = Object.keys(features)
  .filter(f => !['Feature'].includes(f))
  .map(f => {
    return [
      `${nameMap[f] || _.kebabCase(f)}: ${features[f].desc || ''}`,
      processConfig(features[f].defaultConfig || {}).map(indent(2)),
    ]
  })

const commandsDoc = [
  '--version, -v       show version',
  '--help, -h          show help',
  'init                init project',
  'init --ts           generate tsconfig.json',
  'serve               start webpack dev server',
  'build               build assets',
  'run                 run jellyweb tasks',
]

const doc = [
  'Commands',
  '',
  ...commandsDoc.map(indent(2)),
  '',
  '',
  'Features & their default config',
  '',
  ..._.flattenDeep(featuresDoc).map(indent(2))
]
  .map(line => line + '\n')
  .join('')

const help = () => {
  print.log(doc)
}

module.exports = help
