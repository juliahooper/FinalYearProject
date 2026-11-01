import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../../components/Banner'
import { MarkdownView } from '../../components/MarkdownView'
import { Chip, READING_STATUSES, statusLabel, StatusPill, TagPill } from '../../components/Pills'
import { Stars } from '../../components/Stars'
import { SECTIONS } from '../../config'
import { getDraft } from '../../data/cache'
import { updateMarkdownFile } from '../../data/edit'
import { authorLine } from '../../data/readingText'
import { useRepo } from '../../data/RepoContext'
import type { Doc, ReadingMeta, ReadingStatus } from '../../data/types'
import { useSave } from '../../data/useSave'

const today = () => new Date().toISOString().slice(0, 10)

// Fills the "Verified by Julia" column of ai-use.md rows about this reading that are still empty.
function markVerifiedInLog(log: string, key: string): string {
  return log
    .split('\n')
    .map((line) => (line.includes(`readings/${key}.md`) && /\|\s*\|\s*$/.test(line) ? line.replace(/\|\s*\|\s*$/, `| ${today()} |`) : line))
    .join('\n')
}

export function ReadingView({ reading, onEdit }: { reading: Doc<ReadingMeta>; onEdit: () => void }) {
  const { data } = useRepo()
  const { save, saving, problem, clearProblem } = useSave()
  const [note, setNote] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const m = reading.meta

  useEffect(() => {
    let live = true
    void getDraft(reading.path).then((d) => live && setHasDraft(Boolean(d && d.text !== reading.text)))
    return () => {
      live = false
    }
  }, [reading.path, reading.text])

  if (!data) return null
  const tagById = new Map(data.tags.map((t) => [t.id, t]))
  const sectionLabel = new Map(SECTIONS.map((s) => [s.id, s.label]))
  const link = m.doi ? `https://doi.org/${m.doi}` : m.url
  const recommended = data.followUps.filter((f) => f.found_in.some((s) => s.source === m.key))

  async function setMeta(changes: Partial<ReadingMeta>) {
    setNote(null)
    await save(reading.path, updateMarkdownFile(reading.text, changes))
  }

  async function markVerified() {
    setNote(null)
    if (!(await save(reading.path, updateMarkdownFile(reading.text, { verified: true, status: 'verified' })))) return
    const log = data?.files.get('ai-use.md')
    if (!log) {
      setNote('Marked as verified. Add today’s date to this reading’s row in ai-use.md.')
      return
    }
    const updated = markVerifiedInLog(log.text, m.key)
    if (updated === log.text) setNote('Marked as verified. There was no empty “Verified by Julia” cell for this reading in ai-use.md, so check that file.')
    else if (await save('ai-use.md', updated)) setNote(`Marked as verified, and today’s date was added to ai-use.md.`)
  }

  return (
    <article className="reading">
      <p className="muted reading-meta-line">
        {[authorLine(m), m.venue, m.year].filter(Boolean).join(' · ')}
        {link && (
          <>
            {' · '}
            <a href={link} target="_blank" rel="noreferrer">
              Open paper
            </a>
          </>
        )}
      </p>
      <div className="reading-title-row">
        <h1 className="reading-title">{m.title}</h1>
        <button className="btn" onClick={onEdit}>
          Edit
        </button>
      </div>

      <div className="reading-controls">
        <Stars value={m.stars} disabled={saving} onChange={(stars) => void setMeta({ stars })} />
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        {/* Choosing Verified marks the reading as checked against the PDF and dates it in ai-use.md. */}
        <select
          id="status"
          className="select"
          value={m.status}
          disabled={saving}
          onChange={(e) => {
            const status = e.target.value as ReadingStatus
            if (status === 'verified') void markVerified()
            else void setMeta({ status, verified: false })
          }}
        >
          {READING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
        <StatusPill status={m.status} />
        {saving && <span className="muted">Saving…</span>}
      </div>

      <div className="pill-row">
        {m.tags.map((t) => (
          <TagPill key={t} id={t} tag={tagById.get(t)} />
        ))}
        {m.decisions.map((d) => (
          <Chip key={d} to={`/decisions/${d}`} title="Open this decision">
            {d}
          </Chip>
        ))}
        {m.sections.map((s) => (
          <Chip key={s} title="Report section">
            {sectionLabel.get(s) ?? s}
          </Chip>
        ))}
      </div>

      {problem && (
        <Banner kind="err" actions={<button className="btn btn-quiet" onClick={clearProblem}>Dismiss</button>}>
          {problem.message}
        </Banner>
      )}
      {note && <Banner>{note}</Banner>}
      {hasDraft && (
        <Banner kind="warn" actions={<button className="btn" onClick={onEdit}>Continue editing</button>}>
          You have unsaved changes to this reading.
        </Banner>
      )}

      <MarkdownView source={reading.body} />

      {recommended.length > 0 && (
        <section className="recommended">
          <h2 className="section-label">Follow-up readings recommended here</h2>
          <ul>
            {recommended.map((f) => (
              <li key={f.title}>
                {f.title} <span className="muted">({f.status === 'suggested' ? `${f.priority} priority` : f.status})</span>
              </li>
            ))}
          </ul>
          <Link to="/readings?view=next">Open “To read next”</Link>
        </section>
      )}
    </article>
  )
}
