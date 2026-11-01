import { Link, useParams } from 'react-router-dom'
import { SplitPage } from '../components/SplitPage'
import { useRepo } from '../data/RepoContext'

const shortTitle = (t: string) => t.split(':')[0]
const firstAuthor = (a: string[]) => (a[0] ?? '').split(',')[0]

export function Readings() {
  const { data } = useRepo()
  const { key } = useParams()
  if (!data) return null
  const selected = data.readings.find((r) => r.meta.key === key)

  const list = (
    <>
      <div className="list-head">
        {data.readings.length} reading{data.readings.length === 1 ? '' : 's'}
      </div>
      {data.readings.length === 0 && <p className="muted list-head">No readings yet. Add a paper to Zotero, then ask Claude Code to summarise it.</p>}
      {data.readings.map((r) => (
        <Link key={r.meta.key} to={`/readings/${r.meta.key}`} className={`list-item${r.meta.key === key ? ' active' : ''}`}>
          <div>{shortTitle(r.meta.title)}</div>
          <div className="sub">
            {firstAuthor(r.meta.authors)} {r.meta.year}
          </div>
        </Link>
      ))}
    </>
  )

  return (
    <SplitPage list={list} hasSelection={Boolean(selected)}>
      {selected ? (
        <article>
          <p className="muted">
            {selected.meta.authors.join(', ')} · {selected.meta.venue} · {selected.meta.year}
          </p>
          <h1 className="reading-text">{selected.meta.title}</h1>
          <p className="muted">The reader and editor arrive in stage 5.</p>
        </article>
      ) : (
        <p className="muted">Select a reading.</p>
      )}
    </SplitPage>
  )
}
