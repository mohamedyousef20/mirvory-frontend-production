"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronDown, RotateCcw, SlidersHorizontal, Trash2, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { categoryService, productService } from "@/lib/api"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"

/**
 * Filters shown under the header search bar on every storefront page.
 *
 *  ┌ [Filters (n)]  [Category ▾] [Color ▾] [Sort ▾] ┐   quick row (always visible, sticky header)
 *  └ active chips …                       [Clear all] ┘
 *  Tapping "Filters" opens a bottom sheet (slides up) with color swatches, sizes,
 *  price range, category and rating, and a "Show N products" button.
 *
 * Everything is stored in the URL (size, color, category, minPrice, maxPrice, minRating, sort, q),
 * and the products page reads the very same params.
 */

const HIDDEN_PREFIXES = ["/admin", "/vendor", "/auth", "/checkout", "/guest-checkout", "/verifyEmail"]
const MAX_PRICE = 3000
const PRICE_STEP = 50

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
type Cat = { _id: string; name: string; nameEn?: string }
type Draft = {
  sizes: string[]
  colors: string[]
  category: string
  minPrice: number
  maxPrice: number
  minRating: number
}

const csv = (v: string | null) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : [])
const toNum = (v: string | null, d: number) => {
  const n = Number(v)
  return v !== null && v !== "" && Number.isFinite(n) ? n : d
}

export function QuickFilters() {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const sp = useSearchParams()
  const { language } = useLanguage()
  const ar = language === "ar"

  const [facets, setFacets] = useState<Facets>({ sizes: [], colors: [] })
  const [categories, setCategories] = useState<Cat[]>([])
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState<number | null>(null)

  const onProducts = pathname.startsWith("/products")

  // The applied filters come from the URL (only meaningful on /products)
  const applied: Draft = useMemo(
    () => ({
      sizes: onProducts ? csv(sp.get("size")) : [],
      colors: onProducts ? csv(sp.get("color")) : [],
      category: onProducts ? sp.get("category") || "" : "",
      minPrice: onProducts ? toNum(sp.get("minPrice"), 0) : 0,
      maxPrice: onProducts ? toNum(sp.get("maxPrice"), MAX_PRICE) : MAX_PRICE,
      minRating: onProducts ? toNum(sp.get("minRating"), 0) : 0,
    }),
    [sp, onProducts],
  )
  const sort = onProducts ? sp.get("sort") || "newest" : "newest"
  const q = onProducts ? sp.get("q") || "" : sp.get("q") || ""

  const [draft, setDraft] = useState<Draft>(applied)

  // facets + categories, loaded once
  useEffect(() => {
    let alive = true
    productService
      .getProductFilterFacets({})
      .then((res: any) => {
        const d = res?.data?.data
        if (alive && d) setFacets({ sizes: d.sizes || [], colors: d.colors || [] })
      })
      .catch(() => {})
    categoryService
      .getCategories()
      .then((res: any) => {
        const list = res?.data?.data ?? res?.data ?? []
        if (alive && Array.isArray(list)) setCategories(list)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // every time the sheet opens, start from what is applied now
  useEffect(() => {
    if (open) setDraft(applied)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const buildParams = useCallback(
    (d: Draft, nextSort: string) => {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (d.sizes.length) params.set("size", d.sizes.join(","))
      if (d.colors.length) params.set("color", d.colors.join(","))
      if (d.category) params.set("category", d.category)
      if (d.minPrice > 0) params.set("minPrice", String(d.minPrice))
      if (d.maxPrice < MAX_PRICE) params.set("maxPrice", String(d.maxPrice))
      if (d.minRating > 0) params.set("minRating", String(d.minRating))
      if (nextSort && nextSort !== "newest") params.set("sort", nextSort)
      return params
    },
    [q],
  )

  const go = useCallback(
    (d: Draft, nextSort: string) => {
      const qs = buildParams(d, nextSort).toString()
      router.push(qs ? `/products?${qs}` : "/products")
    },
    [buildParams, router],
  )

  // live "Show N products" count for the sheet (debounced)
  const countSeq = useRef(0)
  useEffect(() => {
    if (!open) return
    const seq = ++countSeq.current
    const t = setTimeout(async () => {
      try {
        const params: any = { page: 1, limit: 1 }
        if (q) params.search = q
        if (draft.category) params.category = draft.category
        if (draft.sizes.length) params.size = draft.sizes.join(",")
        if (draft.colors.length) params.color = draft.colors.join(",")
        if (draft.minPrice > 0) params.minPrice = draft.minPrice
        if (draft.maxPrice < MAX_PRICE) params.maxPrice = draft.maxPrice
        if (draft.minRating > 0) params.minRating = draft.minRating
        const res: any = await productService.getProducts(params)
        if (seq === countSeq.current) setCount(res?.data?.pagination?.total ?? null)
      } catch {
        if (seq === countSeq.current) setCount(null)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [draft, open, q])

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  const catName = (c?: Cat) => (c ? (ar ? c.name : c.nameEn || c.name) : "")
  const colorOf = (value: string) => facets.colors.find((c) => c.value === value)
  const activeCount =
    applied.sizes.length +
    applied.colors.length +
    (applied.category ? 1 : 0) +
    (applied.minPrice > 0 || applied.maxPrice < MAX_PRICE ? 1 : 0) +
    (applied.minRating > 0 ? 1 : 0)
  const hasActive = activeCount > 0 || sort !== "newest"

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const clearAll = () => go({ sizes: [], colors: [], category: "", minPrice: 0, maxPrice: MAX_PRICE, minRating: 0 }, "newest")

  const pill =
    "h-11 shrink-0 appearance-none rounded-full border border-border bg-background ps-4 pe-9 text-sm font-medium outline-none focus:border-primary"
  const chip = "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 text-xs font-medium text-blue-900 dark:bg-blue-950 dark:text-blue-100"

  const Select = ({ value, onChange, children, label }: { value: string; onChange: (v: string) => void; children: React.ReactNode; label: string }) => (
    <div className="relative shrink-0">
      <select className={pill} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )

  return (
    <div className="container mx-auto px-4 pb-3" dir={ar ? "rtl" : "ltr"}>
      {/* ───── quick row ───── */}
      <div className="mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto scrollbar-hide" role="group" aria-label={ar ? "الفلاتر" : "Filters"}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#0b1f4d] px-4 text-sm font-semibold text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {ar ? "الفلاتر" : "Filters"}
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-xs">{activeCount}</span>
          )}
        </button>

        <Select
          label={ar ? "الفئة" : "Category"}
          value={applied.category}
          onChange={(v) => go({ ...applied, category: v }, sort)}
        >
          <option value="">{ar ? "كل الفئات" : "All categories"}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{catName(c)}</option>
          ))}
        </Select>

        <Select
          label={ar ? "اللون" : "Color"}
          value={applied.colors[0] || ""}
          onChange={(v) => go({ ...applied, colors: v ? [v] : [] }, sort)}
        >
          <option value="">{ar ? "كل الألوان" : "All colors"}</option>
          {facets.colors.map((c) => (
            <option key={c.value} value={c.value}>{c.name}</option>
          ))}
        </Select>

        <Select label={ar ? "ترتيب" : "Sort"} value={sort} onChange={(v) => go(applied, v)}>
          {SORTS.map((o) => (
            <option key={o.value} value={o.value}>{ar ? o.ar : o.en}</option>
          ))}
        </Select>
      </div>

      {/* ───── active chips ───── */}
      {hasActive && (
        <div className="mx-auto mt-2 flex max-w-3xl items-center gap-2 overflow-x-auto scrollbar-hide">
          {applied.colors.map((v) => (
            <span key={v} className={chip}>
              <span className="h-3 w-3 rounded-full border border-black/20" style={{ background: v }} />
              {colorOf(v)?.name || v}
              <button type="button" aria-label="remove" onClick={() => go({ ...applied, colors: applied.colors.filter((x) => x !== v) }, sort)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {applied.sizes.map((s) => (
            <span key={s} className={chip}>
              {ar ? `مقاس ${s}` : `Size ${s}`}
              <button type="button" aria-label="remove" onClick={() => go({ ...applied, sizes: applied.sizes.filter((x) => x !== s) }, sort)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {applied.category && (
            <span className={chip}>
              {catName(categories.find((c) => c._id === applied.category)) || (ar ? "فئة" : "Category")}
              <button type="button" aria-label="remove" onClick={() => go({ ...applied, category: "" }, sort)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(applied.minPrice > 0 || applied.maxPrice < MAX_PRICE) && (
            <span className={chip}>
              {applied.minPrice}–{applied.maxPrice} {ar ? "ج.م" : "EGP"}
              <button type="button" aria-label="remove" onClick={() => go({ ...applied, minPrice: 0, maxPrice: MAX_PRICE }, sort)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {applied.minRating > 0 && (
            <span className={chip}>
              {applied.minRating}+ ★
              <button type="button" aria-label="remove" onClick={() => go({ ...applied, minRating: 0 }, sort)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button type="button" onClick={clearAll} className="ms-auto inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
            <Trash2 className="h-3.5 w-3.5" />
            {ar ? "مسح الكل" : "Clear all"}
          </button>
        </div>
      )}

      {/* ───── bottom sheet ───── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          dir={ar ? "rtl" : "ltr"}
          className="flex max-h-[88vh] flex-col gap-0 rounded-t-3xl p-0 [&>button]:hidden"
        >
          <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-muted" aria-hidden />
          <SheetHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 px-5 py-3">
            <div>
              <SheetTitle className="text-xl font-bold">{ar ? "الفلاتر" : "Filters"}</SheetTitle>
              <SheetDescription className="sr-only">{ar ? "اختر اللون والمقاس والسعر والفئة" : "Choose color, size, price and category"}</SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDraft({ sizes: [], colors: [], category: "", minPrice: 0, maxPrice: MAX_PRICE, minRating: 0 })}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                {ar ? "إعادة تعيين" : "Reset"}
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="close" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
            {/* color */}
            {facets.colors.length > 0 && (
              <section className="rounded-2xl border p-4">
                <h3 className="mb-3 font-semibold">{ar ? "اللون" : "Color"}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-3">
                  {facets.colors.map((c) => {
                    const on = draft.colors.includes(c.value)
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, colors: toggle(d.colors, c.value) }))}
                        className="flex w-14 flex-col items-center gap-1"
                        aria-pressed={on}
                      >
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-full border ${on ? "ring-2 ring-offset-2 ring-blue-700" : ""}`}
                          style={{ background: c.value }}
                        >
                          {on && <Check className="h-5 w-5 text-white mix-blend-difference" />}
                        </span>
                        <span className="text-xs">{c.name}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* size */}
            {facets.sizes.length > 0 && (
              <section className="rounded-2xl border p-4">
                <h3 className="mb-3 font-semibold">{ar ? "المقاس" : "Size"}</h3>
                <div className="flex flex-wrap gap-2">
                  {facets.sizes.map(({ size }) => {
                    const on = draft.sizes.includes(size)
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, sizes: toggle(d.sizes, size) }))}
                        aria-pressed={on}
                        className={`h-11 min-w-12 rounded-xl border px-4 text-base ${on ? "border-[#0b1f4d] bg-[#0b1f4d] text-white" : "bg-background"}`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* price */}
            <section className="rounded-2xl border p-4">
              <h3 className="mb-4 font-semibold">{ar ? "السعر" : "Price"}</h3>
              <Slider
                value={[draft.minPrice, draft.maxPrice]}
                max={MAX_PRICE}
                step={PRICE_STEP}
                onValueChange={(v: number[]) => setDraft((d) => ({ ...d, minPrice: v[0], maxPrice: v[1] }))}
              />
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span className="flex-1 rounded-xl bg-muted px-3 py-2">
                  {ar ? "من" : "From"} <b>{draft.minPrice}</b> {ar ? "ج.م" : "EGP"}
                </span>
                <span className="flex-1 rounded-xl bg-muted px-3 py-2">
                  {ar ? "إلى" : "To"} <b>{draft.maxPrice}</b> {ar ? "ج.م" : "EGP"}
                </span>
              </div>
            </section>

            {/* category */}
            {categories.length > 0 && (
              <section className="rounded-2xl border p-4">
                <h3 className="mb-3 font-semibold">{ar ? "الفئة" : "Category"}</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const on = draft.category === c._id
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, category: on ? "" : c._id }))}
                        aria-pressed={on}
                        className={`h-10 rounded-xl border px-4 text-sm ${on ? "border-[#0b1f4d] bg-[#0b1f4d] text-white" : "bg-background"}`}
                      >
                        {catName(c)}
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* rating */}
            <section className="rounded-2xl border p-4">
              <h3 className="mb-3 font-semibold">{ar ? "التقييم" : "Rating"}</h3>
              <div className="flex flex-wrap gap-2">
                {RATINGS.map((r) => {
                  const on = draft.minRating === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, minRating: on ? 0 : r }))}
                      aria-pressed={on}
                      className={`h-10 rounded-xl border px-4 text-sm ${on ? "border-[#0b1f4d] bg-[#0b1f4d] text-white" : "bg-background"}`}
                    >
                      {r}+ ★
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t bg-background px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                go(draft, sort)
              }}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0b1f4d] text-base font-semibold text-white"
            >
              {count === null
                ? ar ? "عرض المنتجات" : "Show products"
                : ar ? `عرض ${count} منتج` : `Show ${count} products`}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
