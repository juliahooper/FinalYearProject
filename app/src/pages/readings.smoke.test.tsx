// @vitest-environment jsdom
// Smoke test: render the Readings screens with the repo's real files (no GitHub calls).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { parse } from 'yaml'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { build } from '../data/repo'
import type { RawFile } from '../data/types'
import { highlightsFile } from './highlights.fixture'
import { Readings } from './Readings'

const repo = join(__dirname, '../../..')
const files = new Map<string, RawFile>()
const add = (p: string) => files.set(p, { path: p, sha: 'sha-' + p, text: readFileSync(join(repo, p), 'utf8') })
for (const f of readdirSync(join(repo, 'readings')).filter((x) => x.endsWith('.md'))) add(`readings/${f}`)
for (const f of readdirSync(join(repo, 'decisions')).filter((x) => x.endsWith('.md'))) add(`decisions/${f}`)
;['tags.yml', 'readings/follow-up.yml', 'references.bib', 'ai-use.md'].forEach(add)
files.set('highlights.yml', highlightsFile)
// The verify test needs one unverified reading with an undated ai-use.md row, whatever the
// repo's current state, so rajawat2024investigating is reset to that here.
const rajawat = 'readings/rajawat2024investigating.md'
files.get(rajawat)!.text = files.get(rajawat)!.text.replace(/^verified: true$/m, 'verified: false').replace(/^status: done$/m, 'status: to-read')
files.get('ai-use.md')!.text = files
  .get('ai-use.md')!
  .text.split('\n')
  .map((l) => (l.includes(rajawat) ? l.replace(/\|\s*[\d-]+\s*\|\s*$/, '| |') : l))
  .join('\n')
const data = build(files)
const save = vi.fn(async () => {})

vi.mock('../data/RepoContext', () => ({
  useRepo: () => ({ data, loading: false, progress: null, error: null, reload: async () => {}, save }),
}))
vi.mock('mermaid', () => ({ default: { initialize: () => {}, render: async () => ({ svg: '<svg data-test="diagram"></svg>' }) } }))
vi.mock('../data/cache', () => ({ getDraft: async () => undefined, setDraft: async () => {}, clearDraft: async () => {} }))

beforeAll(() => {
  // jsdom lacks matchMedia, which the theme detection uses.
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as never
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
          <Route path="readings" element={<Readings />} />
          <Route path="readings/new" element={<Readings />} />
          <Route path="readings/:key" element={<Readings />} />
          <Route path="readings/:key/edit" element={<Readings />} />
        </Routes>
      </MemoryRouter>,
    )
  })
  // Let lazy imports, effects and diagram rendering settle.
  for (let i = 0; i < 20; i++) await act(async () => new Promise((r) => setTimeout(r, 25)))
  return container
}

describe('Readings screens', () => {
  it('lists the readings with a count', async () => {
    const c = await render('/readings')
    expect(c.textContent).toContain(`${data.readings.length} readings`)
    expect(c.querySelectorAll('.list-pane .list-item').length).toBe(data.readings.length)
  })

  it('filters by tag from the URL', async () => {
    const c = await render('/readings?tags=data-curation')
    const n = data.readings.filter((r) => r.meta.tags.includes('data-curation')).length
    expect(c.textContent).toContain(`${n} reading${n === 1 ? '' : 's'} · 1 filter`)
  })

  it('searches the summaries and highlights matches', async () => {
    const c = await render('/readings?q=GloVe')
    expect(c.textContent).toContain('1 reading')
    expect(c.querySelector('.list-pane mark, .list-pane .item-title')).toBeTruthy()
  })

  it('shows a status heart beside each title in the list', async () => {
    const c = await render('/readings')
    const hearts = [...c.querySelectorAll('.list-pane .item-title .status-heart')]
    expect(hearts).toHaveLength(data.readings.length)
    const caliskan = c.querySelector('.list-pane a[href^="/readings/caliskan2017semantics"] .status-heart')
    expect(caliskan?.getAttribute('aria-label')).toBe('Done')
  })

  it('shows a reading with maths, diagrams and chips, and no unverified banner', async () => {
    const c = await render('/readings/caliskan2017semantics')
    expect(c.querySelector('.reading-title')?.textContent).toContain('Semantics Derived Automatically')
    expect(c.textContent).not.toContain('Unverified')
    expect(c.textContent).not.toContain('Mark as verified')
    expect(c.querySelectorAll('.markdown h2').length).toBeGreaterThan(5)
    expect(c.querySelectorAll('.katex').length).toBeGreaterThan(5)
    expect(c.querySelector('[data-test="diagram"]')).toBeTruthy()
    expect(c.querySelector('a.chip[href="/decisions/DET-01"]')).toBeTruthy()
    expect(c.textContent).toContain('Follow-up readings recommended here')
  })

  it('paints highlights in their tag colour, and lists ones that no longer match', async () => {
    const c = await render('/readings/mendu2025safer')
    const mark = c.querySelector<HTMLElement>('.markdown mark.hl[data-hl="h-1"]')!
    expect(mark.textContent).toBe('the closest existing tool')
    expect(mark.style.background).toBe('rgb(252, 228, 238)') // metrics, #FCE4EE
    expect(c.textContent).toContain('One highlight no longer matches')
    expect(c.textContent).toContain('words that were edited away')
    await act(async () => mark.click())
    expect(c.querySelector('.hl-toolbar')?.textContent).toContain('A note on: Detector · Methodology')
  })

  it('selecting text, choosing a tag and adding it as a note saves highlights.yml', async () => {
    save.mockClear()
    const c = await render('/readings/mendu2025safer')
    const strong = [...c.querySelectorAll('.markdown strong')].find((s) => s.textContent === 'Analogy:')!
    const text = strong.nextSibling as Text
    const range = document.createRange()
    range.setStart(text, 3)
    range.setEnd(text, 23)
    window.getSelection()!.removeAllRanges()
    window.getSelection()!.addRange(range)
    await act(async () => c.querySelector('.highlightable')!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })))
    const toolbar = c.querySelector('.hl-toolbar')!
    expect(toolbar.textContent).toContain('Highlight as')
    const tagButton = [...toolbar.querySelectorAll<HTMLButtonElement>('.hl-tag-btn')][0]
    const tag = data.readings.find((r) => r.meta.key === 'mendu2025safer')!.meta.tags[0]
    await act(async () => tagButton.click())
    const dialog = c.querySelector('dialog')!
    expect(dialog.textContent).toContain('Add this as a note?')
    const ticked = [...dialog.querySelectorAll<HTMLInputElement>('input:checked')].map((i) => i.parentElement!.textContent)
    expect(ticked.length).toBeGreaterThan(0)
    const add = [...dialog.querySelectorAll('button')].find((b) => b.textContent === 'Add note')!
    await act(async () => add.click())
    const [path, out] = save.mock.calls[0] as unknown as [string, string]
    expect(path).toBe('highlights.yml')
    const entry = (parse(out) as { reading: string; tag: string; text: string; sections: string[] }[]).at(-1)!
    expect(entry).toMatchObject({ reading: 'mendu2025safer', tag, text: text.data.slice(3, 23).trim() })
    expect(entry.sections.length).toBeGreaterThan(0)
  })

  it('opens the editor with metadata controls and the toolbar', async () => {
    const c = await render('/readings/kumar2025detecting/edit')
    expect(c.querySelector('.toolbar')).toBeTruthy()
    expect(c.querySelector('.ProseMirror')?.textContent).toContain('Knowledge Graph-Augmented Training')
    expect(c.querySelector('#found-via')).toBeTruthy()
    expect(c.textContent).toContain('Save')
  })

  it('shows To read next grouped by priority', async () => {
    const c = await render('/readings?view=next')
    expect(c.textContent).toContain('High priority')
    const firstHigh = data.followUps.find((f) => f.status === 'suggested' && f.priority === 'high')!
    expect(c.textContent).toContain(firstHigh.title)
    expect(c.textContent).toContain('Find this paper')
  })

  it('clicking a star saves just that change', async () => {
    save.mockClear()
    const c = await render('/readings/caliskan2017semantics')
    const star4 = c.querySelector<HTMLButtonElement>('.reading-controls button[aria-label="4 stars"]')!
    await act(async () => star4.click())
    expect(save).toHaveBeenCalledTimes(1)
    const [path, text] = save.mock.calls[0] as unknown as [string, string]
    expect(path).toBe('readings/caliskan2017semantics.md')
    const before = files.get(path)!.text.split('\n')
    const changed = text.split('\n').filter((l, i) => l !== before[i])
    expect(changed).toEqual(['stars: 4'])
  })

  it('choosing Done in the status menu saves the reading and dates ai-use.md', async () => {
    save.mockClear()
    const c = await render('/readings/rajawat2024investigating')
    const select = c.querySelector<HTMLSelectElement>('#status')!
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(select, 'done')
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    for (let i = 0; i < 5; i++) await act(async () => new Promise((r) => setTimeout(r, 10)))
    const calls = save.mock.calls as unknown as [string, string][]
    expect(calls.map((x) => x[0])).toEqual(['readings/rajawat2024investigating.md', 'ai-use.md'])
    expect(calls[0][1]).toMatch(/^verified: true$/m)
    expect(calls[0][1]).toMatch(/^status: done$/m)
    const today = new Date().toISOString().slice(0, 10)
    const row = calls[1][1].split('\n').find((l) => l.includes('readings/rajawat2024investigating.md'))!
    expect(row.trim().endsWith(`| ${today} |`)).toBe(true)
  })

  it('New reading offers exactly the papers without a note', async () => {
    const c = await render('/readings/new')
    const have = new Set(data.readings.map((r) => r.meta.key))
    const without = [...(files.get('references.bib')!.text.matchAll(/^@\w+\{([^,]+),/gm))].map((m) => m[1]).filter((k) => !have.has(k))
    if (without.length === 0) expect(c.textContent).toContain('Every paper in references.bib already has a note')
    else expect([...c.querySelectorAll('.pick-list code')].map((e) => e.textContent).sort()).toEqual(without.sort())
  })
})
