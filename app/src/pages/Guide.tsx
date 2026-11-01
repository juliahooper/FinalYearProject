import { useRepo } from '../data/RepoContext'

export function Guide() {
  const { data } = useRepo()
  if (!data) return null
  return (
    <div className="page-pad">
      <h1>Guide</h1>
      <p className="muted">The guides render here in stage 8. For now they’re in the repo:</p>
      <ul>
        {data.docs.map((d) => (
          <li key={d.path}>{d.path}</li>
        ))}
      </ul>
    </div>
  )
}
