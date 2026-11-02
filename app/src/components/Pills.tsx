import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ReadingStatus, Tag } from '../data/types'

export function TagPill({ tag, id, onRemove }: { tag?: Tag; id: string; onRemove?: () => void }) {
  return (
    <span className="pill tag-pill" style={{ background: tag?.bg ?? 'var(--line)' }} title={tag ? undefined : 'Not in tags.yml'}>
      {tag?.label ?? id}
      {onRemove && (
        <button type="button" className="pill-x" aria-label={`Remove ${tag?.label ?? id}`} onClick={onRemove}>
          ×
        </button>
      )}
    </span>
  )
}

const STATUS_LABEL: Record<ReadingStatus, string> = {
  'to-read': 'To read',
  'in-progress': 'In progress',
  done: 'Done',
}

export const READING_STATUSES = Object.keys(STATUS_LABEL) as ReadingStatus[]
export const statusLabel = (s: ReadingStatus) => STATUS_LABEL[s] ?? s

export function StatusPill({ status }: { status: ReadingStatus }) {
  return (
    <span className={`pill status-pill status-${status}`}>
      {status === 'done' && <span aria-hidden="true">✓ </span>}
      {statusLabel(status)}
    </span>
  )
}

export function StatusHeart({ status }: { status: ReadingStatus }) {
  return (
    <svg className={`status-heart status-${status}`} viewBox="0 0 24 24" role="img" aria-label={statusLabel(status)}>
      <title>{statusLabel(status)}</title>
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3.1 1.7-2 3.2-3.1 5.3-3.1 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" />
    </svg>
  )
}

export function Chip({ to, children, title }: { to?: string; children: ReactNode; title?: string }) {
  return to ? (
    <Link className="pill chip" to={to} title={title}>
      {children}
    </Link>
  ) : (
    <span className="pill chip" title={title}>
      {children}
    </span>
  )
}
