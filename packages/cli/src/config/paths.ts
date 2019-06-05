import { resolvePathInProject } from '../utils'

export default {
  appPublic: resolvePathInProject('./public'),
  appSrc: resolvePathInProject('./src'),
  appTsConfig: resolvePathInProject('./tsconfig.json'),
  appNodeModules: resolvePathInProject('node_modules'),
  appPackageJson: resolvePathInProject('./package.json'),
  proxySetup: resolvePathInProject('setupProxy.js'),
}

const folders = {
  assets: 'static',
}

export { folders }
