import type { Extensions } from '@tiptap/core'
import { TableKit } from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'

// The editor's extensions, shared by the app and the round-trip tests.
export function editorExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: { openOnClick: false, autolink: false, HTMLAttributes: { rel: 'noreferrer', target: '_blank' } },
      underline: false, // markdown has no underline
    }),
    TableKit.configure({ table: { resizable: false } }),
    Markdown.configure({
      html: false, // never let raw HTML into the document
      tightLists: true,
      bulletListMarker: '-',
      linkify: false,
      breaks: false,
      transformPastedText: true,
    }),
  ]
}
