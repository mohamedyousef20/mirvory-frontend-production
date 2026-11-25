// SEO helpers (server-side). Read-only calls to the public products/categories API.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mirvory.net").replace(/\/$/, "")
const API = (process.env.NEXT_PUBLIC_API_URL || SITE_URL).replace(/\/$/, "")

async function getJson(path: string, revalidate = 3600): Promise<any | null> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchProduct(id: string) {
  const d = await getJson(`/api/products/${encodeURIComponent(id)}`)
  return d?.product ?? d?.data ?? null
}

export async function fetchAllProducts(): Promise<any[]> {
  const out: any[] = []
  for (let page = 1; page <= 20; page++) {
    const d = await getJson(`/api/products?limit=100&page=${page}`)
    if (!d?.data) break
    out.push(...d.data)
    if (!d.pagination?.hasNextPage) break
  }
  return out
}

export async function fetchCategories(): Promise<any[]> {
  const d = await getJson(`/api/categories`)
  return Array.isArray(d) ? d : d?.data ?? d?.categories ?? []
}
