import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../render/markdown'
import { sectionNeeds } from './sectionNeeds'

const read = (p: string) => ({ path: p, sha: '', text: readFileSync(join(__dirname, '../../..', p), 'utf8') })

describe('What this section needs', () => {
  it('reads the comment block of an interim section', () => {
    const needs = sectionNeeds(read('paper/interim/sections/work-to-date.tex'))!
    expect(needs.heading).toContain('WORK TO DATE')
    expect(needs.markdown).toContain('"provided evidence of work done to date"')
    expect(needs.markdown).not.toContain('INTERIM REPORT section')
    expect(needs.markdown).not.toContain('Notes: paper/notes')
    expect(needs.markdown).not.toContain('\\todo')
  })

  it('joins wrapped lines into whole bullets', () => {
    const needs = sectionNeeds(read('paper/final/sections/methodology.tex'))!
    const html = renderMarkdown(needs.markdown)
    expect(html).toContain('<li>Practical considerations: feasibility, time and resources.</li>')
  })
})
