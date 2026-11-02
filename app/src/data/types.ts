// Front matter shapes (PLAN.md §3.2–§3.4, readings/follow-up.yml).

export type ReadingStatus = 'to-read' | 'in-progress' | 'done'

export interface ReadingMeta {
  key: string
  title: string
  authors: string[]
  year: number | null
  venue: string
  doi: string
  url: string
  stars: number
  status: ReadingStatus
  tags: string[]
  sections: string[]
  decisions: string[]
  summarised_by: 'claude' | 'julia'
  verified: boolean
  added: string
  found_via: string
}

export type DecisionStatus = 'open' | 'exploring' | 'decided'

export interface DecisionMeta {
  id: string
  title: string
  group: string
  status: DecisionStatus
  decided_on: string | null
  readings: string[]
}

export interface Tag {
  id: string
  label: string
  group: string
  bg: string
}

// A highlighted passage of a reading (highlights.yml). groups and sections are where it shows as a note.
export interface Highlight {
  id: string
  reading: string
  tag: string
  text: string
  prefix: string
  suffix: string
  created: string
  groups: string[]
  sections: string[]
}

export interface FollowUp {
  title: string
  authors: string[]
  year: number | null
  venue: string
  found_in: { source: string; page: string }[]
  why: string
  priority: 'high' | 'medium' | 'low'
  status: 'suggested' | 'saved' | 'skipped'
  key: string
  notes?: string
}

// A markdown file with parsed front matter.
export interface Doc<T> {
  path: string
  sha: string
  text: string
  meta: T
  body: string
}

// A plain text file (markdown without front matter, YAML, JSON, bib).
export interface RawFile {
  path: string
  sha: string
  text: string
}
