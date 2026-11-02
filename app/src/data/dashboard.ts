// Everything the dashboard shows (PLAN.md §6.6), worked out from the live repo data. This is the
// same information as app/public/status.json, recomputed so it's never out of date.
import { DEADLINES, DECISION_GROUPS, READINGS_TARGET, SECTIONS, type Report } from '../config'
import { parseBib } from './bib'
import type { RepoData } from './repo'
import type { ReadingStatus } from './types'

export const GAP_BELOW = 3 // sections with fewer readings than this are flagged as gaps

export interface Deadline {
  label: string
  date: string
  days: number
  report: Report
}

export function nextDeadline(today = new Date()): Deadline | null {
  const day = new Date(today.toISOString().slice(0, 10))
  for (const [i, d] of DEADLINES.entries()) {
    const days = Math.round((new Date(d.date).getTime() - day.getTime()) / 86400000)
    if (days >= 0) return { ...d, days, report: i === 0 ? 'interim' : 'final' }
  }
  return null
}

export function dashboard(data: RepoData, today = new Date()) {
  const readings = data.readings.map((r) => r.meta)
  const byStatus: Record<ReadingStatus, number> = { 'to-read': 0, 'in-progress': 0, done: 0 }
  for (const r of readings) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1

  const deadline = nextDeadline(today)
  const report = deadline?.report ?? 'final'

  const sections = SECTIONS.map((s) => {
    const count = readings.filter((r) => r.sections.includes(s.id)).length
    // Only sections in the report that's due next count as gaps.
    return { id: s.id, label: s.label, count, inNextReport: s.reports.includes(report), gap: s.reports.includes(report) && count < GAP_BELOW }
  })

  const tags = data.tags.map((t) => ({ id: t.id, label: t.label, bg: t.bg, count: readings.filter((r) => r.tags.includes(t.id)).length }))

  const stars = [5, 4, 3, 2, 1, 0].map((n) => ({ stars: n, count: readings.filter((r) => r.stars === n).length }))

  const groups = DECISION_GROUPS.map((g) => {
    const ds = data.decisions.filter((d) => d.meta.group === g.id)
    return {
      id: g.id,
      label: g.label,
      total: ds.length,
      decided: ds.filter((d) => d.meta.status === 'decided').length,
      exploring: ds.filter((d) => d.meta.status === 'exploring').length,
      open: ds.filter((d) => d.meta.status === 'open').length,
    }
  }).filter((g) => g.total > 0)

  const have = new Set(readings.map((r) => r.key))
  const bibWithoutNote = data.bib ? parseBib(data.bib.text).filter((e) => !have.has(e.key)).map((e) => e.key) : []

  return {
    deadline,
    readings: { total: readings.length, target: READINGS_TARGET, byStatus },
    decisions: {
      total: data.decisions.length,
      decided: groups.reduce((n, g) => n + g.decided, 0),
      exploring: groups.reduce((n, g) => n + g.exploring, 0),
      open: groups.reduce((n, g) => n + g.open, 0),
      groups,
    },
    sections,
    tags,
    stars,
    todo: {
      bibWithoutNote,
      unverifiedClaude: readings.filter((r) => r.summarised_by === 'claude' && !r.verified).map((r) => ({ key: r.key, title: r.title })),
      openDecisions: data.decisions.filter((d) => d.meta.status !== 'decided').length,
      highFollowUps: data.followUps.filter((f) => f.status === 'suggested' && f.priority === 'high').map((f) => f.title),
    },
  }
}

export type Dashboard = ReturnType<typeof dashboard>
