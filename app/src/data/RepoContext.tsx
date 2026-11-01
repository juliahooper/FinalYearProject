import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { clearDraft, setCachedFile } from './cache'
import { AuthError, saveFile } from './github'
import { build, loadRepo, type Progress, type RepoData } from './repo'

interface RepoState {
  data: RepoData | null
  loading: boolean
  progress: Progress | null
  error: string | null
  reload: () => Promise<void>
  // Saves one file as one commit. Throws ConflictError if it changed on GitHub; the caller shows the banner.
  // baseSha: the version the edit started from (e.g. a restored draft). Defaults to the latest loaded version.
  save: (path: string, text: string, baseSha?: string | null) => Promise<void>
}

const RepoContext = createContext<RepoState | null>(null)

export function RepoProvider({ token, onAuthFailed, children }: { token: string; onAuthFailed: (msg: string) => void; children: ReactNode }) {
  const [data, setDataState] = useState<RepoData | null>(null)
  // The latest data, readable from event handlers that ran before a re-render (e.g. two quick saves).
  const latest = useRef<RepoData | null>(null)
  const setData = useCallback((d: RepoData | null) => {
    latest.current = d
    setDataState(d)
  }, [])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await loadRepo(token, setProgress))
    } catch (e) {
      if (e instanceof AuthError || (e as { status?: number })?.status === 401) {
        onAuthFailed('Your GitHub token has expired or was revoked. Create a new one and paste it here.')
        return
      }
      setError(
        navigator.onLine
          ? `Couldn’t load the repo from GitHub (${(e as Error).message}). Try again in a minute.`
          : 'You’re offline. Connect to the internet and reload.',
      )
    } finally {
      setLoading(false)
    }
  }, [token, onAuthFailed, setData])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(
    async (path: string, text: string, baseSha?: string | null) => {
      const current = latest.current?.files.get(path)
      const sha = await saveFile(token, path, text, baseSha !== undefined ? baseSha : (current?.sha ?? null))
      await setCachedFile(path, { sha, text })
      await clearDraft(path)
      const d = latest.current
      if (d) {
        const files = new Map(d.files)
        files.set(path, { path, sha, text })
        setData(build(files))
      }
    },
    [token, setData],
  )

  return <RepoContext.Provider value={{ data, loading, progress, error, reload, save }}>{children}</RepoContext.Provider>
}

export function useRepo() {
  const ctx = useContext(RepoContext)
  if (!ctx) throw new Error('useRepo must be used inside RepoProvider')
  return ctx
}
