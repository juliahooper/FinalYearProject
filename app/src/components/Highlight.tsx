// Wraps search terms found in `text` with <mark> (case-insensitive, whole-word prefixes).
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>
  const escaped = terms.filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (escaped.length === 0) return <>{text}</>
  const re = new RegExp(`(\\b(?:${escaped.join('|')})\\w*)`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <mark key={i}>{p}</mark> : p))}
    </>
  )
}
