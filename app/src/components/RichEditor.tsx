import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { editorExtensions } from '../editor/extensions'
import { toEditor } from '../editor/markdown'

// The rich text editor (PLAN.md §6.3): markdown in, Tiptap document out. The caller turns the
// document back into markdown with fromEditor(editor, original) when saving.
export function RichEditor({ markdown, onReady, onChange }: { markdown: string; onReady: (e: Editor) => void; onChange: () => void }) {
  const editor = useEditor({
    extensions: editorExtensions(),
    content: toEditor(markdown),
    editorProps: { attributes: { class: 'markdown reading-text editor-body', 'aria-label': 'Note text' } },
    onCreate: ({ editor }) => onReady(editor),
    onUpdate: () => onChange(),
  })
  if (!editor) return null
  return (
    <div className="editor">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      link: e.isActive('link'),
      table: e.isActive('table'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })

  function setLink() {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link address (leave empty to remove the link)', previous ?? 'https://')
    if (url === null) return
    if (url.trim() === '' || url === 'https://') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  const b = (label: string, active: boolean, run: () => void, title = label, disabled = false) => (
    <button type="button" className={`tool${active ? ' on' : ''}`} aria-pressed={active} title={title} aria-label={title} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={run}>
      {label}
    </button>
  )

  const c = () => editor.chain().focus()
  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting">
      {b('B', s.bold, () => c().toggleBold().run(), 'Bold (Ctrl+B)')}
      {b('I', s.italic, () => c().toggleItalic().run(), 'Italic (Ctrl+I)')}
      <span className="tool-sep" />
      {b('H2', s.h2, () => c().toggleHeading({ level: 2 }).run(), 'Heading')}
      {b('H3', s.h3, () => c().toggleHeading({ level: 3 }).run(), 'Subheading')}
      <span className="tool-sep" />
      {b('• List', s.bullet, () => c().toggleBulletList().run(), 'Bullet list')}
      {b('1. List', s.ordered, () => c().toggleOrderedList().run(), 'Numbered list')}
      <span className="tool-sep" />
      {b('Link', s.link, setLink, 'Link')}
      {s.table ? (
        <>
          {b('+ Row', false, () => c().addRowAfter().run(), 'Add a row below')}
          {b('+ Column', false, () => c().addColumnAfter().run(), 'Add a column to the right')}
          {b('− Row', false, () => c().deleteRow().run(), 'Delete this row')}
          {b('Delete table', false, () => c().deleteTable().run(), 'Delete the table')}
        </>
      ) : (
        b('Table', false, () => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), 'Insert a table')
      )}
      <span className="tool-sep" />
      {b('Undo', false, () => c().undo().run(), 'Undo (Ctrl+Z)', !s.canUndo)}
      {b('Redo', false, () => c().redo().run(), 'Redo (Ctrl+Shift+Z)', !s.canRedo)}
    </div>
  )
}
