import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Banner } from '../../components/Banner'
import { MarkdownView } from '../../components/MarkdownView'
import { TagPill } from '../../components/Pills'
import { DECISION_GROUPS, SECTIONS } from '../../config'
import { addHighlight, HIGHLIGHTS_PATH, removeHighlight, updateHighlight } from '../../data/edit'
import { useRepo } from '../../data/RepoContext'
import type { Doc, Highlight, ReadingMeta } from '../../data/types'
import { useSave } from '../../data/useSave'
import { paintHighlights, quoteFromRange, type Quote } from '../../highlight/anchor'
import { AddNoteDialog } from './AddNoteDialog'

const today = () => new Date().toISOString().slice(0, 10)
const newId = () => `h-${today().replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6)}`

type Spot = { top: number; left: number }
type Asking = { quote: Quote; tag: string } | { highlight: Highlight }

// The reading's text, where a passage can be selected, tagged and sent to decision groups and
// report sections as a note (highlights.yml).
export function HighlightableReading({ reading }: { reading: Doc<ReadingMeta> }) {
  const { data } = useRepo()
  const { save, saving, problem, clearProblem } = useSave()
  const wrap = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<{ quote: Quote; at: Spot } | null>(null)
  const [moreTags, setMoreTags] = useState(false)
  const [clicked, setClicked] = useState<{ highlight: Highlight; at: Spot } | null>(null)
  const [asking, setAsking] = useState<Asking | null>(null)
  const [missing, setMissing] = useState<string[]>([])
  const m = reading.meta

  const highlights = useMemo(() => (data?.highlights ?? []).filter((h) => h.reading === m.key), [data?.highlights, m.key])
  const tagById = useMemo(() => new Map((data?.tags ?? []).map((t) => [t.id, t])), [data?.tags])

  // Paints the highlights after the text is drawn, and again if it's redrawn (e.g. a theme change).
  useEffect(() => {
    const root = wrap.current
    if (!root) return
    let painted: HTMLElement | null = null
    const paint = () => {
      const text = root.querySelector<HTMLElement>('.markdown')
      if (!text || text === painted) return
      painted = text
      const lost = paintHighlights(
        text,
        highlights.map((h) => ({ ...h, color: tagById.get(h.tag)?.bg ?? 'var(--sel)' })),
      )
      setMissing((was) => (was.join() === lost.join() ? was : lost))
    }
    paint()
    const observer = new MutationObserver(paint)
    observer.observe(root, { childList: true })
    return () => observer.disconnect()
  }, [highlights, tagById, reading.body, data?.readings])

  // The selection toolbar and highlight popover close on Escape or a click elsewhere.
  useEffect(() => {
    if (!selection && !clicked) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !(e.target as HTMLElement).closest('.hl-toolbar')) {
        setSelection(null)
        setClicked(null)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [selection, clicked])

  if (!data) return null

  const spotOf = (rect: DOMRect): Spot => {
    const box = wrap.current!.getBoundingClientRect()
    return { top: rect.bottom - box.top + 6, left: Math.max(0, Math.min(rect.left - box.left, box.width - 280)) }
  }

  function onMouseUp() {
    const sel = window.getSelection()
    const text = wrap.current?.querySelector<HTMLElement>('.markdown')
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !text) return
    const range = sel.getRangeAt(0)
    const quote = quoteFromRange(text, range)
    if (!quote) return
    setClicked(null)
    setMoreTags(false)
    setSelection({ quote, at: spotOf(range.getBoundingClientRect?.() ?? text.getBoundingClientRect()) })
  }

  function onClick(e: MouseEvent<HTMLDivElement>) {
    const mark = (e.target as HTMLElement).closest<HTMLElement>('mark.hl')
    const highlight = mark && highlights.find((h) => h.id === mark.dataset.hl)
    if (!highlight || !window.getSelection()?.isCollapsed) return
    setSelection(null)
    setClicked({ highlight, at: spotOf(mark.getBoundingClientRect()) })
  }

  function chooseTag(tag: string) {
    if (!selection) return
    setAsking({ quote: selection.quote, tag })
    setSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  const file = () => data.files.get(HIGHLIGHTS_PATH)?.text

  async function saveAsked(groups: string[], sections: string[]) {
    if (!asking) return
    const text = file()
    const out =
      'quote' in asking
        ? addHighlight(text, { id: newId(), reading: m.key, tag: asking.tag, ...asking.quote, created: today(), groups, sections })
        : updateHighlight(text ?? '', asking.highlight.id, { groups, sections })
    if (await save(HIGHLIGHTS_PATH, out)) setAsking(null)
  }

  async function remove(h: Highlight) {
    const places = h.groups.length + h.sections.length
    if (places && !window.confirm(`Remove this highlight? It’s also a note in ${places} place${places === 1 ? '' : 's'}, and will be removed from there too.`)) return
    setClicked(null)
    const text = file()
    if (text) await save(HIGHLIGHTS_PATH, removeHighlight(text, h.id))
  }

  // Pre-ticks the groups of this reading's decisions and its report sections.
  const linkedGroups = [...new Set(data.decisions.filter((d) => m.decisions.includes(d.meta.id)).map((d) => d.meta.group))]
  const placeLabel = new Map<string, string>([...DECISION_GROUPS.map((g) => [`g:${g.id}`, g.label] as const), ...SECTIONS.map((s) => [`s:${s.id}`, s.label] as const)])
  const placesOf = (h: Highlight) => [...h.groups.map((g) => placeLabel.get(`g:${g}`) ?? g), ...h.sections.map((s) => placeLabel.get(`s:${s}`) ?? s)]
  const otherTags = data.tags.filter((t) => !m.tags.includes(t.id))
  const lost = highlights.filter((h) => missing.includes(h.id))

  return (
    <div className="highlightable" ref={wrap} onMouseUp={onMouseUp} onClick={onClick}>
      {problem && (
        <Banner kind="err" actions={<button className="btn btn-quiet" onClick={clearProblem}>Dismiss</button>}>
          {problem.message}
        </Banner>
      )}
      <MarkdownView source={reading.body} />

      {selection && (
        <div className="hl-toolbar" style={selection.at} onMouseDown={(e) => e.preventDefault()} onMouseUp={(e) => e.stopPropagation()}>
          <div className="hl-toolbar-label">Highlight as</div>
          <div className="hl-tags">
            {m.tags.map((t) => (
              <button key={t} type="button" className="hl-tag-btn" onClick={() => chooseTag(t)}>
                <TagPill id={t} tag={tagById.get(t)} />
              </button>
            ))}
            {otherTags.length > 0 && !moreTags && (
              <button type="button" className="btn btn-quiet btn-small" onClick={() => setMoreTags(true)}>
                {m.tags.length ? 'More tags ▾' : 'Choose a tag ▾'}
              </button>
            )}
            {moreTags &&
              otherTags.map((t) => (
                <button key={t.id} type="button" className="hl-tag-btn" onClick={() => chooseTag(t.id)}>
                  <TagPill id={t.id} tag={t} />
                </button>
              ))}
          </div>
        </div>
      )}

      {clicked && (
        <div className="hl-toolbar" style={clicked.at} onMouseUp={(e) => e.stopPropagation()}>
          <div className="hl-tags">
            <TagPill id={clicked.highlight.tag} tag={tagById.get(clicked.highlight.tag)} />
          </div>
          <p className="muted hl-places">{placesOf(clicked.highlight).length ? `A note on: ${placesOf(clicked.highlight).join(' · ')}` : 'Not a note anywhere yet.'}</p>
          <div className="hl-actions">
            <button
              className="btn btn-small"
              onClick={() => {
                setAsking({ highlight: clicked.highlight })
                setClicked(null)
              }}
            >
              Add to notes…
            </button>
            <button className="btn btn-quiet btn-small" disabled={saving} onClick={() => void remove(clicked.highlight)}>
              Remove highlight
            </button>
          </div>
        </div>
      )}

      {lost.length > 0 && (
        <Banner kind="warn">
          <p>{lost.length === 1 ? 'One highlight no longer matches' : `${lost.length} highlights no longer match`} the text of this reading, probably because it was edited:</p>
          <ul className="hl-lost">
            {lost.map((h) => (
              <li key={h.id}>
                “{h.text}”{' '}
                <button className="btn btn-quiet btn-small" disabled={saving} onClick={() => void remove(h)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </Banner>
      )}

      {asking && (
        <AddNoteDialog
          text={'quote' in asking ? asking.quote.text : asking.highlight.text}
          tag={tagById.get('quote' in asking ? asking.tag : asking.highlight.tag)}
          groups={'quote' in asking ? linkedGroups : asking.highlight.groups}
          sections={'quote' in asking ? m.sections : asking.highlight.sections}
          isNew={'quote' in asking}
          saving={saving}
          onSave={(groups, sections) => void saveAsked(groups, sections)}
          onCancel={() => setAsking(null)}
        />
      )}
    </div>
  )
}
