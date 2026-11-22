"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { loyaltyService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { TIERS, getTierProgress } from "@/lib/loyalty-tiers"

type Tx = { _id: string; type: "earned" | "redeemed" | "adjusted"; points: number; source: string; description?: string; createdAt: string }

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const BENEFITS: Record<string, [string, string][]> = {
  bronze: [["check", "خصم 5% خاص في شهر ميلادك."], ["check", "تجميع نقاط 1:1 على جميع المشتريات."]],
  silver: [["local_shipping", "شحن مجاني مرة شهرياً لأي محافظة بمصر."], ["schedule", "معاينة حصرية وحجز للدروبات قبل الإطلاق العام بـ 6 ساعات."], ["celebration", "خصم 10% في شهر ميلادك."]],
  gold: [["verified", "فحص أصالة وتغليف متحفي مجاني غير محدود."], ["local_shipping", "شحن مجاني فوري وسريع دائم على مدار العام."], ["redeem", "هدية سنوية حصرية (Sneaker Accessories Kit)."], ["percent", "خصم دائم 15% على جميع الإكسسوارات والعناية."]],
}
const SOURCES: Record<string, string> = { order_completion: "إتمام طلب", redemption: "استبدال نقاط", manual_adjustment: "تعديل يدوي", referral: "إحالة", bonus: "مكافأة" }

export function LoyaltyMobile() {
  const { user, cookiesReady } = useAuth()
  const authed = Boolean(user)
  const [loyalty, setLoyalty] = useState<{ points: number; totalEarned: number; tier: string } | null>(null)
  const [txs, setTxs] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!cookiesReady) return
    if (!authed) return setLoading(false)
    Promise.allSettled([loyaltyService.getMyLoyalty(), loyaltyService.getMyTransactions({ page: 1, limit: 8 })]).then(([a, b]) => {
      if (a.status === "fulfilled") setLoyalty(a.value.data?.loyalty ?? null)
      if (b.status === "fulfilled") setTxs(b.value.data?.transactions ?? [])
      setLoading(false)
    })
  }, [authed, cookiesReady])

  const tp = loyalty ? getTierProgress(loyalty.totalEarned) : null
  const memberId = user?._id || user?.id ? String(user._id || user.id).slice(-6).toUpperCase() : ""

  return (
    <div dir="rtl" className="md:hidden flex flex-col w-full pb-24 bg-m3-surface font-m3-body-md min-h-screen">
      <div className="flex flex-col w-full pb-10 space-y-6">
        <section className="px-m3-margin pt-2">
          <div className="relative overflow-hidden rounded-3xl bg-m3-surface-container-low p-6 shadow-sm flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-m3-secondary-container text-m3-on-secondary-container self-start">
              <span className="material-symbols-outlined text-base text-m3-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="font-m3-label-md text-m3-label-md">عضوية VIP الحصرية</span>
            </div>
            <h1 className="font-m3-headline-xl-mobile text-m3-headline-xl-mobile text-m3-on-surface leading-tight font-bold">كل خطوة وكل سنيكرز بيقربك لمكافآت أكبر</h1>
            <p className="font-m3-body-md text-m3-body-md text-m3-on-surface-variant max-w-[280px]">انضم لنادي ميرفوري، اجمع نقاط مع كل عملية شراء، وارتقِ بين مستويات العضوية.</p>
          </div>
        </section>

        <section className="px-m3-margin">
          {!authed ? (
            <div className="rounded-3xl bg-m3-inverse-surface text-m3-inverse-on-surface p-5 shadow-lg flex flex-col gap-3 items-center text-center">
              <span className="material-symbols-outlined text-m3-primary-fixed-dim text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <p className="font-m3-headline-md text-m3-headline-md font-bold">سجّل الدخول لعرض رصيد نقاطك</p>
              <Link href="/auth/login" className="w-full h-[50px] rounded-full bg-m3-surface-container-lowest text-m3-on-surface font-m3-headline-md text-m3-headline-md flex items-center justify-center font-bold">تسجيل الدخول</Link>
            </div>
          ) : loading ? (
            <div className="rounded-3xl bg-m3-inverse-surface/90 h-56 animate-pulse" />
          ) : loyalty && tp ? (
            <div className="rounded-3xl bg-m3-inverse-surface text-m3-inverse-on-surface p-5 shadow-lg relative overflow-hidden">
              <div className="absolute -top-12 -end-12 w-44 h-44 rounded-full bg-m3-primary-container/20 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-m3-surface-container-highest/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-m3-primary-fixed-dim text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-m3-headline-md text-m3-headline-md font-bold text-m3-inverse-on-surface">عضو {tp.current.ar}</span>
                        <span className="font-m3-label-sm text-m3-label-sm text-m3-secondary-fixed-dim tracking-wider uppercase">{tp.current.en} VIP</span>
                      </div>
                      {memberId && <span className="font-m3-body-sm text-m3-body-sm text-m3-outline-variant">المعرف: #MRV-{memberId}</span>}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-m3-primary-container text-m3-on-primary font-m3-label-sm text-m3-label-sm">نشط</span>
                </div>
                <div className="bg-m3-inverse-surface/60 rounded-2xl p-4 flex items-end justify-between">
                  <div>
                    <span className="font-m3-body-sm text-m3-body-sm text-m3-outline-variant block mb-1">الرصيد المتاح حالياً</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-m3-price-display text-m3-headline-xl font-bold text-m3-inverse-on-surface tracking-tight">{fmt(loyalty.points)}</span>
                      <span className="font-m3-label-md text-m3-label-md text-m3-primary-fixed-dim">نقطة</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="font-m3-body-sm text-m3-body-sm text-m3-outline-variant block mb-0.5">إجمالي ما كسبته</span>
                    <span className="font-m3-price-display text-m3-price-display font-bold text-m3-inverse-on-surface">{fmt(loyalty.totalEarned)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-m3-body-sm text-m3-body-sm">
                    <span className="text-m3-outline-variant">{tp.next ? `باقي ${fmt(tp.remaining)} نقطة للوصول للمستوى ${tp.next.ar}` : "وصلت لأعلى مستوى 👑"}</span>
                    <span className="font-m3-label-md text-m3-label-md text-m3-primary-fixed-dim font-bold">{tp.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-m3-surface-container-highest/20 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-m3-primary-container to-m3-primary-fixed-dim rounded-full transition-all duration-500" style={{ width: `${tp.pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="px-m3-margin space-y-3">
          <div>
            <h2 className="font-m3-headline-md text-m3-headline-md font-bold text-m3-on-surface">كيف تجمع النقاط؟</h2>
            <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant">خطوات بسيطة تضاعف رصيدك فوراً</p>
          </div>
          <div className="bg-m3-surface-container-lowest rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-m3-secondary-container flex items-center justify-center text-m3-primary-container shrink-0">
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface font-semibold truncate">مع كل طلب شراء</h3>
                <span className="font-m3-label-sm text-m3-label-sm text-m3-primary-container bg-m3-primary-fixed/40 px-2 py-0.5 rounded-full shrink-0">1 نقطة / 1 ج.م</span>
              </div>
              <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant mt-0.5">تضاف النقاط لمحفظتك تلقائياً بعد إتمام الطلب.</p>
            </div>
          </div>
        </section>

        <section className="px-m3-margin space-y-3">
          <div>
            <h2 className="font-m3-headline-md text-m3-headline-md font-bold text-m3-on-surface">مستويات العضوية ومزاياها</h2>
            <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant">كلما زادت مشترياتك، ارتقيت لمستوى أعلى</p>
          </div>
          <div className="space-y-2.5">
            {TIERS.map((t, i) => {
              const cur = tp?.current.key === t.key
              const next = TIERS[i + 1]
              const range = next ? `${fmt(t.min)} - ${fmt(next.min - 1)} نقطة` : `${fmt(t.min)}+ نقطة`
              return (
                <div key={t.key} className={`bg-m3-surface-container-lowest rounded-2xl p-4 shadow-sm relative overflow-hidden ${cur ? "ring-2 ring-primary-container" : ""}`}>
                  {cur && <div className="absolute top-0 end-0 bg-m3-primary-container text-m3-on-primary font-m3-label-sm text-m3-label-sm px-3 py-1 rounded-es-xl font-bold">مستواك الحالي</div>}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${t.key === "gold" ? "bg-tertiary-container" : t.key === "silver" ? "bg-primary-container" : t.key === "platinum" ? "bg-inverse-surface" : "bg-secondary"}`} />
                      <span className="font-m3-headline-md text-m3-headline-md font-bold text-m3-on-surface">المستوى {t.ar}</span>
                      <span className="font-m3-label-sm text-m3-label-sm text-m3-on-surface-variant uppercase">{t.en}</span>
                    </div>
                    <span className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant">{range}</span>
                  </div>
                  {BENEFITS[t.key] && (
                    <ul className="space-y-1.5 font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant pe-2">
                      {BENEFITS[t.key].map(([icon, text]) => (
                        <li key={text} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-m3-primary">{icon}</span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {authed && (
          <section className="px-m3-margin space-y-3">
            <h2 className="font-m3-headline-md text-m3-headline-md font-bold text-m3-on-surface">سجل النقاط</h2>
            {txs.length === 0 ? (
              <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant">لا توجد حركات نقاط بعد.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {txs.map((x) => (
                  <div key={x._id} className="bg-m3-surface-container-lowest rounded-2xl p-3 shadow-sm flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="font-m3-label-md text-m3-label-md font-bold text-m3-on-surface block">{SOURCES[x.source] || x.source}</span>
                      <span className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant">{new Date(x.createdAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                    <span className={`font-m3-price-display text-m3-label-lg font-bold ${x.points >= 0 ? "text-primary" : "text-error"}`} dir="ltr">
                      {x.points > 0 ? "+" : ""}{fmt(x.points)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="px-m3-margin pt-2">
          <div className="bg-m3-surface-container-lowest p-4 rounded-3xl shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-m3-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <div>
                <span className="font-m3-headline-md text-m3-headline-md font-bold text-m3-on-surface block leading-tight">استعد للإطلاق القادم</span>
                <span className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant">كل طلب يقرّبك من المستوى التالي</span>
              </div>
            </div>
            <Link href="/products" className="px-6 h-[48px] rounded-full bg-m3-primary-container hover:bg-m3-primary text-m3-on-primary font-m3-headline-md text-m3-headline-md font-bold shrink-0 flex items-center shadow-md">ابدأ التسوق</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
