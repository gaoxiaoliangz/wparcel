// injected into the application via DefinePlugin in Webpack configuration

function getAppEnvironment(isDebug, isBrowser) {
  const raw = {
    __BROWSER__: isBrowser,
    __DEV__: isDebug
  }

  if (isBrowser) {
    raw['process.env.NODE_ENV'] = isDebug ? 'development' : 'production'
  }

  const stringified = Object.keys(raw)
    .reduce((config, key) => {
      config[key] = JSON.stringify(raw[key]) // eslint-disable-line
      return config
    }, {})

  return { raw, stringified }
}

export default getAppEnvironment
