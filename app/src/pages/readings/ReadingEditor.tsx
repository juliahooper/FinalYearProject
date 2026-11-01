import { useState } from 'react'
import { DocEditorFrame } from '../../components/DocEditorFrame'
import { MultiSelect } from '../../components/MultiSelect'
import { READING_STATUSES, statusLabel, TagPill } from '../../components/Pills'
import { Stars } from '../../components/Stars'
import { SECTIONS } from '../../config'
import { addTag } from '../../data/edit'
import { useRepo } from '../../data/RepoContext'
import type { Doc, ReadingMeta, ReadingStatus } from '../../data/types'
import { useSave } from '../../data/useSave'
import { useDocEditor } from '../../editor/useDocEditor'

type EditableMeta = Pick<ReadingMeta, 'stars' | 'status' | 'tags' | 'decisions' | 'sections' | 'found_via'>
const pickMeta = (m: ReadingMeta): EditableMeta => ({ stars: m.stars, status: m.status, tags: m.tags, decisions: m.decisions, sections: m.sections, found_via: m.found_via })

export function ReadingEditor({ reading, onDone }: { reading: Doc<ReadingMeta>; onDone: () => void }) {
  const { data } = useRepo()
  const ed = useDocEditor(reading, pickMeta, onDone)
  const tagSave = useSave()
  const [newTag, setNewTag] = useState('')
  const [tagError, setTagError] = useState<string | null>(null)
  const { meta, changeMeta } = ed

  async function createTag() {
    if (!data) return
    setTagError(null)
    try {
      const { text, tag } = addTag(data.files.get('tags.yml')?.text ?? '', data.tags, newTag)
      if (await tagSave.save('tags.yml', text)) {
        changeMeta({ tags: [...meta.tags, tag.id] })
        setNewTag('')
      }
    } catch (e) {
      setTagError((e as Error).message)
    }
  }

  if (!data) return null
  const tagById = new Map(data.tags.map((t) => [t.id, t]))

  return (
    <DocEditorFrame title={reading.meta.title} ed={ed}>
      <div className="meta-form">
        <div className="field">
          <span className="field-label">Stars</span>
          <Stars value={meta.stars} onChange={(stars) => changeMeta({ stars })} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="edit-status">
            Status
          </label>
          <select id="edit-status" className="select" value={meta.status} onChange={(e) => changeMeta({ status: e.target.value as ReadingStatus })}>
            {READING_STATUSES.map((s) => (
              <option key={s} value={s} disabled={s === 'verified' && !reading.meta.verified}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="field-label">Tags</span>
          <div className="pill-row">
            {meta.tags.map((t) => (
              <TagPill key={t} id={t} tag={tagById.get(t)} onRemove={() => changeMeta({ tags: meta.tags.filter((x) => x !== t) })} />
            ))}
            <MultiSelect
              label="Add tags"
              options={data.tags.map((t) => ({ value: t.id, label: t.label, dot: t.bg }))}
              selected={meta.tags}
              onChange={(tags) => changeMeta({ tags })}
              footer={
                <form
                  className="new-tag"
                  onSubmit={(e) => {
                    e.preventDefault()
                    void createTag()
                  }}
                >
                  <input type="text" placeholder="Add new tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} aria-label="New tag name" />
                  <button className="btn" type="submit" disabled={!newTag.trim() || tagSave.saving}>
                    Add
                  </button>
                  {(tagError || tagSave.problem) && <div className="field-error">{tagError ?? tagSave.problem?.message}</div>}
                </form>
              }
            />
          </div>
        </div>
        <div className="field">
          <span className="field-label">Decisions</span>
          <MultiSelect
            label={meta.decisions.length ? meta.decisions.join(', ') : 'None'}
            options={data.decisions.map((d) => ({ value: d.meta.id, label: `${d.meta.id} ${d.meta.title}` }))}
            selected={meta.decisions}
            onChange={(decisions) => changeMeta({ decisions })}
          />
        </div>
        <div className="field">
          <span className="field-label">Report sections</span>
          <MultiSelect
            label={meta.sections.length ? meta.sections.map((s) => SECTIONS.find((x) => x.id === s)?.label ?? s).join(', ') : 'None'}
            options={SECTIONS.map((s) => ({ value: s.id, label: s.label, hint: s.reports.length === 2 ? '' : s.reports[0] }))}
            selected={meta.sections}
            onChange={(sections) => changeMeta({ sections })}
          />
        </div>
        <div className="field field-wide">
          <label className="field-label" htmlFor="found-via">
            Found via
          </label>
          <input id="found-via" type="text" value={meta.found_via} placeholder='e.g. IEEE Xplore search "representational bias dataset"' onChange={(e) => changeMeta({ found_via: e.target.value })} />
        </div>
      </div>
    </DocEditorFrame>
  )
}
