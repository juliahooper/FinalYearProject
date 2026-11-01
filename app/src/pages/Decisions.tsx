import { Link, useParams } from 'react-router-dom'
import { SplitPage } from '../components/SplitPage'
import { DECISION_GROUPS } from '../config'
import { useRepo } from '../data/RepoContext'

export function Decisions() {
  const { data } = useRepo()
  const { id } = useParams()
  if (!data) return null
  const selected = data.decisions.find((d) => d.meta.id === id)

  const list = (
    <>
      {DECISION_GROUPS.map((g) => {
        const inGroup = data.decisions.filter((d) => d.meta.group === g.id)
        const decided = inGroup.filter((d) => d.meta.status === 'decided').length
        return (
          <div key={g.id}>
            <div className="list-group">
              {g.label} · {decided} / {inGroup.length} decided
            </div>
            {inGroup.map((d) => (
              <Link key={d.meta.id} to={`/decisions/${d.meta.id}`} className={`list-item${d.meta.id === id ? ' active' : ''}`}>
                <div>{d.meta.title}</div>
                <div className="sub">
                  {d.meta.id} · {d.meta.status}
                </div>
              </Link>
            ))}
          </div>
        )
      })}
    </>
  )

  return (
    <SplitPage list={list} hasSelection={Boolean(selected)}>
      {selected ? (
        <article>
          <p className="muted">{selected.meta.id}</p>
          <h1>{selected.meta.title}</h1>
          <p className="muted">The decision editor arrives in stage 6.</p>
        </article>
      ) : (
        <p className="muted">Select a decision.</p>
      )}
    </SplitPage>
  )
}
