import path from 'path'
import { resolvePathInProject } from '../utils'

// TODO: paths 下的都改为绝对路径
// 绝对路径的地址以 abs 结尾
export default {
  assetFolder: 'static',
  templatesAbs: path.resolve(__dirname, '../../templates'),
  // 暂时没什么用，先留着
  // appCacheAbs: resolvePathInProject('./.cache'),
  appPublicAbs: resolvePathInProject('./public'),
  appSrcAbs: resolvePathInProject('./src'),
  appTsConfigAbs: resolvePathInProject('./tsconfig.json'),
  appNodeModules: resolvePathInProject('node_modules'),
}
