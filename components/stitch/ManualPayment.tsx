"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { manualPaymentService, type PaymentInfo } from "@/lib/api"

export type ManualMethod = "instapay" | "wallet"

const ff = "[font-family:var(--font-cairo),Cairo,sans-serif]"

function CopyRow({ label, value }: { label: string; value: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success("تم النسخ")
    } catch {
      toast.error("مقدرتش أنسخ، انسخه يدوي")
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p dir="ltr" className="break-all text-left text-[15px] font-extrabold text-slate-900">{value}</p>
      </div>
      <button type="button" onClick={copy} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[12px] font-bold text-[#004ac6] shadow-sm">
        نسخ
      </button>
    </div>
  )
}

/** Payee details for a manual transfer: InstaPay (link button + address) or Vodafone Cash (number). */
export function ManualPaymentCard({ method, amount }: { method: ManualMethod; amount?: number }) {
  const [info, setInfo] = useState<PaymentInfo | null>(null)
  useEffect(() => {
    manualPaymentService.getInfo().then((r) => setInfo(r.data?.data ?? null)).catch(() => setInfo(null))
  }, [])
  if (!info) return null
  return (
    <div dir="rtl" className={`mt-3 space-y-3 rounded-2xl border border-[#004ac6]/15 bg-white p-4 ${ff}`}>
      <p className="text-[14px] font-extrabold text-slate-900">
        {method === "instapay" ? "الدفع عبر إنستا باي" : `الدفع عبر ${info.wallet.provider}`}
      </p>
      <ol className="space-y-1 text-[12.5px] leading-6 text-slate-600">
        <li>١. حوّل {amount ? <b className="text-slate-900">{Math.round(amount).toLocaleString("en-US")} ج.م</b> : "إجمالي الطلب"} {method === "instapay" ? "من تطبيق إنستا باي" : "من المحفظة"}.</li>
        <li>٢. بعد تأكيد الطلب، ارفع صورة إيصال التحويل من صفحة الطلب.</li>
        <li>٣. بنراجع التحويل ونأكد الدفع، وتشوف الحالة في صفحة الطلب.</li>
      </ol>
      {method === "instapay" ? (
        <>
          <a
            href={info.instapay.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#004ac6] text-[14px] font-extrabold text-white"
          >
            ادفع عبر إنستا باي
          </a>
          <CopyRow label="عنوان الدفع (InstaPay address)" value={info.instapay.address} />
        </>
      ) : (
        <CopyRow label={`رقم ${info.wallet.provider}`} value={info.wallet.number} />
      )}
    </div>
  )
}

/** Receipt upload for an order paid by transfer. Logged-in: pass orderId. Guest: pass orderNumber (+ phone if known). */
export function ReceiptUpload({
  orderId, orderNumber, phone, status, hasProof, onUploaded,
}: {
  orderId?: string; orderNumber?: string; phone?: string; status?: string; hasProof?: boolean; onUploaded?: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [guestPhone, setGuestPhone] = useState(phone || "")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  if (status === "paid") {
    return <p className={`rounded-xl bg-emerald-50 px-3 py-2.5 text-[13px] font-bold text-emerald-700 ${ff}`}>تم تأكيد الدفع ✅</p>
  }
  const underReview = done || status === "under_review"

  const pick = (f?: File | null) => {
    if (!f) return
    if (!f.type.startsWith("image/")) return toast.error("ارفع صورة فقط")
    if (f.size > 8 * 1024 * 1024) return toast.error("الصورة أكبر من 8 ميجا")
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }
  const send = async () => {
    if (!file) return
    setBusy(true)
    try {
      if (orderId) await manualPaymentService.uploadProof(orderId, file)
      else await manualPaymentService.uploadGuestProof(orderNumber || "", guestPhone, file)
      setDone(true)
      setFile(null)
      toast.success("وصلنا الإيصال، هنراجعه ونأكد الدفع")
      onUploaded?.()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "فشل رفع الإيصال، جرّب تاني")
    } finally {
      setBusy(false)
    }
  }
  return (
    <div dir="rtl" className={`space-y-3 rounded-2xl border border-slate-100 bg-white p-4 ${ff}`}>
      <p className="text-[14px] font-extrabold text-slate-900">إيصال التحويل</p>
      {status === "failed" && <p className="rounded-xl bg-red-50 px-3 py-2 text-[12.5px] font-bold text-red-700">مقدرناش نأكد التحويل. ارفع إيصال واضح تاني أو كلمنا.</p>}
      {underReview && (
        <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[12.5px] font-bold text-amber-800">
          الإيصال وصل وتحت المراجعة. هتتأكد حالة الدفع هنا بعد المراجعة.
        </p>
      )}
      {!orderId && !phone && (
        <input
          dir="ltr"
          inputMode="numeric"
          placeholder="رقم الموبايل اللي سجلت بيه الطلب"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-[14px]"
        />
      )}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {preview && <img src={preview} alt="معاينة الإيصال" className="max-h-56 w-full rounded-xl border border-slate-100 object-contain" />}
      <div className="flex gap-2">
        <button type="button" onClick={() => input.current?.click()} className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-800">
          {file ? "غيّر الصورة" : underReview || hasProof ? "ارفع إيصال تاني" : "اختار صورة الإيصال"}
        </button>
        {file && (
          <button type="button" disabled={busy || (!orderId && guestPhone.replace(/\D/g, "").length < 10)} onClick={send} className="h-11 flex-1 rounded-xl bg-[#004ac6] text-[13px] font-extrabold text-white disabled:opacity-50">
            {busy ? "جاري الرفع..." : "ارفع الإيصال"}
          </button>
        )}
      </div>
    </div>
  )
}
