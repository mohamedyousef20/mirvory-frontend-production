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
    <div dir="rtl" className="md:hidden flex flex-col w-full pb-24 bg-[#f7f9fb] min-h-screen [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif]">
      <section className="px-[1rem] pt-2 pb-[0.5rem] flex flex-col gap-[0.5rem]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[26px] leading-[34px] tracking-[-0.02em] font-[700] text-[#191c1e] tracking-tight">قائمة الرغبات</h1>
            <span className="px-2.5 py-0.5 rounded-[9999px] bg-[#dae2fd] text-[#5c647a] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-bold">{items.length} قطع</span>
          </div>
          <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655] mt-0.5">مجموعتك المختارة بانتظار المقاس والسعر المثالي</p>
        </div>

        {topDrop && (
          <div className="relative overflow-hidden rounded-2xl bg-[#ffffff] p-3 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[9999px] bg-[#ffdad7] flex items-center justify-center shrink-0 text-[#410004]">
                <span className="material-symbols-outlined text-[20px]">trending_down</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] uppercase tracking-wider text-[#ab0b1c] font-bold">انخفاض في السعر</span>
                <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#191c1e] truncate">وفّرت <strong>{fmt(saved)} ج.م</strong> على {topDrop.product.title} منذ حفظه!</p>
              </div>
            </div>
            <Link href={`/products/${topDrop.product._id}`} className="shrink-0 px-3 py-1.5 rounded-[9999px] bg-[#eceef0] text-[#191c1e] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">عرض</Link>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-[9999px] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] shrink-0 shadow-sm ${filter === "all" ? "bg-[#191c1e] text-[#f7f9fb]" : "bg-[#ffffff] text-[#434655]"}`}>الكل ({items.length})</button>
          {pref && (
            <button onClick={() => setFilter("size")} className={`px-3.5 py-2 rounded-[9999px] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] shrink-0 flex items-center gap-1.5 shadow-sm ${filter === "size" ? "bg-[#191c1e] text-[#f7f9fb]" : "bg-[#ffffff] text-[#434655]"}`}>
              <span className="material-symbols-outlined text-[16px] text-[#004ac6]">check_circle</span>
              <span>بمقاسي {pref} EU</span>
            </button>
          )}
          <button onClick={() => setFilter("sale")} className={`px-3.5 py-2 rounded-[9999px] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] shrink-0 flex items-center gap-1.5 shadow-sm ${filter === "sale" ? "bg-[#191c1e] text-[#f7f9fb]" : "bg-[#ffffff] text-[#434655]"}`}>
            <span className="material-symbols-outlined text-[16px] text-[#ab0b1c]">local_offer</span>
            <span>تخفيضات نشطة</span>
          </button>
        </div>
      </section>

      <section className="px-[1rem] py-2">
        {!authed && !loading ? (
          <div className="text-center py-[2.25rem] flex flex-col items-center gap-[0.5rem]">
            <span className="material-symbols-outlined text-[48px] text-[#737686]">favorite</span>
            <p className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">سجّل الدخول لعرض مفضلتك</p>
            <Link href="/auth/login" className="px-6 py-3 rounded-[9999px] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold">تسجيل الدخول</Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-[0.75rem]">{[0, 1].map((i) => <div key={i} className="h-64 rounded-2xl bg-[#f2f4f6] animate-pulse" />)}</div>
        ) : shown.length === 0 ? (
          <div className="text-center py-[2.25rem] flex flex-col items-center gap-[0.5rem]">
            <span className="material-symbols-outlined text-[48px] text-[#737686]">favorite</span>
            <p className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">{items.length ? "لا توجد عناصر مطابقة" : "قائمة رغباتك فارغة"}</p>
            <Link href="/products" className="px-6 py-3 rounded-[9999px] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold">تصفح المنتجات</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[0.75rem]">
            {shown.map((it) => {
              const p = it.product
              const fp = finalPrice(p)
              const hasSale = p.discountPercentage > 0
              const m = matchSize(p, pref)
              const low = m && m.quantity <= 3
              const out = (p.quantity ?? 1) <= 0 || p.status === "sold"
              return (
                <article key={p._id} className="group flex flex-col bg-[#ffffff] rounded-2xl p-2.5 shadow-sm relative">
                  <Link href={`/products/${p._id}`} className="relative w-full aspect-square rounded-[0.75rem] bg-[#f2f4f6] overflow-hidden flex items-center justify-center p-2">
                    <img alt={p.title} src={normalizeImageUrl(p.image || getProductImage(p) || "")} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute top-2 start-2 flex flex-col gap-1 items-start">
                      {hasSale ? (
                        <span className="px-2 py-0.5 rounded-[9999px] bg-[#cf2c30] text-[#ffecea] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-bold flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[12px]">bolt</span>-{Math.round(p.discountPercentage)}% خصم
                        </span>
                      ) : m ? (
                        <span className="px-2 py-0.5 rounded-[9999px] bg-[#dbe1ff] text-[#00174b] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-bold flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[12px]">verified</span>مقاس {pref}
                        </span>
                      ) : null}
                    </div>
                    {low && (
                      <div className="absolute bottom-2 start-2 px-2 py-0.5 rounded-[9999px] bg-[#ffffff]/90 backdrop-blur-md [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#ab0b1c] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-[9999px] bg-[#ab0b1c] animate-pulse" />
                        <span>باقي {m!.quantity} مقاس {pref}</span>
                      </div>
                    )}
                  </Link>
                  <button aria-label="حذف من المفضلة" onClick={() => remove(p._id)} className="absolute top-4 end-4 w-8 h-8 rounded-[9999px] bg-[#ffffff]/90 backdrop-blur-md flex items-center justify-center text-[#ab0b1c] shadow-sm">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                  <div className="flex flex-col mt-2.5 flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
                        <span className="uppercase tracking-wider truncate">{p.brand}</span>
                        {p.ratings?.count > 0 && (
                          <span className="flex items-center text-amber-500 font-bold gap-0.5">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {Number(p.ratings.average).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] mt-0.5 line-clamp-1">{p.title}</h2>
                    </div>
                    <div className="mt-3 pt-2 flex flex-col gap-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className={`[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[20px] leading-[26px] tracking-[-0.02em] font-[700] ${hasSale ? "text-[#ab0b1c]" : "text-[#191c1e]"}`}>{fmt(fp)} <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-bold">ج.م</span></span>
                          {hasSale && <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] line-through text-[#737686] block">{fmt(p.price)} ج.م</span>}
                        </div>
                        {hasSale ? <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] font-bold">وفر {fmt(p.price - fp)}</span> : out ? <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#ba1a1a] font-bold">نفد</span> : null}
                      </div>
                      {m ? (
                        <button onClick={() => addOne(p)} className="w-full py-2.5 px-3 rounded-[9999px] bg-[#2563eb] hover:bg-[#004ac6] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                          <span className="material-symbols-outlined text-[17px]">shopping_bag</span>
                          <span>أضف للسلة</span>
                        </button>
                      ) : (
                        <Link href={`/products/${p._id}`} className="w-full py-2.5 px-3 rounded-[9999px] bg-[#2563eb] hover:bg-[#004ac6] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
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
        <section className="px-[1rem] py-3">
          <div className="rounded-2xl bg-[#ffffff] p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[9999px] bg-[#dae2fd] flex items-center justify-center text-[#5c647a] shrink-0">
                <span className="material-symbols-outlined text-[22px]">share</span>
              </div>
              <div className="flex flex-col">
                <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] text-[#191c1e] font-bold">شارك ذوقك مع أصدقائك</h3>
                <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655]">أرسل قائمة أمنياتك عبر واتساب</p>
              </div>
            </div>
            <button aria-label="مشاركة القائمة" onClick={share} className="shrink-0 w-10 h-10 rounded-[9999px] bg-[#eceef0] flex items-center justify-center text-[#191c1e] active:scale-95">
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
            </button>
          </div>
        </section>
      )}

      {ready.length > 0 && (
        <aside className="sticky bottom-16 w-full z-40 px-[1rem] py-2.5 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3 max-w-screen-md mx-auto">
            <div className="flex flex-col">
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] font-bold">إجمالي العناصر الجاهزة ({ready.length})</span>
              <div className="flex items-baseline gap-1">
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] font-bold">{fmt(readyTotal)}</span>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] font-bold">ج.م</span>
              </div>
            </div>
            <button disabled={busy} onClick={addReady} className="flex-1 py-3 px-5 rounded-[9999px] bg-[#2563eb] hover:bg-[#004ac6] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-60">
              <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
              <span>{busy ? "جارٍ الإضافة..." : "أضف العناصر بمقاسي للسلة"}</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}
