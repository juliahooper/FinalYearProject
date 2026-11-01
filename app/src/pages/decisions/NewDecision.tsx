import { useState } from 'react'
import { Banner } from '../../components/Banner'
import { DECISION_GROUPS } from '../../config'
import { decisionPath, newDecisionText, nextDecisionId } from '../../data/decisions'
import { useRepo } from '../../data/RepoContext'
import { useSave } from '../../data/useSave'

// New decision: pick a group, and the next free ID in that group is assigned (PLAN.md §6.4).
export function NewDecision({ onCreated, onCancel }: { onCreated: (id: string) => void; onCancel: () => void }) {
  const { data } = useRepo()
  const { save, saving, problem } = useSave()
  const [group, setGroup] = useState('')
  const [title, setTitle] = useState('')
  const [question, setQuestion] = useState('')
  if (!data) return null
  const id = group ? nextDecisionId(data.decisions, group) : ''

  async function create() {
    if (!id || !title.trim()) return
    if (await save(decisionPath(id, title), newDecisionText(id, title, group, question), null)) onCreated(id)
  }

  return (
    <article className="reading">
      <h1>New decision</h1>
      <form
        className="meta-form"
        onSubmit={(e) => {
          e.preventDefault()
          void create()
        }}
      >
        <div className="field">
          <label className="field-label" htmlFor="new-group">
            Group
          </label>
          <select id="new-group" className="select" value={group} onChange={(e) => setGroup(e.target.value)} required>
            <option value="">Choose a group…</option>
            {DECISION_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="field-label">ID</span>
          <span>{id || <span className="muted">Assigned when you pick a group</span>}</span>
        </div>
        <div className="field field-wide">
          <label className="field-label" htmlFor="new-title">
            Title
          </label>
          <input id="new-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Score calibration" required />
        </div>
        <div className="field field-wide">
          <label className="field-label" htmlFor="new-question">
            Question
          </label>
          <input id="new-question" type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="The one question this decision answers" />
        </div>
        {problem && (
          <div className="field-wide">
            <Banner kind="err">{problem.message}</Banner>
          </div>
        )}
        <div className="editor-actions field-wide">
          <button className="btn" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" disabled={!id || !title.trim() || saving}>
            {saving ? 'Creating…' : id ? `Create ${id}` : 'Create'}
          </button>
        </div>
      </form>
    </article>
  )
}
