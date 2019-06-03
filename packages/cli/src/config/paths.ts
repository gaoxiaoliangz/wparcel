import { resolvePathInProject } from '../utils'

export default {
  // TODO: 无用
  appPublic: resolvePathInProject('./public'),
  appSrc: resolvePathInProject('./src'),
  appTsConfig: resolvePathInProject('./tsconfig.json'),
  appNodeModules: resolvePathInProject('node_modules'),
  appPackageJson: resolvePathInProject('./package.json'),
}

const folders = {
  assets: 'static',
}

export { folders }
