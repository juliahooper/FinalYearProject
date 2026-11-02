import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { parseBib, readingFieldsFromBib } from './bib'
import { addHighlight, addTag, removeHighlight, updateHighlight, updateListEntry, updateMarkdownFile } from './edit'
import { splitFrontMatter } from './frontmatter'
import type { Highlight, Tag } from './types'

const repo = join(__dirname, '../../..')
const read = (p: string) => readFileSync(join(repo, p), 'utf8')

describe('front matter edits', () => {
  it('changing stars changes only that line', () => {
    const before = read('readings/caliskan2017semantics.md')
    const after = updateMarkdownFile(before, { stars: 4 })
    const a = before.split('\n')
    const b = after.split('\n')
    expect(b.length).toBe(a.length)
    const changed = a.flatMap((line, i) => (line === b[i] ? [] : [[line, b[i]]]))
    expect(changed).toEqual([['stars: 0', 'stars: 4']])
  })

  it('lists stay in flow style', () => {
    const after = updateMarkdownFile(read('readings/caliskan2017semantics.md'), { tags: ['metrics', 'data-curation', 'impact-evaluation'] })
    expect(after).toMatch(/^tags: \[metrics, data-curation, impact-evaluation\]$/m)
    expect(splitFrontMatter<{ tags: string[] }>(after).data?.tags).toEqual(['metrics', 'data-curation', 'impact-evaluation'])
  })

  it('verifying sets both fields and keeps the body', () => {
    const before = read('readings/kumar2025detecting.md')
    const after = updateMarkdownFile(before, { verified: true, status: 'done' })
    expect(splitFrontMatter(after).body).toBe(splitFrontMatter(before).body)
    expect(after).toMatch(/^verified: true$/m)
    expect(after).toMatch(/^status: done$/m)
  })
})

describe('follow-up list edits', () => {
  it('marking one entry saved keeps comments and other entries', () => {
    const before = read('readings/follow-up.yml')
    const after = updateListEntry(before, 0, { status: 'saved', key: 'dearteaga2019bias' })
    expect(after).toContain('# Recommended follow-up readings')
    const list = parse(after) as { status: string; key: string }[]
    expect(list[0]).toMatchObject({ status: 'saved', key: 'dearteaga2019bias' })
    expect(list.length).toBe((parse(before) as unknown[]).length)
    expect(after.split('\n').length).toBe(before.split('\n').length)
  })
})

describe('tags', () => {
  it('a new tag gets the next unused pastel', () => {
    const text = read('tags.yml')
    const tags = parse(text) as Tag[]
    const { text: out, tag } = addTag(text, tags, 'Explainability')
    expect(tag).toMatchObject({ id: 'explainability', bg: '#E3F4F8' })
    expect((parse(out) as Tag[]).at(-1)).toEqual(tag)
    expect(out.startsWith(text.replace(/\n*$/, '\n'))).toBe(true)
  })

  it('rejects duplicates', () => {
    const text = read('tags.yml')
    expect(() => addTag(text, parse(text) as Tag[], 'Metrics')).toThrow()
  })
})

describe('highlights', () => {
  const h = (id: string): Highlight => ({ id, reading: 'mendu2025safer', tag: 'metrics', text: 'a "quoted"\npassage', prefix: 'before ', suffix: ' after', created: '2026-11-02', groups: ['metrics'], sections: [] })

  it('starts the file, then appends, updates and removes entries, keeping comments', () => {
    const first = addHighlight(undefined, h('h-1'))
    expect(parse(first)).toEqual([h('h-1')])
    expect(first).toContain('groups: [metrics]')
    expect(first.startsWith('# Passages highlighted')).toBe(true)
    const two = addHighlight(first, h('h-2'))
    expect((parse(two) as Highlight[]).map((x) => x.id)).toEqual(['h-1', 'h-2'])
    const updated = updateHighlight(two, 'h-2', { sections: ['evaluation', 'analysis'] })
    expect((parse(updated) as Highlight[])[1].sections).toEqual(['evaluation', 'analysis'])
    expect(updated).toContain('sections: [evaluation, analysis]')
    const removed = removeHighlight(updated, 'h-1')
    expect(removed.startsWith('# Passages highlighted')).toBe(true)
    expect((parse(removed) as Highlight[]).map((x) => x.id)).toEqual(['h-2'])
    expect(() => removeHighlight(removed, 'h-1')).toThrow()
  })
})

describe('references.bib', () => {
  const entries = parseBib(read('references.bib'))

  it('finds every entry', () => {
    const src = read('references.bib')
    expect(entries.length).toBe(src.match(/^@\w+\{/gm)?.length)
    expect(entries.map((e) => e.key)).toEqual(expect.arrayContaining(['caliskan2017semantics', 'kumar2025detecting', 'rajawat2024investigating']))
  })

  it('prefills the same metadata as the existing notes', () => {
    for (const e of entries.filter((x) => existsSync(join(repo, `readings/${x.key}.md`)))) {
      const note = splitFrontMatter<{ title: string; authors: string[]; year: number; doi: string }>(read(`readings/${e.key}.md`)).data!
      const f = readingFieldsFromBib(e)
      expect(f.authors).toEqual(note.authors)
      expect(f.year).toBe(note.year)
      expect(f.doi).toBe(note.doi)
      expect(f.title.toLowerCase()).toBe(note.title.toLowerCase())
    }
  })
})
