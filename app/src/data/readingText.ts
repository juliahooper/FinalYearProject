// Helpers for reading notes: display names and the body split into its template sections.
import type { ReadingMeta } from './types'

export const shortTitle = (t: string) => t.split(':')[0].trim()
export const firstAuthorSurname = (a: string[]) => (a[0] ?? '').split(',')[0]

export function authorLine(m: ReadingMeta): string {
  const a = m.authors
  if (a.length === 0) return ''
  if (a.length === 1) return firstAuthorSurname(a)
  if (a.length === 2) return `${firstAuthorSurname(a)} and ${a[1].split(',')[0]}`
  return `${firstAuthorSurname(a)} et al.`
}

export interface BodySection {
  heading: string
  text: string
}

// "## Heading\ntext..." -> [{heading, text}]. Text before the first heading has heading "".
export function bodySections(body: string): BodySection[] {
  const out: BodySection[] = []
  let current: BodySection = { heading: '', text: '' }
  for (const line of body.split('\n')) {
    const h = line.match(/^##\s+(.*)$/)
    if (h) {
      if (current.heading || current.text.trim()) out.push(current)
      current = { heading: h[1].trim(), text: '' }
    } else current.text += line + '\n'
  }
  if (current.heading || current.text.trim()) out.push(current)
  return out
}

// The text used for full-text search: TL;DR and the five question answers (PLAN.md §6.3).
export function searchableBody(body: string): { tldr: string; answers: string } {
  const sections = bodySections(body)
  const strip = (t: string) =>
    t
      .replace(/```[\s\S]*?```/g, ' ') // diagrams and code
      .replace(/\$\$[\s\S]*?\$\$/g, ' ') // display maths
      .replace(/[*_`#>|[\]()]/g, ' ')
  const tldr = sections.find((s) => /^tl;?dr/i.test(s.heading))?.text ?? ''
  const answers = sections
    .filter((s) => /^[1-5]\.\s/.test(s.heading))
    .map((s) => s.text)
    .join('\n')
  return { tldr: strip(tldr), answers: strip(answers) }
}
