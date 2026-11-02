import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { dashboard, GAP_BELOW, nextDeadline } from './dashboard'
import { build } from './repo'
import type { RawFile } from './types'

const repo = join(__dirname, '../../..')
const files = new Map<string, RawFile>()
const add = (p: string) => files.set(p, { path: p, sha: 'sha', text: readFileSync(join(repo, p), 'utf8') })
for (const f of readdirSync(join(repo, 'readings')).filter((x) => x.endsWith('.md'))) add(`readings/${f}`)
for (const f of readdirSync(join(repo, 'decisions')).filter((x) => x.endsWith('.md'))) add(`decisions/${f}`)
;['tags.yml', 'readings/follow-up.yml', 'references.bib'].forEach(add)
const data = build(files)
const d = dashboard(data, new Date('2026-11-02'))

describe('dashboard', () => {
  it('counts down to the interim report until its due date, then the final', () => {
    expect(nextDeadline(new Date('2026-11-02'))).toMatchObject({ report: 'interim', days: 4 })
    expect(nextDeadline(new Date('2026-11-06'))).toMatchObject({ report: 'interim', days: 0 })
    expect(nextDeadline(new Date('2026-11-07'))?.report).toBe('final')
    expect(nextDeadline(new Date('2027-04-08'))).toBeNull()
  })

  it('reading counts add up', () => {
    const s = d.readings.byStatus
    expect(s.done + s['in-progress'] + s['to-read']).toBe(data.readings.length)
    expect(s.done).toBe(data.readings.filter((r) => r.meta.verified).length)
  })

  it('decision counts add up by group and overall', () => {
    expect(d.decisions.groups.reduce((n, g) => n + g.total, 0)).toBe(data.decisions.length)
    expect(d.decisions.decided + d.decisions.exploring + d.decisions.open).toBe(data.decisions.length)
  })

  it('flags gaps only in the next report', () => {
    for (const s of d.sections) expect(s.gap).toBe(s.inNextReport && s.count < GAP_BELOW)
    expect(d.sections.find((s) => s.id === 'analysis')?.gap).toBe(false) // final only
  })

  it('star counts cover every reading', () => {
    expect(d.stars.reduce((n, s) => n + s.count, 0)).toBe(data.readings.length)
  })

  it('lists Zotero papers without a note', () => {
    const have = new Set(data.readings.map((r) => r.meta.key))
    const keys = [...files.get('references.bib')!.text.matchAll(/^@\w+\{([^,]+),/gm)].map((m) => m[1])
    expect(d.todo.bibWithoutNote.sort()).toEqual(keys.filter((k) => !have.has(k)).sort())
  })
})
