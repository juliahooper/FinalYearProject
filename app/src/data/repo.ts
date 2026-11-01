// Loads the files the app needs from the repo, using the IndexedDB cache for any file whose SHA hasn't changed.
import { parse } from 'yaml'
import { getCachedFile, setCachedFile } from './cache'
import { splitFrontMatter } from './frontmatter'
import { fetchBlob, fetchTree, type TreeFile } from './github'
import type { DecisionMeta, Doc, FollowUp, RawFile, ReadingMeta, Tag } from './types'

const WANTED = [
  /^readings\/[^/]+\.md$/,
  /^readings\/follow-up\.yml$/,
  /^decisions\/[^/]+\.md$/,
  /^paper\/notes\/[^/]+\.md$/,
  /^paper\/(interim|final)\/sections\/[^/]+\.tex$/, // for each section's "What this section needs" comment block
  /^tags\.yml$/,
  /^ai-use\.md$/, // verifying a reading fills in its date here
  /^docs\/[^/]+\.md$/,
  /^app\/public\/status\.json$/,
  /^references\.bib$/,
]

// Whether the app loads this repo file.
export const isWanted = (path: string) => WANTED.some((re) => re.test(path))

export interface RepoData {
  files: Map<string, RawFile>
  readings: Doc<ReadingMeta>[]
  readingTemplate: RawFile | null
  decisions: Doc<DecisionMeta>[]
  notes: RawFile[]
  docs: RawFile[]
  tags: Tag[]
  followUps: FollowUp[]
  status: unknown
  bib: RawFile | null
  loadedAt: string
}

export interface Progress {
  done: number
  total: number
}

const isTemplate = (path: string) => /\/_[^/]*$/.test(path)

export async function loadRepo(token: string, onProgress?: (p: Progress) => void): Promise<RepoData> {
  const tree = (await fetchTree(token)).filter((f) => isWanted(f.path))
  const files = new Map<string, RawFile>()
  let done = 0
  onProgress?.({ done, total: tree.length })

  // Fetch in small batches to stay well inside GitHub's rate limits.
  const queue = [...tree]
  const worker = async () => {
    for (let f: TreeFile | undefined; (f = queue.shift()); ) {
      const cached = await getCachedFile(f.path)
      let text: string
      if (cached && cached.sha === f.sha) {
        text = cached.text
      } else {
        text = await fetchBlob(token, f.sha)
        await setCachedFile(f.path, { sha: f.sha, text })
      }
      files.set(f.path, { path: f.path, sha: f.sha, text })
      onProgress?.({ done: ++done, total: tree.length })
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))

  return build(files)
}

// Rebuilds the parsed views from raw files. Also used after a save updates one file.
export function build(files: Map<string, RawFile>): RepoData {
  const all = [...files.values()].sort((a, b) => a.path.localeCompare(b.path))
  const under = (re: RegExp) => all.filter((f) => re.test(f.path))
  const yamlOf = <T>(path: string, fallback: T): T => {
    const f = files.get(path)
    if (!f) return fallback
    try {
      return (parse(f.text) as T) ?? fallback
    } catch {
      return fallback
    }
  }
  const docs = <T>(re: RegExp): Doc<T>[] =>
    under(re)
      .filter((f) => !isTemplate(f.path))
      .flatMap((f) => {
        const { data, body } = splitFrontMatter<T>(f.text)
        return data ? [{ path: f.path, sha: f.sha, text: f.text, meta: data, body }] : []
      })

  let status: unknown = null
  try {
    status = JSON.parse(files.get('app/public/status.json')?.text ?? 'null')
  } catch {
    status = null
  }

  return {
    files,
    readings: docs<ReadingMeta>(/^readings\/[^/]+\.md$/),
    readingTemplate: files.get('readings/_template.md') ?? null,
    decisions: docs<DecisionMeta>(/^decisions\/[^/]+\.md$/),
    notes: under(/^paper\/notes\/[^/]+\.md$/),
    docs: under(/^docs\/[^/]+\.md$/),
    tags: yamlOf<Tag[]>('tags.yml', []),
    followUps: yamlOf<FollowUp[]>('readings/follow-up.yml', []),
    status,
    bib: files.get('references.bib') ?? null,
    loadedAt: new Date().toISOString(),
  }
}
