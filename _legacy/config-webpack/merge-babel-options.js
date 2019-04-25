const _ = require('lodash')

const indexOf = (arr, elm) => {
  const elm1 = Array.isArray(elm) ? elm[0] : elm
  const arr1 = arr.map(elm => {
    return Array.isArray(elm) ? elm[0] : elm
  })
  return arr1.indexOf(elm1)
}

const getConfig = elm => {
  return (Array.isArray(elm) && elm[1]) || {}
}

const getConfigName = elm => {
  return Array.isArray(elm) ? elm[0] : elm
}

const mergeConfigArr = (arr1 = [], arr2 = []) => {
  const arr2Copy = [...arr2]
  const result = []
  for (const elm of arr1) {
    const indexInArr2 = indexOf(arr2Copy, elm)
    if (indexInArr2 !== -1) {
      const elm2Config = getConfig(arr2Copy[indexInArr2])
      const elmConfig = getConfig(elm)
      result.push([getConfigName(elm), Object.assign({}, elmConfig, elm2Config)])
      arr2Copy.splice(indexInArr2, 1)
    } else {
      result.push(elm)
    }
  }
  return [...result, ...arr2Copy]
}

const mergeBabelOptions = (obj1, obj2) => {
  const obj = _.cloneDeep(obj1)
  return _.mergeWith(obj, obj2, (a, b) => {
    if (Array.isArray(a) || Array.isArray(b)) {
      return mergeConfigArr(a, b)
    }
  })
}

exports.mergeConfigArr = mergeConfigArr
exports.mergeBabelOptions = mergeBabelOptions
