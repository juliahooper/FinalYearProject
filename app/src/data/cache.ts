// IndexedDB storage: file contents keyed by path (with their SHA), and unsaved local drafts.
// Every call tolerates IndexedDB being unavailable (private windows, blocked storage):
// the app then simply refetches everything and can't keep drafts.
import { createStore, del, get, keys, set } from 'idb-keyval'
import { REPO } from '../config'

export interface CachedFile {
  sha: string
  text: string
}

export interface Draft {
  text: string
  baseSha: string | null // the SHA the draft was started from, for conflict detection
  savedAt: string
}

const prefix = `${REPO.owner}/${REPO.name}@${REPO.branch}:`
let files: ReturnType<typeof createStore> | null = null
let drafts: ReturnType<typeof createStore> | null = null
try {
  files = createStore('fyp-files', 'files')
  drafts = createStore('fyp-drafts', 'drafts')
} catch {
  // IndexedDB unavailable
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export const getCachedFile = (path: string) =>
  safe(async () => (files ? ((await get(prefix + path, files)) as CachedFile | undefined) : undefined), undefined)

export const setCachedFile = (path: string, file: CachedFile) =>
  safe(async () => void (files && (await set(prefix + path, file, files))), undefined)

export const getDraft = (path: string) =>
  safe(async () => (drafts ? ((await get(prefix + path, drafts)) as Draft | undefined) : undefined), undefined)

export const setDraft = (path: string, draft: Draft) =>
  safe(async () => void (drafts && (await set(prefix + path, draft, drafts))), undefined)

export const clearDraft = (path: string) => safe(async () => void (drafts && (await del(prefix + path, drafts))), undefined)

export const draftPaths = () =>
  safe(
    async () =>
      drafts
        ? (await keys(drafts)).map(String).filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length))
        : [],
    [] as string[],
  )
