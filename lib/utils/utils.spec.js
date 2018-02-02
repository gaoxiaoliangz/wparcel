const { endsWith } = require('./index')

test('endsWith', () => {
  expect(endsWith('c', '[]')).toBe(false)
  expect(endsWith('ccc', '[]')).toBe(false)
  expect(endsWith('cccddd', 'ddd')).toBe(true)
})
