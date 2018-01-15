const print = require('../utils/print')

const help = () => {
  print.log([
    '--version, -v       show version\n',
    '--help, -h          show help\n',
    'init                init project\n',
    'init --ts           generate tsconfig.json\n',
    'serve               start webpack dev server\n',
    'build               build assets\n',
    'run                 run jellyweb tasks',
  ].join(''))
}

module.exports = help
