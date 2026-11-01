// The editor treats LaTeX as ordinary text and would escape characters like \ and _ on save.
// Before loading, math is wrapped so the editor leaves it alone, and unwrapped again on save:
//   $$ ... $$ display blocks  <->  ```math fenced code blocks
//   $$...$$ on one line       <->  ```math-line fenced code blocks
//   $...$ inline math         <->  `$...$` inline code
// Fenced code blocks (e.g. mermaid) are left untouched in both directions.

const FENCE = /^(```|~~~)/

function mapOutsideFences(md: string, fn: (chunk: string) => string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let buf: string[] = []
  let inFence = false
  const flush = () => {
    if (buf.length) out.push(fn(buf.join('\n')))
    buf = []
  }
  for (const line of lines) {
    if (FENCE.test(line.trimStart())) {
      if (!inFence) flush()
      inFence = !inFence
      out.push(line)
    } else if (inFence) {
      out.push(line)
    } else {
      buf.push(line)
    }
  }
  flush()
  return out.join('\n')
}

// Inline $...$: not $$, no space just inside the dollars, no line breaks.
const INLINE_MATH = /(^|[^\\$`])\$(?!\s)([^$\n`]+?)(?<!\s)\$(?!\d)/g

export function toEditorMarkdown(md: string): string {
  // Display math: a line that is exactly $$, up to the next such line, or $$...$$ on one line.
  const withBlocks = mapOutsideFences(md, (chunk) =>
    chunk
      .replace(/^\$\$\n([\s\S]*?)\n\$\$$/gm, (_m, tex: string) => '```math\n' + tex + '\n```')
      .replace(/^\$\$(.+?)\$\$$/gm, (_m, tex: string) => '```math-line\n' + tex + '\n```'),
  )
  return mapOutsideFences(withBlocks, (chunk) => chunk.replace(INLINE_MATH, (_m, pre: string, tex: string) => `${pre}\`$${tex}$\``))
}

export function fromEditorMarkdown(md: string): string {
  const withBlocks = md
    .replace(/^```math-line\n([\s\S]*?)\n```$/gm, (_m, tex: string) => '$$' + tex.replace(/\n/g, ' ') + '$$')
    .replace(/^```math\n([\s\S]*?)\n```$/gm, (_m, tex: string) => '$$\n' + tex + '\n$$')
  return mapOutsideFences(withBlocks, (chunk) => chunk.replace(/`\$([^`\n]+?)\$`/g, (_m, tex: string) => `$${tex}$`))
}
