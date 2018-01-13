const help = () => {
  console.log(`--version, -v       show version
--help, -h          show help
init                init project
init --ts           generate tsconfig.json
serve               start webpack dev server
build               build assets
run                 run jellyweb tasks`)
}

module.exports = help
