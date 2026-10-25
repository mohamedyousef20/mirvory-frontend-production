"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { productService } from "@/lib/api"

/**
 * Quick filters shown under the header search bar on every storefront page.
 * Color / size / rating / sort. Choosing one opens /products with the filter applied
 * (the products page reads the same URL params: size, color, minRating, sort, q).
 */

const HIDDEN_PREFIXES = ["/admin", "/vendor", "/auth", "/checkout", "/guest-checkout", "/verifyEmail"]

const SORTS = [
  { value: "newest", ar: "الأحدث", en: "Newest" },
  { value: "priceLowToHigh", ar: "السعر: الأقل", en: "Price: Low to High" },
  { value: "priceHighToLow", ar: "السعر: الأعلى", en: "Price: High to Low" },
  { value: "topRated", ar: "الأعلى تقييماً", en: "Top rated" },
]
const RATINGS = [4, 3, 2, 1]

type Facets = {
  sizes: { size: string; count: number }[]
  colors: { name: string; value: string; count: number }[]
}

export function QuickFilters() {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const sp = useSearchParams()
  const { language } = useLanguage()
  const ar = language === "ar"
  const [facets, setFacets] = useState<Facets>({ sizes: [], colors: [] })

  useEffect(() => {
    let alive = true
    productService
      .getProductFilterFacets({})
      .then((res: any) => {
        const d = res?.data?.data
        if (alive && d) setFacets({ sizes: d.sizes || [], colors: d.colors || [] })
      })
      .catch(() => { /* optional — the row still works with sort and rating only */ })
    return () => { alive = false }
  }, [])

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  // Only meaningful selections are read from the URL on the products page
  const onProducts = pathname.startsWith("/products")
  const get = (k: string) => (onProducts ? sp.get(k) || "" : "")
  const first = (csv: string) => csv.split(",")[0] || ""

  const apply = (key: string, value: string) => {
    const params = new URLSearchParams(onProducts ? sp.toString() : "")
    if (value && !(key === "sort" && value === "newest")) params.set(key, value)
    else params.delete(key)
    const qs = params.toString()
    router.push(qs ? `/products?${qs}` : "/products")
  }

  const hasAny = ["size", "color", "minRating", "sort"].some((k) => get(k))

  const cls =
    "h-9 shrink-0 rounded-full border border-border bg-background px-3 text-xs outline-none focus:border-primary"

  return (
    <div className="container mx-auto px-4 pb-3">
      <div className="mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto scrollbar-hide" role="group" aria-label={ar ? "فلاتر سريعة" : "Quick filters"}>
        <select className={cls} value={get("sort") || "newest"} onChange={(e) => apply("sort", e.target.value)} aria-label={ar ? "ترتيب" : "Sort"}>
          {SORTS.map((o) => (
            <option key={o.value} value={o.value}>{ar ? o.ar : o.en}</option>
          ))}
        </select>

        <select className={cls} value={first(get("color"))} onChange={(e) => apply("color", e.target.value)} aria-label={ar ? "اللون" : "Color"}>
          <option value="">{ar ? "كل الألوان" : "All colors"}</option>
          {facets.colors.map((c) => (
            <option key={c.value} value={c.value}>{c.name}</option>
          ))}
        </select>

        <select className={cls} value={first(get("size"))} onChange={(e) => apply("size", e.target.value)} aria-label={ar ? "المقاس" : "Size"}>
          <option value="">{ar ? "كل المقاسات" : "All sizes"}</option>
          {facets.sizes.map((s) => (
            <option key={s.size} value={s.size}>{s.size}</option>
          ))}
        </select>

        <select className={cls} value={get("minRating")} onChange={(e) => apply("minRating", e.target.value)} aria-label={ar ? "التقييم" : "Rating"}>
          <option value="">{ar ? "كل التقييمات" : "Any rating"}</option>
          {RATINGS.map((r) => (
            <option key={r} value={String(r)}>{r}+ ★</option>
          ))}
        </select>

        {hasAny && (
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(sp.toString())
              ;["size", "color", "minRating", "sort"].forEach((k) => params.delete(k))
              const qs = params.toString()
              router.push(qs ? `/products?${qs}` : "/products")
            }}
            className="h-9 shrink-0 rounded-full px-3 text-xs text-primary"
          >
            {ar ? "مسح" : "Clear"}
          </button>
        )}
      </div>
    </div>
  )
}
