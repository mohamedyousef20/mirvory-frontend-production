"use client"

import { CheckCircle2, MapPin, Phone, RefreshCcw, Store, Truck, Copy } from "lucide-react"
import { toast } from "sonner"
import { normalizeEgyptianPhone } from "@/lib/whatsapp"
import { WhatsAppIcon } from "@/components/whatsapp-help-button"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"
import { cn } from "@/lib/utils"

export interface Shipment {
  courier?: string | null
  waybillNumber?: string | null
  currentStation?: string | null
  currentStatus?: string | null
  courierAgent?: { name?: string | null; phone?: string | null } | null
  branch?: { name?: string | null; manager?: string | null; phone?: string | null } | null
  route?: { label?: string; station?: string; note?: string }[]
  events?: { status?: string; title: string; description?: string; station?: string; occurredAt?: string }[]
  lastCheckedAt?: string | null
}

export function hasShipmentData(s?: Shipment | null): boolean {
  return Boolean(s && (s.waybillNumber || s.currentStatus || (s.events && s.events.length)))
}

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) : ""
const fmtTime = (d?: string) =>
  d ? new Date(d).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : ""

export function ShipmentTracker({ shipment, orderNumber }: { shipment: Shipment; orderNumber?: string }) {
  const events = [...(shipment.events || [])].sort(
    (a, b) => new Date(b.occurredAt || 0).getTime() - new Date(a.occurredAt || 0).getTime()
  )
  const agentPhone = shipment.courierAgent?.phone || ""
  const agentWa = normalizeEgyptianPhone(agentPhone)

  const copyWaybill = async () => {
    if (!shipment.waybillNumber) return
    try {
      await navigator.clipboard.writeText(shipment.waybillNumber)
      toast.success("تم نسخ رقم البوليصة")
    } catch {
      toast.error("تعذر النسخ")
    }
  }

  return (
    <section className="space-y-4" dir="rtl" aria-label="تتبع الشحنة">
      {/* Header card */}
      <div className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {shipment.waybillNumber && (
              <button onClick={copyWaybill} className="flex items-center gap-1.5 text-xs opacity-90">
                بوليصة #{shipment.waybillNumber}
                <Copy className="h-3 w-3" />
              </button>
            )}
            <p className="text-lg font-bold">{shipment.currentStatus || "قيد المتابعة"}</p>
            {shipment.courier && <p className="text-xs opacity-80">{shipment.courier}</p>}
          </div>
          <Truck className="h-8 w-8 opacity-80" />
        </div>
        {shipment.currentStation && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span className="opacity-80">المحطة الحالية:</span>
            <span className="font-semibold">{shipment.currentStation}</span>
          </div>
        )}
        {shipment.lastCheckedAt && (
          <p className="mt-2 flex items-center gap-1 text-[11px] opacity-75">
            <RefreshCcw className="h-3 w-3" /> آخر تحديث: {fmtDate(shipment.lastCheckedAt)} {fmtTime(shipment.lastCheckedAt)}
          </p>
        )}
      </div>

      {/* Transit summary */}
      {!!shipment.route?.length && (
        <div className="rounded-2xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold">ملخص محطات العبور</h3>
          <ol className="space-y-3">
            {shipment.route.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{r.label}</p>
                  {r.station && <p className="text-sm">{r.station}</p>}
                  {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Timeline */}
      {!!events.length && (
        <div className="rounded-2xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold">سجل الشحنة وتتبع الخطوات</h3>
          <ol className="relative space-y-5 border-s-2 border-muted ps-5">
            {events.map((e, i) => (
              <li key={i} className="relative">
                <span
                  className={cn(
                    "absolute -start-[1.85rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-bold">{e.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{fmtTime(e.occurredAt)}</span>
                </div>
                {e.description && <p className="mt-0.5 text-xs text-muted-foreground">{e.description}</p>}
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {fmtDate(e.occurredAt)}
                  {e.station ? ` • ${e.station}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Courier + branch */}
      {(shipment.courierAgent?.name || shipment.branch?.name) && (
        <div className="space-y-3 rounded-2xl border bg-card p-4">
          {shipment.courierAgent?.name && (
            <div>
              <p className="text-sm font-bold">{shipment.courierAgent.name}</p>
              <p className="text-xs text-muted-foreground">مندوب التوصيل{agentPhone ? ` • ${agentPhone}` : ""}</p>
            </div>
          )}
          {shipment.branch?.name && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Store className="mt-0.5 h-4 w-4" />
              <span>
                {shipment.branch.name}
                {shipment.branch.manager ? ` (مسؤول الفرع: ${shipment.branch.manager})` : ""}
                {shipment.branch.phone ? ` • ${shipment.branch.phone}` : ""}
              </span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {shipment.branch?.phone && (
              <a href={`tel:${shipment.branch.phone}`} className="flex h-10 items-center justify-center gap-1 rounded-xl border text-xs font-semibold">
                <Phone className="h-3.5 w-3.5" /> الفرع
              </a>
            )}
            {agentPhone && (
              <a href={`tel:${agentPhone}`} className="flex h-10 items-center justify-center gap-1 rounded-xl border text-xs font-semibold">
                <Phone className="h-3.5 w-3.5" /> المندوب
              </a>
            )}
            {agentWa && (
              <a
                href={`https://wa.me/${agentWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center justify-center gap-1 rounded-xl bg-[#25D366] text-xs font-semibold text-white"
              >
                <WhatsAppIcon className="h-4 w-4" /> واتساب
              </a>
            )}
          </div>
        </div>
      )}

      {/* Change delivery time / address via WhatsApp */}
      <a
        href={buildSupportWhatsAppUrl(`مرحبًا، أرغب في تعديل موعد أو عنوان الاستلام للطلب ${orderNumber || ""}`.trim())}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-2xl border bg-card p-4"
      >
        <span>
          <span className="block text-sm font-bold">تعديل موعد الاستلام أو العنوان</span>
          <span className="block text-xs text-muted-foreground">أرسل لنا طلب التعديل عبر واتساب</span>
        </span>
        <WhatsAppIcon className="h-6 w-6 text-[#25D366]" />
      </a>
    </section>
  )
}
