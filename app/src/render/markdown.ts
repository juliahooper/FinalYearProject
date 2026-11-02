// View-mode rendering of reading notes: markdown-it with KaTeX for maths and placeholders
// for Mermaid diagrams (drawn afterwards by renderDiagrams). Raw HTML in notes is never
// rendered (html: false), and markdown-it refuses javascript: links.
import katex from 'katex'
import MarkdownIt from 'markdown-it'
import { toEditorMarkdown } from '../editor/mathBridge'

const md = new MarkdownIt({ html: false, linkify: false, typographer: false })

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

function tex(source: string, displayMode: boolean): string {
  try {
    return katex.renderToString(source, { displayMode, throwOnError: false, strict: 'ignore', trust: false })
  } catch {
    return `<code>${escapeHtml(source)}</code>`
  }
}

const defaultFence = md.renderer.rules.fence!
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const lang = token.info.trim().split(/\s+/)[0]
  if (lang === 'math' || lang === 'math-line') return `<div class="math-block">${tex(token.content, true)}</div>`
  if (lang === 'mermaid') return `<div class="mermaid-block" data-source="${escapeHtml(token.content)}"><pre>${escapeHtml(token.content)}</pre></div>`
  return defaultFence(tokens, idx, options, env, self)
}

const defaultInlineCode = md.renderer.rules.code_inline!
md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
  const m = tokens[idx].content.match(/^\$(.+)\$$/)
  return m ? tex(m[1], false) : defaultInlineCode(tokens, idx, options, env, self)
}

// External links open in a new tab.
md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
  const href = tokens[idx].attrGet('href') ?? ''
  if (/^https?:/.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noreferrer')
  }
  return self.renderToken(tokens, idx, options)
}

// @mentions: "@caliskan2017semantics" becomes a link to that reading. Only keys of real readings
// are linked; an @ straight after a letter or digit (an email address) is left alone.
export const MENTION = /(^|[^\w@.])@([A-Za-z][A-Za-z0-9_-]*[A-Za-z0-9])/g

md.core.ruler.push('mentions', (state) => {
  const mentions = (state.env as { mentions?: Map<string, string> }).mentions
  if (!mentions?.size) return
  for (const block of state.tokens) {
    if (block.type !== 'inline' || !block.children) continue
    const out: typeof block.children = []
    let inLink = 0
    for (const tok of block.children) {
      if (tok.type === 'link_open') inLink++
      if (tok.type === 'link_close') inLink--
      if (tok.type !== 'text' || inLink > 0 || !tok.content.includes('@')) {
        out.push(tok)
        continue
      }
      let last = 0
      for (const m of tok.content.matchAll(MENTION)) {
        const key = m[2]
        const title = mentions.get(key)
        if (!title) continue
        const at = m.index! + m[1].length
        if (at > last) out.push(Object.assign(new state.Token('text', '', 0), { content: tok.content.slice(last, at) }))
        const open = new state.Token('link_open', 'a', 1)
        open.attrs = [
          ['href', `/readings/${key}`],
          ['class', 'mention'],
          ['title', title],
          ['data-internal', ''],
        ]
        out.push(open, Object.assign(new state.Token('text', '', 0), { content: `@${key}` }), new state.Token('link_close', 'a', -1))
        last = at + 1 + key.length
      }
      if (last === 0) out.push(tok)
      else if (last < tok.content.length) out.push(Object.assign(new state.Token('text', '', 0), { content: tok.content.slice(last) }))
    }
    block.children = out
  }
})

// mentions: reading key -> title, for linking @mentions.
export function renderMarkdown(source: string, mentions?: Map<string, string>): string {
  return md.render(toEditorMarkdown(source), { mentions })
}

let mermaidReady: Promise<typeof import('mermaid').default> | null = null
let diagramCount = 0

// Draws every Mermaid placeholder inside `root`. If a diagram has an error, its source stays visible.
export async function renderDiagrams(root: HTMLElement, dark: boolean) {
  const blocks = [...root.querySelectorAll<HTMLElement>('.mermaid-block[data-source]')]
  if (blocks.length === 0) return
  mermaidReady ??= import('mermaid').then((m) => m.default)
  const mermaid = await mermaidReady
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'default', fontFamily: 'Inter, system-ui, sans-serif' })
  for (const block of blocks) {
    const source = block.dataset.source ?? ''
    try {
      const { svg } = await mermaid.render(`diagram-${++diagramCount}`, source)
      block.innerHTML = svg
      block.classList.add('drawn')
    } catch (e) {
      block.insertAdjacentHTML('afterbegin', `<p class="diagram-error">This diagram has an error: ${escapeHtml((e as Error).message.split('\n')[0])}</p>`)
    }
  }
}
