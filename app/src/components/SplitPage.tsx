import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icons'

// List pane | reader pane, with an expand button that hides the list (PLAN.md §6.2).
// At phone width only one pane shows; backTo is where the reader's back arrow goes.
export function SplitPage({ list, children, hasSelection, backTo }: { list: ReactNode; children: ReactNode; hasSelection: boolean; backTo?: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`split${expanded ? ' expanded' : ''}${hasSelection ? ' has-selection' : ''}`}>
      <div className="list-pane">{list}</div>
      <section className="reader-pane">
        <div className="reader-bar">
          {backTo && (
            <Link className="btn btn-quiet back-link" to={backTo}>
              ← Back
            </Link>
          )}
          <button className="btn btn-quiet expand-btn" onClick={() => setExpanded(!expanded)} aria-pressed={expanded} title={expanded ? 'Show the list' : 'Hide the list'}>
            <Icon name={expanded ? 'collapse' : 'expand'} /> {expanded ? 'Show list' : 'Expand'}
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
