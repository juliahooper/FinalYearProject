// The editor re-serialises the whole document on save, which changes formatting that the user
// never touched: blank lines around headings and lists, \[escaped\] brackets, &lt; entities.
// restoreFormatting puts back the original text of every line whose meaning didn't change,
// and the original spacing between unchanged neighbours. Only edited lines keep the editor's form.

// What a line means, ignoring markdown escapes, HTML entities and trailing spaces.
function meaning(line: string): string {
  return line
    .replace(/\\([\\`*_{}[\]()#+\-.!|<>~])/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trimEnd()
}

// For newly written lines: undo escapes the editor adds that aren't needed in plain text,
// so new text looks like hand-written markdown. \[x\] stays escaped if it's followed by
// ( or [ or :, where unescaping would turn it into a link. A backslash before a letter is
// literal in markdown, so LaTeX like \parencite{key} is written as is.
function tidy(line: string): string {
  if (/^\s*(```|~~~|\|)/.test(line)) return line // leave fences and table rows alone
  return line
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\\\(?=[A-Za-z])/g, '\\')
    .replace(/(?<!~)\\~(?!~)/g, '~') // a single ~ (e.g. LaTeX p.~4) isn't strikethrough
    .replace(/\\\[([^\]\\]*)\\\](?![([:])/g, '[$1]')
}

interface Line {
  text: string
  blanksBefore: number // blank lines between this line and the previous non-blank line
}

function nonBlankLines(md: string): { lines: Line[]; trailingBlanks: number } {
  const lines: Line[] = []
  let blanks = 0
  for (const text of md.split('\n')) {
    if (text.trim() === '') blanks++
    else {
      lines.push({ text, blanksBefore: blanks })
      blanks = 0
    }
  }
  return { lines, trailingBlanks: blanks }
}

// Longest common subsequence of line meanings; returns, for each output line, the index of
// the original line it matches (or -1).
function align(orig: string[], out: string[]): number[] {
  const n = orig.length
  const m = out.length
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = orig[i] === out[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const match = new Array<number>(m).fill(-1)
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (orig[i] === out[j]) {
      match[j] = i
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return match
}

export function restoreFormatting(original: string, output: string): string {
  const o = nonBlankLines(original)
  const e = nonBlankLines(output)
  const match = align(
    o.lines.map((l) => meaning(l.text)),
    e.lines.map((l) => meaning(l.text)),
  )

  const matched = new Set(match.filter((i) => i >= 0))
  let lastOrig = -1 // the original line index that the previous output line corresponds to
  let result = ''
  e.lines.forEach((line, j) => {
    const i = match[j]
    let blanks = line.blanksBefore
    if (i >= 0) {
      // Unchanged line: original text and original spacing.
      blanks = o.lines[i].blanksBefore
      lastOrig = i
    } else if (lastOrig + 1 < o.lines.length && !matched.has(lastOrig + 1)) {
      // Edited line that replaces the next original line: keep that line's spacing.
      blanks = o.lines[lastOrig + 1].blanksBefore
      lastOrig++
    }
    result += (j > 0 ? '\n' : '') + '\n'.repeat(blanks) + (i >= 0 ? o.lines[i].text : tidy(line.text))
  })
  // Keep the original's trailing newlines.
  return result + '\n'.repeat(o.trailingBlanks)
}
