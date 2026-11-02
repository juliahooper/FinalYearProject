// Deleting a reading: the reading file goes, and so does everything that points at it, so the
// repo never refers to a reading that isn't there (scripts/check.mjs would flag it).
//   decisions/*.md       the citekey comes out of `readings:`
//   follow-up.yml        papers it recommended keep their entry; the source becomes "external: ...";
//                        the entry that led to it (key: <citekey>) becomes skipped
//   highlights.yml       highlights made in it are removed (and with them, their notes)
// The reading stays in git history, and in Zotero until it's removed from the FYP collection.
import { parse } from 'yaml'
import { HIGHLIGHTS_PATH, removeHighlight, updateListEntry, updateMarkdownFile } from './edit'
import type { RepoData } from './repo'
import type { FollowUp, Highlight } from './types'

const FOLLOW_UP = 'readings/follow-up.yml'

export interface DeletePlan {
  path: string // the reading file
  updates: { path: string; text: string }[] // saved before the reading is deleted
  decisions: string[] // IDs it's unlinked from
  followUps: number // follow-up entries whose source changes
  highlights: number // highlights removed
}

export function planDeleteReading(data: RepoData, key: string): DeletePlan {
  const reading = data.readings.find((r) => r.meta.key === key)
  if (!reading) throw new Error(`There's no reading called ${key}.`)
  const updates: DeletePlan['updates'] = []

  const decisions = data.decisions.filter((d) => d.meta.readings.includes(key))
  for (const d of decisions) {
    updates.push({ path: d.path, text: updateMarkdownFile(d.text, { readings: d.meta.readings.filter((k) => k !== key) }) })
  }

  let followUps = 0
  const fu = data.files.get(FOLLOW_UP)
  if (fu) {
    let text = fu.text
    ;(parse(text) as FollowUp[] | null)?.forEach((f, i) => {
      // The follow-up that led to this paper: it was saved, but the reading is now rejected.
      if (f.key === key) text = updateListEntry(text, i, { status: 'skipped', key: '' })
      if (!f.found_in?.some((s) => s.source === key)) return
      followUps++
      text = updateListEntry(text, i, {
        found_in: f.found_in.map((s) => (s.source === key ? { source: `external: ${key} (deleted reading)`, page: s.page } : s)),
      })
    })
    if (text !== fu.text) updates.push({ path: FOLLOW_UP, text })
  }

  let highlights = 0
  const hl = data.files.get(HIGHLIGHTS_PATH)
  if (hl) {
    let text = hl.text
    for (const h of (parse(text) as Highlight[] | null) ?? []) {
      if (h.reading !== key) continue
      highlights++
      text = removeHighlight(text, h.id)
    }
    if (text !== hl.text) updates.push({ path: HIGHLIGHTS_PATH, text })
  }

  return { path: reading.path, updates, decisions: decisions.map((d) => d.meta.id), followUps, highlights }
}

// The confirmation text: what will happen, in plain words.
export function describeDelete(title: string, plan: DeletePlan): string {
  const also = [
    plan.decisions.length && `unlink it from ${plan.decisions.length === 1 ? 'decision' : 'decisions'} ${plan.decisions.join(', ')}`,
    plan.highlights && `remove its ${plan.highlights} highlight${plan.highlights === 1 ? '' : 's'} (and the notes made from them)`,
    plan.followUps && `keep the ${plan.followUps} follow-up paper${plan.followUps === 1 ? '' : 's'} it recommended, marked as from a deleted reading`,
  ].filter(Boolean)
  return (
    `Delete “${title}”?\n\nThis deletes its note${also.length ? ` and will ${also.join('; ')}` : ''}. ` +
    'It stops counting towards your progress.\n\n' +
    'The note can be recovered from GitHub history. Also remove the paper from your Zotero FYP collection, or it will show as "not summarised yet".'
  )
}
