"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { announcementService, categoryService, loyaltyService, offerService, productService, shippingSettingsService, wishlistService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { getProductImage } from "@/lib/productVariants"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"
import { getTierProgress } from "@/lib/loyalty-tiers"
import { toast } from "sonner"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"
import { WhatsAppIcon } from "@/components/whatsapp-help-button"
import { STORE_POLICIES } from "@/lib/store-policies"

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const list = (d: any): any[] => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.announcements) ? d.announcements : d && d._id ? [d] : [])
const pad = (n: number) => String(n).padStart(2, "0")
const finalPrice = (p: any) => (p.discountPercentage > 0 && p.discountedPrice ? p.discountedPrice : p.price)

export function HomeMobile() {
  const { user } = useAuth()
  const authed = Boolean(user)
  const [free, setFree] = useState<{ enabled: boolean; min: number } | null>(null)
  const [slides, setSlides] = useState<any[]>([])
  const [slide, setSlide] = useState(0)
  const [cats, setCats] = useState<any[]>([])
  const [best, setBest] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [loyalty, setLoyalty] = useState<{ points: number; totalEarned: number } | null>(null)
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const [now, setNow] = useState(() => Date.now())
  const [dealSize, setDealSize] = useState("")

  useEffect(() => {
    shippingSettingsService.getShippingSettings().then((r: any) => {
      const d = r.data?.data ?? r.data
      if (d) setFree({ enabled: Boolean(d.freeShippingEnabled), min: Number(d.freeShippingMinimum) || 0 })
    }).catch(() => {})
    announcementService.getMainAnnouncements().then((r: any) => setSlides(list(r.data).filter((a) => a.image))).catch(() => {})
    categoryService.getCategories().then((r: any) => setCats(list(r.data))).catch(() => {})
    productService.getProducts({ sort: "sold:desc", limit: 8 }).then((r: any) => setBest(list(r.data))).catch(() => {})
    offerService.getActiveOffers().then((r: any) => setOffers(list(r.data))).catch(() => {})
  }, [])

  useEffect(() => {
    if (!authed) {
      setLoyalty(null)
      setFavs(new Set())
      return
    }
    loyaltyService.getMyLoyalty().then((r: any) => setLoyalty(r.data?.loyalty ?? null)).catch(() => {})
    wishlistService.getWishlist().then((r: any) => {
      const items = r.data?.data?.products ?? []
      setFavs(new Set(items.map((i: any) => (typeof i.product === "string" ? i.product : i.product?._id)).filter(Boolean)))
    }).catch(() => {})
  }, [authed])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  const liveOffer = useMemo(
    () =>
      offers
        .filter((o) => o.isActive !== false && new Date(o.endDate).getTime() > now && new Date(o.startDate).getTime() <= now)
        .sort((a, b) => +new Date(a.endDate) - +new Date(b.endDate))[0],
    [offers, now]
  )
  const deal = useMemo(() => [...best].filter((p) => p.discountPercentage > 0).sort((a, b) => b.discountPercentage - a.discountPercentage)[0], [best])
  const dealSizes: { size: string; quantity: number }[] = useMemo(() => {
    const c = deal?.colors?.find((x: any) => x.available !== false && x.sizes?.some((s: any) => s.quantity > 0))
    return (c?.sizes || []).filter((s: any) => s.quantity > 0).slice(0, 5)
  }, [deal])

  const miniDeals = useMemo(() => best.filter((p) => p.discountPercentage > 0 && p._id !== deal?._id).slice(0, 3), [best, deal])
  const left = liveOffer ? Math.max(0, Math.floor((new Date(liveOffer.endDate).getTime() - now) / 1000)) : 0
  const tier = loyalty ? getTierProgress(loyalty.totalEarned) : null

  const toggleFav = async (id: string) => {
    if (!authed) return toast.error("سجّل الدخول لإضافة المنتج للمفضلة")
    setFavs((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
    try {
      await wishlistService.toggleWishlist(id)
    } catch {
      toast.error("تعذر تحديث المفضلة")
    }
  }

  const cur = slides[slide]

  return (
    <div dir="rtl" style={{ fontFamily: "var(--font-cairo), Cairo, sans-serif" }} className="md:hidden relative w-full px-m3-margin pt-28 pb-24 bg-m3-surface min-h-screen">
      <div className="flex flex-col w-full gap-m3-space-lg">
        {free?.enabled && free.min > 0 && (
          <aside className="relative overflow-hidden rounded-xl bg-gradient-to-l from-blue-50 to-slate-100 border border-blue-100/80 px-3.5 py-2 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-m3-primary-container text-white">
                  <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate">
                  شحن مجاني للطلبات فوق <span className="font-bold text-m3-primary">{fmt(free.min)} ج.م</span>
                </p>
              </div>
              <Link href="/help" className="shrink-0 bg-white border border-blue-200/60 px-2 py-0.5 rounded-lg shadow-sm text-xs font-bold text-m3-primary-container">
                احصل على شحن أسرع
              </Link>
            </div>
          </aside>
        )}

        {cur && (
          <section className="relative w-full rounded-2xl bg-white p-4 shadow-sm border border-slate-100 overflow-hidden flex flex-col gap-3">
            <div className="relative w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200/60 overflow-hidden flex items-center justify-center">
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-900 tracking-wide">إصدارات حصرية</span>
              </div>
              <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold">ORIGINAL VERIFIED</div>
              <img alt={cur.title} src={normalizeImageUrl(cur.image)} className="relative z-10 w-full h-full object-contain p-2 drop-shadow-xl transition-transform duration-500 hover:scale-105" />
              {slides.length > 1 && (
                <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                  {slides.map((_, i) => (
                    <button key={i} aria-label={`شريحة ${i + 1}`} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-primary-container" : "w-1.5 bg-slate-300"}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase font-m3-price-display">MIRVORY EDITORIAL SELECTION</span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  100% أصلي ومفحوص
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{cur.title}</h2>
              {cur.content && <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">{cur.content}</p>}
              <div className="mt-2 flex items-center gap-2">
                <Link href={cur.link || "/products"} className="flex-1 h-11 rounded-xl bg-m3-primary hover:bg-m3-primary-container text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
                  <span>تسوق المجموعة الآن</span>
                  <span className="material-symbols-outlined text-[18px] rotate-180">arrow_forward</span>
                </Link>
                <Link href="/products" aria-label="استعراض التشكيلة كاملة" className="w-11 h-11 rounded-xl bg-m3-surface-container flex items-center justify-center text-slate-800 active:scale-95 transition-transform border border-slate-200">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {cats.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-extrabold text-slate-900">تصفح الفئات</h3>
              <span className="text-xs font-semibold text-slate-500">اسحب للاستكشاف</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-m3-margin px-m3-margin">
              <Link href="/products" className="shrink-0 h-9 px-4 rounded-xl bg-slate-950 text-white text-xs font-bold shadow-sm flex items-center">الكل</Link>
              <Link href="/products?limited=true" className="shrink-0 h-9 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1">
                <span>إصدارات محدودة</span>
                <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
              </Link>
              {cats.map((c) => (
                <Link key={c._id} href={`/categories/${c._id}/products`} className="shrink-0 h-9 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:border-slate-400 transition-colors flex items-center">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {deal && (
          <section className="relative w-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 shadow-xl overflow-hidden border border-slate-800 flex flex-col gap-3.5">
            <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>{liveOffer?.title || "صفقة اليوم الحصرية"}</span>
              </div>
              {liveOffer && (
                <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[11px] text-slate-300 font-semibold">ينتهي:</span>
                  <div className="flex items-center gap-1 font-m3-price-display text-xs font-bold text-amber-300 tracking-wider" dir="ltr">
                    <span className="bg-slate-900 px-1 py-0.5 rounded text-white">{pad(Math.floor(left / 3600))}</span>:
                    <span className="bg-slate-900 px-1 py-0.5 rounded text-white">{pad(Math.floor((left % 3600) / 60))}</span>:
                    <span className="bg-slate-900 px-1 py-0.5 rounded text-rose-400">{pad(left % 60)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-10 flex flex-col gap-3">
              <Link href={`/products/${deal._id}`} className="relative w-full aspect-[4/3] rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-800/60 border border-slate-700/40 flex items-center justify-center overflow-hidden p-2">
                <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-m3-price-display text-xs font-black shadow-md">-{Math.round(deal.discountPercentage)}% خصم حصري</span>
                <img alt={deal.title} src={normalizeImageUrl(deal.image || getProductImage(deal) || "")} className="w-full h-full object-contain drop-shadow-2xl" />
              </Link>
              <div className="flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between">
                  {deal.brand ? <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-m3-price-display">{deal.brand}</span> : <span />}
                  {deal.ratings?.count > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{Number(deal.ratings.average).toFixed(1)} ({deal.ratings.count} تقييم)</span>
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">{deal.title}</h4>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="font-m3-price-display text-2xl font-black text-blue-400">
                    {fmt(finalPrice(deal))} <span className="text-xs font-semibold text-slate-300">ج.م</span>
                  </span>
                  <span className="font-m3-price-display text-sm line-through text-slate-500 font-bold">{fmt(deal.price)} ج.م</span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">وفر {fmt(deal.price - finalPrice(deal))} ج.م</span>
                </div>
              </div>
              {dealSizes.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">المقاسات المتاحة الفورية (EU):</span>
                    <Link href="/size-guide" className="text-m3-primary-fixed-dim text-[11px] font-bold">دليل المقاسات</Link>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {dealSizes.map((s) => (
                      <button key={s.size} type="button" onClick={() => setDealSize(s.size)} className={`flex-1 h-9 rounded-lg border font-m3-price-display text-xs font-bold transition-all ${dealSize === s.size ? "bg-primary border-blue-400 text-white" : "bg-slate-800/80 border-slate-700 text-slate-200"}`}>
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Link href={`/products/${deal._id}`} className="w-full mt-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-m3-primary text-white text-sm font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                <span>اشتري الآن - توصيل سريع</span>
              </Link>
              {miniDeals.length > 0 && (
                <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">صفقات إضافية</span>
                    <Link href="/products?sort=discount" className="text-blue-400 font-bold">عرض {miniDeals.length} قطع</Link>
                  </div>
                  {miniDeals.map((m) => (
                    <div key={m._id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      <img alt={m.title} src={normalizeImageUrl(m.image || getProductImage(m) || "")} className="w-14 h-14 object-contain rounded-lg bg-slate-800/60 p-1 shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0 text-right">
                        <span className="text-xs font-bold text-white truncate">{m.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-m3-price-display text-sm font-extrabold text-blue-400">{fmt(finalPrice(m))} ج.م</span>
                          <span className="font-m3-price-display text-[11px] line-through text-slate-500">{fmt(m.price)} ج.م</span>
                        </div>
                      </div>
                      <Link href={`/products/${m._id}`} className="px-3 h-8 rounded-lg bg-slate-800 text-white text-xs font-bold shrink-0 flex items-center gap-1 border border-slate-700">
                        <span>معاينة</span>
                        <span className="material-symbols-outlined text-[15px]">chevron_left</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="relative w-full rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white p-4 shadow-md overflow-hidden border border-slate-800">
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[26px]">manage_search</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 text-right">
              <span className="self-start px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">خدمة الكونسيرج الحصرية</span>
              <h3 className="text-base font-extrabold text-white">مش لاقي منتج معين في مصر؟</h3>
              <p className="text-xs text-slate-300 leading-relaxed">ابعتلنا صورة الموديل أو كود الحذاء وهنوفرهولك أصلي 100% وبأفضل سعر مع الفحص الكامل قبل الدفع.</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-emerald-400">verified</span>فحص أصالة مضمون</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-blue-400">bolt</span>تسعير فوري</span>
            </div>
            <Link href="/request-product" className="h-9 px-4 rounded-xl bg-white text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>اطلب منتجك الآن</span>
            </Link>
          </div>
        </section>

        {authed && loyalty && tier && (
          <section className="relative w-full rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/40 p-4 border border-amber-200/70 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">نادي ميرفوري للمكافآت (Mirvory Club)</h4>
                  <p className="text-[11px] text-slate-600 font-medium">اجمع نقاط مع كل عملية شراء</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-900 text-amber-300 text-[10px] font-bold font-m3-price-display tracking-wider uppercase">{tier.current.en}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/90 border border-amber-200/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-m3-price-display text-xl font-extrabold text-slate-900">{fmt(loyalty.points)}</span>
                  <span className="text-xs font-bold text-slate-600">نقطة رصيد</span>
                </div>
                <Link href="/loyalty" className="px-3 h-7 rounded-lg bg-m3-primary text-white text-xs font-bold flex items-center">نادي الولاء</Link>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${tier.pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>{tier.next ? `أنت على بعد ${fmt(tier.remaining)} نقطة للوصول إلى ${tier.next.en}` : "وصلت لأعلى مستوى"}</span>
                  <span className="font-bold text-amber-800">{tier.pct}% مكتمل</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {best.length > 0 && (
          <section className="flex flex-col gap-m3-space-sm">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">الأكثر مبيعاً هذا الأسبوع</h3>
                <p className="text-xs text-slate-500">القطع الأكثر طلباً من عملائنا في مصر</p>
              </div>
              <Link href="/products?sort=sold" className="text-xs font-bold text-m3-primary flex items-center gap-0.5">
                <span>عرض الكل</span>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-m3-gutter">
              {best.slice(0, 4).map((p) => {
                const fp = finalPrice(p)
                const sizes = (p.colors || []).flatMap((c: any) => (c.available !== false ? c.sizes || [] : [])).filter((s: any) => s.quantity > 0).map((s: any) => parseFloat(s.size)).filter((n: number) => !isNaN(n))
                return (
                  <article key={p._id} className="flex flex-col justify-between rounded-2xl bg-white p-3 shadow-sm border border-slate-100 relative group">
                    <button aria-label="إضافة للمفضلة" type="button" onClick={() => toggleFav(p._id)} className={`absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm ${favs.has(p._id) ? "text-rose-600" : "text-slate-500"}`}>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `'FILL' ${favs.has(p._id) ? 1 : 0}` }}>favorite</span>
                    </button>
                    {p.discountPercentage > 0 && <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">-{Math.round(p.discountPercentage)}%</span>}
                    <Link href={`/products/${p._id}`} className="relative w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden mb-2 p-1">
                      <img alt={p.title} src={normalizeImageUrl(p.image || getProductImage(p) || "")} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    </Link>
                    <div className="flex flex-col gap-1 text-right">
                      {p.ratings?.count > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-xs font-bold text-slate-800">{Number(p.ratings.average).toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400 font-m3-price-display">({p.ratings.count})</span>
                        </div>
                      )}
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                      {sizes.length > 0 && <span className="text-[11px] text-slate-500">مقاسات {Math.min(...sizes)} إلى {Math.max(...sizes)}</span>}
                      <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-100">
                        <span className="font-m3-price-display text-base font-extrabold text-slate-950">
                          {fmt(fp)} <span className="text-[11px] font-normal text-slate-500">ج.م</span>
                        </span>
                        <Link href={`/products/${p._id}`} aria-label="اختر المقاس" className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-m3-primary hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-m3-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </span>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">ضمان ميرفوري الأصلي</h4>
                <span className="text-xs text-slate-500">تجربة شراء موثوقة في جمهورية مصر العربية</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">معتمد رسمياً</span>
          </div>
          {[
            ["verified_user", "bg-blue-100 text-m3-primary", `ضمان استبدال واسترجاع ${STORE_POLICIES.returnDays} يوم`, "فحص الخامات والباركود والبوكس الأصلي قطعة بقطعة"],
            ["visibility", "bg-emerald-100 text-emerald-700", "المعاينة وتجربة المقاس عند الاستلام", "حقك الكامل في فحص وتجربة السنيكرز قبل الدفع للمندوب"],
            ["electric_bolt", "bg-rose-100 text-rose-700", "شحن سريع لجميع المحافظات", `وصول خلال ${STORE_POLICIES.deliveryWindow} مع تتبع الشحنة`],
          ].map(([icon, cls, t, d]) => (
            <div key={icon} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900">{t}</span>
                <span className="text-[11px] text-slate-500">{d}</span>
              </div>
            </div>
          ))}
        </section>

        <footer className="rounded-2xl bg-slate-950 text-white p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center tracking-tight">
              <span className="inline-flex font-black text-xl italic tracking-tighter">V<span className="text-rose-500 ml-[-2px]">O</span></span>
              <span className="font-extrabold text-[19px] tracking-wider font-m3-price-display mr-1.5 uppercase">MIRVORY</span>
            </div>
            <a href={buildSupportWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="h-9 px-3 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
              <WhatsAppIcon className="w-4 h-4" />
              <span>واتساب</span>
            </a>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">سنيكرز وملابس أصلية من بائعين موثّقين في مصر، مع المعاينة عند الاستلام.</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs font-semibold text-slate-200 border-t border-slate-800 pt-4">
            {[
              ["/products", "المنتجات"],
              ["/offers", "العروض"],
              ["/size-guide", "دليل المقاسات"],
              ["/orders", "تتبع طلباتك"],
              ["/returns/new", "الاستبدال والإرجاع"],
              ["/help", "المساعدة"],
              ["/faq", "الأسئلة الشائعة"],
              ["/contact", "تواصل معنا"],
              ["/about", "من نحن"],
              ["/return-policy", "سياسة الإرجاع"],
              ["/privacy", "سياسة الخصوصية"],
              ["/terms", "الشروط والأحكام"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-3">
            <a href="mailto:support.mirvory@gmail.com" className="truncate">support.mirvory@gmail.com</a>
            <span className="font-m3-price-display shrink-0">© {new Date().getFullYear()} MIRVORY</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
