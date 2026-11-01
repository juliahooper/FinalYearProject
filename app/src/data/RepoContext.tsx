import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
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
  save: (path: string, text: string) => Promise<void>
}

const RepoContext = createContext<RepoState | null>(null)

export function RepoProvider({ token, onAuthFailed, children }: { token: string; onAuthFailed: (msg: string) => void; children: ReactNode }) {
  const [data, setData] = useState<RepoData | null>(null)
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
  }, [token, onAuthFailed])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(
    async (path: string, text: string) => {
      const current = data?.files.get(path)
      const sha = await saveFile(token, path, text, current?.sha ?? null)
      await setCachedFile(path, { sha, text })
      await clearDraft(path)
      setData((d) => {
        if (!d) return d
        const files = new Map(d.files)
        files.set(path, { path, sha, text })
        return build(files)
      })
    },
    [data, token],
  )

  return <RepoContext.Provider value={{ data, loading, progress, error, reload, save }}>{children}</RepoContext.Provider>
}

export function useRepo() {
  const ctx = useContext(RepoContext)
  if (!ctx) throw new Error('useRepo must be used inside RepoProvider')
  return ctx
}
