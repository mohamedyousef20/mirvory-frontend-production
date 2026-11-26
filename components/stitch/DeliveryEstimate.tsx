"use client"

import { useState } from "react"
import { DELIVERY_NOTE, DELIVERY_ZONES, zoneFor } from "@/lib/delivery-times"
import { GREATER_CAIRO_AREA } from "@/lib/data/greater-cairo-area"

/** Delivery time in hours: pick a governorate for a direct answer, or see the four regions. Used on product page and cart. */
export function DeliveryEstimate({ initialGovernorate = "", className = "" }: { initialGovernorate?: string; className?: string }) {
  const [gov, setGov] = useState(initialGovernorate)
  const zone = zoneFor(gov)
  return (
    <div dir="rtl" className={`rounded-2xl border border-slate-100 bg-white p-3.5 [font-family:var(--font-cairo),Cairo,sans-serif] ${className}`}>
      <div className="flex items-center gap-2 text-[13px] font-extrabold text-slate-900">
        <span className="material-symbols-outlined text-[18px] text-[#004ac6]">schedule</span>
        مدة التوصيل المتوقعة
      </div>
      <select
        aria-label="المحافظة"
        value={gov}
        onChange={(e) => setGov(e.target.value)}
        className="mt-2.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-800"
      >
        <option value="">اختر محافظتك</option>
        {GREATER_CAIRO_AREA.map((g: any) => (
          <option key={g.id} value={g.id}>{g.nameAr}</option>
        ))}
      </select>
      {zone && (
        <p className="mt-2 rounded-xl bg-[#dae2fd]/40 px-3 py-2 text-[13px] font-bold text-[#004ac6]">
          التوصيل لمحافظتك خلال {zone.hours}
        </p>
      )}
      <ul className="mt-2.5 space-y-1.5">
        {DELIVERY_ZONES.map((z) => (
          <li key={z.key} className={`flex items-start justify-between gap-3 text-[12px] ${zone?.key === z.key ? "font-extrabold text-slate-900" : "text-slate-600"}`}>
            <span>{z.label}</span>
            <span className="shrink-0 font-bold text-slate-800">{z.hours}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-slate-400">{DELIVERY_NOTE}</p>
    </div>
  )
}
