import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { parseBib, readingFieldsFromBib } from './bib'
import { addTag, updateListEntry, updateMarkdownFile } from './edit'
import { splitFrontMatter } from './frontmatter'
import type { Tag } from './types'

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
    const after = updateMarkdownFile(before, { verified: true, status: 'verified' })
    expect(splitFrontMatter(after).body).toBe(splitFrontMatter(before).body)
    expect(after).toMatch(/^verified: true$/m)
    expect(after).toMatch(/^status: verified$/m)
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
