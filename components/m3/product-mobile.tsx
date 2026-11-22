"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

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

export function ProductMobile(p: ProductMobileProps) {
  const { product } = p
  const [filter, setFilter] = useState<"all" | "latest" | "five">("all")
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
    <div dir="rtl" className="md:hidden bg-m3-surface font-m3-body-md px-m3-margin pt-20 pb-4">
      <div className="flex flex-col w-full pb-m3-space-md">
        <section className="relative w-full rounded-3xl bg-m3-surface-container-low p-m3-space-sm shadow-sm overflow-hidden">
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-m3-inverse-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-m3-inverse-primary" style={star}>verified</span>
            <span className="font-m3-label-sm text-m3-label-sm text-m3-inverse-on-surface">أصلي 100% تم فحصه</span>
          </div>
          <button
            aria-label="أضف إلى قائمة الرغبات"
            onClick={p.onToggleFavorite}
            className={`absolute top-4 left-4 z-20 w-11 h-11 rounded-full bg-m3-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center shadow-sm transition-transform active:scale-90 ${p.isFavorite ? "text-tertiary" : "text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: `'FILL' ${p.isFavorite ? 1 : 0}` }}>favorite</span>
          </button>
          <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-b from-m3-surface-container-lowest to-m3-surface-container overflow-hidden flex items-center justify-center">
            {p.mainImage && <img alt={product.title} src={p.mainImage} className="w-full h-full object-contain p-m3-space-md transition-all duration-300 drop-shadow-md" />}
          </div>
          {gallery.length > 1 && (
            <div className="flex items-center justify-center gap-m3-space-sm mt-3 px-2 overflow-x-auto">
              {gallery.map((c) => {
                const on = c.value === p.selectedColor
                return (
                  <button
                    key={c.value}
                    onClick={() => p.onColor(c.value)}
                    className={`relative w-16 h-16 rounded-xl bg-m3-surface-container-lowest p-1 shadow-sm transition-all shrink-0 ${on ? "scale-105" : "opacity-60 hover:opacity-100"}`}
                  >
                    <img alt={c.name} src={c.image!} className="w-full h-full object-contain rounded-lg" />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="flex flex-col mt-m3-space-md">
          <div className="flex items-center justify-between">
            {product.brand ? (
              <span className="font-m3-label-md text-m3-label-md text-m3-primary font-bold tracking-wider uppercase bg-m3-secondary-container/60 px-2.5 py-0.5 rounded-full">{product.brand}</span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1 text-m3-on-surface-variant font-m3-label-sm text-m3-label-sm">
              <span className="material-symbols-outlined text-[15px] text-m3-secondary">qr_code_2</span>
              <span>كود: {product._id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
          <h2 className="font-m3-headline-lg text-m3-headline-lg font-bold text-m3-on-surface mt-2 leading-tight">{product.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-m3-surface-container-high px-2 py-0.5 rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-amber-500" style={star}>star</span>
              <span className="font-m3-headline-md text-m3-headline-md text-m3-on-surface font-bold text-[14px]">{avg ? avg.toFixed(1) : "—"}</span>
            </div>
            <span className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant font-medium">({count} تقييم)</span>
            {product.isTrusted && (
              <>
                <span className="w-1 h-1 rounded-full bg-m3-outline-variant" />
                <span className="font-m3-label-sm text-m3-label-sm text-m3-primary flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]" style={star}>verified_user</span>
                  مضمون
                </span>
              </>
            )}
          </div>
          <div className="flex items-baseline gap-m3-space-sm mt-4 bg-m3-surface-container-lowest p-m3-space-md rounded-2xl shadow-sm">
            <div className="flex items-baseline gap-1">
              <span className="font-m3-headline-xl-mobile text-m3-headline-xl-mobile font-bold text-m3-on-surface font-m3-price-display">{fmt(unit)}</span>
              <span className="font-m3-label-md text-m3-label-md text-m3-on-surface font-bold">ج.م</span>
            </div>
            {hasDiscount && <span className="font-m3-body-md text-m3-body-md line-through text-m3-outline font-m3-price-display">{fmt(product.price)} ج.م</span>}
            {hasDiscount && (
              <span className="mr-auto font-m3-label-md text-m3-label-md text-m3-on-error bg-m3-tertiary-container px-2.5 py-1 rounded-full font-bold">-{Math.round(product.discountPercentage)}% خصم حصري</span>
            )}
          </div>
          {unit >= 400 && (
            <div className="mt-3 flex items-center justify-between p-m3-space-sm rounded-xl bg-m3-secondary-container/40 text-m3-on-secondary-fixed">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-m3-surface-container-lowest flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-m3-primary text-[20px]">payments</span>
                </div>
                <p className="font-m3-body-sm text-m3-body-sm font-medium text-m3-on-surface leading-snug">
                  قسّم على <span className="font-bold text-m3-primary">4 دفعات</span> بقيمة <span className="font-bold font-m3-price-display">{fmt(unit / 4)} ج.م</span> بدون فوائد مع Valu أو Sympl
                </p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-m3-on-surface-variant">arrow_back_ios</span>
            </div>
          )}
        </section>

        {colors.length > 0 && (
          <section className="mt-m3-space-lg">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="font-m3-label-lg text-m3-label-lg font-bold text-m3-on-surface">اللون المختار:</h3>
                <span className="font-m3-headline-md text-[14px] text-m3-primary font-bold">{selectedColorObj?.name}</span>
              </div>
              <span className="font-m3-label-sm text-[11px] font-bold text-m3-primary bg-m3-secondary-container/60 px-2 py-0.5 rounded-full">{colors.length} ألوان متوفرة</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {colors.map((c) => {
                const on = c.value === p.selectedColor
                return (
                  <button
                    key={c.value}
                    onClick={() => p.onColor(c.value)}
                    className={`rounded-2xl p-2 flex items-center justify-between transition-all ${on ? "ring-2 ring-primary bg-surface-container-lowest shadow-sm" : "bg-surface-container hover:bg-surface-container-high"}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full shadow-inner inline-block border border-white shrink-0" style={{ background: c.value.startsWith("#") ? c.value : undefined }} />
                      <span className={`font-m3-label-sm text-m3-label-sm truncate ${on ? "font-bold text-on-surface" : "font-medium text-on-surface-variant"}`}>{c.name}</span>
                    </div>
                    <span className={`material-symbols-outlined text-[16px] ${on ? "text-primary" : "opacity-0"}`}>check_circle</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-m3-space-lg">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-m3-label-lg text-m3-label-lg font-bold text-m3-on-surface">المقاس (EU):</h3>
              <span className="font-m3-headline-md text-m3-headline-md font-bold text-m3-primary text-[15px]">{p.selectedSize || "—"}</span>
            </div>
            <Link href="/size-guide" className="font-m3-label-sm text-m3-label-sm text-m3-primary flex items-center gap-1 hover:underline">
              <span>دليل المقاسات بالسنتيمتر 📏</span>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {sizes.map((s) => {
              const out = s.quantity <= 0
              const on = s.size === p.selectedSize
              if (out)
                return (
                  <button key={s.size} disabled className="relative py-2 px-1 rounded-xl bg-m3-surface-container-high/60 text-m3-outline-variant text-center font-m3-headline-md cursor-not-allowed overflow-hidden opacity-50 flex flex-col items-center justify-center">
                    <span className="font-bold text-[14px] line-through">{s.size}</span>
                    <span className="font-m3-label-sm text-[9px] text-m3-outline font-bold">نفذ</span>
                  </button>
                )
              return (
                <button
                  key={s.size}
                  onClick={() => p.onSize(s.size)}
                  className={`relative py-2 px-1 rounded-xl text-center font-m3-headline-md transition-all flex flex-col items-center justify-center ${on ? "bg-primary text-on-primary shadow-md font-bold" : "bg-surface-container-lowest shadow-sm text-on-surface hover:bg-surface-container"}`}
                >
                  <span className="font-bold text-[14px]">{s.size}</span>
                  <span className={`font-m3-label-sm text-[9px] font-medium ${on ? "text-on-primary-container" : "text-on-surface-variant"}`}>{on ? "المختار" : "متوفر"}</span>
                  {s.quantity <= 3 && !on && (
                    <span className="absolute -top-1.5 -right-1 bg-m3-error-container text-m3-on-error-container font-m3-label-sm text-[8px] px-1.5 rounded-full font-bold">متبقي {s.quantity}</span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="p-3 bg-m3-surface-container-lowest rounded-2xl shadow-sm border border-m3-outline-variant/30 flex items-center justify-between">
            <span className="font-m3-label-md text-m3-label-md font-bold text-m3-on-surface">الكمية المطلوبة</span>
            <div className="flex items-center gap-3 bg-m3-surface-container-low px-2 py-1 rounded-xl">
              <button aria-label="إنقاص الكمية" disabled={p.quantity <= 1} onClick={() => p.onQuantity(p.quantity - 1)} className="w-8 h-8 rounded-lg bg-m3-surface-container-lowest flex items-center justify-center text-m3-on-surface shadow-sm active:scale-90 transition-all disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="font-m3-headline-md font-bold text-m3-on-surface text-[16px] min-w-[20px] text-center">{p.quantity}</span>
              <button aria-label="زيادة الكمية" disabled={p.maxQty > 0 && p.quantity >= p.maxQty} onClick={() => p.onQuantity(p.quantity + 1)} className="w-8 h-8 rounded-lg bg-m3-surface-container-lowest flex items-center justify-center text-m3-on-surface shadow-sm active:scale-90 transition-all disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </section>

        {storeName && (
          <div className="flex items-center gap-2 mt-3 px-1 text-m3-on-surface-variant font-m3-label-md text-m3-label-md">
            <span className="material-symbols-outlined text-[18px] text-m3-primary">storefront</span>
            <span>البائع: <span className="font-bold text-m3-on-surface">{storeName}</span></span>
          </div>
        )}

        <div className="flex items-center justify-between px-m3-space-md py-2.5 bg-m3-secondary-container/40 rounded-xl my-3 text-m3-on-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-m3-primary text-[20px]">local_shipping</span>
            <div className="flex flex-col">
              <span className="font-m3-label-md text-m3-label-md font-bold text-m3-on-surface">{p.isOutOfStock ? "غير متوفر حالياً" : "متوفر جاهز للشحن الفوري"}</span>
              <span className="font-m3-body-sm text-[11px] text-m3-on-surface-variant">التوصيل خلال 48 - 120 ساعة لباب منزلك</span>
            </div>
          </div>
          {!p.isOutOfStock && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-m3-primary text-m3-on-primary">متوفر بالمستودع</span>}
        </div>

        <section className="mt-1 mb-2 bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm border border-m3-outline-variant/30">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-m3-on-surface-variant font-medium px-1 bg-m3-surface-container-low p-2 rounded-xl">
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-m3-primary" style={star}>check_circle</span><span>دفع عند الاستلام متاح</span></div>
              <span className="w-1 h-1 rounded-full bg-m3-outline-variant" />
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-m3-primary" style={star}>bolt</span><span>شحن سريع</span></div>
              <span className="w-1 h-1 rounded-full bg-m3-outline-variant" />
              <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-m3-primary" style={star}>styler</span><span>معاينة قبل الدفع</span></div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col shrink-0 min-w-[90px]">
                <span className="font-m3-label-sm text-[10px] text-m3-on-surface-variant leading-tight">المبلغ الإجمالي</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-m3-price-display font-bold text-m3-primary text-[20px] tracking-tight">{fmt(total)}</span>
                  <span className="font-m3-label-sm text-[11px] font-bold text-m3-on-surface">ج.م</span>
                </div>
                {hasDiscount && <span className="text-[10px] text-m3-outline line-through font-m3-price-display">{fmt(product.price * p.quantity)} ج.م</span>}
              </div>
              <button disabled={p.isOutOfStock} onClick={p.onBuyNow} className="flex-1 h-12 bg-m3-primary text-m3-on-primary rounded-xl flex items-center justify-center gap-2 font-m3-headline-md text-[14px] font-bold shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]" style={star}>bolt</span>
                <span>اشتري الآن</span>
              </button>
              <button aria-label="أضف للسلة" disabled={p.isOutOfStock} onClick={p.onAddToCart} className="w-12 h-12 rounded-xl bg-m3-surface-container border border-m3-primary/20 text-m3-primary flex items-center justify-center shrink-0 hover:bg-m3-secondary-container/40 active:scale-90 transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-[22px]">add_shopping_cart</span>
              </button>
              <button aria-label="حفظ في المفضلة" onClick={p.onToggleFavorite} className={`w-10 h-12 rounded-xl bg-m3-surface-container-low border border-m3-outline-variant/30 flex items-center justify-center shrink-0 transition-transform active:scale-90 ${p.isFavorite ? "text-tertiary" : "text-on-surface"}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${p.isFavorite ? 1 : 0}` }}>favorite</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mt-m3-space-lg flex flex-col gap-2.5">
          <details className="group bg-m3-surface-container-lowest rounded-2xl shadow-sm overflow-hidden" open>
            <summary className="flex items-center justify-between p-m3-space-md cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-m3-primary text-[20px]">tune</span>
                <span className="font-m3-headline-md text-m3-headline-md text-m3-on-surface font-bold text-[15px]">مواصفات الحذاء والخامات</span>
              </div>
              <span className="material-symbols-outlined text-m3-on-surface-variant transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-m3-space-md pb-m3-space-md font-m3-body-md text-m3-body-md text-m3-on-surface-variant space-y-2">
              {lines.map((l, i) => (
                <p key={i} className="leading-relaxed">{l}</p>
              ))}
            </div>
          </details>
          <details className="group bg-m3-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
            <summary className="flex items-center justify-between p-m3-space-md cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-m3-primary text-[20px]">assignment_return</span>
                <span className="font-m3-headline-md text-m3-headline-md text-m3-on-surface font-bold text-[15px]">سياسة الاستبدال والمعاينة قبل الدفع (14 يوم)</span>
              </div>
              <span className="material-symbols-outlined text-m3-on-surface-variant transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-m3-space-md pb-m3-space-md font-m3-body-md text-m3-body-md text-m3-on-surface-variant space-y-2">
              <p className="leading-relaxed">تسوق بأمان تام مع ميرفوري: يتيح لك مندوبنا فحص الحذاء ومطابقة المقاس واللون أمامك قبل سداد أي مبلغ عند الاستلام.</p>
              <div className="p-3 bg-m3-surface-container rounded-xl flex items-center gap-2.5 text-[13px]">
                <span className="material-symbols-outlined text-m3-primary text-[20px]">lock_clock</span>
                <span>حق الاستبدال أو استرجاع المبلغ بالكامل خلال 14 يوماً مع الحفاظ على التاغ الأصلي.</span>
              </div>
            </div>
          </details>
        </section>

        <section className="mt-m3-space-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-m3-headline-md text-m3-headline-md font-bold text-m3-on-surface">تقييمات وآراء العملاء</h3>
                <span className="font-m3-label-sm text-m3-label-sm text-m3-primary font-bold bg-m3-secondary-container/60 px-2 py-0.5 rounded-full">{count} تقييم</span>
              </div>
            </div>
            <button onClick={p.onWriteReview} className="px-3 py-1.5 rounded-xl border border-m3-primary/30 text-m3-primary font-m3-label-sm text-m3-label-sm font-bold flex items-center gap-1 hover:bg-m3-secondary-container/40 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[16px]">rate_review</span>
              <span>أضف تقييمك</span>
            </button>
          </div>
          {count > 0 && (
            <div className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm border border-m3-outline-variant/30 flex items-center gap-4">
              <div className="flex flex-col items-center justify-center shrink-0 min-w-[110px] text-center">
                <span className="font-m3-headline-xl text-m3-primary font-m3-price-display text-[38px] leading-none font-bold">{avg.toFixed(1)}</span>
                <div className="flex items-center gap-0.5 my-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `'FILL' ${i <= Math.round(avg) ? 1 : 0}` }}>star</span>
                  ))}
                </div>
                <span className="font-m3-label-sm text-[11px] text-m3-on-surface-variant font-medium">من إجمالي 5 نجوم</span>
              </div>
              <div className="flex-1 w-full flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const pct = count ? Math.round(((dist[n] || 0) / count) * 100) : 0
                  return (
                    <div key={n} className="flex items-center gap-2 text-[11px]">
                      <span className="w-9 text-m3-on-surface-variant font-medium">{n} نجوم</span>
                      <div className="flex-1 h-2 bg-m3-surface-container rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="w-8 text-m3-on-surface-variant font-bold text-left">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {p.reviews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-1 -mx-m3-margin px-m3-margin select-none mt-3 no-scrollbar">
              {([["all", `الكل (${p.reviews.length})`], ["latest", "أحدث التقييمات"], ["five", `5 نجوم (${fives})`]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} className={`shrink-0 px-3.5 py-1.5 rounded-full font-m3-label-sm text-m3-label-sm transition-all ${filter === k ? "bg-primary text-on-primary font-bold shadow-sm" : "bg-surface-container-lowest text-on-surface border border-outline-variant/30 font-medium hover:bg-surface-container"}`}>{l}</button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 mt-3">
            {shownReviews.map((r) => {
              const name = r.user?.fullName || "مشتري"
              return (
                <div key={r._id || r.id} className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm border border-m3-outline-variant/30 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-m3-primary-fixed text-m3-on-primary-fixed flex items-center justify-center font-bold text-[14px]">{name.charAt(0)}</div>
                      <span className="font-m3-label-md text-m3-label-md font-bold text-m3-on-surface">{name}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: `'FILL' ${i <= r.rating ? 1 : 0}` }}>star</span>
                        ))}
                      </div>
                      <span className="text-[10px] text-m3-outline font-medium">{timeAgo(r.createdAt)}</span>
                    </div>
                  </div>
                  {r.comment && <p className="font-m3-body-md text-m3-body-md text-m3-on-surface leading-relaxed">{r.comment}</p>}
                </div>
              )
            })}
            {p.reviews.length === 0 && <p className="text-center font-m3-body-md text-m3-body-md text-m3-on-surface-variant py-m3-space-md">لا توجد تقييمات بعد — كن أول من يقيّم هذا المنتج</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
