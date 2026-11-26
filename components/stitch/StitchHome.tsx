"use client"

import { StitchProductCard } from "./StitchProductCard"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { announcementService, categoryService, loyaltyService, offerService, productService, shippingSettingsService, wishlistService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { getProductImage } from "@/lib/productVariants"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"
import { EGP_PER_100_POINTS, pointsToEgp } from "@/lib/loyalty-rules"
import { toast } from "sonner"
import { StitchHeader, StitchNav } from "./StitchChrome"

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const list = (d: any): any[] => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.announcements) ? d.announcements : d && d._id ? [d] : [])
const pad = (n: number) => String(n).padStart(2, "0")
const finalPrice = (p: any) => (p.discountPercentage > 0 && p.discountedPrice ? p.discountedPrice : p.price)

export default function StitchHome() {
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
  const [skew, setSkew] = useState(0)
  const [dealSize, setDealSize] = useState("")

  useEffect(() => {
    shippingSettingsService.getShippingSettings().then((r: any) => {
      const d = r.data?.data ?? r.data
      if (d) setFree({ enabled: Boolean(d.freeShippingEnabled), min: Number(d.freeShippingMinimum) || 0 })
    }).catch(() => {})
    announcementService.getMainAnnouncements().then((r: any) => setSlides(list(r.data).filter((a) => a.image))).catch(() => {})
    categoryService.getCategories().then((r: any) => setCats(list(r.data))).catch(() => {})
    productService.getBestSellers(8).then((r: any) => {
      const l = list(r.data)
      if (l.length) return setBest(l)
      // No sales data yet: fall back to the newest products so the section is never empty
      return productService.getProducts({ limit: 8 }).then((r2: any) => setBest(list(r2.data))).catch(() => {})
    }).catch(() => {})
    offerService.getActiveOffers().then((r: any) => {
      const l = list(r.data)
      // Use the server clock (serverTime) so the countdown is right even if the phone clock is off
      if (l[0]?.serverTime) setSkew(new Date(l[0].serverTime).getTime() - Date.now())
      setOffers(l)
    }).catch(() => {})
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
    setNow(Date.now() + skew)
    const t = setInterval(() => setNow(Date.now() + skew), 1000)
    return () => clearInterval(t)
  }, [skew])
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

  // 24-hour deal timer: counts down from the offer start, never past the offer end
  const left = liveOffer ? Math.max(0, Math.floor((Math.min(new Date(liveOffer.endDate).getTime(), new Date(liveOffer.startDate).getTime() + 24 * 3600 * 1000) - now) / 1000)) : 0

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
    <>
    <StitchHeader />
    <div dir="rtl" className="relative w-full px-[1rem] pt-28 pb-24 md:pt-8 md:pb-12 md:px-[2rem] bg-[#f8fafc] font-[Cairo,sans-serif]">
      <div className="flex flex-col w-full gap-[1.5rem] md:mx-auto md:max-w-6xl">
        {free?.enabled && free.min > 0 && (
          <aside className="relative overflow-hidden rounded-[0.875rem] bg-gradient-to-l from-blue-50 to-slate-100 border border-blue-100/80 px-3.5 py-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[9999px] bg-[#2563eb] text-white">
                <span className="material-symbols-outlined text-[15px]">local_shipping</span>
              </span>
              <p className="text-xs font-semibold text-slate-800 truncate">
                شحن مجاني للطلبات فوق <span className="font-bold text-[#004ac6]">{fmt(free.min)} ج.م</span>
              </p>
            </div>
          </aside>
        )}

        {cur && (
          <section className="relative w-full rounded-[1.25rem] bg-white p-4 shadow-sm border border-slate-100 overflow-hidden flex flex-col gap-3">
            <div className="relative w-full aspect-[4/3] md:aspect-[21/8] rounded-[0.875rem] bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200/60 overflow-hidden flex items-center justify-center">
                            <img alt={cur.title} src={normalizeImageUrl(cur.image, "product")} fetchPriority="high" decoding="async" className="relative z-10 w-full h-full object-cover object-[50%_78%]" />
              {slides.length > 1 && (
                <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                  {slides.map((_, i) => (
                    <button key={i} aria-label={`شريحة ${i + 1}`} onClick={() => setSlide(i)} className={`h-1.5 rounded-[9999px] transition-all ${i === slide ? "w-6 bg-[#2563eb]" : "w-1.5 bg-slate-300"}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase font-['Space_Grotesk']">MIRVORY EDITORIAL SELECTION</span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> ضمان استبدال 14 يوم</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{cur.title}</h2>
              {cur.content && <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">{cur.content}</p>}
              <div className="mt-2 flex items-center gap-2">
                <Link href={cur.link || "/products"} className="flex-1 h-11 rounded-[0.875rem] bg-[#004ac6] hover:bg-[#2563eb] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
                  <span>تسوق المجموعة الآن</span>
                  <span className="material-symbols-outlined text-[18px] rotate-180">arrow_forward</span>
                </Link>
                <Link href="/products" aria-label="استعراض التشكيلة كاملة" className="w-11 h-11 rounded-[0.875rem] bg-[#f1f5f9] flex items-center justify-center text-slate-800 active:scale-95 transition-transform border border-slate-200">
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
            <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible no-scrollbar py-1 -mx-[1rem] px-[1rem] md:mx-0 md:px-0">
              <Link href="/products" className="shrink-0 h-9 px-4 rounded-[0.875rem] bg-slate-950 text-white text-xs font-bold shadow-sm flex items-center">الكل</Link>
              {cats.map((c) => (
                <Link key={c._id} href={`/categories/${c._id}/products`} className="shrink-0 h-9 px-4 rounded-[0.875rem] bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:border-slate-400 transition-colors flex items-center">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {deal && (
          <section className="relative w-full rounded-[1.25rem] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 shadow-xl overflow-hidden border border-slate-800 flex flex-col gap-3.5">
            <div className="absolute -top-16 -left-16 w-52 h-52 rounded-[9999px] bg-blue-600/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-[9999px] bg-rose-600/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-[9999px] bg-rose-600 text-white font-bold text-xs shadow-md">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>{liveOffer?.title || "صفقة اليوم الحصرية"}</span>
              </div>
              {liveOffer && (
                <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-[0.625rem]">
                  <span className="w-2 h-2 rounded-[9999px] bg-rose-500 animate-ping" />
                  <span className="text-[11px] text-slate-300 font-semibold">ينتهي:</span>
                  <div className="flex items-center gap-1 [font-family:var(--font-space-grotesk),Space_Grotesk,sans-serif] text-xs font-bold text-amber-300 tracking-wider" dir="ltr">
                    <span className="bg-slate-900 px-1 py-0.5 rounded-[0.375rem] text-white">{pad(Math.floor(left / 3600))}</span>:
                    <span className="bg-slate-900 px-1 py-0.5 rounded-[0.375rem] text-white">{pad(Math.floor((left % 3600) / 60))}</span>:
                    <span className="bg-slate-900 px-1 py-0.5 rounded-[0.375rem] text-rose-400">{pad(left % 60)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-10 flex flex-col gap-3">
              <Link href={`/products/${deal._id}`} className="relative w-full aspect-[4/3] md:aspect-[21/8] rounded-[0.875rem] bg-gradient-to-b from-slate-900/90 to-slate-800/60 border border-slate-700/40 flex items-center justify-center overflow-hidden p-2">
                <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-[0.625rem] bg-rose-600 text-white [font-family:var(--font-space-grotesk),Space_Grotesk,sans-serif] text-xs font-black shadow-md">-{Math.round(deal.discountPercentage)}% خصم حصري</span>
                <img alt={deal.title} src={normalizeImageUrl(deal.image || getProductImage(deal) || "", "product")} loading="lazy" decoding="async" className="w-full h-full object-cover scale-[1.35] object-[50%_85%]" />
              </Link>
              <div className="flex flex-col gap-1 text-right">
                <div className="flex items-center justify-between">
                  {deal.brand ? <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase [font-family:var(--font-space-grotesk),Space_Grotesk,sans-serif]">{deal.brand}</span> : <span />}
                  {deal.ratings?.count > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{Number(deal.ratings.average).toFixed(1)} ({deal.ratings.count} تقييم)</span>
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">{deal.title}</h4>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,sans-serif] text-2xl font-black text-blue-400">
                    {fmt(finalPrice(deal))} <span className="text-xs font-semibold text-slate-300">ج.م</span>
                  </span>
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,sans-serif] text-sm line-through text-slate-500 font-bold">{fmt(deal.price)} ج.م</span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-[0.375rem]">وفر {fmt(deal.price - finalPrice(deal))} ج.م</span>
                </div>
              </div>
              {dealSizes.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">المقاسات المتاحة الفورية (EU):</span>
                    <Link href="/size-guide" className="text-[#93c5fd] text-[11px] font-bold">دليل المقاسات</Link>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {dealSizes.map((s) => (
                      <button key={s.size} type="button" onClick={() => setDealSize(s.size)} className={`flex-1 h-9 rounded-[0.625rem] border [font-family:var(--font-space-grotesk),Space_Grotesk,sans-serif] text-xs font-bold transition-all ${dealSize === s.size ? "bg-[#004ac6] border-blue-400 text-white" : "bg-slate-800/80 border-slate-700 text-slate-200"}`}>
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Link href={`/products/${deal._id}`} className="w-full mt-1 h-12 rounded-[0.875rem] bg-gradient-to-r from-blue-600 to-[#004ac6] text-white text-sm font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                <span>اشتري الآن - توصيل سريع</span>
              </Link>
            </div>
          </section>
        )}

        {authed && loyalty && (
          <section className="relative w-full rounded-[1.25rem] bg-gradient-to-br from-amber-50 via-white to-amber-100/40 p-4 border border-amber-200/70 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-[0.875rem] bg-amber-500 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">نادي ميرفوري للمكافآت (Mirvory Club)</h4>
                  <p className="text-[11px] text-slate-600 font-medium">اجمع نقاط مع كل عملية شراء</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-[0.875rem] bg-white/90 border border-amber-200/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,sans-serif] text-xl font-extrabold text-slate-900">{fmt(loyalty.points)}</span>
                  <span className="text-xs font-bold text-slate-600">نقطة رصيد</span>
                </div>
                <Link href="/loyalty" className="px-3 h-7 rounded-[0.625rem] bg-[#004ac6] text-white text-xs font-bold flex items-center">نادي الولاء</Link>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">رصيدك يساوي {fmt(pointsToEgp(loyalty.points))} ج.م خصم (كل 100 نقطة = {EGP_PER_100_POINTS} ج.م)</p>
            </div>
          </section>
        )}

        {best.length > 0 && (
          <section className="flex flex-col gap-[0.5rem]">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">الأكثر مبيعاً هذا الأسبوع</h3>
                <p className="text-xs text-slate-500">القطع الأكثر طلباً من عملائنا في مصر</p>
              </div>
              <Link href="/products?sort=sold" className="text-xs font-bold text-[#004ac6] flex items-center gap-0.5">
                <span>عرض الكل</span>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.75rem]">
              {best.slice(0, 4).map((p) => (
                <StitchProductCard key={p._id} p={p} fav={favs.has(p._id)} onFav={() => toggleFav(p._id)} />
              ))}
            </div>
          </section>
        )}

        <section className="relative w-full rounded-[1.25rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white p-4 shadow-md overflow-hidden border border-slate-800">
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-12 h-12 rounded-[0.875rem] bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[26px]">manage_search</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 text-right">
              <span className="self-start px-2 py-0.5 rounded-[9999px] bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">خدمة الكونسيرج الحصرية</span>
              <h3 className="text-base font-extrabold text-white">مش لاقي منتج معين في مصر؟</h3>
              <p className="text-xs text-slate-300 leading-relaxed">ابعتلنا صورة الموديل أو كود الحذاء وهنوفرهولك بأفضل سعر مع المعاينة الكاملة قبل الدفع.</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-emerald-400">verified_user</span>ضمان استرجاع 14 يوم</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-blue-400">bolt</span>تسعير فوري</span>
            </div>
            <Link href="/request-product" className="h-9 px-4 rounded-[0.875rem] bg-white text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>اطلب منتجك الآن</span>
            </Link>
          </div>
        </section>

        <section className="rounded-[1.25rem] bg-white p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-[9999px] bg-blue-100 text-[#004ac6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </span>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">ضمان ميرفوري</h4>
              <span className="text-xs text-slate-500">تجربة شراء موثوقة في جمهورية مصر العربية</span>
            </div>
          </div>
          {[
            ["verified_user", "bg-blue-100 text-[#004ac6]", "ضمان استبدال واسترجاع 14 يوم", "استبدال أو استرجاع لو المنتج مش مطابق قطعة بقطعة"],
            ["visibility", "bg-emerald-100 text-emerald-700", "المعاينة وتجربة المقاس عند الاستلام", "حقك الكامل في فحص وتجربة السنيكرز قبل الدفع للمندوب"],
            ["electric_bolt", "bg-rose-100 text-rose-700", "شحن سريع لجميع المحافظات", "توصيل لباب بيتك مع تتبع الشحنة"],
          ].map(([icon, cls, t, d]) => (
            <div key={icon} className="flex items-center gap-3 p-2.5 rounded-[0.875rem] bg-slate-50 border border-slate-100">
              <div className={`w-9 h-9 rounded-[0.625rem] flex items-center justify-center shrink-0 ${cls}`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900">{t}</span>
                <span className="text-[11px] text-slate-500">{d}</span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
    <StitchNav />
    </>
  )
}
