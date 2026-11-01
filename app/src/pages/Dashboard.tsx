import { DEADLINES, READINGS_TARGET } from '../config'
import { useRepo } from '../data/RepoContext'

function nextDeadline() {
  const today = new Date(new Date().toISOString().slice(0, 10))
  for (const d of DEADLINES) {
    const days = Math.round((new Date(d.date).getTime() - today.getTime()) / 86400000)
    if (days >= 0) return { ...d, days }
  }
  return null
}

export function Dashboard() {
  const { data } = useRepo()
  if (!data) return null
  const verified = data.readings.filter((r) => r.meta.verified).length
  const decided = data.decisions.filter((d) => d.meta.status === 'decided').length
  const next = nextDeadline()

  return (
    <div className="page-pad">
      <h1>Dashboard</h1>
      <div className="stats">
        {next && (
          <div className="stat">
            <div className="stat-value">{next.days === 0 ? 'Today' : `${next.days} days`}</div>
            <div className="stat-label">{next.label} due {new Date(next.date).toLocaleDateString('en-GB')}</div>
          </div>
        )}
        <div className="stat">
          <div className="stat-value">
            {data.readings.length} / {READINGS_TARGET}
          </div>
          <div className="stat-label">Readings ({verified} verified)</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {decided} / {data.decisions.length}
          </div>
          <div className="stat-label">Decisions decided</div>
        </div>
        <div className="stat">
          <div className="stat-value">{data.followUps.filter((f) => f.status === 'suggested').length}</div>
          <div className="stat-label">Follow-up readings to look at</div>
        </div>
      </div>
      <p className="muted">The full dashboard (coverage, star distribution, to-do list, recent edits) arrives in stage 8.</p>
    </div>
  )
}
