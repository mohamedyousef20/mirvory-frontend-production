"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { loyaltyService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { EGP_PER_100_POINTS, MIN_REDEEM_POINTS, MAX_REDEEM_SHARE, pointsToEgp } from "@/lib/loyalty-rules"

type Tx = { _id: string; type: "earned" | "redeemed" | "adjusted"; points: number; source: string; description?: string; createdAt: string }

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
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

  const memberId = user?._id || user?.id ? String(user._id || user.id).slice(-6).toUpperCase() : ""

  return (
    <div dir="rtl" className="md:max-w-2xl md:mx-auto md:pt-6 flex flex-col w-full pb-24 bg-[#f7f9fb] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] min-h-screen">
      <div className="flex flex-col w-full pb-10 space-y-6">
        <section className="px-[1rem] pt-2">
          <div className="relative overflow-hidden rounded-3xl bg-[#f2f4f6] p-6 shadow-sm flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[9999px] bg-[#dae2fd] text-[#5c647a] self-start">
              <span className="material-symbols-outlined text-base text-[#2563eb]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600]">نادي ميرفوري</span>
            </div>
            <h1 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[26px] leading-[34px] tracking-[-0.02em] font-[700] text-[#191c1e] leading-tight font-bold">كل طلب بيرجعلك نقاط تخصمها من طلبك الجاي</h1>
            <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#434655] max-w-[280px]">نظام نقاط بسيط: اجمع نقطة مع كل 5 جنيه تدفعها، واستخدم رصيدك كخصم عند الدفع.</p>
          </div>
        </section>

        <section className="px-[1rem]">
          {!authed ? (
            <div className="rounded-3xl bg-[#2d3133] text-[#eff1f3] p-5 shadow-lg flex flex-col gap-3 items-center text-center">
              <span className="material-symbols-outlined text-[#b4c5ff] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <p className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold">سجّل الدخول لعرض رصيد نقاطك</p>
              <Link href="/auth/login" className="w-full h-[50px] rounded-[9999px] bg-[#ffffff] text-[#191c1e] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] flex items-center justify-center font-bold">تسجيل الدخول</Link>
            </div>
          ) : loading ? (
            <div className="rounded-3xl bg-[#2d3133]/90 h-56 animate-pulse" />
          ) : loyalty ? (
            <div className="rounded-3xl bg-[#2d3133] text-[#eff1f3] p-5 shadow-lg relative overflow-hidden">
              <div className="absolute -top-12 -end-12 w-44 h-44 rounded-[9999px] bg-[#2563eb]/20 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[9999px] bg-[#e0e3e5]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#b4c5ff] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold text-[#eff1f3]">رصيد نقاطك</span>
                      </div>
                      {memberId && <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#c3c6d7]">المعرف: #MRV-{memberId}</span>}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-[9999px] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">نشط</span>
                </div>
                <div className="bg-[#2d3133]/60 rounded-2xl p-4 flex items-end justify-between">
                  <div>
                    <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#c3c6d7] block mb-1">الرصيد المتاح حالياً</span>
                    <div className="flex items-baseline gap-2">
                      <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[32px] leading-[40px] tracking-[-0.03em] font-[700] font-bold text-[#eff1f3] tracking-tight">{fmt(loyalty.points)}</span>
                      <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#b4c5ff]">نقطة</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#c3c6d7] block mb-0.5">إجمالي ما كسبته</span>
                    <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[20px] leading-[26px] tracking-[-0.02em] font-[700] font-bold text-[#eff1f3]">{fmt(loyalty.totalEarned)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#e0e3e5]/10 px-4 py-3">
                  <span className="text-[12px] text-[#c3c6d7]">قيمة رصيدك كخصم</span>
                  <span className="text-[16px] font-bold text-[#b4c5ff]">{fmt(pointsToEgp(loyalty.points))} ج.م</span>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="px-[1rem] space-y-3">
          <div>
            <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold text-[#191c1e]">كيف تجمع النقاط؟</h2>
            <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655]">خطوات بسيطة تضاعف رصيدك فوراً</p>
          </div>
          <div className="bg-[#ffffff] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#dae2fd] flex items-center justify-center text-[#2563eb] shrink-0">
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] font-semibold truncate">مع كل طلب شراء</h3>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#2563eb] bg-[#dbe1ff]/40 px-2 py-0.5 rounded-[9999px] shrink-0">1 نقطة / 5 ج.م</span>
              </div>
              <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655] mt-0.5">تضاف النقاط لمحفظتك تلقائياً بعد إتمام الطلب.</p>
            </div>
          </div>
        </section>

        <section className="px-[1rem] space-y-3">
          <div>
            <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold text-[#191c1e]">إزاي تستخدم نقاطك؟</h2>
            <p className="text-[12px] leading-[18px] text-[#434655]">من غير مستويات ولا شروط معقدة</p>
          </div>
          <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm flex flex-col gap-3 text-[13px] text-[#191c1e]">
            <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#004ac6]">payments</span><span>كل 100 نقطة = {EGP_PER_100_POINTS} ج.م خصم</span></div>
            <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#004ac6]">shopping_cart_checkout</span><span>فعّل "استخدم نقاطي" في صفحة الدفع</span></div>
            <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#004ac6]">lock_open</span><span>أقل استخدام {fmt(MIN_REDEEM_POINTS)} نقطة، وحتى {Math.round(MAX_REDEEM_SHARE * 100)}% من قيمة الطلب</span></div>
          </div>
        </section>

        {authed && (
          <section className="px-[1rem] space-y-3">
            <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold text-[#191c1e]">سجل النقاط</h2>
            {txs.length === 0 ? (
              <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655]">لا توجد حركات نقاط بعد.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {txs.map((x) => (
                  <div key={x._id} className="bg-[#ffffff] rounded-2xl p-3 shadow-sm flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold text-[#191c1e] block">{SOURCES[x.source] || x.source}</span>
                      <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655]">{new Date(x.createdAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                    <span className={`[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold ${x.points >= 0 ? "text-[#004ac6]" : "text-[#ba1a1a]"}`} dir="ltr">
                      {x.points > 0 ? "+" : ""}{fmt(x.points)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="px-[1rem] pt-2">
          <div className="bg-[#ffffff] p-4 rounded-3xl shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2563eb] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <div>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold text-[#191c1e] block leading-tight">استعد للإطلاق القادم</span>
                <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655]">كل طلب بيزوّد رصيد نقاطك</span>
              </div>
            </div>
            <Link href="/products" className="px-6 h-[48px] rounded-[9999px] bg-[#2563eb] hover:bg-[#004ac6] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold shrink-0 flex items-center shadow-md">ابدأ التسوق</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
