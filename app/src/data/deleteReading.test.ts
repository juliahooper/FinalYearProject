import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { describeDelete, planDeleteReading } from './deleteReading'
import { build } from './repo'
import type { FollowUp, Highlight, RawFile } from './types'

const repo = join(__dirname, '../../..')
const files = new Map<string, RawFile>()
const add = (p: string, text = readFileSync(join(repo, p), 'utf8')) => files.set(p, { path: p, sha: 'sha', text })
for (const f of readdirSync(join(repo, 'readings')).filter((x) => x.endsWith('.md'))) add(`readings/${f}`)
for (const f of readdirSync(join(repo, 'decisions')).filter((x) => x.endsWith('.md'))) add(`decisions/${f}`)
add('readings/follow-up.yml')
add('tags.yml')
add(
  'highlights.yml',
  [
    '# Highlighted passages of readings',
    '- id: h-1',
    '  reading: mendu2025safer',
    '  tag: metrics',
    '  text: "Toxic content"',
    '  prefix: ""',
    '  suffix: ""',
    '  created: 2026-11-02',
    '  groups: [metrics]',
    '  sections: []',
    '- id: h-2',
    '  reading: caliskan2017semantics',
    '  tag: metrics',
    '  text: "WEAT"',
    '  prefix: ""',
    '  suffix: ""',
    '  created: 2026-11-02',
    '  groups: []',
    '  sections: [background]',
    '',
  ].join('\n'),
)
const data = build(files)

describe('deleting a reading', () => {
  const plan = planDeleteReading(data, 'mendu2025safer')

  it('deletes the reading file', () => {
    expect(plan.path).toBe('readings/mendu2025safer.md')
  })

  it('unlinks it from every decision that listed it, and only those', () => {
    const listing = data.decisions.filter((d) => d.meta.readings.includes('mendu2025safer')).map((d) => d.path)
    expect(plan.decisions.length).toBe(listing.length)
    for (const p of listing) {
      const u = plan.updates.find((x) => x.path === p)!
      expect(u.text).not.toContain('mendu2025safer')
      const before = files.get(p)!.text.split('\n')
      const changed = u.text.split('\n').filter((l, i) => l !== before[i])
      expect(changed).toHaveLength(1)
      expect(changed[0]).toMatch(/^readings: \[/)
    }
  })

  it('keeps the follow-ups it recommended, with the source marked as deleted', () => {
    const u = plan.updates.find((x) => x.path === 'readings/follow-up.yml')!
    const after = parse(u.text) as FollowUp[]
    const before = parse(files.get('readings/follow-up.yml')!.text) as FollowUp[]
    expect(after.length).toBe(before.length)
    expect(after.some((f) => f.found_in.some((s) => s.source === 'mendu2025safer'))).toBe(false)
    expect(after.filter((f) => f.found_in.some((s) => s.source === 'external: mendu2025safer (deleted reading)')).length).toBe(plan.followUps)
    expect(plan.followUps).toBeGreaterThan(0)
    expect(u.text).toContain('# Recommended follow-up readings') // comments kept
  })

  it('removes only its highlights', () => {
    const u = plan.updates.find((x) => x.path === 'highlights.yml')!
    expect((parse(u.text) as Highlight[]).map((h) => h.id)).toEqual(['h-2'])
    expect(plan.highlights).toBe(1)
  })

  it('leaves nothing pointing at the deleted reading', () => {
    for (const u of plan.updates) {
      // Only the "deleted reading" markers, free-text notes and comments may still mention it.
      const refs = u.text.split('\n').filter((l) => l.includes('mendu2025safer') && !l.includes('(deleted reading)') && !/^\s*(notes:|#)/.test(l))
      expect(refs).toEqual([])
    }
  })

  it('marks the follow-up that led to it as skipped', () => {
    const before = parse(files.get('readings/follow-up.yml')!.text) as FollowUp[]
    const i = before.findIndex((f) => f.key === 'mendu2025safer')
    expect(i).toBeGreaterThanOrEqual(0)
    const after = parse(plan.updates.find((x) => x.path === 'readings/follow-up.yml')!.text) as FollowUp[]
    expect(after[i]).toMatchObject({ status: 'skipped', key: '' })
  })

  it('explains what will happen', () => {
    const text = describeDelete('Towards Safer Pretraining', plan)
    expect(text).toContain('Delete “Towards Safer Pretraining”?')
    expect(text).toContain(plan.decisions.join(', '))
    expect(text).toContain('1 highlight')
    expect(text).toContain('Zotero')
  })

  it('a reading nothing points at only deletes its own file', () => {
    const p = planDeleteReading(data, 'rajawat2024investigating')
    expect(p.updates.map((u) => u.path).filter((x) => x.startsWith('decisions/'))).toEqual([])
  })
})
