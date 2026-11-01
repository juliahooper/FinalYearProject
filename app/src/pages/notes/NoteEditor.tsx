import { useEffect, type ReactNode } from 'react'
import { DocEditorFrame } from '../../components/DocEditorFrame'
import type { RawFile } from '../../data/types'
import { useDocEditor } from '../../editor/useDocEditor'

const noMeta = () => ({})

// The notes for one report section: always in the rich text editor (PLAN.md §6.5).
// A notes file that doesn't exist yet is created on the first save.
export function NoteEditor({
  path,
  file,
  title,
  needs,
  onDone,
  onCiteReady,
}: {
  path: string
  file: RawFile | undefined
  title: string
  needs: ReactNode
  onDone: () => void
  onCiteReady: (api: { cite: (key: string) => void } | null) => void
}) {
  const ed = useDocEditor({ path, sha: file?.sha ?? '', text: file?.text ?? '', meta: {} }, noMeta, onDone)
  const { getEditor } = ed

  // Lets the readings panel insert \parencite{key} at the cursor.
  useEffect(() => {
    onCiteReady({
      cite: (key) => {
        const editor = getEditor()
        if (!editor) return
        const text = `\\parencite{${key}}`
        // If the cursor was never placed (it sits at the very start, in the title),
        // add the citation as a new paragraph at the end instead.
        if (editor.state.selection.from <= 1) {
          editor
            .chain()
            .insertContentAt(editor.state.doc.content.size, { type: 'paragraph', content: [{ type: 'text', text }] })
            .focus('end')
            .run()
        } else editor.chain().focus().insertContent({ type: 'text', text }).run()
      },
    })
    return () => onCiteReady(null)
  }, [getEditor, onCiteReady])

  return (
    <DocEditorFrame title={title} ed={ed}>
      {needs}
    </DocEditorFrame>
  )
}
