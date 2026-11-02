import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bars, StackedBar } from '../components/Bars'
import { TagPill } from '../components/Pills'
import { dashboard, GAP_BELOW } from '../data/dashboard'
import { useRepo } from '../data/RepoContext'

const relative = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(iso).toLocaleDateString('en-GB')
}

export function Dashboard() {
  const { data, recent } = useRepo()
  const d = useMemo(() => (data ? dashboard(data) : null), [data])
  const [commits, setCommits] = useState<{ sha: string; message: string; date: string }[] | null>(null)
  const [commitsError, setCommitsError] = useState(false)

  useEffect(() => {
    let live = true
    recent(5)
      .then((c) => live && setCommits(c))
      .catch(() => live && setCommitsError(true))
    return () => {
      live = false
    }
  }, [recent, data?.loadedAt])

  if (!data || !d) return null
  const { deadline, readings, decisions, todo } = d

  return (
    <div className="page-pad dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Where the project stands, from the repo as it is now.</p>

      <div className="stats">
        {deadline && (
          <div className="stat stat-pink">
            <div className="stat-value">{deadline.days === 0 ? 'Today' : `${deadline.days} day${deadline.days === 1 ? '' : 's'}`}</div>
            <div className="stat-label">
              {deadline.label} due {new Date(deadline.date).toLocaleDateString('en-GB')}
            </div>
          </div>
        )}
        <Link className="stat stat-lavender stat-link" to="/readings">
          <div className="stat-value">
            {readings.total} / {readings.target}
          </div>
          <div className="stat-label">Readings ({readings.byStatus.done} done)</div>
        </Link>
        <Link className="stat stat-mint stat-link" to="/decisions">
          <div className="stat-value">
            {decisions.decided} / {decisions.total}
          </div>
          <div className="stat-label">Decisions decided</div>
        </Link>
        <Link className="stat stat-peach stat-link" to="/readings?view=next">
          <div className="stat-value">{todo.highFollowUps.length}</div>
          <div className="stat-label">High-priority papers to find</div>
        </Link>
      </div>

      <div className="dash-grid">
        <section className="dash-card dash-wide">
          <h2 className="section-label">Sources</h2>
          <StackedBar
            caption="Readings towards the target"
            target={readings.target}
            segments={[
              { id: 'done', label: 'Done', value: readings.byStatus.done, className: 'seg-done' },
              { id: 'in-progress', label: 'In progress', value: readings.byStatus['in-progress'], className: 'seg-progress' },
              { id: 'to-read', label: 'To read', value: readings.byStatus['to-read'], className: 'seg-toread' },
            ]}
          />
        </section>

        <section className="dash-card">
          <h2 className="section-label">Decisions by area</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th scope="col">Area</th>
                <th scope="col">Decided</th>
                <th scope="col">Exploring</th>
                <th scope="col">Open</th>
              </tr>
            </thead>
            <tbody>
              {decisions.groups.map((g) => (
                <tr key={g.id}>
                  <th scope="row">
                    <Link to={`/decisions?group=${g.id}`}>{g.label}</Link>
                  </th>
                  <td>
                    {g.decided} / {g.total}
                  </td>
                  <td>{g.exploring}</td>
                  <td>{g.open}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="dash-card">
          <h2 className="section-label">Readings per report section</h2>
          <p className="muted dash-note">
            Sections of the {deadline?.report ?? 'final'} report with fewer than {GAP_BELOW} readings are marked as gaps.
          </p>
          <Bars
            caption="Readings per report section"
            rows={d.sections.map((s) => ({
              id: s.id,
              label: <span className={s.inNextReport ? '' : 'muted'}>{s.label}</span>,
              value: s.count,
              note: s.gap ? (
                <span className="gap-flag" title={`Fewer than ${GAP_BELOW} readings`}>
                  <span aria-hidden="true">▲</span> Gap
                </span>
              ) : undefined,
            }))}
          />
        </section>

        <section className="dash-card">
          <h2 className="section-label">Readings per tag</h2>
          <Bars caption="Readings per tag" rows={d.tags.map((t) => ({ id: t.id, label: <TagPill id={t.id} tag={{ id: t.id, label: t.label, group: '', bg: t.bg }} />, value: t.count }))} />
        </section>

        <section className="dash-card">
          <h2 className="section-label">Star ratings</h2>
          <Bars
            caption="Readings by star rating"
            rows={d.stars.map((s) => ({ id: String(s.stars), label: s.stars ? `${'★'.repeat(s.stars)}` : 'Not rated', value: s.count, title: s.stars ? `${s.stars} star${s.stars === 1 ? '' : 's'}` : 'Not rated' }))}
          />
        </section>

        <section className="dash-card">
          <h2 className="section-label">To do</h2>
          <ul className="todo">
            <li>
              {todo.bibWithoutNote.length === 0 ? (
                <span className="muted">Every paper in Zotero has a note.</span>
              ) : (
                <>
                  <Link to="/readings/new">
                    {todo.bibWithoutNote.length} paper{todo.bibWithoutNote.length === 1 ? '' : 's'} in Zotero without a note
                  </Link>
                  <span className="muted"> · {todo.bibWithoutNote.join(', ')}</span>
                </>
              )}
            </li>
            <li>
              {todo.unverifiedClaude.length === 0 ? (
                <span className="muted">No unchecked Claude summaries.</span>
              ) : (
                <>
                  {todo.unverifiedClaude.length} Claude summar{todo.unverifiedClaude.length === 1 ? 'y' : 'ies'} to check against the PDF:{' '}
                  {todo.unverifiedClaude.map((r, i) => (
                    <span key={r.key}>
                      {i > 0 && ', '}
                      <Link to={`/readings/${r.key}`}>{r.key}</Link>
                    </span>
                  ))}
                </>
              )}
            </li>
            <li>
              <Link to="/decisions">
                {todo.openDecisions} decision{todo.openDecisions === 1 ? '' : 's'} not decided yet
              </Link>
            </li>
            <li>
              {todo.highFollowUps.length === 0 ? (
                <span className="muted">No high-priority papers left to find.</span>
              ) : (
                <Link to="/readings?view=next">
                  {todo.highFollowUps.length} high-priority paper{todo.highFollowUps.length === 1 ? '' : 's'} to find
                </Link>
              )}
            </li>
          </ul>
        </section>

        <section className="dash-card">
          <h2 className="section-label">Recently edited</h2>
          {commitsError ? (
            <p className="muted">Couldn’t load recent changes from GitHub. They’ll appear next time the page loads.</p>
          ) : !commits ? (
            <p className="muted">Loading…</p>
          ) : (
            <ul className="recent">
              {commits.map((c) => (
                <li key={c.sha}>
                  <span>{c.message}</span>
                  <span className="muted"> · {relative(c.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
