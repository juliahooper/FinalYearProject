// The GitHub token lives in localStorage on this device only. Every access is guarded,
// because storage can be blocked (private windows, strict browser settings).
const KEY = 'fyp-github-token'

export function loadToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function storeToken(token: string): boolean {
  try {
    localStorage.setItem(KEY, token)
    return true
  } catch {
    return false
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing stored
  }
}
