import { DocEditorFrame } from '../../components/DocEditorFrame'
import { DECISION_STATUSES, statusChange } from '../../data/decisions'
import type { DecisionMeta, DecisionStatus, Doc } from '../../data/types'
import { useDocEditor } from '../../editor/useDocEditor'

type EditableMeta = Pick<DecisionMeta, 'title' | 'status' | 'decided_on'>
const pickMeta = (m: DecisionMeta): EditableMeta => ({ title: m.title, status: m.status, decided_on: m.decided_on })

// Edits a decision: title, status and the five sections (Question, Options considered, Decision,
// Why, Consequences) in the rich text editor.
export function DecisionEditor({ decision, onDone }: { decision: Doc<DecisionMeta>; onDone: () => void }) {
  const ed = useDocEditor(decision, pickMeta, onDone)
  const { meta, changeMeta } = ed
  return (
    <DocEditorFrame title={`${decision.meta.id} ${meta.title}`} ed={ed}>
      <div className="meta-form">
        <div className="field field-wide">
          <label className="field-label" htmlFor="decision-title">
            Title
          </label>
          <input id="decision-title" type="text" value={meta.title} onChange={(e) => changeMeta({ title: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="decision-status">
            Status
          </label>
          <select id="decision-status" className="select" value={meta.status} onChange={(e) => changeMeta(statusChange(e.target.value as DecisionStatus, meta.decided_on))}>
            {DECISION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="field-label">Decided on</span>
          <span>{meta.decided_on ?? <span className="muted">Set when the status is Decided</span>}</span>
        </div>
      </div>
    </DocEditorFrame>
  )
}
