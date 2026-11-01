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

export type Report = 'interim' | 'final'

// Report sections, in report order (PLAN.md §3.5). marks is null for interim-only sections.
export const SECTIONS: { id: string; label: string; reports: Report[]; marks: string | null }[] = [
  { id: 'abstract', label: 'Abstract', reports: ['interim', 'final'], marks: '–' },
  { id: 'introduction', label: 'Introduction', reports: ['interim', 'final'], marks: '10' },
  { id: 'background', label: 'Literature review: background', reports: ['interim', 'final'], marks: '20 (shared)' },
  { id: 'related-work', label: 'Literature review: related work', reports: ['interim', 'final'], marks: '(shared)' },
  { id: 'methodology', label: 'Methodology', reports: ['interim', 'final'], marks: '10' },
  { id: 'work-to-date', label: 'Work to date', reports: ['interim'], marks: null },
  { id: 'project-plan', label: 'Project plan', reports: ['interim'], marks: null },
  { id: 'deliverable', label: 'The tool (deliverable)', reports: ['final'], marks: '25 (shared)' },
  { id: 'evaluation', label: 'Evaluation', reports: ['final'], marks: '(shared)' },
  { id: 'analysis', label: 'Analysis', reports: ['final'], marks: '10' },
  { id: 'conclusion', label: 'Summary and conclusions', reports: ['final'], marks: '10' },
]

export const DECISION_GROUPS = [
  { id: 'system', label: 'System design' },
  { id: 'detector', label: 'Detector' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'ci-cd', label: 'CI/CD' },
  { id: 'reporting', label: 'Reporting' },
  { id: 'validation', label: 'Validation' },
  { id: 'evaluation', label: 'Impact evaluation' },
  { id: 'governance', label: 'Governance' },
] as const
