import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('view-mode rendering', () => {
  it('renders display and inline maths with KaTeX', () => {
    const html = renderMarkdown('Lean of $w$:\n\n$$\ns(w,A,B)=x\n$$\n\nOn one line:\n\n$$d=\\frac{1}{2}$$')
    expect(html.match(/class="katex"/g)?.length).toBeGreaterThanOrEqual(3)
    expect(html).toContain('math-block')
    expect(html).not.toContain('$$')
  })

  it('leaves a placeholder for Mermaid diagrams', () => {
    const html = renderMarkdown('```mermaid\nflowchart LR\n  A --> B\n```')
    expect(html).toContain('class="mermaid-block"')
    expect(html).toContain('data-source="flowchart LR')
  })

  it('never renders raw HTML or javascript: links', () => {
    const html = renderMarkdown('<script>alert(1)</script> [x](javascript:alert(1)) <img src=x onerror=alert(1)>')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('href="javascript:')
  })

  it('opens external links in a new tab', () => {
    expect(renderMarkdown('[doi](https://doi.org/10.1/x)')).toContain('target="_blank"')
  })
})
