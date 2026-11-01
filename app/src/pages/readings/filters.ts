// Readings list filters, kept in the URL query string so they survive reloads and links (PLAN.md §6.3).
import MiniSearch from 'minisearch'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authorLine, searchableBody } from '../../data/readingText'
import type { Doc, ReadingMeta } from '../../data/types'

export type Sort = 'added' | 'stars' | 'year' | 'title' | 'relevance'
export const SORTS: { value: Sort; label: string }[] = [
  { value: 'added', label: 'Date added' },
  { value: 'stars', label: 'Stars' },
  { value: 'year', label: 'Year' },
  { value: 'title', label: 'Title' },
]

export interface Filters {
  q: string
  tags: string[]
  minStars: number
  status: string[]
  decisions: string[]
  sections: string[]
  verified: '' | 'yes' | 'no'
  sort: Sort | ''
  view: 'list' | 'next'
}

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])

export function useFilters() {
  const [params, setParams] = useSearchParams()
  const filters: Filters = {
    q: params.get('q') ?? '',
    tags: list(params.get('tags')),
    minStars: Number(params.get('stars') ?? 0) || 0,
    status: list(params.get('status')),
    decisions: list(params.get('decisions')),
    sections: list(params.get('sections')),
    verified: (params.get('verified') as Filters['verified']) ?? '',
    sort: (params.get('sort') as Sort) ?? '',
    view: params.get('view') === 'next' ? 'next' : 'list',
  }

  function update(changes: Partial<Filters>) {
    const next = { ...filters, ...changes }
    const p = new URLSearchParams()
    if (next.q) p.set('q', next.q)
    if (next.tags.length) p.set('tags', next.tags.join(','))
    if (next.minStars) p.set('stars', String(next.minStars))
    if (next.status.length) p.set('status', next.status.join(','))
    if (next.decisions.length) p.set('decisions', next.decisions.join(','))
    if (next.sections.length) p.set('sections', next.sections.join(','))
    if (next.verified) p.set('verified', next.verified)
    if (next.sort) p.set('sort', next.sort)
    if (next.view === 'next') p.set('view', 'next')
    setParams(p, { replace: true })
  }

  const activeCount =
    filters.tags.length + filters.status.length + filters.decisions.length + filters.sections.length + (filters.minStars ? 1 : 0) + (filters.verified ? 1 : 0)

  return { filters, update, activeCount, query: params.toString() }
}

export interface Result {
  reading: Doc<ReadingMeta>
  terms: string[] // matched search terms, for highlighting
}

export function useResults(readings: Doc<ReadingMeta>[], f: Filters): Result[] {
  const index = useMemo(() => {
    const ms = new MiniSearch<{ id: string; title: string; authors: string; tldr: string; answers: string }>({
      fields: ['title', 'authors', 'tldr', 'answers'],
      searchOptions: { boost: { title: 3, authors: 2, tldr: 1.5 }, prefix: true, fuzzy: 0.2 },
    })
    ms.addAll(readings.map((r) => ({ id: r.meta.key, title: r.meta.title, authors: r.meta.authors.join(' '), ...searchableBody(r.body) })))
    return ms
  }, [readings])

  return useMemo(() => {
    const byKey = new Map(readings.map((r) => [r.meta.key, r]))
    let results: (Result & { score: number })[]
    if (f.q.trim()) {
      results = index.search(f.q).flatMap((hit) => {
        const reading = byKey.get(String(hit.id))
        return reading ? [{ reading, terms: hit.terms, score: hit.score }] : []
      })
    } else {
      results = readings.map((reading) => ({ reading, terms: [], score: 0 }))
    }

    results = results.filter(({ reading: { meta: m } }) => {
      if (f.tags.length && !f.tags.every((t) => m.tags.includes(t))) return false
      if (f.minStars && m.stars < f.minStars) return false
      if (f.status.length && !f.status.includes(m.status)) return false
      if (f.decisions.length && !f.decisions.some((d) => m.decisions.includes(d))) return false
      if (f.sections.length && !f.sections.some((s) => m.sections.includes(s))) return false
      if (f.verified === 'yes' && !m.verified) return false
      if (f.verified === 'no' && m.verified) return false
      return true
    })

    const sort: Sort = f.sort || (f.q.trim() ? 'relevance' : 'added')
    const cmp: Record<Sort, (a: (typeof results)[0], b: (typeof results)[0]) => number> = {
      relevance: (a, b) => b.score - a.score,
      added: (a, b) => b.reading.meta.added.localeCompare(a.reading.meta.added) || a.reading.meta.title.localeCompare(b.reading.meta.title),
      stars: (a, b) => b.reading.meta.stars - a.reading.meta.stars,
      year: (a, b) => (b.reading.meta.year ?? 0) - (a.reading.meta.year ?? 0),
      title: (a, b) => a.reading.meta.title.localeCompare(b.reading.meta.title),
    }
    return [...results].sort(cmp[sort])
  }, [index, readings, f])
}

export { authorLine }
