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
  skimmed: 'Skimmed',
  summarised: 'Summarised',
  verified: 'Verified',
}

export const READING_STATUSES = Object.keys(STATUS_LABEL) as ReadingStatus[]
export const statusLabel = (s: ReadingStatus) => STATUS_LABEL[s] ?? s

export function StatusPill({ status }: { status: ReadingStatus }) {
  return (
    <span className={`pill status-pill status-${status}`}>
      {status === 'verified' && <span aria-hidden="true">✓ </span>}
      {statusLabel(status)}
    </span>
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
