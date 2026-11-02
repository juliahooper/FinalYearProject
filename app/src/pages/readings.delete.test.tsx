// @vitest-environment jsdom
// The Delete reading button: confirms, saves the linked files, deletes the reading, goes to the list.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { build } from '../data/repo'
import type { RawFile } from '../data/types'
import { Readings } from './Readings'

const repo = join(__dirname, '../../..')
const files = new Map<string, RawFile>()
const add = (p: string) => files.set(p, { path: p, sha: 'sha-' + p, text: readFileSync(join(repo, p), 'utf8') })
for (const f of readdirSync(join(repo, 'readings')).filter((x) => x.endsWith('.md'))) add(`readings/${f}`)
for (const f of readdirSync(join(repo, 'decisions')).filter((x) => x.endsWith('.md'))) add(`decisions/${f}`)
;['tags.yml', 'readings/follow-up.yml', 'references.bib'].forEach(add)
const data = build(files)
const calls: string[] = []
const save = vi.fn(async (path: string) => void calls.push(`save ${path}`))
const remove = vi.fn(async (path: string) => void calls.push(`delete ${path}`))

vi.mock('../data/RepoContext', () => ({
  useRepo: () => ({ data, loading: false, progress: null, error: null, reload: async () => {}, save, remove }),
}))
vi.mock('../data/cache', () => ({ getDraft: async () => undefined, setDraft: async () => {}, clearDraft: async () => {} }))

beforeAll(() => {
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as never
})

let container: HTMLDivElement
let location = ''
afterEach(() => container?.remove())

function Where() {
  const l = useLocation()
  useEffect(() => {
    location = l.pathname
  }, [l])
  return null
}

async function render(url: string) {
  container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[url]}>
        <Where />
        <Routes>
          <Route path="readings" element={<Readings />} />
          <Route path="readings/:key/edit" element={<Readings />} />
        </Routes>
      </MemoryRouter>,
    )
  })
  // The editor loads on demand; wait until its Delete button is there.
  for (let i = 0; i < 100 && !findButton(container); i++) await act(async () => new Promise((r) => setTimeout(r, 20)))
  return container
}

const findButton = (c: HTMLElement) => [...c.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent === 'Delete reading')
const button = (c: HTMLElement) => findButton(c)!

describe('Delete reading', () => {
  it('does nothing if you cancel', async () => {
    calls.length = 0
    window.confirm = vi.fn(() => false)
    const c = await render('/readings/mendu2025safer/edit')
    await act(async () => button(c).click())
    expect(window.confirm).toHaveBeenCalled()
    expect(calls).toEqual([])
  })

  it('unlinks first, deletes the reading last, then goes back to the list', async () => {
    calls.length = 0
    window.confirm = vi.fn(() => true)
    const c = await render('/readings/mendu2025safer/edit')
    await act(async () => button(c).click())
    for (let i = 0; i < 5; i++) await act(async () => new Promise((r) => setTimeout(r, 10)))
    const linked = data.decisions.filter((d) => d.meta.readings.includes('mendu2025safer')).map((d) => `save ${d.path}`)
    expect(calls.slice(0, linked.length)).toEqual(linked)
    expect(calls).toContain('save readings/follow-up.yml')
    expect(calls.at(-1)).toBe('delete readings/mendu2025safer.md')
    expect(location).toBe('/readings')
  })
})
