import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HIGHLIGHTS_PATH, updateHighlight } from '../data/edit'
import { shortTitle } from '../data/readingText'
import { useRepo } from '../data/RepoContext'
import type { Highlight } from '../data/types'
import { useSave } from '../data/useSave'
import { Banner } from './Banner'
import { TagPill } from './Pills'

// The highlights sent to one decision group or report section, as a collapsible "Notes" row in the
// same style as the decision accordion.
export function NotesAccordion({ list, id }: { list: 'groups' | 'sections'; id: string }) {
  const { data } = useRepo()
  const { save, saving, problem, clearProblem } = useSave()
  const [open, setOpen] = useState(false)
  if (!data) return null
  const notes = data.highlights.filter((h) => h[list].includes(id))
  const tagById = new Map(data.tags.map((t) => [t.id, t]))
  const titleOf = new Map(data.readings.map((r) => [r.meta.key, r.meta.title]))
  const panel = `notes-${list}-${id}`

  // Takes the note off this page only; the highlight stays on the reading.
  async function removeHere(h: Highlight) {
    const file = data?.files.get(HIGHLIGHTS_PATH)
    if (file) await save(HIGHLIGHTS_PATH, updateHighlight(file.text, h.id, { [list]: h[list].filter((x) => x !== id) }))
  }

  return (
    <section className={`accordion-item notes-accordion${open ? ' open' : ''}`}>
      <h3 className="accordion-heading">
        <button type="button" className="accordion-toggle" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(!open)}>
          <span className="accordion-title">Notes ({notes.length})</span>
          <span className="chevron" aria-hidden="true">
            {open ? '▴' : '▾'}
          </span>
        </button>
      </h3>
      {open && (
        <div id={panel} className="accordion-panel">
          {problem && (
            <Banner kind="err" actions={<button className="btn btn-quiet" onClick={clearProblem}>Dismiss</button>}>
              {problem.message}
            </Banner>
          )}
          {notes.length === 0 && <p className="muted">No notes yet. Highlight a passage in a reading and add it here.</p>}
          {notes.map((h) => {
            const tag = tagById.get(h.tag)
            return (
              <figure key={h.id} className="note-card" style={{ background: tag?.bg }}>
                <blockquote>{h.text}</blockquote>
                <figcaption className="note-card-foot">
                  <TagPill id={h.tag} tag={tag} />
                  <Link to={`/readings/${h.reading}`}>{shortTitle(titleOf.get(h.reading) ?? h.reading)}</Link>
                  <button className="btn btn-quiet btn-small" disabled={saving} onClick={() => void removeHere(h)}>
                    Remove from here
                  </button>
                </figcaption>
              </figure>
            )
          })}
        </div>
      )}
    </section>
  )
}
