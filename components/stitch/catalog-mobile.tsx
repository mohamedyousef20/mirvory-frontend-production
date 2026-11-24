"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { productService, userService, wishlistService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { getProductImage, getTotalStock } from "@/lib/productVariants"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"
import { toast } from "sonner"

const PRICE_MIN = 500
const PRICE_MAX = 8000
const PAGE_SIZE = 12

const SORTS = [
  { value: "newest", label: "ترتيب: الأحدث إلى الأقدم", search: "latest", list: "-createdAt" },
  { value: "priceLowToHigh", label: "السعر: من الأقل للأعلى", search: "price_asc", list: "price" },
  { value: "priceHighToLow", label: "السعر: من الأعلى للأقل", search: "price_desc", list: "-price" },
  { value: "topRated", label: "الأعلى تقييماً للمتاجر", search: "top_rated", list: "-ratings.average" },
]

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")

type Facets = { brands: { brand: string; count: number }[]; sizes: { size: string; count: number }[] }

export function CatalogMobile() {
  const sp = useSearchParams()
  const { user } = useAuth()
  const authed = Boolean(user?.id || user?._id)

  const [query, setQuery] = useState(sp.get("q") || "")
  const [submitted, setSubmitted] = useState(sp.get("q") || "")
  const [brands, setBrands] = useState<string[]>((sp.get("brand") || "").split(",").filter(Boolean))
  const [sizes, setSizes] = useState<string[]>((sp.get("size") || "").split(",").filter(Boolean))
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const [sort, setSort] = useState("newest")
  const [drawer, setDrawer] = useState(false)
  const category = sp.get("category") || ""

  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [facets, setFacets] = useState<Facets>({ brands: [], sizes: [] })
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const [preferred, setPreferred] = useState<string | null>(null)

  useEffect(() => {
    let on = true
    productService
      .getProductFilterFacets(category ? { category } : {})
      .then((r: any) => {
        const d = r.data?.data
        if (on && d) setFacets({ brands: d.brands || [], sizes: d.sizes || [] })
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [category])

  useEffect(() => {
    if (!authed) return setFavs(new Set())
    wishlistService
      .getWishlist()
      .then((r: any) => {
        const items = r.data?.data?.products ?? []
        setFavs(new Set(items.map((i: any) => (typeof i.product === "string" ? i.product : i.product?._id)).filter(Boolean)))
      })
      .catch(() => {})
    userService
      .getProfile()
      .then((r: any) => setPreferred(r?.data?.data?.preferredSize || r?.data?.user?.preferredSize || null))
      .catch(() => {})
  }, [authed])

  const sortDef = SORTS.find((s) => s.value === sort) || SORTS[0]

  const load = useCallback(
    async (pg: number, append: boolean) => {
      setLoading(true)
      try {
        const common: any = { page: pg, limit: PAGE_SIZE }
        if (category) common.category = category
        if (maxPrice < PRICE_MAX) common.maxPrice = maxPrice
        if (brands.length) common.brand = brands.join(",")
        if (sizes.length) common.size = sizes.join(",")
        let list: any[]
        let tot: number
        if (submitted.trim()) {
          const r: any = await productService.advancedSearch({ ...common, q: submitted.trim(), sort: sortDef.search })
          list = r.data.products || []
          tot = r.data.pagination?.total || 0
        } else {
          const r: any = await productService.getProducts({ ...common, sort: sortDef.list })
          list = r.data.data || []
          tot = r.data.pagination?.total || 0
        }
        setProducts((p) => (append ? [...p, ...list] : list))
        setTotal(tot)
        setPage(pg)
      } catch {
        toast.error("فشل تحميل المنتجات")
      } finally {
        setLoading(false)
      }
    },
    [category, maxPrice, brands, sizes, submitted, sortDef]
  )

  useEffect(() => {
    load(1, false)
  }, [load])

  const toggle = (list: string[], v: string, set: (x: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const reset = () => {
    setBrands([])
    setSizes([])
    setMaxPrice(PRICE_MAX)
    setQuery("")
    setSubmitted("")
  }

  const activeCount = brands.length + sizes.length + (maxPrice < PRICE_MAX ? 1 : 0)

  const toggleFav = async (id: string) => {
    if (!authed) return toast.error("سجّل الدخول لإضافة المنتج للمفضلة")
    const was = favs.has(id)
    setFavs((s) => {
      const n = new Set(s)
      was ? n.delete(id) : n.add(id)
      return n
    })
    try {
      await wishlistService.toggleWishlist(id)
    } catch {
      toast.error("تعذر تحديث المفضلة")
    }
  }

  const sizeList = useMemo(
    () => facets.sizes.map((s) => s.size).sort((a, b) => parseFloat(a) - parseFloat(b)),
    [facets.sizes]
  )

  return (
    <div dir="rtl" className="md:hidden min-h-screen bg-[#f7f9fb] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] pt-20 px-[1rem] pb-24">
      <h1 className="sr-only">Categories</h1>
      <div className="flex flex-col w-full gap-[1rem]">
        <div className="flex flex-col gap-[0.25rem]">
          <form
            className="flex items-center gap-[0.25rem] bg-[#ffffff] p-1.5 rounded-[0.75rem] shadow-sm"
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(query)
            }}
          >
            <div className="flex items-center justify-center w-9 h-9 text-[#004ac6] shrink-0">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="w-full bg-transparent [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#191c1e] outline-none placeholder:text-[#434655]/60"
              placeholder="ابحث بالاسم، الموديل أو البائع..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                aria-label="مسح البحث"
                type="button"
                onClick={() => {
                  setQuery("")
                  setSubmitted("")
                }}
                className="flex items-center justify-center w-8 h-8 rounded-[9999px] bg-[#eceef0] hover:bg-[#e6e8ea] text-[#434655] transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            <button
              aria-label="فتح التصفية المتقدمة"
              type="button"
              onClick={() => setDrawer((d) => !d)}
              className="relative flex items-center justify-center w-9 h-9 rounded-[0.5rem] bg-[#2563eb] text-[#ffffff] shrink-0 transition-transform active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              {activeCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-[9999px] bg-[#ab0b1c]" />}
            </button>
          </form>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-[9999px] bg-[#004ac6] animate-pulse" />
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#434655]">عرض {fmt(total)} نتيجة بحث متطابقة</span>
            </div>
            <div className="flex items-center gap-1 text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
              <span className="material-symbols-outlined text-[14px] text-[#004ac6]">verified</span>
              <span>مفحوصة بالكامل</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[0.25rem] overflow-x-auto no-scrollbar py-0.5 -mx-[1rem] px-[1rem]">
          <button
            type="button"
            onClick={() => setDrawer((d) => !d)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9999px] bg-[#191c1e] text-[#f7f9fb] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] shrink-0 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>تصفية متقدمة</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-[9999px] bg-[#004ac6] text-[#ffffff] text-[10px] flex items-center justify-center font-bold">{activeCount}</span>
            )}
          </button>
          {brands.map((b) => (
            <Chip key={b} label={`الماركة: ${b}`} aria="إزالة فلتر الماركة" onRemove={() => toggle(brands, b, setBrands)} />
          ))}
          {sizes.map((s) => (
            <Chip key={s} label={`المقاس: ${s}`} aria="إزالة فلتر المقاس" onRemove={() => toggle(sizes, s, setSizes)} />
          ))}
          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-[#ffffff] text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] py-1.5 pr-3 pl-7 rounded-[9999px] shadow-sm outline-none cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[16px] text-[#434655] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
          </div>
        </div>

        {drawer && (
          <section className="bg-[#ffffff] rounded-2xl p-[1rem] shadow-sm flex flex-col gap-[1rem] transition-all">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[0.5rem] bg-[#dbe1ff] flex items-center justify-center text-[#00174b]">
                  <span className="material-symbols-outlined text-[18px]">page_info</span>
                </div>
                <div>
                  <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] leading-tight">تخصيص الفرز والبحث</h2>
                  <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655]">حدد الشروط والماركة المفضلة لديك</p>
                </div>
              </div>
              <button type="button" onClick={reset} className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#004ac6] font-bold hover:underline">
                إعادة تعيين
              </button>
            </div>

            {facets.brands.length > 0 && (
              <div className="flex flex-col gap-[0.25rem]">
                <label className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] text-[#191c1e]">الماركات التجارية</label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  {facets.brands.map(({ brand }) => {
                    const on = brands.includes(brand)
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggle(brands, brand, setBrands)}
                        className={
                          on
                            ? "px-3.5 py-1.5 rounded-[9999px] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold shrink-0 shadow-sm"
                            : "px-3.5 py-1.5 rounded-[9999px] bg-[#f2f4f6] text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] shrink-0 hover:bg-[#eceef0] transition-colors"
                        }
                      >
                        {brand}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {sizeList.length > 0 && (
              <div className="flex flex-col gap-[0.25rem]">
                <div className="flex justify-between items-center">
                  <label className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] text-[#191c1e]">المقاس (EU)</label>
                  {preferred && <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655]">مقاس موصى به: {preferred}</span>}
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {sizeList.map((s) => {
                    const on = sizes.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(sizes, s, setSizes)}
                        className={
                          on
                            ? "h-9 rounded-[0.5rem] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold flex items-center justify-center shadow-sm"
                            : "h-9 rounded-[0.5rem] bg-[#f2f4f6] text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] flex items-center justify-center hover:bg-[#eceef0]"
                        }
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-[0.25rem]">
              <div className="flex justify-between items-center">
                <label className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] text-[#191c1e]">نطاق السعر</label>
                <div className="flex items-center gap-1 text-[#004ac6] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold">
                  <span>{fmt(PRICE_MIN)} ج.م</span>
                  <span className="text-[#434655]">-</span>
                  <span>{fmt(maxPrice)} ج.م</span>
                </div>
              </div>
              <div className="relative w-full py-2">
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={250}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#004ac6] h-2 bg-[#eceef0] rounded-[0.5rem] appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
                <span>{fmt(PRICE_MIN)} ج.م</span>
                <span>{fmt((PRICE_MIN + PRICE_MAX) / 2)} ج.م</span>
                <span>{fmt(PRICE_MAX)}+ ج.م</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="w-full py-3 rounded-[0.75rem] bg-[#2563eb] hover:bg-[#004ac6] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>تطبيق الفلترة ({fmt(total)} نتيجة)</span>
            </button>
          </section>
        )}

        <section className="flex flex-col gap-[0.5rem]">
          <div className="flex items-center justify-between px-1">
            <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">الإصدارات المتاحة</h3>
            <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655]">تحديث فوري للمخزون</span>
          </div>
          <div className="grid grid-cols-2 gap-[0.75rem]">
            {products.map((p) => (
              <CatalogCard key={p._id} p={p} fav={favs.has(p._id)} onFav={() => toggleFav(p._id)} />
            ))}
          </div>
          {!loading && products.length === 0 && (
            <p className="text-center [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#434655] py-[1.5rem]">لا توجد نتائج مطابقة</p>
          )}
          {products.length < total && (
            <button
              type="button"
              disabled={loading}
              onClick={() => load(page + 1, true)}
              className="w-full py-3 rounded-[0.75rem] bg-[#ffffff] text-[#004ac6] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold shadow-sm active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "جارٍ التحميل..." : "عرض المزيد"}
            </button>
          )}
        </section>
      </div>
    </div>
  )
}

function Chip({ label, aria, onRemove }: { label: string; aria: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 rounded-[9999px] bg-[#dae2fd] text-[#131b2e] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] shrink-0 transition-colors">
      <span>{label}</span>
      <button aria-label={aria} type="button" onClick={onRemove} className="flex items-center justify-center hover:opacity-75 transition-opacity">
        <span className="material-symbols-outlined text-[14px]">cancel</span>
      </button>
    </div>
  )
}

function CatalogCard({ p, fav, onFav }: { p: any; fav: boolean; onFav: () => void }) {
  const price = Number(p.price) || 0
  const pct = Number(p.discountPercentage) || 0
  const final = p.discountedPrice && p.discountedPrice < price ? Number(p.discountedPrice) : pct > 0 ? price * (1 - pct / 100) : price
  const hasDiscount = final < price
  const img = normalizeImageUrl(p.image || getProductImage(p) || "", "card")
  const brand = p.brand || p.category?.name || ""
  const out = getTotalStock(p) <= 0
  const badge = hasDiscount
    ? { text: `خصم ${Math.round(pct || ((price - final) / price) * 100)}%`, cls: "bg-[#ffdad7] text-[#410004]" }
    : p.isTrusted
      ? { text: "بائع موثوق ✓", cls: "bg-[#dae2fd] text-[#131b2e]" }
      : p.isFeatured || (p.sold || 0) > 20
        ? { text: "الأكثر طلباً", cls: "bg-[#dbe1ff] text-[#00174b]" }
        : null
  return (
    <article className="bg-[#ffffff] rounded-2xl p-2.5 flex flex-col gap-2 shadow-sm relative group">
      <Link href={`/products/${p._id}`} className="relative aspect-square w-full rounded-[0.75rem] bg-[#f2f4f6] overflow-hidden flex items-center justify-center">
        {img && <img alt={p.title} src={img} loading="lazy" decoding="async" className="object-contain w-full h-full p-1 transform group-hover:scale-105 transition-transform duration-300" />}
        {badge && (
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-[9999px] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-bold shadow-sm ${badge.cls}`}>{badge.text}</span>
        )}
      </Link>
      <button
        aria-label="إضافة للمفضلة"
        type="button"
        onClick={onFav}
        className={`absolute top-4 left-4 w-7 h-7 rounded-[9999px] bg-[#ffffff]/80 backdrop-blur-md flex items-center justify-center shadow-sm ${fav ? "text-[#ab0b1c]" : "text-[#434655]"}`}
      >
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: `'FILL' ${fav ? 1 : 0}` }}>favorite</span>
      </button>
      <div className="flex flex-col gap-1 flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
            <span className="truncate">{brand}</span>
            {hasDiscount ? (
              <span className="text-[#ab0b1c] font-bold">وفر {fmt(price - final)} ج.م</span>
            ) : out ? (
              <span className="text-[#ba1a1a] font-bold">نفد</span>
            ) : null}
          </div>
          <h4 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] text-[#191c1e] line-clamp-1 font-bold">{p.title}</h4>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[20px] leading-[26px] tracking-[-0.02em] font-[700] text-[#191c1e] font-extrabold">{fmt(final)}</span>
          <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#191c1e]">ج.م</span>
          {hasDiscount && <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] line-through text-[#434655]/70">{fmt(price)} ج.م</span>}
        </div>
        <Link
          href={`/products/${p._id}`}
          className="w-full py-2 px-3 rounded-[0.75rem] bg-[#004ac6] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
          <span>{out ? "غير متوفر" : "اختر المقاس"}</span>
        </Link>
      </div>
    </article>
  )
}
