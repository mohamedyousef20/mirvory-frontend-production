"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Shipment } from "./shipment-tracker"
import { STAGES, cleanEvents, groupByDay, reachedStage, isReturned } from "@/lib/shipment-timeline"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"

const fmtTime = (d?: string) => (d ? new Date(d).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "")
const ic = "material-symbols-outlined"

/** Customer-facing shipment tracking in the new design: current status, step bar, events grouped by day. */
export function ShipmentTimeline({ shipment, orderNumber, deliveryStatus, createdAt }: { shipment?: Shipment | null; orderNumber?: string; deliveryStatus?: string; createdAt?: string }) {
  const [all, setAll] = useState(false)
  const events = cleanEvents(shipment?.events)
  const returned = isReturned(events)
  const reached = reachedStage(events, deliveryStatus, Boolean(shipment && (shipment.waybillNumber || events.length)))
  const latest = events[0]
  const headline = returned ? (events.some((e) => e.kind === "return_done") ? "تم استلام المرتجع" : "الشحنة راجعة إلى المرسل") : STAGES[reached].label
  const shown = all ? events : events.slice(0, 6)
  const groups = groupByDay(shown)
  const copy = async () => { try { await navigator.clipboard.writeText(shipment?.waybillNumber || ""); toast.success("تم نسخ رقم الشحنة") } catch { toast.error("تعذر النسخ") } }

  return (
    <section dir="rtl" className="space-y-4 font-[Cairo,sans-serif]" aria-label="تتبع الشحنة">
      <div className={`rounded-[1.25rem] p-5 text-white shadow-[0_8px_24px_rgba(0,74,198,0.18)] ${returned ? "bg-gradient-to-br from-slate-700 to-slate-900" : "bg-gradient-to-br from-[#004ac6] to-[#2563eb]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs opacity-80">حالة الشحنة</p>
            <h3 className="text-2xl font-black mt-0.5">{headline}</h3>
            {latest && <p className="text-xs opacity-85 mt-1">آخر تحديث {latest.day} {fmtTime(latest.at)}{latest.city ? ` • ${latest.city}` : ""}</p>}
          </div>
          <span className={`${ic} text-[34px] opacity-90`}>{returned ? "assignment_return" : STAGES[reached].icon}</span>
        </div>
        {(shipment?.courier || shipment?.waybillNumber) && (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs">
            <span>{shipment?.courier || "شركة الشحن"}</span>
            {shipment?.waybillNumber && <button onClick={copy} className="flex items-center gap-1 font-bold" dir="ltr">#{shipment.waybillNumber}<span className={`${ic} text-[14px]`}>content_copy</span></button>}
          </div>
        )}
      </div>

      {!returned && (
        <div className="rounded-[1.25rem] bg-white border border-slate-100 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <ol className="grid grid-cols-6 gap-1">
            {STAGES.map((s, i) => {
              const done = i <= reached, cur = i === reached
              return (
                <li key={s.key} className="flex flex-col items-center text-center gap-1.5">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? "bg-[#004ac6] text-white" : "bg-slate-100 text-slate-400"} ${cur ? "ring-4 ring-[#004ac6]/20" : ""}`}><span className={`${ic} text-[18px]`}>{done && !cur ? "check" : s.icon}</span></span>
                  <span className={`text-[10px] leading-tight ${done ? "font-bold text-slate-900" : "font-semibold text-slate-400"}`}>{s.label}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {!!events.length && (
        <div className="rounded-[1.25rem] bg-white border border-slate-100 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
          <h3 className="font-black text-slate-900 mb-4">تفاصيل الرحلة</h3>
          <div className="space-y-5">
            {groups.map((g, gi) => (
              <div key={gi}>
                <p className="text-xs font-bold text-slate-500 mb-2">{g.day}</p>
                <ol className="relative space-y-4 border-s-2 border-slate-100 ps-5">
                  {g.items.map((e, i) => {
                    const first = gi === 0 && i === 0
                    return (
                      <li key={i} className="relative">
                        <span className={`absolute -start-[1.65rem] top-0.5 w-4 h-4 rounded-full border-2 border-white ${first ? "bg-[#004ac6] ring-4 ring-[#004ac6]/15" : "bg-slate-300"}`} />
                        <div className="flex items-baseline justify-between gap-2">
                          <p className={`text-sm ${first ? "font-black text-slate-900" : "font-bold text-slate-700"}`}>{e.title}</p>
                          <span className="text-[11px] text-slate-400 shrink-0">{fmtTime(e.at)}</span>
                        </div>
                        {e.city && <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><span className={`${ic} text-[14px]`}>location_on</span>{e.city}</p>}
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </div>
          {events.length > 6 && <button onClick={() => setAll((v) => !v)} className="mt-4 text-sm font-bold text-[#004ac6]">{all ? "عرض أقل" : `عرض كل التحديثات (${events.length})`}</button>}
        </div>
      )}

      <a href={buildSupportWhatsAppUrl(`مرحبًا، عندي استفسار عن شحنة الطلب ${orderNumber || ""}`.trim())} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[1.25rem] bg-white border border-slate-100 p-4">
        <span><span className="block text-sm font-bold text-slate-900">محتاج مساعدة في الشحنة؟</span><span className="block text-xs text-slate-500">كلمنا على واتساب وهنتابع مع شركة الشحن</span></span>
        <span className={`${ic} text-[#25D366] text-[28px]`}>chat</span>
      </a>
    </section>
  )
}
