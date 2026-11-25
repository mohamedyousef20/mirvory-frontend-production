"use client"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { shippingSettingsService } from "@/lib/api"

type Color = { name: string; value: string; image?: string | null; available?: boolean; sizes?: { size: string; quantity: number }[] }

export type ProductMobileProps = {
  product: {
    _id: string
    title: string
    description?: string
    brand?: string
    price: number
    discountPercentage: number
    discountedPrice: number
    colors: Color[]
    ratings?: { average: number; count: number; distribution?: Record<string, number> }
    seller?: { firstName?: string; lastName?: string; vendorProfile?: { storeName?: string } }
    category?: { name?: string }
    isTrusted?: boolean
  }
  mainImage: string
  onMainImage: (url: string) => void
  selectedColor: string
  selectedSize: string
  activeSizes: { size: string; quantity: number }[]
  quantity: number
  maxQty: number
  isFavorite: boolean
  isOutOfStock: boolean
  reviews: { _id?: string; id?: string; rating: number; comment?: string; user?: { fullName: string | null }; createdAt: string }[]
  onColor: (v: string) => void
  onSize: (v: string) => void
  onQuantity: (n: number) => void
  onAddToCart: () => void
  onBuyNow: () => void
  onToggleFavorite: () => void
  onWriteReview: () => void
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const star = { fontVariationSettings: "'FILL' 1" } as const

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (days <= 0) return "اليوم"
  if (days === 1) return "أمس"
  if (days < 30) return `قبل ${days} يوم`
  if (days < 365) return `قبل ${Math.floor(days / 30)} شهر`
  return `قبل ${Math.floor(days / 365)} سنة`
}

export function ProductMobileInner(p: ProductMobileProps) {
  const { product } = p
  const [filter, setFilter] = useState<"all" | "latest" | "five">("all")
  // Suggestion A: free-shipping hint. Suggestion B: sticky buy bar. Both are self-contained; delete the marked blocks to drop them.
  const [ship, setShip] = useState<{ enabled: boolean; min: number } | null>(null)
  const [showSticky, setShowSticky] = useState(false)
  const buyRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    shippingSettingsService.getShippingSettings().then((r: any) => {
      const d = r?.data?.data || r?.data || r
      if (d?.freeShippingEnabled && Number(d.freeShippingMinimum) > 0) setShip({ enabled: true, min: Number(d.freeShippingMinimum) })
    }).catch(() => {})
  }, [])
  useEffect(() => {
    const el = buyRef.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const hasDiscount = product.discountPercentage > 0
  const unit = hasDiscount ? product.discountedPrice : product.price
  const total = unit * p.quantity
  const colors = (product.colors || []).filter((c) => c.available !== false)
  const gallery = colors.filter((c) => c.image)
  const selectedColorObj = colors.find((c) => c.value === p.selectedColor)
  const sizes = useMemo(() => [...p.activeSizes].sort((a, b) => parseFloat(a.size) - parseFloat(b.size)), [p.activeSizes])
  const avg = product.ratings?.average || 0
  const count = product.ratings?.count || 0
  const dist = product.ratings?.distribution || {}
  const storeName = product.seller?.vendorProfile?.storeName || [product.seller?.firstName, product.seller?.lastName].filter(Boolean).join(" ")
  const lines = (product.description || "").split(/\n+/).map((l) => l.trim()).filter(Boolean)

  const shownReviews = useMemo(() => {
    let r = [...p.reviews]
    if (filter === "five") r = r.filter((x) => x.rating === 5)
    r.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    return r
  }, [p.reviews, filter])
  const fives = p.reviews.filter((x) => x.rating === 5).length

  return (
    <div dir="rtl" className="bg-[#f7f9fb] font-[Cairo,sans-serif] px-[1rem] pt-16 pb-24">
      <div className="flex flex-col w-full pb-[1rem]">
        <section className="relative w-full rounded-3xl bg-[#f2f4f6] p-[0.5rem] shadow-sm overflow-hidden">
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#2d3133]/90 backdrop-blur-md px-3 py-1.5 rounded-[9999px] shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-[#b4c5ff]" style={star}>verified</span>
            <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#eff1f3]">أصلي 100% تم فحصه</span>
          </div>
          <button
            aria-label="أضف إلى قائمة الرغبات"
            onClick={p.onToggleFavorite}
            className={`absolute top-4 left-4 z-20 w-11 h-11 rounded-[9999px] bg-[#ffffff]/80 backdrop-blur-md flex items-center justify-center shadow-sm transition-transform active:scale-90 ${p.isFavorite ? "text-[#ab0b1c]" : "text-[#191c1e]"}`}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: `'FILL' ${p.isFavorite ? 1 : 0}` }}>favorite</span>
          </button>
          <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-b from-[#ffffff] to-[#eceef0] overflow-hidden flex items-center justify-center">
            {p.mainImage && <img alt={product.title} src={normalizeImageUrl(p.mainImage, "product")} fetchPriority="high" decoding="async" className="w-full h-full object-contain p-[1rem] transition-all duration-300 drop-shadow-md" />}
          </div>
          {gallery.length > 1 && (
            <div className="flex items-center justify-center gap-[0.5rem] mt-3 px-2 overflow-x-auto">
              {gallery.map((c) => {
                const on = c.value === p.selectedColor
                return (
                  <button
                    key={c.value}
                    onClick={() => p.onColor(c.value)}
                    className={`relative w-16 h-16 rounded-[0.75rem] bg-[#ffffff] p-1 shadow-sm transition-all shrink-0 ${on ? "scale-105" : "opacity-60 hover:opacity-100"}`}
                  >
                    <img alt={c.name} src={normalizeImageUrl(c.image!, "thumbnail")} loading="lazy" decoding="async" className="w-full h-full object-contain rounded-[0.5rem]" />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="flex flex-col mt-[1rem]">
          <div className="flex items-center justify-between">
            {product.brand ? (
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#004ac6] font-bold tracking-wider uppercase bg-[#dae2fd]/60 px-2.5 py-0.5 rounded-[9999px]">{product.brand}</span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1 text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
              <span className="material-symbols-outlined text-[15px] text-[#565e74]">qr_code_2</span>
              <span>كود: {product._id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
          <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[22px] leading-[30px] tracking-[-0.02em] font-[700] font-bold text-[#191c1e] mt-2 leading-tight">{product.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-[#e6e8ea] px-2 py-0.5 rounded-[0.5rem]">
              <span className="material-symbols-outlined text-[16px] text-amber-500" style={star}>star</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] font-bold text-[14px]">{avg ? avg.toFixed(1) : "—"}</span>
            </div>
            <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655] font-medium">({count} تقييم)</span>
            {product.isTrusted && (
              <>
                <span className="w-1 h-1 rounded-[9999px] bg-[#c3c6d7]" />
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]" style={star}>verified_user</span>
                  مضمون
                </span>
              </>
            )}
          </div>
          <div className="flex items-baseline gap-[0.5rem] mt-4 bg-[#ffffff] p-[1rem] rounded-2xl shadow-sm">
            <div className="flex items-baseline gap-1">
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[26px] leading-[34px] tracking-[-0.02em] font-[700] font-bold text-[#191c1e] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif]">{fmt(unit)}</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#191c1e] font-bold">ج.م</span>
            </div>
            {hasDiscount && <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] line-through text-[#737686] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif]">{fmt(product.price)} ج.م</span>}
            {hasDiscount && (
              <span className="mr-auto [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#ffffff] bg-[#cf2c30] px-2.5 py-1 rounded-[9999px] font-bold">-{Math.round(product.discountPercentage)}% خصم حصري</span>
            )}
          </div>
          {unit >= 400 && (
            <div className="mt-3 flex items-center justify-between p-[0.5rem] rounded-[0.75rem] bg-[#dae2fd]/40 text-[#131b2e]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[0.5rem] bg-[#ffffff] flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[#004ac6] text-[20px]">payments</span>
                </div>
                <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] font-medium text-[#191c1e] leading-snug">
                  قسّم على <span className="font-bold text-[#004ac6]">4 دفعات</span> بقيمة <span className="font-bold [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif]">{fmt(unit / 4)} ج.م</span> بدون فوائد مع Valu أو Sympl
                </p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-[#434655]">arrow_back_ios</span>
            </div>
          )}
        </section>

        {colors.length > 0 && (
          <section className="mt-[1.5rem]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold text-[#191c1e]">اللون المختار:</h3>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] text-[#004ac6] font-bold">{selectedColorObj?.name}</span>
              </div>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[11px] font-bold text-[#004ac6] bg-[#dae2fd]/60 px-2 py-0.5 rounded-[9999px]">{colors.length} ألوان متوفرة</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {colors.map((c) => {
                const on = c.value === p.selectedColor
                return (
                  <button
                    key={c.value}
                    onClick={() => p.onColor(c.value)}
                    className={`rounded-2xl p-2 flex items-center justify-between transition-all ${on ? "ring-2 ring-[#004ac6] bg-[#ffffff] shadow-sm" : "bg-[#eceef0] hover:bg-[#e6e8ea]"}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-[9999px] shadow-inner inline-block border border-white shrink-0" style={{ background: c.value.startsWith("#") ? c.value : undefined }} />
                      <span className={`[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] truncate ${on ? "font-bold text-[#191c1e]" : "font-medium text-[#434655]"}`}>{c.name}</span>
                    </div>
                    <span className={`material-symbols-outlined text-[16px] ${on ? "text-[#004ac6]" : "opacity-0"}`}>check_circle</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-[1.5rem]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold text-[#191c1e]">المقاس (EU):</h3>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold text-[#004ac6] text-[15px]">{p.selectedSize || "—"}</span>
            </div>
            <Link href="/size-guide" className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] flex items-center gap-1 hover:underline">
              <span>دليل المقاسات بالسنتيمتر 📏</span>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {sizes.map((s) => {
              const out = s.quantity <= 0
              const on = s.size === p.selectedSize
              if (out)
                return (
                  <button key={s.size} disabled className="relative py-2 px-1 rounded-[0.75rem] bg-[#e6e8ea]/60 text-[#c3c6d7] text-center [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] cursor-not-allowed overflow-hidden opacity-50 flex flex-col items-center justify-center">
                    <span className="font-bold text-[14px] line-through">{s.size}</span>
                    <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[9px] text-[#737686] font-bold">نفذ</span>
                  </button>
                )
              return (
                <button
                  key={s.size}
                  onClick={() => p.onSize(s.size)}
                  className={`relative py-2 px-1 rounded-[0.75rem] text-center [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] transition-all flex flex-col items-center justify-center ${on ? "bg-[#004ac6] text-[#ffffff] shadow-md font-bold" : "bg-[#ffffff] shadow-sm text-[#191c1e] hover:bg-[#eceef0]"}`}
                >
                  <span className="font-bold text-[14px]">{s.size}</span>
                  <span className={`[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[9px] font-medium ${on ? "text-[#eeefff]" : "text-[#434655]"}`}>{on ? "المختار" : "متوفر"}</span>
                  {s.quantity <= 3 && !on && (
                    <span className="absolute -top-1.5 -right-1 bg-[#ffdad6] text-[#93000a] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[8px] px-1.5 rounded-[9999px] font-bold">متبقي {s.quantity}</span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="p-3 bg-[#ffffff] rounded-2xl shadow-sm border border-[#c3c6d7]/30 flex items-center justify-between">
            <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold text-[#191c1e]">الكمية المطلوبة</span>
            <div className="flex items-center gap-3 bg-[#f2f4f6] px-2 py-1 rounded-[0.75rem]">
              <button aria-label="إنقاص الكمية" disabled={p.quantity <= 1} onClick={() => p.onQuantity(p.quantity - 1)} className="w-8 h-8 rounded-[0.5rem] bg-[#ffffff] flex items-center justify-center text-[#191c1e] shadow-sm active:scale-90 transition-all disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] font-bold text-[#191c1e] text-[16px] min-w-[20px] text-center">{p.quantity}</span>
              <button aria-label="زيادة الكمية" disabled={p.maxQty > 0 && p.quantity >= p.maxQty} onClick={() => p.onQuantity(p.quantity + 1)} className="w-8 h-8 rounded-[0.5rem] bg-[#ffffff] flex items-center justify-center text-[#191c1e] shadow-sm active:scale-90 transition-all disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </section>

        {storeName && (
          <div className="flex items-center gap-2 mt-3 px-1 text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600]">
            <span className="material-symbols-outlined text-[18px] text-[#004ac6]">storefront</span>
            <span>البائع: <span className="font-bold text-[#191c1e]">{storeName}</span></span>
          </div>
        )}

        <div className="flex items-center justify-between px-[1rem] py-2.5 bg-[#dae2fd]/40 rounded-[0.75rem] my-3 text-[#191c1e]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">local_shipping</span>
            <div className="flex flex-col">
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold text-[#191c1e]">{p.isOutOfStock ? "غير متوفر حالياً" : "متوفر جاهز للشحن الفوري"}</span>
              <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[11px] text-[#434655]">التوصيل خلال 48 - 120 ساعة لباب منزلك</span>
            </div>
          </div>
          {!p.isOutOfStock && <span className="inline-flex items-center px-2 py-0.5 rounded-[9999px] text-[10px] font-bold bg-[#004ac6] text-[#ffffff]">متوفر بالمستودع</span>}
        </div>

        <section ref={buyRef} className="mt-1 mb-2 bg-[#ffffff] rounded-2xl p-[1rem] shadow-sm border border-[#c3c6d7]/30">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-[#434655] font-medium px-1 bg-[#f2f4f6] p-2 rounded-[0.75rem]">
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#004ac6]" style={star}>check_circle</span><span>دفع عند الاستلام متاح</span></div>
              <span className="w-1 h-1 rounded-[9999px] bg-[#c3c6d7]" />
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#004ac6]" style={star}>bolt</span><span>شحن سريع</span></div>
              <span className="w-1 h-1 rounded-[9999px] bg-[#c3c6d7]" />
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-[#004ac6]" style={star}>styler</span><span>معاينة قبل الدفع</span></div>
            </div>
            {/* A: free-shipping hint */}
            {ship && (
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#004ac6] bg-[#dae2fd]/40 rounded-[0.75rem] px-3 py-2">
                <span className="material-symbols-outlined text-[16px]" style={star}>local_shipping</span>
                {total >= ship.min ? "طلبك مؤهل للشحن المجاني" : `باقي ${fmt(ship.min - total)} ج.م وتاخد شحن مجاني`}
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col shrink-0 min-w-[90px]">
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] text-[#434655] leading-tight">المبلغ الإجمالي</span>
                <div className="flex items-baseline gap-1">
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] font-bold text-[#004ac6] text-[20px] tracking-tight">{fmt(total)}</span>
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[11px] font-bold text-[#191c1e]">ج.م</span>
                </div>
                {hasDiscount && <span className="text-[10px] text-[#737686] line-through [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif]">{fmt(product.price * p.quantity)} ج.م</span>}
              </div>
              <button disabled={p.isOutOfStock} onClick={p.onBuyNow} className="flex-1 h-12 bg-[#004ac6] text-[#ffffff] rounded-[0.75rem] flex items-center justify-center gap-2 [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] font-bold shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]" style={star}>bolt</span>
                <span>اشتري الآن</span>
              </button>
              <button aria-label="أضف للسلة" disabled={p.isOutOfStock} onClick={p.onAddToCart} className="w-12 h-12 rounded-[0.75rem] bg-[#eceef0] border border-[#004ac6]/20 text-[#004ac6] flex items-center justify-center shrink-0 hover:bg-[#dae2fd]/40 active:scale-90 transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-[22px]">add_shopping_cart</span>
              </button>
              <button aria-label="حفظ في المفضلة" onClick={p.onToggleFavorite} className={`w-10 h-12 rounded-[0.75rem] bg-[#f2f4f6] border border-[#c3c6d7]/30 flex items-center justify-center shrink-0 transition-transform active:scale-90 ${p.isFavorite ? "text-[#ab0b1c]" : "text-[#191c1e]"}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${p.isFavorite ? 1 : 0}` }}>favorite</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mt-[1.5rem] flex flex-col gap-2.5">
          <details className="group bg-[#ffffff] rounded-2xl shadow-sm overflow-hidden" open>
            <summary className="flex items-center justify-between p-[1rem] cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">tune</span>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] font-bold text-[15px]">مواصفات الحذاء والخامات</span>
              </div>
              <span className="material-symbols-outlined text-[#434655] transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-[1rem] pb-[1rem] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#434655] space-y-2">
              {lines.map((l, i) => (
                <p key={i} className="leading-relaxed">{l}</p>
              ))}
            </div>
          </details>
          <details className="group bg-[#ffffff] rounded-2xl shadow-sm overflow-hidden">
            <summary className="flex items-center justify-between p-[1rem] cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">assignment_return</span>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] font-bold text-[15px]">سياسة الاستبدال والمعاينة قبل الدفع (14 يوم)</span>
              </div>
              <span className="material-symbols-outlined text-[#434655] transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-[1rem] pb-[1rem] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#434655] space-y-2">
              <p className="leading-relaxed">تسوق بأمان تام مع ميرفوري: يتيح لك مندوبنا فحص الحذاء ومطابقة المقاس واللون أمامك قبل سداد أي مبلغ عند الاستلام.</p>
              <div className="p-3 bg-[#eceef0] rounded-[0.75rem] flex items-center gap-2.5 text-[13px]">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">lock_clock</span>
                <span>حق الاستبدال أو استرجاع المبلغ بالكامل خلال 14 يوماً مع الحفاظ على التاغ الأصلي.</span>
              </div>
            </div>
          </details>
        </section>

        <section className="mt-[1.5rem] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold text-[#191c1e]">تقييمات وآراء العملاء</h3>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] font-bold bg-[#dae2fd]/60 px-2 py-0.5 rounded-[9999px]">{count} تقييم</span>
              </div>
            </div>
            <button onClick={p.onWriteReview} className="px-3 py-1.5 rounded-[0.75rem] border border-[#004ac6]/30 text-[#004ac6] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-bold flex items-center gap-1 hover:bg-[#dae2fd]/40 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[16px]">rate_review</span>
              <span>أضف تقييمك</span>
            </button>
          </div>
          {count > 0 && (
            <div className="bg-[#ffffff] rounded-2xl p-[1rem] shadow-sm border border-[#c3c6d7]/30 flex items-center gap-4">
              <div className="flex flex-col items-center justify-center shrink-0 min-w-[110px] text-center">
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#004ac6] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[38px] leading-none font-bold">{avg.toFixed(1)}</span>
                <div className="flex items-center gap-0.5 my-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `'FILL' ${i <= Math.round(avg) ? 1 : 0}` }}>star</span>
                  ))}
                </div>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[11px] text-[#434655] font-medium">من إجمالي 5 نجوم</span>
              </div>
              <div className="flex-1 w-full flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const pct = count ? Math.round(((dist[n] || 0) / count) * 100) : 0
                  return (
                    <div key={n} className="flex items-center gap-2 text-[11px]">
                      <span className="w-9 text-[#434655] font-medium">{n} نجوم</span>
                      <div className="flex-1 h-2 bg-[#eceef0] rounded-[9999px] overflow-hidden"><div className="h-full bg-amber-500 rounded-[9999px]" style={{ width: `${pct}%` }} /></div>
                      <span className="w-8 text-[#434655] font-bold text-left">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {p.reviews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-1 -mx-[1rem] px-[1rem] select-none mt-3 no-scrollbar">
              {([["all", `الكل (${p.reviews.length})`], ["latest", "أحدث التقييمات"], ["five", `5 نجوم (${fives})`]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} className={`shrink-0 px-3.5 py-1.5 rounded-[9999px] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] transition-all ${filter === k ? "bg-[#004ac6] text-[#ffffff] font-bold shadow-sm" : "bg-[#ffffff] text-[#191c1e] border border-[#c3c6d7]/30 font-medium hover:bg-[#eceef0]"}`}>{l}</button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 mt-3">
            {shownReviews.map((r) => {
              const name = r.user?.fullName || "مشتري"
              return (
                <div key={r._id || r.id} className="bg-[#ffffff] rounded-2xl p-[1rem] shadow-sm border border-[#c3c6d7]/30 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-[9999px] bg-[#dbe1ff] text-[#00174b] flex items-center justify-center font-bold text-[14px]">{name.charAt(0)}</div>
                      <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold text-[#191c1e]">{name}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: `'FILL' ${i <= r.rating ? 1 : 0}` }}>star</span>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#737686] font-medium">{timeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                  {r.comment && <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#191c1e] leading-relaxed">{r.comment}</p>}
                </div>
              )
            })}
            {p.reviews.length === 0 && <p className="text-center [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#434655] py-[1rem]">لا توجد تقييمات بعد — كن أول من يقيّم هذا المنتج</p>}
          </div>
        </section>
      </div>
      {/* B: sticky buy bar, shown only after the main buy buttons scroll off screen */}
      {showSticky && !p.isOutOfStock && (
        <div dir="rtl" className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 px-[1rem] pb-2">
          <div className="bg-[#ffffff] rounded-2xl shadow-lg border border-[#c3c6d7]/30 p-2 flex items-center gap-2">
            <div className="flex flex-col px-2 shrink-0">
              <span className="text-[10px] text-[#434655]">الإجمالي</span>
              <span className="font-bold text-[#004ac6] text-[16px]">{fmt(total)} ج.م</span>
            </div>
            <button onClick={p.onBuyNow} className="flex-1 h-11 bg-[#004ac6] text-white rounded-[0.75rem] font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[18px]" style={star}>bolt</span>اشتري الآن
            </button>
            <button aria-label="أضف للسلة" onClick={p.onAddToCart} className="w-11 h-11 rounded-[0.75rem] bg-[#eceef0] text-[#004ac6] flex items-center justify-center active:scale-90">
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthProvider"
import { StitchNav } from "./StitchChrome"

export function ProductMobile(p: ProductMobileProps) {
  const router = useRouter()
  const { user } = useAuth()
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.product.title, url: window.location.href })
      else await navigator.clipboard?.writeText(window.location.href)
    } catch {}
  }
  return (
    <div className="md:hidden">
      <header dir="rtl" className="fixed top-0 w-full z-50 bg-[#ffffff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.03)] pt-safe">
        <div className="h-16 px-[1rem] flex items-center justify-between">
          <div className="flex items-center gap-[0.5rem]">
            <button aria-label="رجوع" onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center rounded-[9999px] text-[#191c1e] hover:bg-[#eceef0] transition-colors">
              <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
            </button>
            <h1 className="font-[Cairo,sans-serif] text-[18px] leading-[26px] font-bold text-[#191c1e] tracking-tight truncate max-w-[200px]">تفاصيل المنتج</h1>
          </div>
          <div className="flex items-center gap-[0.25rem]">
            <button aria-label="مشاركة" onClick={share} className="w-11 h-11 flex items-center justify-center rounded-[9999px] text-[#191c1e] hover:bg-[#eceef0] transition-colors">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
            <Link aria-label="حسابي" href={user ? "/profile" : "/auth/login"} className="w-8 h-8 rounded-[9999px] bg-[#004ac6] flex items-center justify-center shrink-0 mr-1">
              <span className="material-symbols-outlined text-[#ffffff] text-[18px]">person</span>
            </Link>
          </div>
        </div>
      </header>
      <ProductMobileInner {...p} />
      <StitchNav />
    </div>
  )
}
