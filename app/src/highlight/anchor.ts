// Highlights are stored as the quoted text plus a little context either side, and found again in the
// rendered reading by searching its text. Maths and diagrams are left out, since their text changes
// as they're drawn.

export interface Quote {
  text: string
  prefix: string
  suffix: string
}

export interface Paint extends Quote {
  id: string
  color: string
}

const CONTEXT = 30
const SKIP = '.katex, .mermaid-block'

// The text nodes of root in document order, with where each starts in the joined text.
function flatten(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  const nodes: Text[] = []
  const starts: number[] = []
  let text = ''
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push(n as Text)
    starts.push(text.length)
    text += n.nodeValue ?? ''
  }
  return { nodes, starts, text }
}

// The selected text inside root, or null if the selection is empty or outside it.
export function quoteFromRange(root: HTMLElement, range: Range): Quote | null {
  if (range.collapsed || !root.contains(range.commonAncestorContainer)) return null
  const { nodes, starts, text } = flatten(root)
  let start = Infinity
  let end = -Infinity
  nodes.forEach((n, i) => {
    if (!range.intersectsNode(n)) return
    start = Math.min(start, starts[i] + (n === range.startContainer ? range.startOffset : 0))
    end = Math.max(end, starts[i] + (n === range.endContainer ? range.endOffset : n.length))
  })
  while (start < end && /\s/.test(text[start])) start++
  while (end > start && /\s/.test(text[end - 1])) end--
  if (!(end > start)) return null
  return { text: text.slice(start, end), prefix: text.slice(Math.max(0, start - CONTEXT), start), suffix: text.slice(end, end + CONTEXT) }
}

// Where the quote is in text, using the context to choose between repeats; -1 if it isn't there.
export function findQuote(text: string, q: Quote): number {
  let best = -1
  let bestScore = -1
  for (let i = text.indexOf(q.text); i >= 0; i = text.indexOf(q.text, i + 1)) {
    const before = text.slice(0, i)
    const after = text.slice(i + q.text.length)
    let score = 0
    while (score < q.prefix.length && before[before.length - 1 - score] === q.prefix[q.prefix.length - 1 - score]) score++
    let s = 0
    while (s < q.suffix.length && after[s] === q.suffix[s]) s++
    if (score + s > bestScore) [best, bestScore] = [i, score + s]
  }
  return best
}

// Removes any marks painted earlier, leaving the text as it was.
function unpaint(root: HTMLElement) {
  for (const mark of root.querySelectorAll('mark.hl')) mark.replaceWith(...mark.childNodes)
  root.normalize()
}

// Wraps each highlight's text in <mark class="hl">, in its colour. Returns the ids that weren't found.
// Overlapping highlights: the first one wins the overlap.
export function paintHighlights(root: HTMLElement, highlights: Paint[]): string[] {
  unpaint(root)
  if (highlights.length === 0) return []
  const { nodes, starts, text } = flatten(root)
  const missing: string[] = []
  const owner: (Paint | undefined)[] = new Array(text.length)
  for (const h of highlights) {
    const at = findQuote(text, h)
    if (at < 0) missing.push(h.id)
    else for (let c = at; c < at + h.text.length; c++) owner[c] ??= h
  }
  nodes.forEach((node, i) => {
    // Runs of characters with the same highlight inside this text node.
    const runs: { from: number; to: number; h: Paint }[] = []
    for (let c = 0; c < node.length; c++) {
      const h = owner[starts[i] + c]
      if (!h) continue
      const last = runs[runs.length - 1]
      if (last && last.h === h && last.to === c) last.to++
      else runs.push({ from: c, to: c + 1, h })
    }
    // From the end backwards, so splitting doesn't move the earlier offsets.
    for (const { from, to, h } of runs.reverse()) {
      if (!/\S/.test(node.data.slice(from, to))) continue
      node.splitText(to)
      const middle = node.splitText(from)
      const mark = document.createElement('mark')
      mark.className = 'hl'
      mark.dataset.hl = h.id
      mark.style.background = h.color
      middle.replaceWith(mark)
      mark.append(middle)
    }
  })
  return missing
}
