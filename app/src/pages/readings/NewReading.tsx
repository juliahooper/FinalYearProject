import { useMemo, useState } from 'react'
import { Document } from 'yaml'
import { Banner } from '../../components/Banner'
import { parseBib, readingFieldsFromBib, type BibEntry } from '../../data/bib'
import { joinFrontMatter, splitFrontMatter } from '../../data/frontmatter'
import { useRepo } from '../../data/RepoContext'
import type { ReadingMeta } from '../../data/types'
import { useSave } from '../../data/useSave'

// Builds a new reading file from the template, with metadata copied from the bib entry (PLAN.md §6.3).
export function newReadingText(template: string, entry: BibEntry): string {
  const meta: ReadingMeta = {
    key: entry.key,
    ...readingFieldsFromBib(entry),
    stars: 0,
    status: 'to-read',
    tags: [],
    sections: [],
    decisions: [],
    summarised_by: 'julia',
    verified: false,
    added: new Date().toISOString().slice(0, 10),
    found_via: '',
  }
  const doc = new Document(meta)
  for (const k of ['authors', 'tags', 'sections', 'decisions'] as const) doc.set(k, doc.createNode(meta[k], { flow: true }))
  return joinFrontMatter(doc.toString({ lineWidth: 0, flowCollectionPadding: false }), splitFrontMatter(template).body)
}

export function NewReading({ onCreated, onCancel }: { onCreated: (key: string) => void; onCancel: () => void }) {
  const { data } = useRepo()
  const { save, saving, problem } = useSave()
  const [filter, setFilter] = useState('')
  const [chosen, setChosen] = useState<BibEntry | null>(null)

  const available = useMemo(() => {
    if (!data?.bib) return []
    const have = new Set(data.readings.map((r) => r.meta.key))
    return parseBib(data.bib.text).filter((e) => !have.has(e.key))
  }, [data])

  if (!data) return null
  const shown = available.filter((e) => `${e.key} ${e.fields.title ?? ''} ${e.fields.author ?? ''}`.toLowerCase().includes(filter.toLowerCase()))

  async function create() {
    if (!chosen || !data?.readingTemplate) return
    if (await save(`readings/${chosen.key}.md`, newReadingText(data.readingTemplate.text, chosen), null)) onCreated(chosen.key)
  }

  return (
    <article className="reading">
      <h1>New reading</h1>
      {!data.readingTemplate && <Banner kind="err">readings/_template.md is missing from the repo, so a new reading can’t be created.</Banner>}
      {available.length === 0 ? (
        <p className="muted">
          Every paper in <code>references.bib</code> already has a note. To add another, save it to the FYP collection in Zotero; it appears here after the bib file is pushed to GitHub.
        </p>
      ) : (
        <>
          <p className="muted">Pick a paper from Zotero that doesn’t have a note yet. Its title, authors, year, venue and DOI are filled in from references.bib.</p>
          <input type="text" placeholder={`Search ${available.length} papers without a note`} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Search papers" />
          <div className="pick-list" role="listbox" aria-label="Papers without a note">
            {shown.map((e) => {
              const f = readingFieldsFromBib(e)
              return (
                <button key={e.key} type="button" role="option" aria-selected={chosen?.key === e.key} className={`list-item${chosen?.key === e.key ? ' active' : ''}`} onClick={() => setChosen(e)}>
                  <div>{f.title || e.key}</div>
                  <div className="sub">
                    <code>{e.key}</code> · {f.authors[0]?.split(',')[0]} {f.year}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
      {problem && <Banner kind="err">{problem.message}</Banner>}
      <div className="editor-actions">
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" disabled={!chosen || saving || !data.readingTemplate} onClick={() => void create()}>
          {saving ? 'Creating…' : chosen ? `Create ${chosen.key}` : 'Create'}
        </button>
      </div>
    </article>
  )
}
