const nodeExternals = require('webpack-node-externals')

const makeCommonjs2External = pkgName => ({
  [pkgName]: {
    commonjs2: pkgName,
  },
})

exports.makeCommonjs2External = makeCommonjs2External

const iotBIExternals = ({ useNodeExternals = true } = {}) => {
  return [
    ...(useNodeExternals ? [nodeExternals()] : []),
    {
      ...makeCommonjs2External('lodash'),
      ...makeCommonjs2External('element-ui'),
      ...makeCommonjs2External('echarts'),
      ...makeCommonjs2External('vue'),
      ...makeCommonjs2External('mathjs'),
      ...makeCommonjs2External('mathjs/core'),
      ...makeCommonjs2External('@iot-bi/core'),
      ...makeCommonjs2External('@iot-bi/component-widget-renderer'),
    },
    (context, request, callback) => {
      if (/^@iot-bi\/core\/lib\/\S+$/.test(request)) {
        return callback(null, 'commonjs2 ' + request)
      }
      if (/^mathjs\/lib\/\S+$/.test(request)) {
        return callback(null, 'commonjs2 ' + request)
      }
      callback()
    },
  ]
}

exports.iotBIExternals = iotBIExternals
