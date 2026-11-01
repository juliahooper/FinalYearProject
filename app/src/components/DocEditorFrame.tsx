import type { Editor } from '@tiptap/core'
import type { ReactNode } from 'react'
import type { Draft } from '../data/cache'
import { useRepo } from '../data/RepoContext'
import type { SaveProblem } from '../data/useSave'
import { Banner } from './Banner'
import { RichEditor } from './RichEditor'

// The parts of useDocEditor's state this frame uses.
interface DocEditorState {
  start: { restored: Draft | null } | null
  startBody: string
  dirty: boolean
  saving: boolean
  problem: SaveProblem
  clearProblem: () => void
  doSave: () => Promise<void>
  cancel: () => Promise<void>
  discardDraft: () => Promise<void>
  copyMyText: () => Promise<void>
  onEditorReady: (e: Editor) => void
  onEditorChange: () => void
}

// The parts every editing screen shares: title and Save/Cancel, draft and conflict banners,
// the screen's own metadata controls (children), and the rich text body.
export function DocEditorFrame({ title, ed, children }: { title: ReactNode; ed: DocEditorState; children?: ReactNode }) {
  const { reload } = useRepo()
  if (!ed.start) return <p className="muted">Opening the editor…</p>
  return (
    <article className="reading editing">
      <div className="editor-head">
        <h1 className="reading-title">{title}</h1>
        <div className="editor-actions">
          {ed.dirty && <span className="unsaved">Unsaved changes</span>}
          <button className="btn" onClick={() => void ed.cancel()} disabled={ed.saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => void ed.doSave()} disabled={ed.saving}>
            {ed.saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {ed.start.restored && (
        <Banner
          kind="warn"
          actions={
            <button className="btn btn-quiet" onClick={() => void ed.discardDraft()}>
              Discard them
            </button>
          }
        >
          Restored your unsaved changes from {new Date(ed.start.restored.savedAt).toLocaleString('en-GB')}.
        </Banner>
      )}
      {ed.problem?.kind === 'conflict' && (
        <Banner
          kind="err"
          actions={
            <>
              <button className="btn" onClick={() => void ed.copyMyText()}>
                Copy my text
              </button>
              <button
                className="btn"
                onClick={() => {
                  ed.clearProblem()
                  void reload()
                }}
              >
                Reload from GitHub
              </button>
            </>
          }
        >
          {ed.problem.message}
        </Banner>
      )}
      {ed.problem?.kind === 'error' && <Banner kind="err">{ed.problem.message}</Banner>}

      {children}

      <RichEditor markdown={ed.startBody} onReady={ed.onEditorReady} onChange={ed.onEditorChange} />
    </article>
  )
}
