import { lazy, Suspense } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { MarkdownView } from '../components/MarkdownView'
import { SplitPage } from '../components/SplitPage'
import { DECISION_GROUPS } from '../config'
import { DECISION_STATUSES, groupLabel, statusChange } from '../data/decisions'
import { updateMarkdownFile } from '../data/edit'
import { useRepo } from '../data/RepoContext'
import type { DecisionMeta, DecisionStatus, Doc } from '../data/types'
import { useSave } from '../data/useSave'
import { DecisionReadings } from './decisions/DecisionReadings'
import { NewDecision } from './decisions/NewDecision'

// The editor (Tiptap) is only downloaded when a decision is first edited.
const DecisionEditor = lazy(() => import('./decisions/DecisionEditor').then((m) => ({ default: m.DecisionEditor })))

export function DecisionStatusPill({ status }: { status: DecisionStatus }) {
  return <span className={`pill status-pill decision-${status}`}>{DECISION_STATUSES.find((s) => s.value === status)?.label ?? status}</span>
}

export function Decisions() {
  const { data } = useRepo()
  const { id } = useParams()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  if (!data) return null
  const openGroup = params.get('group') // a group shown with every decision collapsed

  const isNew = pathname === '/decisions/new'
  const editing = pathname.endsWith('/edit')
  const selected = id ? data.decisions.find((d) => d.meta.id === id) : undefined
  const decided = data.decisions.filter((d) => d.meta.status === 'decided').length
  const exploring = data.decisions.filter((d) => d.meta.status === 'exploring').length
  const total = data.decisions.length

  const list = (
    <>
      <div className="list-tools">
        <div className="progress-head">
          <span>
            <strong>{decided}</strong> of {total} decided{exploring ? ` · ${exploring} exploring` : ''}
          </span>
          <Link className="btn btn-primary btn-small" to="/decisions/new">
            New decision
          </Link>
        </div>
        <div className="progress progress-wide" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={decided} aria-label="Decisions decided">
          <div style={{ width: total ? `${(100 * decided) / total}%` : 0 }} />
        </div>
      </div>
      {DECISION_GROUPS.map((g) => {
        const inGroup = data.decisions.filter((d) => d.meta.group === g.id)
        if (inGroup.length === 0) return null
        const done = inGroup.filter((d) => d.meta.status === 'decided').length
        return (
          <div key={g.id}>
            <div className="list-group">
              {g.label} · {done} / {inGroup.length} decided
            </div>
            {inGroup.map((d) => (
              <Link key={d.meta.id} to={`/decisions/${d.meta.id}`} className={`list-item${d.meta.id === id ? ' active' : ''}`}>
                <div className="decision-row">
                  <span className="decision-id">{d.meta.id}</span>
                  <span>{d.meta.title}</span>
                </div>
                <div className="sub">
                  <DecisionStatusPill status={d.meta.status} />
                </div>
              </Link>
            ))}
          </div>
        )
      })}
    </>
  )

  let reader
  if (isNew) reader = <NewDecision onCreated={(newId) => navigate(`/decisions/${newId}`)} onCancel={() => navigate('/decisions')} />
  else if (selected && editing)
    reader = (
      <Suspense fallback={<p className="muted">Opening the editor…</p>}>
        <DecisionEditor key={selected.path} decision={selected} onDone={() => navigate(`/decisions/${selected.meta.id}`)} />
      </Suspense>
    )
  else if (selected) reader = <GroupAccordion decisions={data.decisions.filter((d) => d.meta.group === selected.meta.group)} openId={selected.meta.id} />
  else if (id) reader = <p className="muted">There’s no decision called “{id}”.</p>
  else if (openGroup && data.decisions.some((d) => d.meta.group === openGroup))
    reader = <GroupAccordion decisions={data.decisions.filter((d) => d.meta.group === openGroup)} openId="" />
  else reader = <p className="muted">Select a decision to see its question, options and the readings behind it.</p>

  return (
    <SplitPage list={list} hasSelection={Boolean(selected || isNew || id || openGroup)} backTo="/decisions">
      {reader}
    </SplitPage>
  )
}

// A group's decisions as collapsible sections; the selected one is open (PLAN.md §6.4).
function GroupAccordion({ decisions, openId }: { decisions: Doc<DecisionMeta>[]; openId: string }) {
  const navigate = useNavigate()
  return (
    <div className="accordion">
      <h2 className="accordion-group">{groupLabel(decisions[0]?.meta.group ?? '')}</h2>
      {decisions.map((d) => {
        const open = d.meta.id === openId
        return (
          <section key={d.meta.id} className={`accordion-item${open ? ' open' : ''}`}>
            <h3 className="accordion-heading">
              <button
                type="button"
                className="accordion-toggle"
                aria-expanded={open}
                aria-controls={`panel-${d.meta.id}`}
                onClick={() => navigate(open ? `/decisions?group=${d.meta.group}` : `/decisions/${d.meta.id}`)}
              >
                <span className="decision-id">{d.meta.id}</span>
                <span className="accordion-title">{d.meta.title}</span>
                <DecisionStatusPill status={d.meta.status} />
                <span className="chevron" aria-hidden="true">
                  {open ? '▴' : '▾'}
                </span>
              </button>
            </h3>
            {open && (
              <div id={`panel-${d.meta.id}`} className="accordion-panel">
                <DecisionPanel decision={d} />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function DecisionPanel({ decision }: { decision: Doc<DecisionMeta> }) {
  const navigate = useNavigate()
  const { save, saving, problem, clearProblem } = useSave()
  const m = decision.meta
  return (
    <>
      <div className="reading-controls">
        <label className="field-label" htmlFor={`status-${m.id}`}>
          Status
        </label>
        <select
          id={`status-${m.id}`}
          className="select select-small"
          value={m.status}
          disabled={saving}
          onChange={(e) => void save(decision.path, updateMarkdownFile(decision.text, statusChange(e.target.value as DecisionStatus, m.decided_on)))}
        >
          {DECISION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {m.decided_on && <span className="muted">Decided on {new Date(m.decided_on).toLocaleDateString('en-GB')}</span>}
        {saving && <span className="muted">Saving…</span>}
        <button className="btn btn-small edit-btn" onClick={() => navigate(`/decisions/${m.id}/edit`)}>
          Edit
        </button>
      </div>
      {problem && (
        <Banner kind="err" actions={<button className="btn btn-quiet" onClick={clearProblem}>Dismiss</button>}>
          {problem.message}
        </Banner>
      )}
      <MarkdownView source={decision.body} />
      <DecisionReadings decision={decision} />
    </>
  )
}
