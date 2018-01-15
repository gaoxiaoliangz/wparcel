function stringifyEnv(raw) {
  return Object.keys(raw)
    .reduce((config, key) => {
      config[key] = JSON.stringify(raw[key])
      return config
    }, {})
}

module.exports = stringifyEnv
