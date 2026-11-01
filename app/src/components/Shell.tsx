import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useRepo } from '../data/RepoContext'
import { Icon } from './Icons'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function Shell({ onSignOut }: { onSignOut: () => void }) {
  const { data, loading, progress, error, reload } = useRepo()
  const [theme, setTheme] = useState<Theme>(currentTheme)

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('fyp-theme', next)
    } catch {
      // theme just won't be remembered
    }
    setTheme(next)
  }

  const nav = [
    { to: '/', label: 'Dashboard', icon: 'dashboard' as const, end: true },
    { to: '/readings', label: 'Readings', icon: 'readings' as const, count: data?.readings.length },
    { to: '/notes', label: 'Report notes', icon: 'notes' as const },
    { to: '/decisions', label: 'Decisions', icon: 'decisions' as const, count: data?.decisions.length },
    { to: '/guide', label: 'Guide', icon: 'guide' as const },
  ]

  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Main">
        <div className="sidebar-title">FYP</div>
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
            {n.count !== undefined && <span className="count">{n.count}</span>}
          </NavLink>
        ))}
        <div className="sidebar-foot">
          <button className="btn btn-quiet" onClick={toggleTheme}>
            <Icon name="theme" /> {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button className="btn btn-quiet" onClick={onSignOut}>
            <Icon name="signout" /> Sign out
          </button>
        </div>
      </nav>
      <main className="page">
        {error ? (
          <div className="page-pad">
            <div className="banner banner-err" role="alert">{error}</div>
            <button className="btn" onClick={() => void reload()}>Try again</button>
          </div>
        ) : loading && !data ? (
          <div className="loading" aria-live="polite">
            Loading the repo{progress ? ` (${progress.done} of ${progress.total} files)` : '…'}
            {progress && progress.total > 0 && (
              <div className="progress">
                <div style={{ width: `${(100 * progress.done) / progress.total}%` }} />
              </div>
            )}
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}
