// Shared editing logic for markdown files with front matter (readings, decisions): the
// metadata being edited, the rich text body, local drafts, explicit save (button or Ctrl/Cmd+S),
// and conflict handling (PLAN.md §6.1).
import type { Editor } from '@tiptap/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clearDraft, getDraft, setDraft, type Draft } from '../data/cache'
import { updateMarkdownFile } from '../data/edit'
import { splitFrontMatter } from '../data/frontmatter'
import { useSave } from '../data/useSave'
import { fromEditor } from './markdown'

export interface EditableDoc<T> {
  path: string
  sha: string
  text: string
  meta: T
}

export function useDocEditor<T, M extends object>(doc: EditableDoc<T>, pick: (meta: T) => M, onDone: () => void) {
  const { save, saving, problem, clearProblem } = useSave()
  // What the edit started from: the file as loaded, or a restored draft.
  const [start, setStart] = useState<{ text: string; baseSha: string; restored: Draft | null } | null>(null)
  const [meta, setMeta] = useState<M>(() => pick(doc.meta))
  const [dirty, setDirty] = useState(false)
  const editorRef = useRef<Editor | null>(null)
  const draftTimer = useRef<number | undefined>(undefined)

  // On open, restore an unsaved draft if there is one.
  useEffect(() => {
    let live = true
    void getDraft(doc.path).then((draft) => {
      if (!live) return
      if (draft && draft.text !== doc.text) {
        const parsed = splitFrontMatter<T>(draft.text)
        if (parsed.data) setMeta(pick({ ...doc.meta, ...parsed.data }))
        setStart({ text: draft.text, baseSha: draft.baseSha ?? doc.sha, restored: draft })
        setDirty(true)
      } else setStart({ text: doc.text, baseSha: doc.sha, restored: null })
    })
    return () => {
      live = false
    }
    // Only when a different file is opened, not after each save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.path])

  // Files without front matter (report notes) are all body.
  const hasFrontMatter = splitFrontMatter(doc.text).data !== null
  const bodyOf = (text: string) => (hasFrontMatter ? splitFrontMatter(text).body : text)
  const originalBody = bodyOf(doc.text)

  const compose = useCallback(
    (m: M) => {
      const body = editorRef.current ? fromEditor(editorRef.current, originalBody) : originalBody
      return hasFrontMatter ? updateMarkdownFile(doc.text, m as Record<string, unknown>, body) : body
    },
    [doc.text, originalBody, hasFrontMatter],
  )

  // Keep a local draft a moment after each change.
  const scheduleDraft = useCallback(
    (m: M) => {
      setDirty(true)
      window.clearTimeout(draftTimer.current)
      draftTimer.current = window.setTimeout(() => {
        if (start) void setDraft(doc.path, { text: compose(m), baseSha: start.baseSha, savedAt: new Date().toISOString() })
      }, 600)
    },
    [compose, doc.path, start],
  )

  const changeMeta = useCallback(
    (changes: Partial<M>) => {
      const next = { ...meta, ...changes }
      setMeta(next)
      scheduleDraft(next)
    },
    [meta, scheduleDraft],
  )

  const doSave = useCallback(async () => {
    if (!start || saving) return
    window.clearTimeout(draftTimer.current)
    const text = compose(meta)
    if (text === doc.text) {
      await clearDraft(doc.path)
      onDone()
      return
    }
    if (await save(doc.path, text, start.baseSha)) onDone()
  }, [start, saving, compose, meta, doc.text, doc.path, save, onDone])

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

  const cancel = useCallback(async () => {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return
    window.clearTimeout(draftTimer.current)
    await clearDraft(doc.path)
    onDone()
  }, [dirty, doc.path, onDone])

  const discardDraft = useCallback(async () => {
    await clearDraft(doc.path)
    window.location.reload()
  }, [doc.path])

  // Stable, so screens can depend on it in effects.
  const getEditor = useCallback(() => editorRef.current, [])

  const copyMyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(compose(meta))
    } catch {
      window.alert('Your browser blocked copying. Select the text in the editor and copy it by hand.')
    }
  }, [compose, meta])

  return {
    start,
    startBody: start ? bodyOf(start.text) : '',
    getEditor,
    meta,
    changeMeta,
    dirty,
    saving,
    problem,
    clearProblem,
    doSave,
    cancel,
    discardDraft,
    copyMyText,
    onEditorReady: (e: Editor) => {
      editorRef.current = e
    },
    onEditorChange: () => scheduleDraft(meta),
  }
}
