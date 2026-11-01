// A small reader for the Better BibLaTeX export in references.bib: enough to list citekeys
// and prefill a new reading. Field values are taken as written, with outer braces and
// {{protective}} braces removed.

export interface BibEntry {
  type: string
  key: string
  fields: Record<string, string>
}

function readBraced(src: string, start: number): { value: string; end: number } {
  // src[start] is '{'. Returns the text inside the matching '}'.
  let depth = 0
  for (let i = start; i < src.length; i++) {
    if (src[i] === '\\') {
      i++
      continue
    }
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return { value: src.slice(start + 1, i), end: i + 1 }
  }
  return { value: src.slice(start + 1), end: src.length }
}

const clean = (v: string) => v.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim()

export function parseBib(src: string): BibEntry[] {
  const entries: BibEntry[] = []
  const head = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g
  for (let m; (m = head.exec(src)); ) {
    const type = m[1].toLowerCase()
    if (type === 'comment' || type === 'string' || type === 'preamble') continue
    const fields: Record<string, string> = {}
    let i = head.lastIndex
    for (;;) {
      const f = /\s*([A-Za-z][\w-]*)\s*=\s*/y
      f.lastIndex = i
      const fm = f.exec(src)
      if (!fm) break
      i = f.lastIndex
      let value = ''
      if (src[i] === '{') {
        const r = readBraced(src, i)
        value = r.value
        i = r.end
      } else if (src[i] === '"') {
        const close = src.indexOf('"', i + 1)
        value = src.slice(i + 1, close)
        i = close + 1
      } else {
        const bare = /[^,}\s]+/y
        bare.lastIndex = i
        value = bare.exec(src)?.[0] ?? ''
        i = bare.lastIndex
      }
      fields[fm[1].toLowerCase()] = clean(value)
      const comma = /\s*,/y
      comma.lastIndex = i
      if (comma.exec(src)) i = comma.lastIndex
      else break
    }
    entries.push({ type, key: m[2], fields })
    head.lastIndex = i
  }
  return entries
}

// "Caliskan, Aylin and Bryson, Joanna J." -> ["Caliskan, A.", "Bryson, J. J."]
export function formatAuthors(author: string | undefined): string[] {
  if (!author) return []
  return author.split(/\s+and\s+/).map((name) => {
    const [family, given = ''] = name.split(',').map((s) => s.trim())
    const initials = given
      .split(/[\s.]+/)
      .filter(Boolean)
      .map((g) => g.split('-').map((p) => p[0].toUpperCase() + '.').join('-'))
      .join(' ')
    return initials ? `${family}, ${initials}` : family
  })
}

export function readingFieldsFromBib(e: BibEntry) {
  const year = Number.parseInt((e.fields.date ?? e.fields.year ?? '').slice(0, 4), 10)
  return {
    title: e.fields.title ?? '',
    authors: formatAuthors(e.fields.author),
    year: Number.isFinite(year) ? year : null,
    venue: e.fields.journaltitle ?? e.fields.booktitle ?? e.fields.journal ?? e.fields.publisher ?? '',
    doi: e.fields.doi ?? '',
    url: e.fields.url ?? '',
  }
}
