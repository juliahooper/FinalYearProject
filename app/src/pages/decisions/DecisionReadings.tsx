import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../../components/Banner'
import { Stars } from '../../components/Stars'
import { updateMarkdownFile } from '../../data/edit'
import { authorLine, bodySections, shortTitle } from '../../data/readingText'
import { useRepo } from '../../data/RepoContext'
import type { DecisionMeta, Doc } from '../../data/types'
import { useSave } from '../../data/useSave'

const excerpt = (text: string, max = 220) => {
  const plain = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > max ? plain.slice(0, max).replace(/\s\S*$/, '') + '…' : plain
}

// The readings that inform a decision: those whose `decisions:` list it, plus the decision's own
// `readings:` list (PLAN.md §6.4). Linking and unlinking update both files.
export function DecisionReadings({ decision }: { decision: Doc<DecisionMeta> }) {
  const { data } = useRepo()
  const { save, saving, problem } = useSave()
  const [adding, setAdding] = useState('')
  if (!data) return null
  const id = decision.meta.id

  const linked = data.readings.filter((r) => r.meta.decisions.includes(id) || decision.meta.readings.includes(r.meta.key)).sort((a, b) => b.meta.stars - a.meta.stars)
  const missing = decision.meta.readings.filter((k) => !data.readings.some((r) => r.meta.key === k))
  const unlinked = data.readings.filter((r) => !linked.includes(r))

  async function link(key: string) {
    const reading = data?.readings.find((r) => r.meta.key === key)
    if (!reading) return
    if (!reading.meta.decisions.includes(id)) {
      if (!(await save(reading.path, updateMarkdownFile(reading.text, { decisions: [...reading.meta.decisions, id] })))) return
    }
    if (!decision.meta.readings.includes(key)) {
      if (!(await save(decision.path, updateMarkdownFile(decision.text, { readings: [...decision.meta.readings, key] })))) return
    }
    setAdding('')
  }

  async function unlink(key: string) {
    const reading = data?.readings.find((r) => r.meta.key === key)
    if (reading?.meta.decisions.includes(id)) {
      if (!(await save(reading.path, updateMarkdownFile(reading.text, { decisions: reading.meta.decisions.filter((d) => d !== id) })))) return
    }
    if (decision.meta.readings.includes(key)) await save(decision.path, updateMarkdownFile(decision.text, { readings: decision.meta.readings.filter((k) => k !== key) }))
  }

  return (
    <section className="decision-readings">
      <h3 className="section-label">Readings</h3>
      {problem && <Banner kind="err">{problem.message}</Banner>}
      {linked.length === 0 && <p className="muted">No readings linked yet.</p>}
      <ul className="linked-readings">
        {linked.map((r) => {
          const tldr = bodySections(r.body).find((s) => /^tl;?dr/i.test(s.heading))?.text ?? ''
          return (
            <li key={r.meta.key}>
              <div className="linked-head">
                <Link to={`/readings/${r.meta.key}`}>{shortTitle(r.meta.title)}</Link>
                <span className="muted">
                  {authorLine(r.meta)} {r.meta.year}
                </span>
                <Stars value={r.meta.stars} />
                <button className="btn btn-quiet btn-small" disabled={saving} onClick={() => void unlink(r.meta.key)} aria-label={`Unlink ${r.meta.key}`}>
                  Unlink
                </button>
              </div>
              {tldr && <p className="muted linked-tldr">{excerpt(tldr)}</p>}
            </li>
          )
        })}
      </ul>
      {missing.length > 0 && <p className="muted">Listed in this decision but without a reading note: {missing.join(', ')}.</p>}
      {unlinked.length > 0 && (
        <form
          className="link-reading"
          onSubmit={(e) => {
            e.preventDefault()
            if (adding) void link(adding)
          }}
        >
          <label className="sr-only" htmlFor={`link-${id}`}>
            Link a reading
          </label>
          <select id={`link-${id}`} className="select select-small" value={adding} onChange={(e) => setAdding(e.target.value)}>
            <option value="">Link a reading…</option>
            {unlinked.map((r) => (
              <option key={r.meta.key} value={r.meta.key}>
                {shortTitle(r.meta.title)} ({r.meta.key})
              </option>
            ))}
          </select>
          <button className="btn btn-small" type="submit" disabled={!adding || saving}>
            {saving ? 'Linking…' : 'Link'}
          </button>
        </form>
      )}
    </section>
  )
}
