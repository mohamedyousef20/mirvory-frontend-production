const KEY = 'mirvory_return_to'

/** Only same-site paths, never auth pages. */
export function safePath(p?: string | null): string | null {
  if (!p) return null
  try { p = decodeURIComponent(p) } catch { return null }
  if (!p.startsWith('/') || p.startsWith('//') || p.startsWith('/\\')) return null
  if (p.startsWith('/auth') || p.startsWith('/api')) return null
  return p
}

export function rememberPath(p: string) {
  const s = safePath(p)
  if (s && typeof window !== 'undefined') { try { sessionStorage.setItem(KEY, s) } catch {} }
}

/** Where to send the user after login: ?redirect=, else the last page they were on, else home. */
export function getReturnTo(): string {
  if (typeof window === 'undefined') return '/'
  const q = new URLSearchParams(window.location.search)
  const fromQuery = safePath(q.get('redirect') || q.get('callbackUrl'))
  if (fromQuery) return fromQuery
  try {
    const s = safePath(sessionStorage.getItem(KEY))
    if (s) return s
  } catch {}
  return '/'
}
