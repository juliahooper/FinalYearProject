// @vitest-environment jsdom
import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'
import { editorExtensions } from './extensions'
import { fromEditor, toEditor } from './markdown'
import type { MentionMenu } from './mentions'

const items = [
  { key: 'caliskan2017semantics', label: 'Semantics Derived Automatically · Caliskan et al. 2017' },
  { key: 'kumar2025detecting', label: 'Detecting and Mitigating Bias in LLMs · Kumar et al. 2025' },
]

function setup(md = '## Question\nWhat should we use?\n') {
  let menu: MentionMenu | null = null
  const editor = new Editor({ extensions: editorExtensions({ items: () => items, onMenu: (m) => (menu = m) }), content: toEditor(md) })
  const press = (key: string) => editor.view.someProp('handleKeyDown', (f) => f(editor.view, new KeyboardEvent('keydown', { key })))
  return { editor, menu: () => menu, press, md }
}

describe('@mentions in the editor', () => {
  it('typing @ and part of a name offers matching readings', () => {
    const t = setup()
    t.editor.chain().focus('end').insertContent(' See @cal').run()
    expect(t.menu()?.items.map((i) => i.key)).toEqual(['caliskan2017semantics'])
    t.editor.destroy()
  })

  it('a title word matches too', () => {
    const t = setup()
    t.editor.chain().focus('end').insertContent(' @knowledge').run()
    expect(t.menu()).toBeNull() // no reading matches, so the list closes
    t.editor.chain().focus('end').insertContent(' @mitigating').run()
    expect(t.menu()?.items.map((i) => i.key)).toEqual(['kumar2025detecting'])
    t.editor.destroy()
  })

  it('Enter inserts the key, and it saves as plain @key text', () => {
    const t = setup()
    t.editor.chain().focus('end').insertContent(' See @cal').run()
    expect(t.press('Enter')).toBe(true)
    expect(t.menu()).toBeNull()
    expect(fromEditor(t.editor, t.md)).toBe('## Question\nWhat should we use? See @caliskan2017semantics\n')
    t.editor.destroy()
  })

  it('arrow keys move through the list', () => {
    const t = setup()
    t.editor.chain().focus('end').insertContent(' @').run()
    expect(t.menu()?.index).toBe(0)
    t.press('ArrowDown')
    expect(t.menu()?.index).toBe(1)
    t.press('Enter')
    expect(fromEditor(t.editor, t.md)).toContain('@kumar2025detecting')
    t.editor.destroy()
  })

  it('Escape closes the list without inserting anything', () => {
    const t = setup()
    t.editor.chain().focus('end').insertContent(' @cal').run()
    t.press('Escape')
    expect(t.menu()).toBeNull()
    expect(fromEditor(t.editor, t.md)).toContain('@cal')
    t.editor.destroy()
  })

  it('an email address does not open the list', () => {
    const t = setup()
    t.editor.chain().focus('end').insertContent(' me@cal').run()
    expect(t.menu()).toBeNull()
    t.editor.destroy()
  })
})
