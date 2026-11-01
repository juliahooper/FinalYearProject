import { useCallback, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { clearToken, loadToken } from './auth'
import { Shell } from './components/Shell'
import { SignIn } from './components/SignIn'
import { RepoProvider } from './data/RepoContext'
import { Dashboard } from './pages/Dashboard'
import { Decisions } from './pages/Decisions'
import { Guide } from './pages/Guide'
import { Notes } from './pages/Notes'
import { Readings } from './pages/Readings'

export default function App() {
  const [token, setToken] = useState<string | null>(loadToken)
  const [signInMessage, setSignInMessage] = useState<string | null>(null)

  const signOut = useCallback((message: string | null = null) => {
    clearToken()
    setSignInMessage(message)
    setToken(null)
  }, [])
  const onAuthFailed = useCallback((message: string) => signOut(message), [signOut])

  if (!token) return <SignIn message={signInMessage} onSignedIn={setToken} />

  return (
    <RepoProvider token={token} onAuthFailed={onAuthFailed}>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell onSignOut={() => signOut()} />}>
            <Route index element={<Dashboard />} />
            <Route path="readings/:key?" element={<Readings />} />
            <Route path="notes/:section?" element={<Notes />} />
            <Route path="decisions/:id?" element={<Decisions />} />
            <Route path="guide" element={<Guide />} />
            <Route path="*" element={<div className="page-pad">Page not found.</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RepoProvider>
  )
}
