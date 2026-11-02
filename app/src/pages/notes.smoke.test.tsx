// @vitest-environment jsdom
// Smoke test: render the Report notes screens with the repo's real files (no GitHub calls).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { build } from '../data/repo'
import type { RawFile } from '../data/types'
import { highlightsFile } from './highlights.fixture'
import { defaultReport, Notes, notesWordCount } from './Notes'

const repo = join(__dirname, '../../..')
const files = new Map<string, RawFile>()
const add = (p: string) => files.set(p, { path: p, sha: 'sha-' + p, text: readFileSync(join(repo, p), 'utf8') })
for (const f of readdirSync(join(repo, 'readings')).filter((x) => x.endsWith('.md'))) add(`readings/${f}`)
for (const f of readdirSync(join(repo, 'paper/notes'))) add(`paper/notes/${f}`)
for (const r of ['interim', 'final']) for (const f of readdirSync(join(repo, `paper/${r}/sections`))) add(`paper/${r}/sections/${f}`)
add('tags.yml')
files.set('highlights.yml', highlightsFile)
const data = build(files)
const save = vi.fn(async () => {})

vi.mock('../data/RepoContext', () => ({
  useRepo: () => ({ data, loading: false, progress: null, error: null, reload: async () => {}, save }),
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
          <Route path="notes" element={<Notes />} />
          <Route path="notes/:report" element={<Notes />} />
          <Route path="notes/:report/:section" element={<Notes />} />
        </Routes>
      </MemoryRouter>,
    )
  })
  await settle()
  // Editors load on demand; under a full parallel test run that can take longer than the fixed wait.
  for (let i = 0; i < 100 && container.textContent?.includes('Opening the editor'); i++) await settle(1)
  return container
}

describe('Report notes', () => {
  it('picks the report whose deadline is next', () => {
    expect(defaultReport(new Date('2026-11-01'))).toBe('interim')
    expect(defaultReport(new Date('2026-11-06T12:00:00Z'))).toBe('interim')
    expect(defaultReport(new Date('2026-11-07'))).toBe('final')
  })

  it('counts only words written by Julia', () => {
    expect(notesWordCount(files.get('paper/notes/abstract.md')!.text)).toBe(0)
    expect(notesWordCount('# Notes: x\n\nRough working notes for this section.\n\nTwo words.')).toBe(2)
  })

  it('the interim list shows its sections, with no marks on interim-only ones', async () => {
    const c = await render('/notes/interim')
    const items = [...c.querySelectorAll('.list-pane .list-item')].map((e) => e.textContent ?? '')
    expect(items.map((t) => t.split('Marks')[0].split('0 words')[0])).toEqual([
      'Abstract',
      'Introduction',
      'Literature review: background',
      'Literature review: related work',
      'Methodology',
      'Work to date',
      'Project plan',
    ])
    expect(items[5]).not.toContain('Marks')
    expect(items[1]).toContain('Marks 10')
    const bg = data.readings.filter((r) => r.meta.sections.includes('background')).length
    expect(items[2]).toContain(`${bg} reading${bg === 1 ? '' : 's'}`)
  })

  it('the final list has the final sections', async () => {
    const c = await render('/notes/final')
    const text = c.querySelector('.list-pane')!.textContent!
    expect(text).toContain('Evaluation')
    expect(text).toContain('The tool (deliverable)')
    expect(text).not.toContain('Work to date')
  })

  it('opens a section with what it needs, the editor and tagged readings', async () => {
    const c = await render('/notes/interim/background')
    expect(c.querySelector('.needs summary')?.textContent).toBe('What this section needs')
    expect(c.querySelector('.needs')?.textContent).toContain('Who said it')
    expect(c.querySelector('.ProseMirror')?.textContent).toContain('Notes: background')
    expect(c.querySelector('.cite-panel')?.textContent).toContain('Semantics Derived Automatically')
  })

  it('Cite inserts \\parencite at the cursor, and Save writes it', async () => {
    save.mockClear()
    const c = await render('/notes/interim/background')
    const cite = [...c.querySelectorAll<HTMLButtonElement>('.cite-actions button')].find((b) => b.textContent === 'Cite')!
    await act(async () => cite.click())
    expect(c.querySelector('.ProseMirror')?.textContent).toContain('\\parencite{caliskan2017semantics}')
    const saveButton = [...c.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent === 'Save')!
    await act(async () => saveButton.click())
    await settle(5)
    const [path, text] = save.mock.calls[0] as unknown as [string, string]
    expect(path).toBe('paper/notes/background.md')
    expect(text).toContain('\\parencite{caliskan2017semantics}')
    expect(text).not.toContain('\\\\parencite')
    expect(text.startsWith('# Notes: background\n')).toBe(true)
  })

  it('a section has a Notes row under the editor with its highlighted passages', async () => {
    const c = await render('/notes/interim/methodology')
    const notes = c.querySelector('.notes-main .notes-accordion')!
    expect(notes.textContent).toContain('Notes (1)')
    await act(async () => notes.querySelector<HTMLButtonElement>('.accordion-toggle')!.click())
    expect(notes.querySelector('.note-card')?.textContent).toContain('the closest existing tool')
    const other = await render('/notes/interim/background')
    expect(other.querySelector('.notes-accordion')?.textContent).toContain('Notes (0)')
  })

  it('switching report keeps a section both reports share', async () => {
    const c = await render('/notes/interim/methodology')
    const finalTab = [...c.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) => b.textContent === 'Final')!
    await act(async () => finalTab.click())
    await settle(3)
    expect(location).toBe('/notes/final/methodology')
  })

  it('/notes goes to the next report', async () => {
    await render('/notes')
    expect(location).toBe(`/notes/${defaultReport()}`)
  })
})
