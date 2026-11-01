import { useState, type ReactNode } from 'react'
import { Icon } from './Icons'

// List pane | reader pane, with an expand button that hides the list (PLAN.md §6.2).
export function SplitPage({ list, children, hasSelection }: { list: ReactNode; children: ReactNode; hasSelection: boolean }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`split${expanded ? ' expanded' : ''}${hasSelection ? ' has-selection' : ''}`}>
      <div className="list-pane">{list}</div>
      <section className="reader-pane">
        <div className="reader-bar">
          <button className="btn btn-quiet" onClick={() => setExpanded(!expanded)} aria-pressed={expanded} title={expanded ? 'Show the list' : 'Hide the list'}>
            <Icon name={expanded ? 'collapse' : 'expand'} /> {expanded ? 'Show list' : 'Expand'}
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
