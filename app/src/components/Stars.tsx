// 0–5 stars for usefulness (PLAN.md §5). Click a star to set it; click the current value again to clear.
export function Stars({ value, onChange, disabled }: { value: number; onChange?: (n: number) => void; disabled?: boolean }) {
  if (!onChange) {
    return (
      <span className="stars" aria-label={value ? `${value} of 5 stars` : 'Not rated'} title={value ? `${value} of 5` : 'Not rated'}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= value ? 'star on' : 'star'} aria-hidden="true">
            ★
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className="stars stars-input" role="group" aria-label="Usefulness to this project">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'star on' : 'star'}
          aria-label={n === value ? `${n} stars (click to clear)` : `${n} star${n === 1 ? '' : 's'}`}
          aria-pressed={n === value}
          disabled={disabled}
          onClick={() => onChange(n === value ? 0 : n)}
        >
          ★
        </button>
      ))}
    </span>
  )
}
