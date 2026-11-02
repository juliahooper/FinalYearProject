// @mentions in the editor: typing "@" opens a list of readings; choosing one inserts "@key".
// Mentions are stored as plain text, so they read naturally on GitHub too, and are shown as
// links in the app (render/markdown.ts). Known mentions are highlighted while editing.
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view'

export interface MentionItem {
  key: string
  label: string // e.g. the reading's short title, author and year
}

export interface MentionMenu {
  items: MentionItem[]
  index: number
  left: number
  top: number
  choose: (item: MentionItem) => void
}

export interface MentionOptions {
  items: () => MentionItem[]
  onMenu: (menu: MentionMenu | null) => void
}

const key = new PluginKey('mentions')
// "@" at the start or after a space or bracket, then the typed query, right before the cursor.
const TRIGGER = /(?:^|[\s(])@([A-Za-z0-9_-]*)$/

export const Mentions = Extension.create<MentionOptions>({
  name: 'mentions',
  // Above the default (100), so the list gets arrow keys, Enter and Escape before the editor's own keymaps.
  priority: 1000,

  addOptions() {
    return { items: () => [], onMenu: () => {} }
  },

  addProseMirrorPlugins() {
    const options = this.options
    let index = 0
    let lastQuery: string | null = null
    let dismissedAt: number | null = null
    let current: { from: number; to: number; items: MentionItem[] } | null = null
    let viewRef: EditorView | null = null

    function choose(item: MentionItem) {
      if (!viewRef || !current) return
      const { from, to } = current
      viewRef.dispatch(viewRef.state.tr.insertText(`@${item.key} `, from, to))
      viewRef.focus()
    }

    function update(view: EditorView) {
      viewRef = view
      const { selection } = view.state
      const $from = selection.$from
      const textBefore = selection.empty ? $from.parent.textBetween(0, $from.parentOffset, undefined, '￼') : ''
      const m = textBefore.match(TRIGGER)
      const atPos = m ? selection.from - m[1].length - 1 : null
      if (!m || atPos === null || atPos === dismissedAt) {
        current = null
        if (!m) dismissedAt = null
        options.onMenu(null)
        return
      }
      const query = m[1].toLowerCase()
      if (query !== lastQuery) index = 0
      lastQuery = query
      const items = options
        .items()
        .filter((i) => !query || i.key.toLowerCase().includes(query) || i.label.toLowerCase().includes(query))
        .slice(0, 8)
      if (items.length === 0) {
        current = null
        options.onMenu(null)
        return
      }
      index = Math.min(index, items.length - 1)
      current = { from: atPos, to: selection.from, items }
      let coords = { left: 0, bottom: 0 }
      try {
        coords = view.coordsAtPos(atPos)
      } catch {
        // Position can't be measured (e.g. the editor isn't laid out yet); show the menu at the corner.
      }
      options.onMenu({ items, index, left: coords.left, top: coords.bottom, choose })
    }

    return [
      new Plugin({
        key,
        view: (view) => {
          update(view)
          return { update: (v) => update(v), destroy: () => options.onMenu(null) }
        },
        props: {
          handleKeyDown(view, event) {
            if (!current) return false
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              index = (index + (event.key === 'ArrowDown' ? 1 : -1) + current.items.length) % current.items.length
              update(view)
              return true
            }
            if (event.key === 'Enter' || event.key === 'Tab') {
              choose(current.items[index])
              return true
            }
            if (event.key === 'Escape') {
              dismissedAt = current.from
              update(view)
              return true
            }
            return false
          },
          // Highlight @mentions of known readings while editing.
          decorations(state) {
            const known = new Set(options.items().map((i) => i.key))
            if (known.size === 0) return null
            const decos: Decoration[] = []
            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text || node.marks.some((mk) => mk.type.name === 'code')) return
              for (const m of node.text.matchAll(/(^|[^\w@.])@([A-Za-z][A-Za-z0-9_-]*[A-Za-z0-9])/g)) {
                if (!known.has(m[2])) continue
                const from = pos + m.index! + m[1].length
                decos.push(Decoration.inline(from, from + 1 + m[2].length, { class: 'mention-inline' }))
              }
            })
            return DecorationSet.create(state.doc, decos)
          },
        },
      }),
    ]
  },
})
