// Thin wrapper over the GitHub REST API for this one repo.
import { Octokit } from '@octokit/rest'
import { REPO } from '../config'

export class AuthError extends Error {}
export class ConflictError extends Error {}

export interface TreeFile {
  path: string
  sha: string
}

const repoParams = { owner: REPO.owner, repo: REPO.name }

export function client(token: string) {
  return new Octokit({ auth: token, userAgent: 'fyp-research-app' })
}

const status = (e: unknown) => (e as { status?: number })?.status

// Checks the token can see the repo, and whether it can write to it.
export async function verifyToken(token: string): Promise<{ canWrite: boolean }> {
  try {
    const { data } = await client(token).repos.get(repoParams)
    return { canWrite: Boolean(data.permissions?.push) }
  } catch (e) {
    if (status(e) === 401) throw new AuthError('GitHub didn’t accept this token. Check you copied all of it, or create a new one.')
    if (status(e) === 403 || status(e) === 404)
      throw new AuthError(`This token can’t see ${REPO.owner}/${REPO.name}. When you create it, choose “Only select repositories” and pick this repo.`)
    throw e
  }
}

export async function fetchTree(token: string): Promise<TreeFile[]> {
  const { data } = await client(token).git.getTree({ ...repoParams, tree_sha: REPO.branch, recursive: 'true' })
  if (data.truncated) console.warn('Repo tree was truncated by GitHub; some files may be missing.')
  return data.tree.filter((t) => t.type === 'blob' && t.path && t.sha).map((t) => ({ path: t.path!, sha: t.sha! }))
}

export async function fetchBlob(token: string, sha: string): Promise<string> {
  const { data } = await client(token).git.getBlob({ ...repoParams, file_sha: sha })
  return decodeBase64(data.content)
}

// Writes one file as one commit. Fails with ConflictError if the file changed on GitHub since `sha`.
export async function saveFile(token: string, path: string, text: string, sha: string | null): Promise<string> {
  try {
    const { data } = await client(token).repos.createOrUpdateFileContents({
      ...repoParams,
      path,
      branch: REPO.branch,
      message: `app: update ${path}`,
      content: encodeBase64(text),
      ...(sha ? { sha } : {}),
    })
    return data.content!.sha!
  } catch (e) {
    if (status(e) === 409 || status(e) === 422) {
      throw new ConflictError(
        'This file changed on GitHub since you opened it. Reload it to see the latest version, or copy your text first.',
      )
    }
    if (status(e) === 401) throw new AuthError('Your GitHub token has expired. Create a new one and paste it here.')
    throw e
  }
}

export async function recentCommits(token: string, count = 5) {
  const { data } = await client(token).repos.listCommits({ ...repoParams, sha: REPO.branch, per_page: count })
  return data.map((c) => ({ sha: c.sha, message: c.commit.message.split('\n')[0], date: c.commit.author?.date ?? '' }))
}

function decodeBase64(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

function encodeBase64(text: string): string {
  let bin = ''
  for (const b of new TextEncoder().encode(text)) bin += String.fromCharCode(b)
  return btoa(bin)
}
