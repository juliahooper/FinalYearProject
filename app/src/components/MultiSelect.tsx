import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

export interface Option {
  value: string
  label: string
  dot?: string // colour dot, e.g. a tag's pastel
  hint?: string
}

// A dropdown chip with a checkbox list (or radio list when `single`). Used for filters and edit fields.
export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  single,
  footer,
}: {
  label: ReactNode
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  single?: boolean
  footer?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  function toggle(value: string) {
    if (single) {
      onChange(selected[0] === value ? [] : [value])
      setOpen(false)
    } else onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className={`btn filter-chip${selected.length ? ' active' : ''}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {label}
        {selected.length > 0 && !single && <span className="count-badge">{selected.length}</span>} <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="dropdown-menu" id={id} role="group">
          {options.length === 0 && <div className="muted dropdown-empty">Nothing to choose from yet.</div>}
          {options.map((o) => (
            <label key={o.value} className="dropdown-option">
              <input type={single ? 'radio' : 'checkbox'} name={id} checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
              {o.dot && <span className="dot" style={{ background: o.dot }} aria-hidden="true" />}
              <span>{o.label}</span>
              {o.hint && <span className="muted option-hint">{o.hint}</span>}
            </label>
          ))}
          {footer && <div className="dropdown-footer">{footer}</div>}
        </div>
      )}
    </div>
  )
}
