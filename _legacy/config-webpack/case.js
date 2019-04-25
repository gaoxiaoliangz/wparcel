const isCap = char => char.length === 1 && char >= 'A' && char <= 'Z'

const capFirst = str => {
  return Array.from(str)
    .map((char, index) => {
      if (index === 0) {
        return char.toUpperCase()
      }
      return char
    })
    .join('')
}

exports.capFirst = capFirst

const splitChars = str => {
  if (str !== '' && !str) {
    return ''
  }
  const chars = Array.from(str)
    .map((char, index) => {
      if (index === 0 && isCap(char)) {
        return char.toLowerCase()
      }
      return char
    })

  if (chars.some(char => char === '-')) {
    return chars.join('').split('-')
  }

  if (chars.some(char => char === '_')) {
    return chars.join('').split('_')
  }

  let parts = []
  let currentPart = []
  chars.forEach((char, index) => {
    const nextChar = chars[index + 1]
    if (nextChar && ((nextChar !== '_' && (isCap(nextChar) !== isCap(char))) || (nextChar === '_' && char !== '_'))) {
      currentPart.push(char)
      parts.push(currentPart)
      currentPart = []
    } else if (char !== '_') {
      currentPart.push(char)
    }
    if (index === chars.length - 1) {
      parts.push(currentPart)
    }
  })
  parts = parts.map(part => part.join(''))
  const half = Math.ceil(parts.length / 2)
  const finalParts = []
  for (let i = 0; i < half; i++) {
    if (i === 0) {
      finalParts.push(parts[0])
    } else {
      const index = (i * 2) - 1
      finalParts.push([parts[index], parts[index + 1]].filter(Boolean).join(''))
    }
  }
  return finalParts.map(part => part.toLowerCase())
}

exports.splitChars = splitChars

// lodash has it, so...
exports.toCamelCase = str => {
  return str
}

exports.toPascalCase = str => {
  return str
}

exports.toSnakeCase = str => {
  return str
}

