// Decision helpers (PLAN.md §3.4, §6.4): ID prefixes per group, the next free ID, and new files.
import { DECISION_GROUPS } from '../config'
import { slugifyTag } from './edit'
import type { DecisionMeta, DecisionStatus, Doc } from './types'

export const GROUP_PREFIX: Record<string, string> = {
  system: 'ARCH',
  detector: 'DET',
  metrics: 'MET',
  'ci-cd': 'CI',
  reporting: 'UI',
  validation: 'VAL',
  evaluation: 'EVAL',
  governance: 'ETH',
}

export function nextDecisionId(decisions: Doc<DecisionMeta>[], group: string): string {
  const prefix = GROUP_PREFIX[group]
  if (!prefix) throw new Error(`Unknown decision group "${group}"`)
  const used = decisions.map((d) => d.meta.id.match(new RegExp(`^${prefix}-(\\d+)$`))?.[1]).filter(Boolean).map(Number)
  const n = (used.length ? Math.max(...used) : 0) + 1
  return `${prefix}-${String(n).padStart(2, '0')}`
}

export function decisionPath(id: string, title: string) {
  return `decisions/${id}-${slugifyTag(title)}.md`
}

// A new decision file in the same shape as the seeded ones.
export function newDecisionText(id: string, title: string, group: string, question: string): string {
  return `---
id: ${id}
title: ${title.replace(/\n/g, ' ').trim()}
group: ${group}
status: open
decided_on:
readings: []
---

## Question
${question.trim() || 'The one question this decision answers.'}

## Options considered
(none recorded yet)

## Decision
(empty until decided)

## Why
(empty until decided; cite readings by key)

## Consequences
(empty until decided)
`
}

// Status changes: "decided" stamps today's date; moving away from decided clears it.
export function statusChange(status: DecisionStatus, current: string | null): Pick<DecisionMeta, 'status' | 'decided_on'> {
  return { status, decided_on: status === 'decided' ? (current ?? new Date().toISOString().slice(0, 10)) : null }
}

export const groupLabel = (id: string) => DECISION_GROUPS.find((g) => g.id === id)?.label ?? id

export const DECISION_STATUSES: { value: DecisionStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'exploring', label: 'Exploring' },
  { value: 'decided', label: 'Decided' },
]
