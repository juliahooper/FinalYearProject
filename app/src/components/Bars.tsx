import type { ReactNode } from 'react'

export interface BarRow {
  id: string
  label: ReactNode
  value: number
  note?: ReactNode // e.g. a "Gap" marker, shown after the value
  title?: string // hover text
}

// A small horizontal bar chart, built as a table so the numbers are always readable as text.
// One series, one hue (magnitude); values are direct labels, so no legend is needed.
export function Bars({ rows, caption, max }: { rows: BarRow[]; caption: string; max?: number }) {
  const top = Math.max(1, max ?? Math.max(...rows.map((r) => r.value), 0))
  return (
    <table className="bars">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} title={r.title}>
            <th scope="row">{r.label}</th>
            <td className="bar-cell">
              <span className="bar" style={{ width: `${(100 * r.value) / top}%` }} />
            </td>
            <td className="bar-value">
              {r.value}
              {r.note}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export interface Segment {
  id: string
  label: string
  value: number
  className: string
}

// One stacked bar towards a target, with a legend that gives every count in words.
export function StackedBar({ segments, target, caption }: { segments: Segment[]; target: number; caption: string }) {
  const total = Math.max(target, segments.reduce((n, s) => n + s.value, 0))
  return (
    <figure className="stacked">
      <div className="stacked-track" role="img" aria-label={`${caption}: ${segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(', ')}, target ${target}`}>
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            // No numbers inside the segments (white on amber is too low contrast); the legend gives every count.
            <span key={s.id} className={`stacked-seg ${s.className}`} style={{ width: `${(100 * s.value) / total}%` }} title={`${s.label}: ${s.value}`} />
          ))}
      </div>
      <figcaption className="legend">
        {segments.map((s) => (
          <span key={s.id} className="legend-item">
            <span className={`legend-swatch ${s.className}`} aria-hidden="true" />
            {s.label} <strong>{s.value}</strong>
          </span>
        ))}
        <span className="legend-item muted">Target {target}</span>
      </figcaption>
    </figure>
  )
}
