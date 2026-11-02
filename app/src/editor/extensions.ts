import type { Extensions } from '@tiptap/core'
import { TableKit } from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import { Mentions, type MentionOptions } from './mentions'

// The editor's extensions, shared by the app and the round-trip tests.
// With `mentions`, typing @ offers readings to link (editor/mentions.ts).
export function editorExtensions(mentions?: MentionOptions): Extensions {
  return [
    ...(mentions ? [Mentions.configure(mentions)] : []),
    StarterKit.configure({
      heading: { levels: [1, 2, 3] }, // notes files start with a level-1 title; the toolbar offers 2 and 3
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
