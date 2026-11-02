import { useState, type FormEvent } from 'react'
import { storeToken } from '../auth'
import { REPO } from '../config'
import { verifyToken } from '../data/github'

export function SignIn({ message, onSignedIn }: { message?: string | null; onSignedIn: (token: string) => void }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(message ?? null)
  const [checking, setChecking] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const t = token.trim()
    if (!t) return
    setChecking(true)
    setError(null)
    try {
      const { canWrite } = await verifyToken(t)
      if (!canWrite) {
        setError('This token can read the repo but not save to it. Edit the token on GitHub and set Contents to “Read and write”.')
        return
      }
      if (!storeToken(t)) {
        setError('Your browser is blocking local storage, so the token can’t be remembered. Allow site data for this page, or use a normal (not private) window.')
        return
      }
      onSignedIn(t)
    } catch (err) {
      setError((err as Error).message || 'Couldn’t reach GitHub. Check your connection and try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <main className="signin">
      <h1 className="page-title">Sign in with a GitHub token</h1>
      <p className="muted">
        The app reads and saves files in <strong>{REPO.owner}/{REPO.name}</strong> using a token that only works for that repo. The token stays in this browser.
      </p>
      <ol>
        <li>
          Open{' '}
          <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
            GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token
          </a>
          .
        </li>
        <li>Name it “FYP app” and pick an expiry date. You’ll make a new one when it expires.</li>
        <li>
          Under <strong>Repository access</strong>, choose <strong>Only select repositories</strong> and pick <strong>{REPO.name}</strong>.
        </li>
        <li>
          Under <strong>Permissions → Repository permissions</strong>, set <strong>Contents</strong> to <strong>Read and write</strong>. <strong>Metadata: Read-only</strong> is added automatically.
        </li>
        <li>Click <strong>Generate token</strong>, copy it, and paste it below.</li>
      </ol>
      {error && <div className="banner banner-err" role="alert">{error}</div>}
      <form onSubmit={submit}>
        <label htmlFor="token">Token</label>
        <input id="token" type="password" autoComplete="off" spellCheck={false} placeholder="github_pat_…" value={token} onChange={(e) => setToken(e.target.value)} />
        <button className="btn btn-primary" type="submit" disabled={checking || !token.trim()}>
          {checking ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
