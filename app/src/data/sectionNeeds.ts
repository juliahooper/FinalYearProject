// "What this section needs" (PLAN.md §6.5) comes from the comment block at the top of each
// section's .tex file, which summarises the FYP marking guide and rubric for that section.
// The app never shows the course PDFs themselves.
import type { Report } from '../config'
import type { RawFile } from './types'

export function sectionTexPath(report: Report, section: string) {
  return `paper/${report}/sections/${section}.tex`
}

// Turns the leading % comment block into markdown: drops the separator lines, the
// "INTERIM REPORT section" banner and the "Notes:" pointer, and joins wrapped lines.
export function sectionNeeds(tex: RawFile | undefined): { heading: string; markdown: string } | null {
  if (!tex) return null
  const lines: string[] = []
  for (const raw of tex.text.split('\n')) {
    if (!raw.startsWith('%')) break
    const line = raw.replace(/^%\s?/, '')
    if (/^-{5,}$/.test(line.trim())) continue
    if (/^(INTERIM|FINAL) REPORT section/.test(line)) continue
    if (/^Notes: paper\/notes\//.test(line)) continue
    lines.push(line)
  }
  if (lines.length === 0) return null
  const [heading, ...rest] = lines
  // Indented lines continue the previous line.
  const joined: string[] = []
  for (const line of rest) {
    if (/^\s{2,}\S/.test(line) && joined.length) joined[joined.length - 1] += ' ' + line.trim()
    else joined.push(line)
  }
  // A line that ends with ":" introduces a list, so it gets its own bold paragraph; any other
  // plain line after a bullet starts a new paragraph rather than running on into the bullet.
  const isBullet = (l: string) => /^\s*-\s/.test(l)
  const markdown = joined
    .map((l, i) => {
      if (/^\S.*:$/.test(l)) return `\n**${l}**`
      if (!isBullet(l) && i > 0 && isBullet(joined[i - 1])) return `\n${l}`
      return l
    })
    .join('\n')
    .trim()
  return { heading: heading.trim(), markdown }
}
