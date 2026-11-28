/**
 * Anonymous behaviour tracking for the admin "تحليل سلوك المشترين" tab.
 * Sends only: random session id (sessionStorage, dies with the tab), event type, path, product id, search term,
 * device class, referrer HOST and utm_source. No name, phone, email, IP or cookies. Honors Do Not Track.
 * Failures are silent and never affect the site.
 */
export type TrackType = "pageview" | "product_view" | "add_to_cart" | "checkout_start" | "purchase" | "search"

const SID_KEY = "mv_sid"
// Any browser where an admin/super_admin logged in is marked with this flag (set by AuthProvider).
// It stays after logout on purpose: the owner's own visits must not count as buyer behavior,
// whether he is logged in or just browsing the storefront.
const ADMIN_FLAG = "mv_adm"

export function markAdminBrowser(role?: string) {
  if (typeof window === "undefined") return
  try { if (role === "admin" || role === "super_admin") localStorage.setItem(ADMIN_FLAG, "1") } catch { /* ignore */ }
}

function isAdminBrowser(): boolean {
  try { return localStorage.getItem(ADMIN_FLAG) === "1" } catch { return false }
}
function sid(): string {
  try {
    let s = sessionStorage.getItem(SID_KEY)
    if (!s) { s = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); sessionStorage.setItem(SID_KEY, s) }
    return s
  } catch { return "" }
}
const device = () => (window.innerWidth < 768 ? "mobile" : window.innerWidth < 1100 ? "tablet" : "desktop")
function source() {
  try {
    const k = "mv_src"
    const cached = sessionStorage.getItem(k)
    if (cached) return JSON.parse(cached) as { ref: string; utm: string }
    let ref = ""
    try { const h = new URL(document.referrer).hostname.replace(/^www\./, ""); if (h && h !== location.hostname.replace(/^www\./, "")) ref = h } catch { /* none */ }
    const utm = new URLSearchParams(location.search).get("utm_source") || ""
    const v = { ref, utm }
    sessionStorage.setItem(k, JSON.stringify(v))
    return v
  } catch { return { ref: "", utm: "" } }
}

export function track(type: TrackType, extra: { productId?: string; term?: string; results?: number; isAuth?: boolean } = {}) {
  if (typeof window === "undefined") return
  if (navigator.doNotTrack === "1") return
  if (isAdminBrowser()) return
  const id = sid()
  if (!id) return
  const { ref, utm } = source()
  try {
    fetch("/api/behavior/track", {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ sid: id, type, path: location.pathname, device: device(), ref, utm, ...extra }),
    }).catch(() => {})
  } catch { /* ignore */ }
}
