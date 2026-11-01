import { describe, expect, it } from 'vitest'
import { isWanted } from './repo'

// Every file a screen reads or writes must be loaded, or saves against it go wrong.
describe('files the app loads', () => {
  it.each([
    'readings/caliskan2017semantics.md',
    'readings/_template.md',
    'readings/follow-up.yml',
    'decisions/MET-02-per-item-bias-score.md',
    'paper/notes/background.md',
    'paper/interim/sections/work-to-date.tex',
    'paper/final/sections/evaluation.tex',
    'tags.yml',
    'ai-use.md',
    'references.bib',
    'docs/reading-workflow.md',
    'app/public/status.json',
  ])('%s', (path) => expect(isWanted(path)).toBe(true))

  it.each(['course-materials/spec/ise-fyp-specification-2026-2027.pdf', 'readings/pdfs/x.pdf', 'paper/shared/preamble.tex', 'app/src/App.tsx'])(
    'not %s',
    (path) => expect(isWanted(path)).toBe(false),
  )
})
