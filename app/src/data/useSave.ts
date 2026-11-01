import { useCallback, useState } from 'react'
import { AuthError, ConflictError } from './github'
import { useRepo } from './RepoContext'

export type SaveProblem = { kind: 'conflict' | 'error'; message: string } | null

// Wraps RepoContext.save with the saving flag and the messages screens show (PLAN.md §6.1, §6.7).
export function useSave() {
  const { save } = useRepo()
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<SaveProblem>(null)

  const run = useCallback(
    async (path: string, text: string, baseSha?: string | null): Promise<boolean> => {
      setSaving(true)
      setProblem(null)
      try {
        await save(path, text, baseSha)
        return true
      } catch (e) {
        if (e instanceof ConflictError) setProblem({ kind: 'conflict', message: e.message })
        else if (e instanceof AuthError) setProblem({ kind: 'error', message: e.message })
        else if (!navigator.onLine) setProblem({ kind: 'error', message: 'You’re offline, so this wasn’t saved. Your changes are kept in this browser; save again when you’re back online.' })
        else setProblem({ kind: 'error', message: `GitHub didn’t accept the save (${(e as Error).message}). Your changes are kept in this browser; try again.` })
        return false
      } finally {
        setSaving(false)
      }
    },
    [save],
  )

  return { save: run, saving, problem, clearProblem: () => setProblem(null) }
}
