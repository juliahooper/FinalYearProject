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

export function renderMarkdown(source: string): string {
  return md.render(toEditorMarkdown(source))
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
