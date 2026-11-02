// @vitest-environment jsdom
// Smoke test: the Dashboard and Guide with the repo's real files (no GitHub calls).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { build } from '../data/repo'
import type { RawFile } from '../data/types'
import { Dashboard } from './Dashboard'
import { Guide, headings } from './Guide'

const repo = join(__dirname, '../../..')
const files = new Map<string, RawFile>()
const add = (p: string) => files.set(p, { path: p, sha: 'sha-' + p, text: readFileSync(join(repo, p), 'utf8') })
for (const f of readdirSync(join(repo, 'readings')).filter((x) => x.endsWith('.md'))) add(`readings/${f}`)
for (const f of readdirSync(join(repo, 'decisions')).filter((x) => x.endsWith('.md'))) add(`decisions/${f}`)
for (const f of readdirSync(join(repo, 'docs'))) add(`docs/${f}`)
;['tags.yml', 'readings/follow-up.yml', 'references.bib'].forEach(add)
const data = build(files)
const recent = vi.fn(async () => [
  { sha: 'a1', message: 'app: update readings/caliskan2017semantics.md', date: new Date().toISOString() },
  { sha: 'b2', message: 'chore: update status [skip ci]', date: '2026-10-30T10:00:00Z' },
])

vi.mock('../data/RepoContext', () => ({
  useRepo: () => ({ data, loading: false, progress: null, error: null, reload: async () => {}, save: async () => {}, remove: async () => {}, recent }),
}))

beforeAll(() => {
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as never
  Element.prototype.scrollIntoView = () => {}
})

let container: HTMLDivElement
afterEach(() => container?.remove())

async function render(url: string) {
  container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="guide" element={<Guide />} />
        </Routes>
      </MemoryRouter>,
    )
  })
  for (let i = 0; i < 10; i++) await act(async () => new Promise((r) => setTimeout(r, 20)))
  return container
}

describe('Dashboard', () => {
  it('shows the countdown, counts, charts, to-do list and recent edits', async () => {
    const c = await render('/')
    expect(c.querySelector('h1.page-title')?.textContent).toBe('Dashboard')
    expect(c.querySelectorAll('.stat').length).toBe(4)
    expect(c.textContent).toContain(`${data.readings.length} / 30`)
    expect(c.querySelector('.stacked-track')?.getAttribute('aria-label')).toMatch(/target 30/)
    expect(c.querySelectorAll('.dash-table tbody tr').length).toBe(8)
    expect(c.querySelectorAll('.bars').length).toBe(3)
    expect(c.textContent).toContain('Gap')
    expect(c.textContent).toContain('decisions not decided yet')
    expect(c.textContent).toContain('app: update readings/caliskan2017semantics.md')
    expect(c.textContent).toContain('just now')
  })
})

describe('Guide', () => {
  it('builds a table of contents from the headings, skipping code blocks', () => {
    const h = headings('## One\ntext\n```\n## not a heading\n```\n### Two **bold**\n## One')
    expect(h).toEqual([
      { level: 2, text: 'One', id: 'one' },
      { level: 3, text: 'Two bold', id: 'two-bold' },
      { level: 2, text: 'One', id: 'one-2' },
    ])
  })

  it('shows the reading workflow with contents, heading anchors and copy buttons', async () => {
    const c = await render('/guide')
    expect(c.querySelector('h1.page-title')?.textContent).toBe('Guide')
    const toc = [...c.querySelectorAll('.guide-toc a')].map((a) => a.getAttribute('href'))
    expect(toc.length).toBeGreaterThan(3)
    for (const href of toc) expect(document.getElementById(href!.slice(1))).toBeTruthy()
    expect(c.querySelectorAll('.copy-btn').length).toBeGreaterThan(0)
    expect(c.textContent).toContain('Summarise the reading')
  })

  it('switches to the app guide', async () => {
    const c = await render('/guide?doc=using-the-app')
    expect(c.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe('Using the app')
    expect(c.textContent).toContain('Sign in')
  })
})
