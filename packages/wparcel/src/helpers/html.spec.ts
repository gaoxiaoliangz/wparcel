import { parseHtml } from './html'

describe('parseHtml', () => {
  test('#1', () => {
    expect(parseHtml('abc')).toEqual({ ok: true })
  })
})
