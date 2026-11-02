import { useEffect, useRef, type ReactNode } from 'react'

// A modal popup on the native <dialog>, which handles focus, Escape and the backdrop.
export function Dialog({ title, onClose, children, actions }: { title: string; onClose: () => void; children: ReactNode; actions: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal?.()
    return () => dialog?.close?.()
  }, [])

  return (
    <dialog ref={ref} className="dialog" aria-label={title} onCancel={(e) => (e.preventDefault(), onClose())}>
      <h2 className="dialog-title">{title}</h2>
      {children}
      <div className="dialog-actions">{actions}</div>
    </dialog>
  )
}
