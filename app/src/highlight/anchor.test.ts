// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { findQuote, paintHighlights, quoteFromRange } from './anchor'

function root(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

const paint = (id: string, text: string, prefix = '', suffix = '') => ({ id, text, prefix, suffix, color: 'pink' })
const marked = (el: HTMLElement) => [...el.querySelectorAll('mark.hl')].map((m) => m.textContent)

describe('quoteFromRange', () => {
  it('quotes a selection across bold text, with context', () => {
    const el = root('<p>The detector <strong>flags biased</strong> rows quickly.</p>')
    const range = document.createRange()
    range.setStart(el.querySelector('p')!.firstChild!, 4)
    range.setEnd(el.querySelector('strong')!.firstChild!, 5)
    expect(quoteFromRange(el, range)).toEqual({ text: 'detector flags', prefix: 'The ', suffix: ' biased rows quickly.' })
  })

  it('trims surrounding whitespace and ignores empty selections', () => {
    const el = root('<p>one two</p>')
    const text = el.querySelector('p')!.firstChild!
    const range = document.createRange()
    range.setStart(text, 3)
    range.setEnd(text, 4)
    expect(quoteFromRange(el, range)).toBeNull()
  })
})

describe('findQuote', () => {
  it('uses the context to choose between repeats', () => {
    const text = 'bias in data. More bias in models.'
    expect(findQuote(text, { text: 'bias', prefix: 'More ', suffix: ' in models' })).toBe(19)
    expect(findQuote(text, { text: 'bias', prefix: '', suffix: ' in data' })).toBe(0)
    expect(findQuote(text, { text: 'fairness', prefix: '', suffix: '' })).toBe(-1)
  })
})

describe('paintHighlights', () => {
  it('wraps text inside one node and across elements', () => {
    const el = root('<p>Alpha beta</p>\n<p>gamma <em>delta</em> epsilon</p>')
    expect(paintHighlights(el, [paint('a', 'beta'), paint('b', 'gamma delta')])).toEqual([])
    expect(marked(el)).toEqual(['beta', 'gamma ', 'delta'])
    expect(el.querySelector('em mark')).not.toBeNull()
  })

  it('crosses paragraphs without marking the whitespace between them', () => {
    const el = root('<p>end of one</p>\n<p>start of two</p>')
    paintHighlights(el, [paint('a', 'one\nstart')])
    expect(marked(el)).toEqual(['one', 'start'])
  })

  it('reports quotes that are no longer there, and repaints cleanly', () => {
    const el = root('<p>Alpha beta</p>')
    expect(paintHighlights(el, [paint('a', 'beta'), paint('gone', 'zeta')])).toEqual(['gone'])
    paintHighlights(el, [paint('c', 'Alpha')])
    expect(marked(el)).toEqual(['Alpha'])
    expect(el.innerHTML).toBe('<p><mark class="hl" data-hl="c" style="background: pink;">Alpha</mark> beta</p>')
  })

  it('lets the first highlight keep an overlap', () => {
    const el = root('<p>one two three</p>')
    paintHighlights(el, [paint('a', 'one two'), paint('b', 'two three')])
    expect([...el.querySelectorAll('mark')].map((m) => [m.getAttribute('data-hl'), m.textContent])).toEqual([
      ['a', 'one two'],
      ['b', ' three'],
    ])
  })

  it('leaves maths alone', () => {
    const el = root('<p>x <span class="katex">beta</span> beta</p>')
    paintHighlights(el, [paint('a', 'beta')])
    expect(el.querySelector('.katex mark')).toBeNull()
    expect(marked(el)).toEqual(['beta'])
  })
})
