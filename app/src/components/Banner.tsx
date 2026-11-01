import type { ReactNode } from 'react'

export function Banner({ kind = 'info', children, actions }: { kind?: 'info' | 'warn' | 'err'; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className={`banner banner-${kind}`} role={kind === 'err' ? 'alert' : 'status'}>
      <div>{children}</div>
      {actions && <div className="banner-actions">{actions}</div>}
    </div>
  )
}
