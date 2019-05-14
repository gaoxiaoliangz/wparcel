import path from 'path'
import { resolvePathInProject } from '../utils'

// 绝对路径的地址以 abs 结尾
export default {
  defaultHtmlFileAbs: path.resolve(__dirname, '../../static/index.html'),
  appCacheAbs: resolvePathInProject('./.cache'),
  appCacheStaticAbs: resolvePathInProject('./.cache/static'),
  appPublicAbs: resolvePathInProject('./public'),
}
