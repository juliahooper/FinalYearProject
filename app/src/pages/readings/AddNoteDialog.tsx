import { useState } from 'react'
import { Dialog } from '../../components/Dialog'
import { DECISION_GROUPS, SECTIONS } from '../../config'
import type { Tag } from '../../data/types'

// Asked after a passage is highlighted (or from an existing highlight): which decision groups and
// report sections should show it as a note.
export function AddNoteDialog({
  text,
  tag,
  groups,
  sections,
  isNew,
  saving,
  onSave,
  onCancel,
}: {
  text: string
  tag?: Tag
  groups: string[]
  sections: string[]
  isNew: boolean
  saving: boolean
  onSave: (groups: string[], sections: string[]) => void
  onCancel: () => void
}) {
  const [pickedGroups, setGroups] = useState(groups)
  const [pickedSections, setSections] = useState(sections)
  const toggle = (list: string[], set: (l: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  const picked = pickedGroups.length + pickedSections.length

  return (
    <Dialog
      title={isNew ? 'Add this as a note?' : 'Show this highlight as a note on'}
      onClose={onCancel}
      actions={
        <>
          <button className="btn btn-quiet" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          {isNew && (
            <button className="btn" onClick={() => onSave([], [])} disabled={saving}>
              Just highlight
            </button>
          )}
          <button className="btn btn-primary" onClick={() => onSave(pickedGroups, pickedSections)} disabled={saving || (isNew && picked === 0)}>
            {saving ? 'Saving…' : isNew ? 'Add note' : 'Save'}
          </button>
        </>
      }
    >
      <blockquote className="note-card dialog-quote" style={{ background: tag?.bg }}>
        {text}
      </blockquote>
      <p className="muted">Ticked places are the ones this reading is already linked to.</p>
      <div className="dialog-columns">
        <fieldset>
          <legend className="field-label">Decision groups</legend>
          {DECISION_GROUPS.map((g) => (
            <label key={g.id} className="dropdown-option">
              <input type="checkbox" checked={pickedGroups.includes(g.id)} onChange={() => toggle(pickedGroups, setGroups, g.id)} />
              <span>{g.label}</span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend className="field-label">Report sections</legend>
          {SECTIONS.map((s) => (
            <label key={s.id} className="dropdown-option">
              <input type="checkbox" checked={pickedSections.includes(s.id)} onChange={() => toggle(pickedSections, setSections, s.id)} />
              <span>{s.label}</span>
            </label>
          ))}
        </fieldset>
      </div>
    </Dialog>
  )
}
