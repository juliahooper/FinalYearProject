import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decisionPath, newDecisionText, nextDecisionId, statusChange } from './decisions'
import { updateMarkdownFile } from './edit'
import { splitFrontMatter } from './frontmatter'
import type { DecisionMeta, Doc } from './types'

const dir = join(__dirname, '../../../decisions')
const decisions: Doc<DecisionMeta>[] = readdirSync(dir)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .map((f) => {
    const text = readFileSync(join(dir, f), 'utf8')
    const { data, body } = splitFrontMatter<DecisionMeta>(text)
    return { path: `decisions/${f}`, sha: '', text, meta: data!, body }
  })

describe('decisions', () => {
  it('assigns the next ID in a group', () => {
    expect(nextDecisionId(decisions, 'metrics')).toBe('MET-07')
    expect(nextDecisionId(decisions, 'evaluation')).toBe('EVAL-07')
    expect(nextDecisionId(decisions, 'ci-cd')).toBe('CI-04')
  })

  it('builds a new file the check script accepts', () => {
    const text = newDecisionText('MET-07', 'Score calibration', 'metrics', 'How are scores calibrated?')
    const { data } = splitFrontMatter<DecisionMeta>(text)
    expect(data).toEqual({ id: 'MET-07', title: 'Score calibration', group: 'metrics', status: 'open', decided_on: null, readings: [] })
    expect(decisionPath('MET-07', 'Score calibration')).toBe('decisions/MET-07-score-calibration.md')
  })

  it('deciding stamps a date; reopening clears it', () => {
    expect(statusChange('decided', null).decided_on).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(statusChange('decided', '2026-11-01').decided_on).toBe('2026-11-01')
    expect(statusChange('open', '2026-11-01').decided_on).toBeNull()
  })

  it('a status change is a small diff, and an empty date stays "decided_on:"', () => {
    const before = decisions.find((d) => d.meta.id === 'MET-02')!.text
    const decided = updateMarkdownFile(before, statusChange('decided', null))
    const changed = decided.split('\n').filter((l, i) => l !== before.split('\n')[i])
    expect(changed).toEqual(['status: decided', expect.stringMatching(/^decided_on: \d{4}-\d{2}-\d{2}$/)])
    const reopened = updateMarkdownFile(decided, statusChange('open', '2026-11-01'))
    expect(reopened).toBe(before)
  })
})
