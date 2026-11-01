import { lazy, Suspense, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { MarkdownView } from '../components/MarkdownView'
import { SplitPage } from '../components/SplitPage'
import { Stars } from '../components/Stars'
import { DEADLINES, SECTIONS, type Report } from '../config'
import { authorLine, shortTitle } from '../data/readingText'
import { useRepo } from '../data/RepoContext'
import { sectionNeeds, sectionTexPath } from '../data/sectionNeeds'

// The editor (Tiptap) is only downloaded when a section's notes are first opened.
const NoteEditor = lazy(() => import('./notes/NoteEditor').then((m) => ({ default: m.NoteEditor })))

// The report whose deadline is next: interim up to and including its due date, then final.
export function defaultReport(today = new Date()): Report {
  const day = today.toISOString().slice(0, 10)
  return day <= DEADLINES[0].date ? 'interim' : 'final'
}

const notesPath = (section: string) => `paper/notes/${section}.md`

// Words in a notes file, leaving out the "# Notes: x" title and the starter sentence.
export function notesWordCount(text: string): number {
  const body = text
    .replace(/^# Notes:.*$/m, '')
    .replace(/^Rough working notes for this section.*$/m, '')
    .replace(/[#*_`>|[\]()-]/g, ' ')
  return body.split(/\s+/).filter((w) => /\w/.test(w)).length
}

export function Notes() {
  const { data } = useRepo()
  const params = useParams()
  const navigate = useNavigate()
  if (!data) return null

  const report = params.report as Report | undefined
  if (report !== 'interim' && report !== 'final') return <Navigate to={`/notes/${defaultReport()}`} replace />
  const sections = SECTIONS.filter((s) => s.reports.includes(report))
  const section = sections.find((s) => s.id === params.section)
  if (params.section && !section) return <Navigate to={`/notes/${report}`} replace />

  const tagged = (id: string) => data.readings.filter((r) => r.meta.sections.includes(id))

  const list = (
    <>
      <div className="tabs" role="tablist" aria-label="Report">
        {(['interim', 'final'] as const).map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={report === r}
            className={`tab${report === r ? ' active' : ''}`}
            onClick={() => {
              const keep = section && SECTIONS.find((s) => s.id === section.id)?.reports.includes(r)
              navigate(`/notes/${r}${keep ? `/${section.id}` : ''}`)
            }}
          >
            {r === 'interim' ? 'Interim' : 'Final'}
          </button>
        ))}
      </div>
      <div className="list-head">
        {report === 'interim' ? 'Interim report, due 06/11/2026' : 'Final report and video, due 07/04/2027'}
      </div>
      {sections.map((s) => {
        const words = notesWordCount(data.files.get(notesPath(s.id))?.text ?? '')
        const readings = tagged(s.id).length
        return (
          <Link key={s.id} to={`/notes/${report}/${s.id}`} className={`list-item${s.id === section?.id ? ' active' : ''}`}>
            <div>{s.label}</div>
            <div className="sub">
              {[s.marks && s.marks !== '–' ? `Marks ${s.marks}` : null, `${words} word${words === 1 ? '' : 's'} of notes`, `${readings} reading${readings === 1 ? '' : 's'}`]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </Link>
        )
      })}
    </>
  )

  return (
    <SplitPage list={list} hasSelection={Boolean(section)} backTo={`/notes/${report}`}>
      {section ? <SectionNotes key={`${report}/${section.id}`} report={report} sectionId={section.id} label={section.label} /> : <p className="muted">Select a section to write its notes.</p>}
    </SplitPage>
  )
}

function SectionNotes({ report, sectionId, label }: { report: Report; sectionId: string; label: string }) {
  const { data } = useRepo()
  const [version, setVersion] = useState(0)
  const [panelOpen, setPanelOpen] = useState(true)
  const [editorApi, setEditorApi] = useState<{ cite: (key: string) => void } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  if (!data) return null

  const path = notesPath(sectionId)
  const file = data.files.get(path)
  const needs = sectionNeeds(data.files.get(sectionTexPath(report, sectionId)))
  const readings = data.readings.filter((r) => r.meta.sections.includes(sectionId)).sort((a, b) => b.meta.stars - a.meta.stars)

  async function copyCite(key: string) {
    try {
      await navigator.clipboard.writeText(`\\textcite{${key}}`)
      setCopied(key)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      window.prompt('Copy this citation:', `\\textcite{${key}}`)
    }
  }

  return (
    <div className={`notes-layout${panelOpen ? '' : ' panel-closed'}`}>
      <div className="notes-main">
        <Suspense fallback={<p className="muted">Opening the editor…</p>}>
          <NoteEditor
            key={`${path}#${version}`}
            path={path}
            file={file}
            title={label}
            onDone={() => setVersion((v) => v + 1)}
            onCiteReady={setEditorApi}
            needs={
              needs && (
                <details className="needs">
                  <summary>What this section needs</summary>
                  <p className="muted needs-source">{needs.heading}</p>
                  <MarkdownView source={needs.markdown} className="needs-body" />
                </details>
              )
            }
          />
        </Suspense>
      </div>
      <aside className="cite-panel" aria-label="Readings for this section">
        <button className="btn btn-quiet panel-toggle" aria-expanded={panelOpen} onClick={() => setPanelOpen(!panelOpen)}>
          {panelOpen ? 'Hide readings ›' : `‹ Readings (${readings.length})`}
        </button>
        {panelOpen && (
          <>
            <h2 className="section-label">Readings tagged for this section</h2>
            {readings.length === 0 && <p className="muted">No readings are tagged with this section yet. Add it under “Report sections” when editing a reading.</p>}
            <ul className="cite-list">
              {readings.map((r) => (
                <li key={r.meta.key}>
                  <div className="cite-title">{shortTitle(r.meta.title)}</div>
                  <div className="sub muted">
                    {authorLine(r.meta)} {r.meta.year} <Stars value={r.meta.stars} />
                  </div>
                  <div className="cite-actions">
                    <button className="btn btn-small" disabled={!editorApi} onClick={() => editorApi?.cite(r.meta.key)} title={`Insert \\parencite{${r.meta.key}} at the cursor`}>
                      Cite
                    </button>
                    <button className="btn btn-small" onClick={() => void copyCite(r.meta.key)} title={`Copy \\textcite{${r.meta.key}}`}>
                      {copied === r.meta.key ? 'Copied' : 'Copy cite'}
                    </button>
                    <Link className="btn btn-quiet btn-small" to={`/readings/${r.meta.key}`}>
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  )
}
