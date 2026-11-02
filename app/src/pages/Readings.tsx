import { lazy, Suspense } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Highlight } from '../components/Highlight'
import { MultiSelect } from '../components/MultiSelect'
import { READING_STATUSES, StatusHeart, statusLabel, TagPill } from '../components/Pills'
import { SplitPage } from '../components/SplitPage'
import { Stars } from '../components/Stars'
import { SECTIONS } from '../config'
import { authorLine, shortTitle } from '../data/readingText'
import { useRepo } from '../data/RepoContext'
import { SORTS, useFilters, useResults, type Filters } from './readings/filters'
import { NewReading } from './readings/NewReading'
import { ReadingView } from './readings/ReadingView'
import { ToReadNext } from './readings/ToReadNext'

// The editor (Tiptap) is only downloaded when a reading is first edited.
const ReadingEditor = lazy(() => import('./readings/ReadingEditor').then((m) => ({ default: m.ReadingEditor })))

export function Readings() {
  const { data } = useRepo()
  const { key } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { filters, update, activeCount, query } = useFilters()
  const results = useResults(data?.readings ?? [], filters)
  if (!data) return null

  const isNew = pathname === '/readings/new'
  const editing = pathname.endsWith('/edit')
  const selected = key ? data.readings.find((r) => r.meta.key === key) : undefined
  const qs = query ? `?${query}` : ''
  const tagById = new Map(data.tags.map((t) => [t.id, t]))
  const suggested = data.followUps.filter((f) => f.status === 'suggested').length

  const list = (
    <>
      <div className="tabs" role="tablist" aria-label="Readings views">
        <button role="tab" aria-selected={filters.view === 'list'} className={`tab${filters.view === 'list' ? ' active' : ''}`} onClick={() => update({ view: 'list' })}>
          Readings
        </button>
        <button role="tab" aria-selected={filters.view === 'next'} className={`tab${filters.view === 'next' ? ' active' : ''}`} onClick={() => update({ view: 'next' })}>
          To read next {suggested > 0 && <span className="count-badge">{suggested}</span>}
        </button>
      </div>

      {filters.view === 'next' ? (
        <ToReadNext />
      ) : (
        <>
          <div className="list-tools">
            <input
              type="search"
              className="search"
              placeholder={`Search ${data.readings.length} reading${data.readings.length === 1 ? '' : 's'}`}
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              aria-label="Search readings"
            />
            <FilterBar filters={filters} update={update} />
            <ActivePills filters={filters} update={update} />
            <div className="list-head list-head-row">
              <span>
                {results.length} reading{results.length === 1 ? '' : 's'}
                {activeCount > 0 && ` · ${activeCount} filter${activeCount === 1 ? '' : 's'}`}
              </span>
              <Link className="btn btn-primary btn-small" to={`/readings/new${qs}`}>
                New reading
              </Link>
            </div>
          </div>
          {data.readings.length === 0 && <p className="muted list-head">No readings yet. Add a paper to Zotero, then click New reading.</p>}
          {data.readings.length > 0 && results.length === 0 && <p className="muted list-head">No readings match. Try fewer filters or a different search.</p>}
          {results.map(({ reading: r, terms }) => (
            <Link key={r.meta.key} to={`/readings/${r.meta.key}${qs}`} className={`list-item${r.meta.key === key ? ' active' : ''}`}>
              <div className="item-title item-title-heart">
                <StatusHeart status={r.meta.status} />
                <span>
                  <Highlight text={shortTitle(r.meta.title)} terms={terms} />
                </span>
              </div>
              <div className="sub item-meta">
                <Stars value={r.meta.stars} />
                <span>
                  <Highlight text={authorLine(r.meta)} terms={terms} /> {r.meta.year}
                </span>
              </div>
              {r.meta.tags.length > 0 && (
                <div className="pill-row pill-row-small">
                  {r.meta.tags.map((t) => (
                    <TagPill key={t} id={t} tag={tagById.get(t)} />
                  ))}
                </div>
              )}
            </Link>
          ))}
        </>
      )}
    </>
  )

  let reader
  if (isNew) reader = <NewReading onCreated={(k) => navigate(`/readings/${k}/edit${qs}`)} onCancel={() => navigate(`/readings${qs}`)} />
  else if (selected && editing)
    reader = (
      <Suspense fallback={<p className="muted">Opening the editor…</p>}>
        <ReadingEditor key={selected.path} reading={selected} onDone={() => navigate(`/readings/${selected.meta.key}${qs}`)} />
      </Suspense>
    )
  else if (selected) reader = <ReadingView key={selected.path} reading={selected} onEdit={() => navigate(`/readings/${selected.meta.key}/edit${qs}`)} />
  else if (key) reader = <p className="muted">There’s no reading called “{key}”. It may have been renamed or not pushed yet.</p>
  else reader = <p className="muted">Select a reading{data.readings.length ? '' : ', or add one with New reading'}.</p>

  return (
    <SplitPage list={list} hasSelection={Boolean(selected || isNew || key)} backTo={`/readings${qs}`}>
      {reader}
    </SplitPage>
  )
}

function FilterBar({ filters, update }: { filters: Filters; update: (c: Partial<Filters>) => void }) {
  const { data } = useRepo()
  if (!data) return null
  return (
    <div className="filter-bar">
      <MultiSelect label="Tags" options={data.tags.map((t) => ({ value: t.id, label: t.label, dot: t.bg }))} selected={filters.tags} onChange={(tags) => update({ tags })} />
      <MultiSelect
        label="Stars"
        single
        options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${'★'.repeat(n)} or more` }))}
        selected={filters.minStars ? [String(filters.minStars)] : []}
        onChange={(v) => update({ minStars: Number(v[0] ?? 0) })}
      />
      <MultiSelect label="Status" options={READING_STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))} selected={filters.status} onChange={(status) => update({ status })} />
      <MultiSelect label="Decision" options={data.decisions.map((d) => ({ value: d.meta.id, label: `${d.meta.id} ${d.meta.title}` }))} selected={filters.decisions} onChange={(decisions) => update({ decisions })} />
      <MultiSelect label="Section" options={SECTIONS.map((s) => ({ value: s.id, label: s.label }))} selected={filters.sections} onChange={(sections) => update({ sections })} />
      <MultiSelect
        label="Verified"
        single
        options={[
          { value: 'yes', label: 'Verified' },
          { value: 'no', label: 'Not verified' },
        ]}
        selected={filters.verified ? [filters.verified] : []}
        onChange={(v) => update({ verified: (v[0] as Filters['verified']) ?? '' })}
      />
      <label className="sr-only" htmlFor="sort">
        Sort
      </label>
      <select id="sort" className="select select-small" value={filters.sort} onChange={(e) => update({ sort: e.target.value as Filters['sort'] })}>
        <option value="">{filters.q ? 'Sort: best match' : 'Sort: date added'}</option>
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            Sort: {s.label.toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  )
}

function ActivePills({ filters, update }: { filters: Filters; update: (c: Partial<Filters>) => void }) {
  const { data } = useRepo()
  if (!data) return null
  const pills: { label: string; remove: () => void }[] = [
    ...filters.tags.map((t) => ({ label: data.tags.find((x) => x.id === t)?.label ?? t, remove: () => update({ tags: filters.tags.filter((x) => x !== t) }) })),
    ...(filters.minStars ? [{ label: `${filters.minStars}+ stars`, remove: () => update({ minStars: 0 }) }] : []),
    ...filters.status.map((s) => ({ label: statusLabel(s as never), remove: () => update({ status: filters.status.filter((x) => x !== s) }) })),
    ...filters.decisions.map((d) => ({ label: d, remove: () => update({ decisions: filters.decisions.filter((x) => x !== d) }) })),
    ...filters.sections.map((s) => ({ label: SECTIONS.find((x) => x.id === s)?.label ?? s, remove: () => update({ sections: filters.sections.filter((x) => x !== s) }) })),
    ...(filters.verified ? [{ label: filters.verified === 'yes' ? 'Verified' : 'Not verified', remove: () => update({ verified: '' }) }] : []),
  ]
  if (pills.length === 0) return null
  return (
    <div className="pill-row active-filters">
      {pills.map((p) => (
        <span key={p.label} className="pill chip">
          {p.label}
          <button type="button" className="pill-x" aria-label={`Remove filter ${p.label}`} onClick={p.remove}>
            ×
          </button>
        </span>
      ))}
      <button className="btn btn-quiet btn-small" onClick={() => update({ tags: [], minStars: 0, status: [], decisions: [], sections: [], verified: '' })}>
        Clear all
      </button>
    </div>
  )
}
