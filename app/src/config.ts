// The repo the app reads and writes. Change these if the repo moves.
export const REPO = {
  owner: 'juliahooper',
  name: 'FinalYearProject',
  branch: 'main',
}

export const DEADLINES = [
  { label: 'Interim report', date: '2026-11-06' },
  { label: 'Final report and video', date: '2027-04-07' },
]

export const READINGS_TARGET = 30

// Report sections, in order (PLAN.md §3.5).
export const SECTIONS = [
  { id: 'abstract', label: 'Abstract', marks: '–' },
  { id: 'introduction', label: 'Introduction', marks: '10' },
  { id: 'background', label: 'Literature review: background', marks: '20 (shared)' },
  { id: 'related-work', label: 'Literature review: related work', marks: '(shared)' },
  { id: 'methodology', label: 'Methodology', marks: '10' },
  { id: 'deliverable', label: 'Primary research / deliverable', marks: '25' },
  { id: 'analysis', label: 'Analysis', marks: '10' },
  { id: 'conclusion', label: 'Summary and conclusions', marks: '10' },
] as const

export const DECISION_GROUPS = [
  { id: 'system', label: 'System design' },
  { id: 'detector', label: 'Detector' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'ci-cd', label: 'CI/CD' },
  { id: 'reporting', label: 'Reporting' },
  { id: 'validation', label: 'Validation' },
  { id: 'governance', label: 'Governance' },
] as const
