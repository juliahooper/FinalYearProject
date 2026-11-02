import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { authorLine, shortTitle } from '../data/readingText'
import { useRepo } from '../data/RepoContext'
import { editorExtensions } from '../editor/extensions'
import { toEditor } from '../editor/markdown'
import type { MentionItem, MentionMenu } from '../editor/mentions'

// The rich text editor (PLAN.md §6.3): markdown in, Tiptap document out. The caller turns the
// document back into markdown with fromEditor(editor, original) when saving.
// Typing @ offers readings to mention.
export function RichEditor({ markdown, onReady, onChange }: { markdown: string; onReady: (e: Editor) => void; onChange: () => void }) {
  const { data } = useRepo()
  const [menu, setMenu] = useState<MentionMenu | null>(null)
  // The extension reads the latest readings through this ref, so it never needs rebuilding.
  const readingItems = useMemo<MentionItem[]>(
    () => (data?.readings ?? []).map((r) => ({ key: r.meta.key, label: `${shortTitle(r.meta.title)} · ${authorLine(r.meta)} ${r.meta.year ?? ''}` })),
    [data?.readings],
  )
  const items = useRef<MentionItem[]>(readingItems)
  useEffect(() => {
    items.current = readingItems
  }, [readingItems])

  const editor = useEditor({
    extensions: editorExtensions({ items: () => items.current, onMenu: setMenu }),
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
      {menu && (
        <ul className="mention-menu" role="listbox" aria-label="Mention a reading" style={{ left: menu.left, top: menu.top + 4 }}>
          {menu.items.map((item, i) => (
            <li
              key={item.key}
              role="option"
              aria-selected={i === menu.index}
              className={i === menu.index ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault()
                menu.choose(item)
              }}
            >
              <code>@{item.key}</code>
              <span className="muted">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
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
