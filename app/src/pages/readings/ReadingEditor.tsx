import type { Editor } from '@tiptap/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Banner } from '../../components/Banner'
import { MultiSelect } from '../../components/MultiSelect'
import { READING_STATUSES, statusLabel, TagPill } from '../../components/Pills'
import { RichEditor } from '../../components/RichEditor'
import { Stars } from '../../components/Stars'
import { SECTIONS } from '../../config'
import { clearDraft, getDraft, setDraft, type Draft } from '../../data/cache'
import { addTag, updateMarkdownFile } from '../../data/edit'
import { splitFrontMatter } from '../../data/frontmatter'
import { useRepo } from '../../data/RepoContext'
import type { Doc, ReadingMeta, ReadingStatus } from '../../data/types'
import { useSave } from '../../data/useSave'
import { fromEditor } from '../../editor/markdown'

type EditableMeta = Pick<ReadingMeta, 'stars' | 'status' | 'tags' | 'decisions' | 'sections' | 'found_via'>
const pickMeta = (m: ReadingMeta): EditableMeta => ({ stars: m.stars, status: m.status, tags: m.tags, decisions: m.decisions, sections: m.sections, found_via: m.found_via })

export function ReadingEditor({ reading, onDone }: { reading: Doc<ReadingMeta>; onDone: () => void }) {
  const { data, reload } = useRepo()
  const { save, saving, problem, clearProblem } = useSave()
  const tagSave = useSave()

  // What the edit started from: the file as loaded, or a restored draft.
  const [start, setStart] = useState<{ text: string; baseSha: string; restored: Draft | null } | null>(null)
  const [meta, setMeta] = useState<EditableMeta>(pickMeta(reading.meta))
  const [dirty, setDirty] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [tagError, setTagError] = useState<string | null>(null)
  const editorRef = useRef<Editor | null>(null)
  const draftTimer = useRef<number | undefined>(undefined)

  // On open, restore an unsaved draft if there is one.
  useEffect(() => {
    let live = true
    void getDraft(reading.path).then((draft) => {
      if (!live) return
      if (draft && draft.text !== reading.text) {
        const parsed = splitFrontMatter<ReadingMeta>(draft.text)
        if (parsed.data) setMeta(pickMeta({ ...reading.meta, ...parsed.data }))
        setStart({ text: draft.text, baseSha: draft.baseSha ?? reading.sha, restored: draft })
        setDirty(true)
      } else setStart({ text: reading.text, baseSha: reading.sha, restored: null })
    })
    return () => {
      live = false
    }
    // Only when a different reading is opened, not after each save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading.path])

  const startBody = start ? splitFrontMatter(start.text).body : ''

  const compose = useCallback(
    (m: EditableMeta) => {
      const body = editorRef.current ? fromEditor(editorRef.current, splitFrontMatter(reading.text).body) : splitFrontMatter(reading.text).body
      return updateMarkdownFile(reading.text, m, body)
    },
    [reading.text],
  )

  // Keep a local draft a moment after each change.
  const scheduleDraft = useCallback(
    (m: EditableMeta) => {
      setDirty(true)
      window.clearTimeout(draftTimer.current)
      draftTimer.current = window.setTimeout(() => {
        if (start) void setDraft(reading.path, { text: compose(m), baseSha: start.baseSha, savedAt: new Date().toISOString() })
      }, 600)
    },
    [compose, reading.path, start],
  )

  function changeMeta(changes: Partial<EditableMeta>) {
    const next = { ...meta, ...changes }
    setMeta(next)
    scheduleDraft(next)
  }

  const doSave = useCallback(async () => {
    if (!start || saving) return
    window.clearTimeout(draftTimer.current)
    const text = compose(meta)
    if (text === reading.text) {
      await clearDraft(reading.path)
      onDone()
      return
    }
    if (await save(reading.path, text, start.baseSha)) onDone()
  }, [start, saving, compose, meta, reading.text, reading.path, save, onDone])

  // Ctrl+S / Cmd+S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void doSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doSave])

  async function cancel() {
    if (dirty && !window.confirm('Discard your unsaved changes to this reading?')) return
    window.clearTimeout(draftTimer.current)
    await clearDraft(reading.path)
    onDone()
  }

  async function createTag() {
    if (!data) return
    setTagError(null)
    const file = data.files.get('tags.yml')
    try {
      const { text, tag } = addTag(file?.text ?? '', data.tags, newTag)
      if (await tagSave.save('tags.yml', text)) {
        changeMeta({ tags: [...meta.tags, tag.id] })
        setNewTag('')
      }
    } catch (e) {
      setTagError((e as Error).message)
    }
  }

  async function copyMyText() {
    try {
      await navigator.clipboard.writeText(compose(meta))
    } catch {
      window.alert('Your browser blocked copying. Select the text in the editor and copy it by hand.')
    }
  }

  if (!data || !start) return <p className="muted">Opening the editor…</p>
  const tagById = new Map(data.tags.map((t) => [t.id, t]))

  return (
    <article className="reading editing">
      <div className="editor-head">
        <h1 className="reading-title">{reading.meta.title}</h1>
        <div className="editor-actions">
          {dirty && <span className="unsaved">Unsaved changes</span>}
          <button className="btn" onClick={() => void cancel()} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => void doSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {start.restored && (
        <Banner
          kind="warn"
          actions={
            <button
              className="btn btn-quiet"
              onClick={() => {
                void clearDraft(reading.path).then(() => window.location.reload())
              }}
            >
              Discard them
            </button>
          }
        >
          Restored your unsaved changes from {new Date(start.restored.savedAt).toLocaleString('en-GB')}.
        </Banner>
      )}
      {problem?.kind === 'conflict' && (
        <Banner
          kind="err"
          actions={
            <>
              <button className="btn" onClick={() => void copyMyText()}>
                Copy my text
              </button>
              <button
                className="btn"
                onClick={() => {
                  clearProblem()
                  void reload()
                }}
              >
                Reload from GitHub
              </button>
            </>
          }
        >
          {problem.message}
        </Banner>
      )}
      {problem?.kind === 'error' && <Banner kind="err">{problem.message}</Banner>}

      <div className="meta-form">
        <div className="field">
          <span className="field-label">Stars</span>
          <Stars value={meta.stars} onChange={(stars) => changeMeta({ stars })} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="edit-status">
            Status
          </label>
          <select
            id="edit-status"
            className="select"
            value={meta.status}
            onChange={(e) => changeMeta({ status: e.target.value as ReadingStatus })}
          >
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

      <RichEditor
        markdown={startBody}
        onReady={(e) => {
          editorRef.current = e
        }}
        onChange={() => scheduleDraft(meta)}
      />
    </article>
  )
}
