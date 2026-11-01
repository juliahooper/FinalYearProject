import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../../components/Banner'
import { parseBib } from '../../data/bib'
import { updateListEntry } from '../../data/edit'
import { useRepo } from '../../data/RepoContext'
import type { FollowUp } from '../../data/types'
import { useSave } from '../../data/useSave'

const FILE = 'readings/follow-up.yml'
const PRIORITIES = ['high', 'medium', 'low'] as const

// "To read next": suggested follow-ups from readings/follow-up.yml (PLAN.md §6.3).
export function ToReadNext() {
  const { data } = useRepo()
  const { save, saving, problem } = useSave()
  const [showDone, setShowDone] = useState(false)
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [key, setKey] = useState('')

  const bibKeys = useMemo(() => (data?.bib ? parseBib(data.bib.text).map((e) => e.key).sort() : []), [data])
  if (!data) return null
  const readingKeys = new Set(data.readings.map((r) => r.meta.key))
  const items = data.followUps.map((f, index) => ({ f, index }))
  const done = items.filter(({ f }) => f.status !== 'suggested')

  async function update(index: number, changes: Partial<FollowUp>) {
    const file = data?.files.get(FILE)
    if (!file) return
    if (await save(FILE, updateListEntry(file.text, index, changes))) {
      setSavingIndex(null)
      setKey('')
    }
  }

  const card = ({ f, index }: { f: FollowUp; index: number }) => {
    const missing = f.venue.includes('NOT FOUND IN SOURCE')
    const surname = (a: string) => a.split(',')[0]
    const who = f.authors.length === 0 ? '' : f.authors.length === 1 ? surname(f.authors[0]) : f.authors.length === 2 ? `${surname(f.authors[0])} and ${surname(f.authors[1])}` : `${surname(f.authors[0])} et al.`
    return (
      <li key={index} className="next-item">
        <div className="next-title">{f.title}</div>
        <div className="sub muted">
          {[who, f.year].filter(Boolean).join(' ')}
          {missing ? <span className="find-hint"> · Find this paper: the details aren’t known yet</span> : f.venue ? ` · ${f.venue}` : ''}
        </div>
        <p className="next-why">{f.why}</p>
        {f.notes && <p className="muted next-notes">{f.notes}</p>}
        <div className="sub muted">
          Found in:{' '}
          {f.found_in.map((s, i) => (
            <span key={i}>
              {i > 0 && ', '}
              {readingKeys.has(s.source) ? <Link to={`/readings/${s.source}`}>{s.source}</Link> : s.source.replace(/^external:\s*/, '')}
              {s.page && s.page !== '-' ? ` (p. ${s.page})` : ''}
            </span>
          ))}
        </div>
        {f.status === 'suggested' ? (
          savingIndex === index ? (
            <form
              className="next-actions"
              onSubmit={(e) => {
                e.preventDefault()
                if (key) void update(index, { status: 'saved', key })
              }}
            >
              <label className="sr-only" htmlFor={`key-${index}`}>
                Zotero citekey
              </label>
              <select id={`key-${index}`} className="select" value={key} onChange={(e) => setKey(e.target.value)}>
                <option value="">Choose its citekey…</option>
                {bibKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" type="submit" disabled={!key || saving}>
                Save
              </button>
              <button className="btn btn-quiet" type="button" onClick={() => setSavingIndex(null)}>
                Cancel
              </button>
              {bibKeys.length === 0 && <span className="muted">No papers in references.bib yet.</span>}
            </form>
          ) : (
            <div className="next-actions">
              <button className="btn" disabled={saving} onClick={() => setSavingIndex(index)}>
                Saved to Zotero
              </button>
              <button className="btn btn-quiet" disabled={saving} onClick={() => void update(index, { status: 'skipped' })}>
                Skip
              </button>
            </div>
          )
        ) : (
          <div className="sub muted">{f.status === 'saved' ? `Saved as ${f.key}` : 'Skipped'}</div>
        )}
      </li>
    )
  }

  return (
    <div>
      {problem && <Banner kind="err">{problem.message}</Banner>}
      {data.followUps.length === 0 && <p className="muted list-head">Nothing suggested yet. Follow-ups are added when a reading is summarised.</p>}
      {PRIORITIES.map((p) => {
        const group = items.filter(({ f }) => f.status === 'suggested' && f.priority === p)
        return group.length ? (
          <section key={p}>
            <div className="list-group">
              {p[0].toUpperCase() + p.slice(1)} priority · {group.length}
            </div>
            <ul className="next-list">{group.map(card)}</ul>
          </section>
        ) : null
      })}
      {done.length > 0 && (
        <div className="list-head">
          <button className="btn btn-quiet" onClick={() => setShowDone(!showDone)} aria-expanded={showDone}>
            {showDone ? 'Hide done' : `Show done (${done.length})`}
          </button>
          {showDone && <ul className="next-list">{done.map(card)}</ul>}
        </div>
      )}
    </div>
  )
}
