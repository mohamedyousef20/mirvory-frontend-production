"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { orderService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { normalizeEgyptianPhone } from "@/lib/whatsapp"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"
import { cleanEvents } from "@/lib/shipment-timeline"
import { hasShipmentData, type Shipment } from "@/components/orders/shipment-tracker"

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const day = (d?: string) => (d ? new Date(d).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) : "")
const time = (d?: string) => (d ? new Date(d).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "")

const STATUS_AR: Record<string, string> = {
  pending: "قيد المراجعة",
  processing: "جاري تجهيز الطلب",
  shipped: "تم شحن الطلب",
  delivered: "تم التوصيل بنجاح",
  cancelled: "ملغي",
  returned: "مرتجع",
}

export function TrackingMobile() {
  const { user, cookiesReady } = useAuth()
  const authed = Boolean(user)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      const r: any = await orderService.getUserOrders()
      setOrders(r.data?.data ?? [])
    } catch {
      toast.error("تعذر تحميل الطلبات")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!cookiesReady) return
    if (!authed) return setLoading(false)
    load()
  }, [authed, cookiesReady, load])

  const sorted = useMemo(() => [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [orders])
  const active = sorted.find((o) => ["pending", "processing", "shipped"].includes(o.deliveryStatus) && hasShipmentData(o.shipment)) || sorted.find((o) => ["pending", "processing", "shipped"].includes(o.deliveryStatus))
  const done = sorted.filter((o) => o.deliveryStatus === "delivered" && o._id !== active?._id)
  const sh: Shipment | null = active?.shipment && hasShipmentData(active.shipment) ? active.shipment : null
  const events = sh ? cleanEvents(sh.events).map((e) => ({ status: e.kind, title: e.title, description: "", station: e.city, occurredAt: e.at })) : []
  const agentPhone = "" // courier phone numbers are not shown to customers
  const agentWa = normalizeEgyptianPhone(agentPhone)
  const item = active?.items?.[0]
  const orderNo = active ? active.orderNumber || active._id.slice(-6).toUpperCase() : ""

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v)
      toast.success("تم نسخ رقم البوليصة")
    } catch {
      toast.error("تعذر النسخ")
    }
  }

  if (!authed && !loading)
    return (
      <div dir="rtl" className="md:hidden min-h-screen bg-[#f7f9fb] px-[1rem] pt-[2.25rem] text-center flex flex-col items-center gap-[0.5rem]">
        <span className="material-symbols-outlined text-[48px] text-[#737686]">local_shipping</span>
        <p className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">سجّل الدخول لتتبع طلباتك</p>
        <Link href="/auth/login" className="px-6 py-3 rounded-[9999px] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold">تسجيل الدخول</Link>
      </div>
    )

  return (
    <div dir="rtl" className="md:hidden flex flex-col w-full bg-[#f7f9fb] min-h-screen pb-24 [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif]">
      {loading ? (
        <div className="px-[1rem] pt-2 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-[#f2f4f6] animate-pulse" />)}</div>
      ) : !active ? (
        <div className="px-[1rem] pt-[2.25rem] text-center flex flex-col items-center gap-[0.5rem]">
          <span className="material-symbols-outlined text-[48px] text-[#737686]">inventory_2</span>
          <p className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">لا توجد طلبات قيد الشحن حالياً</p>
          <Link href="/products" className="px-6 py-3 rounded-[9999px] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <section className="px-[1rem] pt-2 pb-3">
            <div className="bg-[#ffffff] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] truncate">{sh?.waybillNumber ? `بوليصة #${sh.waybillNumber}` : `طلب #${orderNo}`}</span>
                    {sh?.waybillNumber && (
                      <button aria-label="نسخ رقم البوليصة" onClick={() => copy(sh.waybillNumber!)} className="text-[#434655] hover:text-[#004ac6] p-1">
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {sh?.courier && <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#004ac6] font-bold">{sh.courier}</span>}
                    <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655]">• {day(active.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dae2fd] text-[#131b2e] rounded-[9999px] shadow-sm shrink-0">
                  <span className="w-2 h-2 rounded-[9999px] bg-[#004ac6] animate-ping" />
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] font-bold">{sh?.currentStatus || STATUS_AR[active.deliveryStatus]}</span>
                </div>
              </div>
              {(sh?.currentStatus || sh?.currentStation) && (
                <div className="bg-[#004ac6]/5 rounded-[0.75rem] p-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-[9999px] bg-[#004ac6] flex items-center justify-center text-[#ffffff] shrink-0">
                      <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                    </div>
                    <div className="min-w-0">
                      <p className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#004ac6] font-semibold">الحالة الميدانية الآن</p>
                      <p className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] truncate">{sh?.currentStatus || STATUS_AR[active.deliveryStatus]}</p>
                    </div>
                  </div>
                  {sh?.currentStation && (
                    <div className="text-left min-w-0">
                      <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] block">المحطة الحالية</span>
                      <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#191c1e] font-semibold">{sh.currentStation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {sh && (
            <section className="px-[1rem] py-2">
              <div className="bg-[#ffffff] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#004ac6] text-[22px]">local_shipping</span>
                    <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">مسار الشحنة ومحطة التسليم</h3>
                  </div>
                  <button onClick={() => load(true)} className="flex items-center gap-1.5 px-3 py-1 rounded-[9999px] bg-[#eceef0] text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
                    <span className={`material-symbols-outlined text-[14px] ${refreshing ? "animate-spin" : ""}`}>sync</span>
                    <span>تحديث الحالة</span>
                  </button>
                </div>
                {sh.lastCheckedAt && <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] block">آخر فحص: {time(sh.lastCheckedAt)}</span>}
                {!!sh.route?.length && (
                  <div className="space-y-2 pt-1">
                    <p className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] uppercase tracking-wider">ملخص محطات العبور والشحن (Transit Summary)</p>
                    <div className="grid grid-cols-1 gap-2">
                      {sh.route.map((r, i) => {
                        const last = i === sh.route!.length - 1
                        return (
                          <div key={i} className={`bg-[#f2f4f6] p-3 rounded-[0.75rem] ${last ? "border border-[#004ac6]/20" : ""}`}>
                            <div className={`flex items-center gap-2 mb-1 ${last ? "text-[#004ac6]" : "text-[#565e74]"}`}>
                              <span className="material-symbols-outlined text-[16px]">{i === 0 ? "inventory_2" : last ? "local_shipping" : "hub"}</span>
                              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-semibold">{i + 1}. {r.label}</span>
                            </div>
                            <p className={`[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] font-semibold ${last ? "text-[#004ac6]" : "text-[#191c1e]"}`}>{r.station}</p>
                            {r.note && <span className="text-[11px] text-[#434655] block mt-0.5">{r.note}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {item && (
            <section className="px-[1rem] py-2">
              <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm">
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] uppercase tracking-wider block mb-3">تفاصيل المنتج</span>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-[0.75rem] bg-[#f2f4f6] shrink-0 p-2 overflow-hidden flex items-center justify-center">
                    {item.image && <img loading="lazy" decoding="async" alt={item.title} className="w-full h-full object-contain" src={normalizeImageUrl(item.image, "thumbnail")} />}
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] truncate">{item.title || item.product?.title}</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.size && <span className="px-2 py-0.5 rounded-md bg-[#eceef0] text-[#191c1e] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">مقاس {item.size}</span>}
                        {item.color?.name && <span className="px-2 py-0.5 rounded-md bg-[#e6e8ea] text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">{item.color.name}</span>}
                        {active.items.length > 1 && <span className="px-2 py-0.5 rounded-md bg-[#e6e8ea] text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">+{active.items.length - 1} منتجات</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[20px] leading-[26px] tracking-[-0.02em] font-[700] text-[#004ac6] font-bold">{fmt(active.total)}</span>
                        <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] text-[#434655]">ج.م</span>
                      </div>
                      <Link href={`/orders/${active._id}`} className="flex items-center gap-1 text-[#565e74] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] bg-[#eceef0] px-2 py-1 rounded-md">
                        <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                        <span>تفاصيل الطلب</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {!!events.length && (
            <section className="px-[1rem] py-2">
              <div className="bg-[#ffffff] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">سجل الشحنة وتتبع الخطوات</h3>
                  {sh?.waybillNumber && <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] bg-[#004ac6]/10 px-2.5 py-1 rounded-[9999px] font-bold">{sh.waybillNumber}</span>}
                </div>
                <div className="relative space-y-5 pe-1">
                  {events.map((e, i) => {
                    const first = i === 0
                    return (
                      <div key={i} className="relative flex items-start gap-3">
                        <div className={`relative z-10 w-8 h-8 rounded-[9999px] flex items-center justify-center shrink-0 ${first ? "bg-[#004ac6] text-[#ffffff] shadow-md ring-4 ring-[#004ac6]/20" : "bg-[#565e74] text-[#ffffff] shadow-sm"}`}>
                          <span className="material-symbols-outlined text-[18px]">{first ? "local_shipping" : "check_circle"}</span>
                        </div>
                        <div className={`flex-1 pt-0.5 ${first ? "bg-[#f2f4f6] p-3 rounded-[0.75rem] border border-[#004ac6]/20" : ""}`}>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] ${first ? "text-[#004ac6] font-bold" : "text-[#191c1e]"}`}>{e.title}</p>
                            <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] shrink-0">{time(e.occurredAt)}</span>
                          </div>
                          {e.description && <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655] mt-0.5">{e.description}</p>}
                          <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] block mt-0.5">{day(e.occurredAt)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {(sh?.courierAgent?.name || sh?.courierAgent?.phone || sh?.branch?.name) && (
            <section className="px-[1rem] py-2">
              <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm space-y-3">
                {(sh?.courierAgent?.name || sh?.courierAgent?.phone) && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[9999px] bg-[#e6e8ea] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#004ac6] text-[28px]">person</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">{sh.courierAgent?.name || "المندوب"}</h4>
                        <span className="material-symbols-outlined text-[#004ac6] text-[16px]">verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#434655] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400]">
                        <span className="text-[#004ac6] font-semibold">المندوب اللي هيوصّل طلبك</span>
                        {agentPhone && <span>• هاتف: {agentPhone}</span>}
                      </div>
                    </div>
                  </div>
                )}
                {sh?.branch?.name && (
                  <div className="bg-[#f2f4f6] rounded-[0.75rem] p-3 flex items-center justify-between text-[#434655] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[#004ac6] text-[18px]">store</span>
                      <div className="min-w-0">
                        <span className="font-semibold text-[#191c1e] block truncate">{sh.branch.name}{sh.branch.manager ? ` (مسؤول الفرع: ${sh.branch.manager})` : ""}</span>
                        {sh.branch.phone && <span>خدمة العملاء والفرع: {sh.branch.phone}</span>}
                      </div>
                    </div>
                    {sh.branch.phone && (
                      <a href={`tel:${sh.branch.phone}`} className="px-2.5 py-1 rounded-[0.5rem] bg-[#eceef0] text-[#191c1e] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-semibold flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>اتصال بالفرع</span>
                      </a>
                    )}
                  </div>
                )}
                {agentPhone && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a href={`tel:${agentPhone}`} className="flex items-center justify-center gap-2 py-3 px-4 rounded-[0.75rem] bg-[#eceef0] text-[#191c1e] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600]">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span>اتصال بالمندوب</span>
                    </a>
                    {agentWa && (
                      <a href={`https://wa.me/${agentWa}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 px-4 rounded-[0.75rem] bg-[#004ac6] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        <span>واتساب المندوب</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {done.length > 0 && (
        <section className="px-[1rem] pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">سجل الطلبات السابقة</h3>
              <p className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655]">طلباتك المكتملة</p>
            </div>
            <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] font-bold">{done.length} طلبات مكتملة</span>
          </div>
          {done.slice(0, 6).map((o) => {
            const it = o.items?.[0]
            return (
              <div key={o._id} className="bg-[#ffffff] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3 min-w-0">
                    <div className="w-16 h-16 rounded-[0.75rem] bg-[#f2f4f6] flex items-center justify-center p-1.5 shrink-0">
                      {it?.image && <img loading="lazy" decoding="async" alt={it.title} className="w-full h-full object-contain" src={normalizeImageUrl(it.image, "thumbnail")} />}
                    </div>
                    <div className="min-w-0">
                      <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] block truncate">{it?.title || it?.product?.title}</span>
                      <span className="[font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655] block">طلب #{o.orderNumber || o._id.slice(-6).toUpperCase()}{it?.size ? ` • مقاس ${it.size}` : ""}</span>
                      <div className="flex items-center gap-1.5 mt-1 text-emerald-600 [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>تم التوصيل ({day(o.deliveredAt || o.updatedAt)})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[20px] leading-[26px] tracking-[-0.02em] font-[700] text-[#191c1e] block">{fmt(o.total)}</span>
                    <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655]">ج.م</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {it?.product?._id && (
                    <Link href={`/products/${it.product._id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[0.75rem] bg-[#dae2fd] text-[#131b2e] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                      <span>طلب نفس الموديل</span>
                    </Link>
                  )}
                  <Link href={`/orders/${o._id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[0.75rem] bg-[#eceef0] text-[#191c1e] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    <span>تفاصيل / إرجاع</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </section>
      )}

      <footer className="px-[1rem] pt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[9999px] bg-[#eceef0] text-[#434655] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400]">
          <span className="material-symbols-outlined text-[#004ac6] text-[18px]">verified</span>
          <span>بيانات التتبع من شركة الشحن</span>
        </div>
      </footer>
    </div>
  )
}
