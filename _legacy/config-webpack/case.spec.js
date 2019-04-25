const { splitChars } = require('./case')

test('test splitChars', () => {
  expect(splitChars('aaa_bb_cc')).toEqual(['aaa', 'bb', 'cc'])
  expect(splitChars('soWhatAa')).toEqual(['so', 'what', 'aa'])
  expect(splitChars('ExtractCss')).toEqual(['extract', 'css'])
  expect(splitChars('ExtractCssForAll')).toEqual(['extract', 'css', 'for', 'all'])
  expect(splitChars('it-is-good')).toEqual(['it', 'is', 'good'])
  
  // maybe later
  // expect(splitChars('aab_bb___cc')).toEqual(['aab', 'bb', 'cc'])
  // expect(splitChars('aacBBcc')).toEqual(['aac', 'B', 'Bcc'])
  // expect(splitChars('parseHTML')).toEqual(['parse', 'HTML'])
  // expect(splitChars('parseHTMLPlus')).toEqual(['parse', 'HTML', 'Plus'])
  // expect(splitChars('ExtractSCSSForAll')).toEqual(['extract', 'scss', 'for', 'all'])
})
