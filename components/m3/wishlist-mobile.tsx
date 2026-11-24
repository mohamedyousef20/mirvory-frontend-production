"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { cartService, userService, wishlistService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { getProductImage } from "@/lib/productVariants"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const finalPrice = (p: any) => (p.discountPercentage > 0 && p.discountedPrice ? p.discountedPrice : p.price)

type Match = { colorValue: string; colorName: string; quantity: number } | null
function matchSize(p: any, size: string | null): Match {
  if (!size) return null
  for (const c of p.colors || []) {
    if (c.available === false) continue
    const s = (c.sizes || []).find((x: any) => String(x.size) === String(size) && x.quantity > 0)
    if (s) return { colorValue: c.value, colorName: c.name, quantity: s.quantity }
  }
  return null
}

export function WishlistMobile() {
  const { user, cookiesReady } = useAuth()
  const authed = Boolean(user)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pref, setPref] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "size" | "sale">("all")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const r: any = await wishlistService.getWishlist()
      setItems((r.data?.data?.products ?? []).filter((i: any) => i.product && typeof i.product === "object"))
    } catch {
      toast.error("فشل في جلب قائمة المفضلة")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!cookiesReady) return
    if (!authed) return setLoading(false)
    load()
    userService.getProfile().then((r: any) => setPref(r.data?.data?.preferredSize || r.data?.user?.preferredSize || null)).catch(() => {})
  }, [authed, cookiesReady, load])

  const remove = async (id: string) => {
    setItems((x) => x.filter((i) => i.product._id !== id))
    try {
      await wishlistService.toggleWishlist(id)
      window.dispatchEvent(new Event("wishlist-updated"))
    } catch {
      toast.error("فشل في إزالة المنتج")
      load()
    }
  }

  const addOne = async (p: any) => {
    const m = matchSize(p, pref)
    if (!m) return
    try {
      await cartService.addToCart({ productId: p._id, quantity: 1, sizes: [pref as string], colors: [m.colorValue] })
      window.dispatchEvent(new Event("cart-updated"))
      toast.success("تمت إضافة المنتج إلى السلة")
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "فشل في الإضافة للسلة")
    }
  }

  const ready = useMemo(() => items.filter((i) => matchSize(i.product, pref)), [items, pref])
  const readyTotal = ready.reduce((s, i) => s + finalPrice(i.product), 0)

  const addReady = async () => {
    setBusy(true)
    let ok = 0
    for (const i of ready) {
      const m = matchSize(i.product, pref)!
      try {
        await cartService.addToCart({ productId: i.product._id, quantity: 1, sizes: [pref as string], colors: [m.colorValue] })
        ok++
      } catch {
        /* keep going: one sold-out item must not block the rest */
      }
    }
    setBusy(false)
    window.dispatchEvent(new Event("cart-updated"))
    ok ? toast.success(`تمت إضافة ${ok} منتج للسلة`) : toast.error("تعذرت الإضافة للسلة")
  }

  const drops = items.filter((i) => i.priceAtAdd && finalPrice(i.product) < i.priceAtAdd)
  const topDrop = [...drops].sort((a, b) => b.priceAtAdd - finalPrice(b.product) - (a.priceAtAdd - finalPrice(a.product)))[0]
  const saved = topDrop ? topDrop.priceAtAdd - finalPrice(topDrop.product) : 0

  const shown = items.filter((i) => (filter === "size" ? matchSize(i.product, pref) : filter === "sale" ? i.product.discountPercentage > 0 : true))

  const share = () => {
    const text = `قائمة أمنياتي من Mirvory:\n` + items.map((i) => `• ${i.product.title} — ${location.origin}/products/${i.product._id}`).join("\n")
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener")
  }

  return (
    <div dir="rtl" className="md:hidden flex flex-col w-full pb-24 bg-m3-surface min-h-screen font-m3-body-md">
      <section className="px-m3-margin pt-2 pb-m3-space-sm flex flex-col gap-m3-space-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-m3-headline-xl-mobile text-m3-headline-xl-mobile text-m3-on-surface tracking-tight">قائمة الرغبات</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-m3-secondary-container text-m3-on-secondary-container font-m3-label-sm text-m3-label-sm font-bold">{items.length} قطع</span>
          </div>
          <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant mt-0.5">مجموعتك المختارة بانتظار المقاس والسعر المثالي</p>
        </div>

        {topDrop && (
          <div className="relative overflow-hidden rounded-2xl bg-m3-surface-container-lowest p-3 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-m3-tertiary-fixed flex items-center justify-center shrink-0 text-m3-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[20px]">trending_down</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-m3-label-sm text-m3-label-sm uppercase tracking-wider text-m3-tertiary font-bold">انخفاض في السعر</span>
                <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface truncate">وفّرت <strong>{fmt(saved)} ج.م</strong> على {topDrop.product.title} منذ حفظه!</p>
              </div>
            </div>
            <Link href={`/products/${topDrop.product._id}`} className="shrink-0 px-3 py-1.5 rounded-full bg-m3-surface-container text-m3-on-surface font-m3-label-sm text-m3-label-sm">عرض</Link>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full font-m3-label-md text-m3-label-md shrink-0 shadow-sm ${filter === "all" ? "bg-on-surface text-surface" : "bg-surface-container-lowest text-on-surface-variant"}`}>الكل ({items.length})</button>
          {pref && (
            <button onClick={() => setFilter("size")} className={`px-3.5 py-2 rounded-full font-m3-label-md text-m3-label-md shrink-0 flex items-center gap-1.5 shadow-sm ${filter === "size" ? "bg-on-surface text-surface" : "bg-surface-container-lowest text-on-surface-variant"}`}>
              <span className="material-symbols-outlined text-[16px] text-m3-primary">check_circle</span>
              <span>بمقاسي {pref} EU</span>
            </button>
          )}
          <button onClick={() => setFilter("sale")} className={`px-3.5 py-2 rounded-full font-m3-label-md text-m3-label-md shrink-0 flex items-center gap-1.5 shadow-sm ${filter === "sale" ? "bg-on-surface text-surface" : "bg-surface-container-lowest text-on-surface-variant"}`}>
            <span className="material-symbols-outlined text-[16px] text-m3-tertiary">local_offer</span>
            <span>تخفيضات نشطة</span>
          </button>
        </div>
      </section>

      <section className="px-m3-margin py-2">
        {!authed && !loading ? (
          <div className="text-center py-m3-space-xl flex flex-col items-center gap-m3-space-sm">
            <span className="material-symbols-outlined text-[48px] text-m3-outline">favorite</span>
            <p className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">سجّل الدخول لعرض مفضلتك</p>
            <Link href="/auth/login" className="px-6 py-3 rounded-full bg-m3-primary-container text-m3-on-primary font-m3-label-lg text-m3-label-lg font-bold">تسجيل الدخول</Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-m3-gutter">{[0, 1].map((i) => <div key={i} className="h-64 rounded-2xl bg-m3-surface-container-low animate-pulse" />)}</div>
        ) : shown.length === 0 ? (
          <div className="text-center py-m3-space-xl flex flex-col items-center gap-m3-space-sm">
            <span className="material-symbols-outlined text-[48px] text-m3-outline">favorite</span>
            <p className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">{items.length ? "لا توجد عناصر مطابقة" : "قائمة رغباتك فارغة"}</p>
            <Link href="/products" className="px-6 py-3 rounded-full bg-m3-primary-container text-m3-on-primary font-m3-label-lg text-m3-label-lg font-bold">تصفح المنتجات</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-m3-gutter">
            {shown.map((it) => {
              const p = it.product
              const fp = finalPrice(p)
              const hasSale = p.discountPercentage > 0
              const m = matchSize(p, pref)
              const low = m && m.quantity <= 3
              const out = (p.quantity ?? 1) <= 0 || p.status === "sold"
              return (
                <article key={p._id} className="group flex flex-col bg-m3-surface-container-lowest rounded-2xl p-2.5 shadow-sm relative">
                  <Link href={`/products/${p._id}`} className="relative w-full aspect-square rounded-xl bg-m3-surface-container-low overflow-hidden flex items-center justify-center p-2">
                    <img alt={p.title} src={normalizeImageUrl(p.image || getProductImage(p) || "")} className="mix-blend-multiply w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute top-2 start-2 flex flex-col gap-1 items-start">
                      {hasSale ? (
                        <span className="px-2 py-0.5 rounded-full bg-m3-tertiary-container text-m3-on-tertiary-container font-m3-label-sm text-m3-label-sm font-bold flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[12px]">bolt</span>-{Math.round(p.discountPercentage)}% خصم
                        </span>
                      ) : m ? (
                        <span className="px-2 py-0.5 rounded-full bg-m3-primary-fixed text-m3-on-primary-fixed font-m3-label-sm text-m3-label-sm font-bold flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[12px]">verified</span>مقاس {pref}
                        </span>
                      ) : null}
                    </div>
                    {low && (
                      <div className="absolute bottom-2 start-2 px-2 py-0.5 rounded-full bg-m3-surface-container-lowest/90 backdrop-blur-md font-m3-label-sm text-m3-label-sm text-m3-tertiary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-m3-tertiary animate-pulse" />
                        <span>باقي {m!.quantity} مقاس {pref}</span>
                      </div>
                    )}
                  </Link>
                  <button aria-label="حذف من المفضلة" onClick={() => remove(p._id)} className="absolute top-4 end-4 w-8 h-8 rounded-full bg-m3-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center text-m3-tertiary shadow-sm">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                  <div className="flex flex-col mt-2.5 flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between text-m3-on-surface-variant font-m3-label-sm text-m3-label-sm">
                        <span className="uppercase tracking-wider truncate">{p.brand}</span>
                        {p.ratings?.count > 0 && (
                          <span className="flex items-center text-amber-500 font-bold gap-0.5">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {Number(p.ratings.average).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h2 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface mt-0.5 line-clamp-1">{p.title}</h2>
                    </div>
                    <div className="mt-3 pt-2 flex flex-col gap-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className={`font-m3-price-display text-m3-price-display ${hasSale ? "text-tertiary" : "text-on-surface"}`}>{fmt(fp)} <span className="font-m3-label-sm text-m3-label-sm font-bold">ج.م</span></span>
                          {hasSale && <span className="font-m3-label-sm text-m3-label-sm line-through text-m3-outline block">{fmt(p.price)} ج.م</span>}
                        </div>
                        {hasSale ? <span className="font-m3-label-sm text-m3-label-sm text-m3-primary font-bold">وفر {fmt(p.price - fp)}</span> : out ? <span className="font-m3-label-sm text-m3-label-sm text-m3-error font-bold">نفد</span> : null}
                      </div>
                      {m ? (
                        <button onClick={() => addOne(p)} className="w-full py-2.5 px-3 rounded-full bg-m3-primary-container hover:bg-m3-primary text-m3-on-primary font-m3-label-md text-m3-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                          <span className="material-symbols-outlined text-[17px]">shopping_bag</span>
                          <span>أضف للسلة</span>
                        </button>
                      ) : (
                        <Link href={`/products/${p._id}`} className="w-full py-2.5 px-3 rounded-full bg-m3-primary-container hover:bg-m3-primary text-m3-on-primary font-m3-label-md text-m3-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                          <span className="material-symbols-outlined text-[17px]">shopping_bag</span>
                          <span>اختر المقاس</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {items.length > 0 && (
        <section className="px-m3-margin py-3">
          <div className="rounded-2xl bg-m3-surface-container-lowest p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-m3-secondary-container flex items-center justify-center text-m3-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-[22px]">share</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-m3-label-lg text-m3-label-lg text-m3-on-surface font-bold">شارك ذوقك مع أصدقائك</h3>
                <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant">أرسل قائمة أمنياتك عبر واتساب</p>
              </div>
            </div>
            <button aria-label="مشاركة القائمة" onClick={share} className="shrink-0 w-10 h-10 rounded-full bg-m3-surface-container flex items-center justify-center text-m3-on-surface active:scale-95">
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
            </button>
          </div>
        </section>
      )}

      {ready.length > 0 && (
        <aside className="sticky bottom-16 w-full z-40 px-m3-margin py-2.5 bg-m3-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3 max-w-screen-md mx-auto">
            <div className="flex flex-col">
              <span className="font-m3-label-sm text-m3-label-sm text-m3-on-surface-variant font-bold">إجمالي العناصر الجاهزة ({ready.length})</span>
              <div className="flex items-baseline gap-1">
                <span className="font-m3-headline-md text-m3-headline-md text-m3-on-surface font-bold">{fmt(readyTotal)}</span>
                <span className="font-m3-label-sm text-m3-label-sm text-m3-on-surface-variant font-bold">ج.م</span>
              </div>
            </div>
            <button disabled={busy} onClick={addReady} className="flex-1 py-3 px-5 rounded-full bg-m3-primary-container hover:bg-m3-primary text-m3-on-primary font-m3-label-lg text-m3-label-lg font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-60">
              <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
              <span>{busy ? "جارٍ الإضافة..." : "أضف العناصر بمقاسي للسلة"}</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}
