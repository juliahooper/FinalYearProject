import { Link, useParams } from 'react-router-dom'
import { SplitPage } from '../components/SplitPage'
import { SECTIONS } from '../config'
import { useRepo } from '../data/RepoContext'

export function Notes() {
  const { data } = useRepo()
  const { section } = useParams()
  if (!data) return null
  const selected = SECTIONS.find((s) => s.id === section)

  const list = (
    <>
      <div className="list-head">Report sections</div>
      {SECTIONS.map((s) => (
        <Link key={s.id} to={`/notes/${s.id}`} className={`list-item${s.id === section ? ' active' : ''}`}>
          <div>{s.label}</div>
          <div className="sub">
            {s.reports.length === 2 ? 'Interim and final' : s.reports[0] === 'interim' ? 'Interim only' : 'Final only'}
            {s.marks ? ` · marks ${s.marks}` : ''}
          </div>
        </Link>
      ))}
    </>
  )

  return (
    <SplitPage list={list} hasSelection={Boolean(selected)}>
      {selected ? (
        <article>
          <h1>{selected.label}</h1>
          <p className="muted">The notes editor arrives in stage 7.</p>
        </article>
      ) : (
        <p className="muted">Select a report section.</p>
      )}
    </SplitPage>
  )
}
