// @vitest-environment jsdom
// Smoke test: render the Decisions screens with the repo's real files (no GitHub calls).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { build } from '../data/repo'
import type { RawFile } from '../data/types'
import { Decisions } from './Decisions'
import { highlightsFile } from './highlights.fixture'

const repo = join(__dirname, '../../..')
const files = new Map<string, RawFile>()
const add = (p: string) => files.set(p, { path: p, sha: 'sha-' + p, text: readFileSync(join(repo, p), 'utf8') })
for (const f of readdirSync(join(repo, 'readings')).filter((x) => x.endsWith('.md'))) add(`readings/${f}`)
for (const f of readdirSync(join(repo, 'decisions')).filter((x) => x.endsWith('.md'))) add(`decisions/${f}`)
;['tags.yml', 'readings/follow-up.yml'].forEach(add)
files.set('highlights.yml', highlightsFile)
const data = build(files)
const save = vi.fn(async () => {})

vi.mock('../data/RepoContext', () => ({
  useRepo: () => ({ data, loading: false, progress: null, error: null, reload: async () => {}, save }),
}))
vi.mock('mermaid', () => ({ default: { initialize: () => {}, render: async () => ({ svg: '<svg></svg>' }) } }))
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
    location = l.pathname + l.search
  }, [l])
  return null
}

const settle = async (n = 20) => {
  for (let i = 0; i < n; i++) await act(async () => new Promise((r) => setTimeout(r, 20)))
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
          <Route path="decisions" element={<Decisions />} />
          <Route path="decisions/new" element={<Decisions />} />
          <Route path="decisions/:id" element={<Decisions />} />
          <Route path="decisions/:id/edit" element={<Decisions />} />
        </Routes>
      </MemoryRouter>,
    )
  })
  await settle()
  // Editors load on demand; under a full parallel test run that can take longer than the fixed wait.
  for (let i = 0; i < 100 && container.textContent?.includes('Opening the editor'); i++) await settle(1)
  return container
}

// Sets a <select>'s value the way React notices.
function choose(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!
  setter.call(select, value)
  select.dispatchEvent(new Event('change', { bubbles: true }))
}
function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  setter.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('Decisions screens', () => {
  it('lists every group with counts and a progress bar', async () => {
    const c = await render('/decisions')
    expect(c.textContent).toContain(`0 of ${data.decisions.length} decided`)
    expect(c.textContent).toContain('Metrics · 0 / 6 decided')
    expect(c.textContent).toContain('Impact evaluation · 0 / 6 decided')
    expect(c.querySelector('[role="progressbar"]')).toBeTruthy()
  })

  it('opens a decision inside its group, with its readings', async () => {
    const c = await render('/decisions/DET-01')
    expect(c.querySelector('.accordion-group')?.textContent).toBe('Detector')
    expect(c.querySelectorAll('.accordion-item:not(.notes-accordion)').length).toBe(6)
    expect(c.querySelectorAll('.accordion-item.open').length).toBe(1)
    expect(c.querySelector('.accordion-item.open')?.textContent).toContain('The working definition and taxonomy')
    expect(c.querySelector('.decision-readings')?.textContent).toContain('Semantics Derived Automatically')
  })

  it('setting status to decided stamps today’s date', async () => {
    save.mockClear()
    const c = await render('/decisions/MET-02')
    await act(async () => choose(c.querySelector<HTMLSelectElement>('#status-MET-02')!, 'decided'))
    const [path, text] = save.mock.calls[0] as unknown as [string, string]
    expect(path).toBe('decisions/MET-02-per-item-bias-score.md')
    expect(text).toMatch(/^status: decided$/m)
    expect(text).toMatch(new RegExp(`^decided_on: ${new Date().toISOString().slice(0, 10)}$`, 'm'))
  })

  it('linking a reading updates the reading and the decision', async () => {
    save.mockClear()
    const c = await render('/decisions/MET-02')
    await act(async () => choose(c.querySelector<HTMLSelectElement>('#link-MET-02')!, 'kumar2025detecting'))
    await act(async () => c.querySelector<HTMLFormElement>('.link-reading')!.requestSubmit())
    await settle(5)
    const calls = save.mock.calls as unknown as [string, string][]
    expect(calls.map((x) => x[0])).toEqual(['readings/kumar2025detecting.md', 'decisions/MET-02-per-item-bias-score.md'])
    expect(calls[0][1]).toMatch(/^decisions: \[VAL-01, MET-02\]$/m)
    expect(calls[1][1]).toMatch(/^readings: \[kumar2025detecting\]$/m)
  })

  it('a new decision gets the next ID in its group', async () => {
    save.mockClear()
    const c = await render('/decisions/new')
    await act(async () => choose(c.querySelector<HTMLSelectElement>('#new-group')!, 'metrics'))
    expect(c.textContent).toContain('MET-07')
    await act(async () => type(c.querySelector<HTMLInputElement>('#new-title')!, 'Score calibration'))
    await act(async () => c.querySelector<HTMLFormElement>('form.meta-form')!.requestSubmit())
    await settle(5)
    const [path, text] = save.mock.calls[0] as unknown as [string, string]
    expect(path).toBe('decisions/MET-07-score-calibration.md')
    expect(text).toContain('id: MET-07')
    expect(location).toBe('/decisions/MET-07')
  })

  it('opens the editor', async () => {
    const c = await render('/decisions/EVAL-01/edit')
    expect(c.querySelector('.toolbar')).toBeTruthy()
    expect(c.querySelector<HTMLInputElement>('#decision-title')?.value).toBe('Downstream impact experiment')
    expect(c.querySelector('.ProseMirror')?.textContent).toContain('accept/reject decisions')
  })

  it('a group ends with its Notes row, which opens to show highlighted passages', async () => {
    save.mockClear()
    const c = await render('/decisions/DET-01')
    const notes = c.querySelector('.notes-accordion')!
    expect(notes.textContent).toContain('Notes (1)')
    expect(notes.querySelector('.note-card')).toBeNull()
    await act(async () => notes.querySelector<HTMLButtonElement>('.accordion-toggle')!.click())
    const card = notes.querySelector<HTMLElement>('.note-card')!
    expect(card.textContent).toContain('the closest existing tool')
    expect(card.style.background).toBeTruthy()
    expect(card.querySelector('a[href="/readings/mendu2025safer"]')).toBeTruthy()
    const remove = [...card.querySelectorAll('button')].find((b) => b.textContent === 'Remove from here')!
    await act(async () => remove.click())
    const [path, text] = save.mock.calls[0] as unknown as [string, string]
    expect(path).toBe('highlights.yml')
    expect(text).toContain('groups: []\n  sections: [methodology]')
  })

  it('collapsing keeps the group on screen', async () => {
    const c = await render('/decisions/DET-01')
    await act(async () => c.querySelector<HTMLButtonElement>('.accordion-item.open .accordion-toggle')!.click())
    await settle(3)
    expect(location).toBe('/decisions?group=detector')
    expect(c.querySelectorAll('.accordion-item:not(.notes-accordion)').length).toBe(6)
    expect(c.querySelectorAll('.accordion-item.open').length).toBe(0)
  })
})
