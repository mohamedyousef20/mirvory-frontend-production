"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { announcementService, categoryService, offerService, productService, shippingSettingsService, wishlistService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { getProductImage } from "@/lib/productVariants"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"
import { toast } from "sonner"

/** Desktop (md+) home page. The mobile home stays in StitchHome. */

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const pad = (n: number) => String(n).padStart(2, "0")
const list = (d: any): any[] => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.announcements) ? d.announcements : d && d._id ? [d] : [])
const finalPrice = (p: any) => (p.discountPercentage > 0 && p.discountedPrice ? p.discountedPrice : p.price)
const num = "[font-family:var(--font-space-grotesk),Space_Grotesk,sans-serif]"

function sizesOf(p: any): string[] {
  const s = (p.colors || [])
    .flatMap((c: any) => (c.available !== false ? c.sizes || [] : []))
    .filter((x: any) => x.quantity > 0)
    .map((x: any) => String(x.size))
  return Array.from(new Set<string>(s)).sort((a, b) => parseFloat(a) - parseFloat(b))
}

function Card({ p, fav, onFav }: { p: any; fav: boolean; onFav: (id: string) => void }) {
  const fp = finalPrice(p)
  const sizes = sizesOf(p)
  const colors = (p.colors || []).length
  return (
    <article className="group relative flex flex-col rounded-[1.25rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <button aria-label="إضافة للمفضلة" type="button" onClick={() => onFav(p._id)} className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-[9999px] bg-white/95 shadow flex items-center justify-center transition-colors ${fav ? "text-rose-600" : "text-slate-500 hover:text-rose-600"}`}>
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${fav ? 1 : 0}` }}>favorite</span>
      </button>
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-start">
        {p.discountPercentage > 0 && <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[11px]">-{Math.round(p.discountPercentage)}%</span>}
        {sizes.length > 0 && sizes.length <= 2 && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">آخر {sizes.length === 1 ? "مقاس" : "مقاسين"}</span>}
      </div>
      <Link href={`/products/${p._id}`} className="relative block aspect-square bg-slate-50 overflow-hidden">
        <img alt={p.title} src={normalizeImageUrl(p.image || getProductImage(p) || "", "card")} loading="lazy" decoding="async" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-slate-950/90 text-white text-sm font-bold py-2.5 text-center">اختر المقاس واطلب الآن</div>
      </Link>
      <div className="flex flex-col gap-1.5 p-4 text-right">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold">{p.brand || ""}</span>
          {p.ratings?.count > 0 && (
            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {Number(p.ratings.average).toFixed(1)}
            </span>
          )}
        </div>
        <Link href={`/products/${p._id}`} className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-[#004ac6]">{p.title}</Link>
        <div className="flex items-center gap-1.5 flex-wrap min-h-[1.5rem]">
          {sizes.slice(0, 5).map((s) => (
            <span key={s} className={`${num} px-1.5 py-0.5 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-600`}>{s}</span>
          ))}
          {sizes.length > 5 && <span className="text-[11px] text-slate-400">+{sizes.length - 5}</span>}
          {colors > 1 && <span className="text-[11px] text-slate-500 mr-auto">{colors} ألوان</span>}
        </div>
        <div className="flex items-baseline gap-2 pt-2 mt-1 border-t border-slate-100">
          <span className={`${num} text-lg font-extrabold text-slate-950`}>{fmt(fp)} <span className="text-xs font-semibold text-slate-500">ج.م</span></span>
          {p.discountPercentage > 0 && <span className={`${num} text-xs line-through text-slate-400`}>{fmt(p.price)}</span>}
        </div>
      </div>
    </article>
  )
}

function Head({ title, sub, href }: { title: string; sub?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div className="text-right">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-bold text-[#004ac6] hover:underline">
          <span>عرض الكل</span>
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </Link>
      )}
    </div>
  )
}

export default function DesktopHome() {
  const { user } = useAuth()
  const authed = Boolean(user)
  const [free, setFree] = useState<{ enabled: boolean; min: number } | null>(null)
  const [slides, setSlides] = useState<any[]>([])
  const [slide, setSlide] = useState(0)
  const [cats, setCats] = useState<any[]>([])
  const [best, setBest] = useState<any[]>([])
  const [fresh, setFresh] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [favs, setFavs] = useState<Set<string>>(new Set())
  const [now, setNow] = useState(() => Date.now())
  const [skew, setSkew] = useState(0)

  useEffect(() => {
    shippingSettingsService.getShippingSettings().then((r: any) => {
      const d = r.data?.data ?? r.data
      if (d) setFree({ enabled: Boolean(d.freeShippingEnabled), min: Number(d.freeShippingMinimum) || 0 })
    }).catch(() => {})
    announcementService.getMainAnnouncements().then((r: any) => setSlides(list(r.data).filter((a) => a.image))).catch(() => {})
    categoryService.getCategories().then((r: any) => setCats(list(r.data))).catch(() => {})
    productService.getBestSellers(8).then((r: any) => setBest(list(r.data))).catch(() => {})
    productService.getProducts({ limit: 8, sort: "-createdAt" } as any).then((r: any) => setFresh(list(r.data))).catch(() => {})
    offerService.getActiveOffers().then((r: any) => {
      const l = list(r.data)
      if (l[0]?.serverTime) setSkew(new Date(l[0].serverTime).getTime() - Date.now())
      setOffers(l)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!authed) return setFavs(new Set())
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
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [slides.length])

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

  const liveOffer = useMemo(
    () => offers.filter((o) => o.isActive !== false && new Date(o.endDate).getTime() > now && new Date(o.startDate).getTime() <= now).sort((a, b) => +new Date(a.endDate) - +new Date(b.endDate))[0],
    [offers, now]
  )
  const left = liveOffer ? Math.max(0, Math.floor((Math.min(new Date(liveOffer.endDate).getTime(), new Date(liveOffer.startDate).getTime() + 24 * 3600 * 1000) - now) / 1000)) : 0
  const pool = best.length ? best : fresh
  const deal = useMemo(() => [...pool, ...fresh].filter((p) => p.discountPercentage > 0).sort((a, b) => b.discountPercentage - a.discountPercentage)[0], [pool, fresh])
  const hero = slides[slide]
  const heroImg = hero ? normalizeImageUrl(hero.image, "product") : normalizeImageUrl(pool[0]?.image || (pool[0] && getProductImage(pool[0])) || "", "product")
  const heroLink = hero?.link || (pool[0] ? `/products/${pool[0]._id}` : "/products")

  const trust = [
    ["verified_user", "ضمان استبدال 14 يوم", "استبدال أو استرجاع بسهولة"],
    ["visibility", "معاينة قبل الدفع", "جرّب المقاس مع المندوب واتأكد"],
    ["local_shipping", free?.enabled && free.min > 0 ? `شحن مجاني فوق ${fmt(free.min)} ج.م` : "شحن سريع لكل المحافظات", "توصيل لباب البيت مع تتبع الشحنة"],
  ]

  return (
    <div dir="rtl" className="hidden md:block bg-[#f8fafc] font-[Cairo,sans-serif] pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-l from-slate-950 via-slate-900 to-[#0b1f4d] text-white">
        <div className="mx-auto max-w-7xl px-8 py-12 grid grid-cols-12 gap-10 items-center">
          <div className="col-span-6 flex flex-col gap-5 text-right">
            <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-[9999px] bg-white/10 border border-white/15 text-xs font-bold text-emerald-300">
              <span className="material-symbols-outlined text-[16px]">verified_user</span> ضمان استبدال 14 يوم
            </span>
            <h1 className="text-5xl font-black leading-[1.2] tracking-tight">
              {hero?.title || "سنيكرز، جرّبه قبل ما تدفع"}
            </h1>
            <p className="text-base text-slate-300 leading-relaxed max-w-xl">
              {hero?.content || "أحدث الموديلات من أشهر الماركات بأسعار واضحة، معاينة عند الاستلام، واستبدال واسترجاع لمدة 14 يوم."}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link href={heroLink} className="h-12 px-8 rounded-[0.875rem] bg-white text-slate-950 font-extrabold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg">
                <span>تسوق الآن</span>
                <span className="material-symbols-outlined text-[18px] rotate-180">arrow_forward</span>
              </Link>
              <Link href="/products" className="h-12 px-6 rounded-[0.875rem] border border-white/25 text-white font-bold text-sm flex items-center hover:bg-white/10 transition-colors">كل المنتجات</Link>
              <a href={buildSupportWhatsAppUrl("مرحباً، محتاج مساعدة في اختيار مقاس")} target="_blank" rel="noopener noreferrer" className="h-12 px-5 rounded-[0.875rem] text-[#25D366] font-bold text-sm flex items-center gap-1.5 hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">support_agent</span> اسأل على الواتساب
              </a>
            </div>
          </div>
          <div className="col-span-6 relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-blue-500/20 blur-3xl" />
            <Link href={heroLink} className="relative block aspect-[4/3] rounded-[1.75rem] bg-white overflow-hidden shadow-2xl">
              {heroImg && <img alt={hero?.title || "منتج مميز"} src={heroImg} fetchPriority="high" decoding="async" className="w-full h-full object-cover object-[50%_78%]" />}
            </Link>
            {slides.length > 1 && (
              <div className="absolute -bottom-6 inset-x-0 flex items-center justify-center gap-2">
                {slides.map((_, i) => (
                  <button key={i} aria-label={`شريحة ${i + 1}`} onClick={() => setSlide(i)} className={`h-1.5 rounded-[9999px] transition-all ${i === slide ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="mx-auto max-w-7xl px-8 -mt-0">
        <div className="grid grid-cols-4 gap-0 rounded-b-[1.25rem] bg-white shadow-md border border-slate-100 border-t-0 divide-x divide-x-reverse divide-slate-100">
          {trust.map(([icon, t, d]) => (
            <div key={icon} className="flex items-center gap-3 p-5">
              <span className="w-11 h-11 rounded-[0.875rem] bg-blue-50 text-[#004ac6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
              </span>
              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-900">{t}</div>
                <div className="text-xs text-slate-500">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 flex flex-col gap-14 pt-12">
        {/* Categories */}
        {cats.length > 0 && (
          <section>
            <Head title="تسوق حسب الفئة" />
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="h-12 px-7 rounded-[0.875rem] bg-slate-950 text-white text-sm font-bold flex items-center shadow-sm">الكل</Link>
              {cats.map((c) => (
                <Link key={c._id} href={`/categories/${c._id}/products`} className="h-12 px-7 rounded-[0.875rem] bg-white border border-slate-200 text-slate-800 text-sm font-bold flex items-center hover:border-[#004ac6] hover:text-[#004ac6] hover:shadow-md transition-all">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Deal */}
        {deal && (
          <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 text-white grid grid-cols-12 gap-8 items-center p-8 shadow-xl">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-[9999px] bg-rose-600/20 blur-3xl pointer-events-none" />
            <div className="col-span-7 relative z-10 flex flex-col gap-4 text-right">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[9999px] bg-rose-600 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>{liveOffer?.title || "صفقة اليوم"}
                </span>
                {liveOffer && (
                  <span dir="ltr" className={`${num} inline-flex items-center gap-1 text-sm font-bold text-amber-300`}>
                    <span className="bg-white/10 px-2 py-1 rounded-md">{pad(Math.floor(left / 3600))}</span>:
                    <span className="bg-white/10 px-2 py-1 rounded-md">{pad(Math.floor((left % 3600) / 60))}</span>:
                    <span className="bg-white/10 px-2 py-1 rounded-md text-rose-300">{pad(left % 60)}</span>
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-black">{deal.title}</h3>
              <div className="flex items-baseline gap-3">
                <span className={`${num} text-4xl font-black text-blue-300`}>{fmt(finalPrice(deal))} <span className="text-base font-semibold text-slate-300">ج.م</span></span>
                <span className={`${num} text-lg line-through text-slate-500`}>{fmt(deal.price)}</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded-md">وفر {fmt(deal.price - finalPrice(deal))} ج.م</span>
              </div>
              <Link href={`/products/${deal._id}`} className="self-start h-12 px-8 rounded-[0.875rem] bg-gradient-to-l from-blue-600 to-[#004ac6] font-extrabold text-sm flex items-center gap-2 shadow-lg hover:brightness-110 transition">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span> اشتري الآن
              </Link>
            </div>
            <Link href={`/products/${deal._id}`} className="col-span-5 relative z-10 aspect-[4/3] rounded-[1.25rem] bg-white/95 overflow-hidden">
              <img alt={deal.title} src={normalizeImageUrl(deal.image || getProductImage(deal) || "", "product")} loading="lazy" decoding="async" className="w-full h-full object-contain p-4" />
            </Link>
          </section>
        )}

        {/* Best sellers */}
        {best.length > 0 && (
          <section>
            <Head title="الأكثر مبيعاً" sub="القطع الأكثر طلباً من عملائنا" href="/products?sort=sold" />
            <div className="grid grid-cols-4 gap-5">
              {best.slice(0, 4).map((p) => <Card key={p._id} p={p} fav={favs.has(p._id)} onFav={toggleFav} />)}
            </div>
          </section>
        )}

        {/* New arrivals */}
        {fresh.length > 0 && (
          <section>
            <Head title="وصل حديثاً" sub="آخر الموديلات المضافة" href="/products" />
            <div className="grid grid-cols-4 gap-5">
              {fresh.slice(0, 8).map((p) => <Card key={p._id} p={p} fav={favs.has(p._id)} onFav={toggleFav} />)}
            </div>
          </section>
        )}

        {/* Concierge + help */}
        <section className="grid grid-cols-2 gap-5">
          <div className="rounded-[1.5rem] bg-gradient-to-l from-slate-900 to-slate-950 text-white p-7 flex items-center gap-5">
            <span className="w-14 h-14 rounded-[1rem] bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[30px]">manage_search</span>
            </span>
            <div className="flex-1 text-right">
              <h3 className="text-lg font-extrabold">مش لاقي موديل معين؟</h3>
              <p className="text-sm text-slate-300 mt-1">ابعتلنا صورة أو كود الحذاء وهنوفرهولك بأفضل سعر.</p>
            </div>
            <Link href="/request-product" className="h-11 px-5 rounded-[0.875rem] bg-white text-slate-950 text-sm font-extrabold flex items-center whitespace-nowrap">اطلب منتجك</Link>
          </div>
          <div className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-7 flex items-center gap-5">
            <span className="w-14 h-14 rounded-[1rem] bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[30px]">support_agent</span>
            </span>
            <div className="flex-1 text-right">
              <h3 className="text-lg font-extrabold text-slate-900">محتار في المقاس؟</h3>
              <p className="text-sm text-slate-500 mt-1">شوف دليل المقاسات أو كلمنا على الواتساب ونساعدك.</p>
            </div>
            <Link href="/size-guide" className="h-11 px-5 rounded-[0.875rem] bg-slate-100 text-slate-900 text-sm font-extrabold flex items-center whitespace-nowrap hover:bg-slate-200">دليل المقاسات</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
