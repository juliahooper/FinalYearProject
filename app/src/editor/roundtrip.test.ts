// @vitest-environment jsdom
// Markdown must survive load -> editor -> save unchanged when nothing was edited (PLAN.md §6.3),
// and an edit must only change the edited lines.
import { Editor } from '@tiptap/core'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { splitFrontMatter } from '../data/frontmatter'
import { editorExtensions } from './extensions'
import { fromEditor, toEditor } from './markdown'

function load(md: string) {
  return new Editor({ extensions: editorExtensions(), content: toEditor(md) })
}

function roundTrip(md: string): string {
  const editor = load(md)
  const out = fromEditor(editor, md)
  editor.destroy()
  return out
}

const cases: Record<string, string> = {
  headings: '## TL;DR\nText.\n\n### A smaller heading\n\nMore text.\n',
  'numbered headings': '## 1. What is the aim of the paper?\nAnswer.',
  'bullet list': '- one\n- two\n- three',
  'numbered list': '1. one\n2. two\n3. three',
  'nested list': '- outer\n  - inner\n- next',
  bold: 'Some **bold** text.',
  italic: 'Some *italic* text.',
  'bold label in a list': '- **Data and model:** pre-trained GloVe (p. 9).',
  'label then list, no blank line': '**Real-world use cases (p. 11):**\n- one\n- two',
  link: 'See [the paper](https://doi.org/10.1126/science.aal4230).',
  table: '| Parameter | Value |\n| --- | --- |\n| Input | 1 |\n| Output | 2 |\n',
  'page reference': 'The effect size is 1.50 (p. 3), and 0.90 (pp. 6–7).',
  'inline code': 'Run `node scripts/check.mjs` first.',
  'square-bracket citations': 'Reducing bias in diagnostic suggestions [13] and a broken "[?]" citation.',
  'less-than signs': 'Effect size 1.50, p < 10⁻⁷.',
  blockquote: '> **Source note:** drafted from the preprint.',
  'mermaid block': '```mermaid\nflowchart LR\n  A["Web text"]:::data --> B["GloVe"]\n  classDef data fill:#E1EFFB,color:#1F1B1E\n```',
  'display math, multi-line': 'The score:\n\n$$\ns(w,A,B)=\\operatorname{mean}_{a\\in A}\\cos(\\vec w,\\vec a)\n$$\n\nDone.',
  'display math, one line': '$$P(\\hat Y = 1 \\mid A = a) = P(\\hat Y = 1 \\mid A = b)$$',
  'inline math': 'For each word $w$ in set $X$, the lean is $s(x,A,B)$.',
  quote: 'Quote (p. 12): "eliminating bias is eliminating information"',
}

describe('markdown round-trip with no edits', () => {
  for (const [name, md] of Object.entries(cases)) {
    it(name, () => expect(roundTrip(md)).toBe(md))
  }
})

describe('reading notes in the repo, with no edits', () => {
  const dir = join(__dirname, '../../../readings')
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  for (const f of files) {
    it(f, () => {
      const { body } = splitFrontMatter(readFileSync(join(dir, f), 'utf8'))
      expect(roundTrip(body)).toBe(body)
    })
  }
})

describe('an edit changes only the edited line', () => {
  it('typing at the end of one paragraph', () => {
    const md = '## TL;DR\nFirst [13] p < 0.05.\n\n## Next\nSecond paragraph.\n'
    const editor = load(md)
    // Put the cursor at the end of "Second paragraph." and type.
    let end = 0
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text === 'Second paragraph.') end = pos + node.nodeSize
    })
    editor.chain().setTextSelection(end).insertContent(' Added.').run()
    const out = fromEditor(editor, md)
    editor.destroy()
    expect(out).toBe('## TL;DR\nFirst [13] p < 0.05.\n\n## Next\nSecond paragraph. Added.\n')
  })

  it('adding a new paragraph keeps everything else as it was', () => {
    const md = '## TL;DR\nFirst [13].\n\n## Next\nSecond.\n'
    const editor = load(md)
    editor.commands.insertContentAt(editor.state.doc.content.size, {
      type: 'paragraph',
      content: [{ type: 'text', text: 'A new [14] paragraph, p < 0.05.' }],
    })
    const out = fromEditor(editor, md)
    editor.destroy()
    expect(out).toBe('## TL;DR\nFirst [13].\n\n## Next\nSecond.\n\nA new [14] paragraph, p < 0.05.\n')
  })

  it('deleting a paragraph removes only that line', () => {
    const md = '## A\nKeep [1].\n\nDelete me.\n\n## B\nKeep too.\n'
    const editor = load(md)
    let from = 0
    let to = 0
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'paragraph' && node.textContent === 'Delete me.') {
        from = pos
        to = pos + node.nodeSize
      }
    })
    editor.chain().deleteRange({ from, to }).run()
    const out = fromEditor(editor, md)
    editor.destroy()
    expect(out).toBe('## A\nKeep [1].\n\n## B\nKeep too.\n')
  })
})
