"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { orderService, productService, returnService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { STORE_POLICIES } from "@/lib/store-policies"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"
import { WhatsAppIcon } from "@/components/whatsapp-help-button"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

const REASONS = [
  "المقاس ضيق ومحتاج أكبر بنصف نمرة",
  "المقاس واسع ومحتاج أصغر",
  "اللون أو الموديل مختلف عن الصور",
  "عايز أغير الموديل أو اللون تماماً",
  "الحذاء غير مريح في المشي / خامة النعل",
  "وجود عيب مصنعي أو خدش في الجلد/القماش",
  "وصلني مقاس أو موديل خطأ بالطلب",
  "سبب آخر (يرجى التوضيح في الملاحظات)",
]
const METHODS = [
  { v: "instapay", icon: "send_to_mobile", t: "إنستاباي (InstaPay)", d: "تحويل على حسابك عبر عنوان الدفع", ph: "your-handle@instapay" },
  { v: "e_wallet", icon: "phone_iphone", t: "محفظة إلكترونية (فودافون كاش / أورانج / وي)", d: "تحويل رقمي على رقم هاتفك", ph: "01XXXXXXXXX" },
  { v: "cash", icon: "payments", t: "استرداد نقدي", d: "يسلمه المندوب عند استلام الحذاء", ph: "" },
] as const

const daysSince = (d?: string) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0)

export function ReturnMobile() {
  const router = useRouter()
  const sp = useSearchParams()
  const { user, cookiesReady } = useAuth()
  const authed = Boolean(user)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState(sp.get("orderId") || "")
  const [itemId, setItemId] = useState(sp.get("itemId") || "")
  const [type, setType] = useState<"exchange" | "return">("exchange")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [newSize, setNewSize] = useState("")
  const [method, setMethod] = useState<"instapay" | "e_wallet" | "cash">("instapay")
  const [account, setAccount] = useState("")
  const [address, setAddress] = useState("")
  const [slot, setSlot] = useState<"morning" | "evening">("morning")
  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!cookiesReady) return
    if (!authed) return setLoading(false)
    orderService
      .getUserOrders()
      .then((r: any) => setOrders((r.data?.data ?? []).filter((o: any) => o.deliveryStatus === "delivered" && daysSince(o.deliveredAt || o.updatedAt) <= STORE_POLICIES.returnDays)))
      .catch(() => toast.error("تعذر تحميل الطلبات"))
      .finally(() => setLoading(false))
  }, [authed, cookiesReady])

  const order = orders.find((o) => o._id === orderId)
  const item = order?.items?.find((i: any) => i._id === itemId)
  const left = order ? Math.max(0, STORE_POLICIES.returnDays - daysSince(order.deliveredAt || order.updatedAt)) : 0

  useEffect(() => {
    if (order && !address) setAddress(order.deliveryInfo?.address || "")
  }, [order]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const pid = item?.product?._id || item?.product
    if (!pid) return setSizes([])
    productService
      .getProductById(String(pid))
      .then((r: any) => {
        const p = r.data?.data ?? r.data
        const col = (p?.colors || []).find((c: any) => c.value === item.color?.value) || (p?.colors || [])[0]
        setSizes(((col?.sizes || []) as any[]).filter((s) => String(s.size) !== String(item.size)).sort((a, b) => parseFloat(a.size) - parseFloat(b.size)))
      })
      .catch(() => setSizes([]))
  }, [item])

  const submit = async () => {
    if (!order || !item) return toast.error("اختر المنتج أولاً")
    if (!reason) return toast.error("اختر سبب الاستبدال أو الإرجاع")
    if (type === "exchange" && !newSize) return toast.error("اختر المقاس البديل")
    if (type === "return" && method !== "cash" && !account.trim()) return toast.error("أدخل بيانات التحويل")
    setSending(true)
    try {
      await returnService.createReturnRequest({
        orderId: order._id,
        itemId: item._id,
        reason,
        type,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(type === "exchange" ? { exchangeSize: newSize } : { refundMethod: method, ...(account.trim() ? { refundAccount: account.trim() } : {}) }),
        preferredSlot: slot,
        ...(address.trim() ? { pickupAddress: address.trim() } : {}),
      })
      toast.success(type === "exchange" ? "تم إرسال طلب الاستبدال بنجاح" : "تم إرسال طلب الإرجاع بنجاح")
      router.push("/returns")
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "حدث خطأ أثناء إرسال الطلب")
    } finally {
      setSending(false)
    }
  }

  const picks = useMemo(() => orders.flatMap((o) => (o.items || []).map((i: any) => ({ o, i }))), [orders])

  if (!authed && !loading)
    return (
      <div dir="rtl" className="md:hidden min-h-screen bg-m3-surface px-m3-margin pt-m3-space-xl text-center flex flex-col items-center gap-m3-space-sm">
        <p className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">سجّل الدخول لطلب الاستبدال أو الإرجاع</p>
        <Link href="/auth/login" className="px-6 py-3 rounded-full bg-m3-primary-container text-m3-on-primary font-m3-label-lg text-m3-label-lg font-bold">تسجيل الدخول</Link>
      </div>
    )

  return (
    <div dir="rtl" className="md:hidden flex flex-col w-full bg-m3-surface min-h-screen font-m3-body-md pb-44">
      <div className="bg-m3-surface-container-high px-m3-margin py-m3-space-sm flex items-center justify-between text-m3-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="inline-flex w-2 h-2 rounded-full bg-m3-primary-container animate-pulse" />
          <span className="text-m3-body-sm font-semibold text-m3-on-surface">خدمة الاستبدال والإرجاع على باب بيتك</span>
        </div>
        <span className="font-m3-label-sm text-m3-label-sm text-m3-primary font-bold">سياسة {STORE_POLICIES.returnDays} يوم</span>
      </div>

      <div className="px-m3-margin flex flex-col gap-m3-space-lg mt-m3-space-md">
        {loading ? (
          <div className="h-40 rounded-2xl bg-m3-surface-container-low animate-pulse" />
        ) : !item ? (
          <section className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm flex flex-col gap-m3-space-sm">
            <h3 className="font-bold text-m3-headline-md text-m3-on-surface">اختر المنتج المراد استبداله أو إرجاعه</h3>
            {picks.length === 0 ? (
              <p className="text-m3-body-sm text-m3-on-surface-variant">لا توجد طلبات مسلّمة ضمن فترة الاستبدال ({STORE_POLICIES.returnDays} يوم).</p>
            ) : (
              picks.map(({ o, i }) => (
                <button key={`${o._id}-${i._id}`} onClick={() => { setOrderId(o._id); setItemId(i._id) }} className="flex items-center gap-3 p-2 rounded-xl bg-m3-surface-container-low text-right">
                  <div className="w-14 h-14 rounded-lg bg-m3-surface-container-lowest p-1 flex items-center justify-center shrink-0">
                    {i.image && <img alt={i.title} src={normalizeImageUrl(i.image)} className="w-full h-full object-contain" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-m3-on-surface text-m3-body-md block truncate">{i.title || i.product?.title}</span>
                    <span className="text-m3-body-sm text-m3-on-surface-variant">طلب #{o.orderNumber || o._id.slice(-6).toUpperCase()}{i.size ? ` • مقاس ${i.size}` : ""}</span>
                  </div>
                </button>
              ))
            )}
          </section>
        ) : (
          <>
            <section className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm">
              <div className="flex items-center justify-between pb-m3-space-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-m3-label-md text-m3-label-md text-m3-on-surface-variant">رقم الطلب:</span>
                  <span className="font-m3-headline-md text-m3-headline-md tracking-wider text-m3-on-surface font-bold">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                </div>
                <span className="bg-m3-surface-container px-2.5 py-1 rounded-full text-m3-body-sm text-m3-on-surface-variant">تم التسليم قبل {daysSince(order.deliveredAt || order.updatedAt)} يوم</span>
              </div>
              <div className="flex gap-m3-space-md items-center py-m3-space-xs">
                <div className="w-20 h-20 rounded-xl bg-m3-surface-container-low p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image && <img alt={item.title} className="w-full h-full object-contain mix-blend-multiply" src={normalizeImageUrl(item.image)} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-m3-headline-md text-m3-on-surface truncate">{item.title || item.product?.title}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {item.size && <span className="bg-m3-surface-container-high text-m3-on-surface font-m3-label-md text-m3-label-md px-2 py-0.5 rounded-lg">EU {item.size}</span>}
                    {item.color?.name && <span className="text-m3-on-surface-variant text-m3-body-sm">اللون: {item.color.name}</span>}
                  </div>
                </div>
              </div>
              <div className="mt-m3-space-sm bg-m3-surface-container-low rounded-xl px-m3-space-md py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-m3-primary">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-m3-body-sm font-bold text-m3-on-surface">متبقي {left} يوماً في فترة الاستبدال</span>
                </div>
                <button onClick={() => { setOrderId(""); setItemId("") }} className="font-m3-label-sm text-m3-label-sm text-m3-primary font-bold">تغيير</button>
              </div>
            </section>

            <section className="flex flex-col gap-m3-space-sm">
              <span className="font-bold text-m3-headline-md text-m3-on-surface">نوع المعاملة المطلوبة</span>
              <div className="grid grid-cols-1 gap-2.5">
                {([
                  ["exchange", "استبدال مقاس أو موديل", "المندوب بيوصلك بالمقاس الجديد لبيتك، ويستلم المقاس الحالي.", "بدون رسوم شحن للاستبدال"],
                  ["return", "إرجاع واسترداد", "إرجاع الكوتشي من باب البيت وتحويل المبلغ بالطريقة اللي تختارها.", "استرداد المبلغ"],
                ] as const).map(([v, t, d, tag]) => (
                  <button key={v} type="button" onClick={() => setType(v)} className={`text-right bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm flex items-start gap-m3-space-md transition-all ${type === v ? "ring-2 ring-primary-container" : ""}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${type === v ? "bg-primary-container text-on-primary" : "bg-surface-container-highest text-transparent"}`}>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-m3-on-surface text-m3-body-lg">{t}</span>
                        <span className={`text-m3-label-sm px-2 py-0.5 rounded-full font-bold shrink-0 ${v === "exchange" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-on-surface-variant"}`}>{tag}</span>
                      </div>
                      <p className="text-m3-body-sm text-m3-on-surface-variant mt-1 leading-relaxed">{d}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-m3-space-sm">
              <label className="font-bold text-m3-headline-md text-m3-on-surface">سبب {type === "exchange" ? "الاستبدال" : "الإرجاع"}</label>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button key={r} type="button" onClick={() => setReason(r)} className={`text-m3-body-md px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 ${reason === r ? "bg-on-surface text-surface-container-lowest font-semibold shadow-sm" : "bg-surface-container-low text-on-surface font-medium"}`}>
                    <span>{r}</span>
                    {reason === r && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex flex-col gap-1.5">
                <label className="text-m3-body-sm font-semibold text-m3-on-surface-variant">تفاصيل إضافية أو ملاحظات للمندوب (اختياري)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="اكتب أي تفاصيل بخصوص حالة الحذاء أو المقاس المطلوب..." className="w-full bg-m3-surface-container-low text-m3-on-surface rounded-xl p-3 text-m3-body-sm outline-none focus:ring-2 focus:ring-m3-primary-container resize-none" />
              </div>
            </section>

            {type === "exchange" ? (
              <section className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm flex flex-col gap-m3-space-md">
                <div>
                  <h3 className="font-bold text-m3-headline-md text-m3-on-surface">اختر المقاس البديل المطلوب</h3>
                  <p className="text-m3-body-sm text-m3-on-surface-variant">مقاسك الحالي: <span className="font-m3-label-md text-m3-label-md font-bold text-m3-error">EU {item.size || "—"}</span></p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {sizes.map((s) => {
                    const out = s.quantity <= 0
                    const on = newSize === String(s.size)
                    return (
                      <button key={s.size} type="button" disabled={out} onClick={() => setNewSize(String(s.size))} className={`rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 transition-all ${out ? "bg-surface-container-low opacity-50 cursor-not-allowed" : on ? "bg-primary-container text-on-primary ring-2 ring-primary-container" : "bg-surface-container-low"}`}>
                        <span className={`font-m3-headline-md text-m3-headline-md font-bold ${out ? "line-through text-on-surface-variant" : on ? "text-on-primary" : "text-on-surface"}`}>EU {s.size}</span>
                        <span className={`text-m3-label-sm ${out ? "text-error" : on ? "text-on-primary" : "text-on-surface-variant"}`}>{out ? "نفذت الكمية" : s.quantity <= 3 ? `متوفر ${s.quantity}` : "متوفر"}</span>
                      </button>
                    )
                  })}
                  {sizes.length === 0 && <p className="col-span-3 text-m3-body-sm text-m3-on-surface-variant">لا توجد مقاسات بديلة معروضة حالياً لهذا اللون.</p>}
                </div>
              </section>
            ) : (
              <section className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm flex flex-col gap-m3-space-md">
                <div>
                  <h3 className="font-bold text-m3-headline-md text-m3-on-surface">طريقة استرداد المبلغ المالي</h3>
                  <p className="text-m3-body-sm text-m3-on-surface-variant">يتم التحويل بعد استلام الحذاء وفحصه</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {METHODS.map((m) => (
                    <label key={m.v} className={`bg-m3-surface-container-low rounded-xl p-3 flex items-center justify-between cursor-pointer ${method === m.v ? "ring-2 ring-primary-container" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-m3-surface-container-highest flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-m3-primary-container">{m.icon}</span>
                        </div>
                        <div>
                          <span className="font-bold text-m3-body-md text-m3-on-surface block">{m.t}</span>
                          <span className="text-m3-body-sm text-m3-on-surface-variant">{m.d}</span>
                        </div>
                      </div>
                      <input type="radio" name="refund_method" checked={method === m.v} onChange={() => setMethod(m.v)} className="accent-m3-primary-container w-4 h-4" />
                    </label>
                  ))}
                </div>
                {method !== "cash" && (
                  <div className="pt-2">
                    <label className="text-m3-body-sm font-semibold text-m3-on-surface-variant block mb-1">بيانات التحويل (رقم الهاتف أو عنوان الدفع IPA)</label>
                    <input dir="ltr" value={account} onChange={(e) => setAccount(e.target.value)} placeholder={METHODS.find((m) => m.v === method)!.ph} className="w-full h-12 text-m3-on-surface rounded-xl px-3 font-m3-label-md text-m3-label-md text-left outline-none focus:ring-2 focus:ring-m3-primary-container bg-m3-surface-container-low" />
                  </div>
                )}
              </section>
            )}

            <section className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm flex flex-col gap-m3-space-md">
              <div className="bg-m3-primary-container text-m3-on-primary rounded-xl p-m3-space-md flex items-start gap-3">
                <span className="material-symbols-outlined text-[28px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>swap_horizontal_circle</span>
                <div>
                  <h4 className="font-bold text-m3-body-lg text-m3-on-primary">خدمة الاستلام من باب البيت</h4>
                  <p className="text-m3-body-sm text-m3-on-primary-container mt-1 leading-relaxed opacity-95">المندوب بيزورك في الموعد المفضل، وبيستنى معاك لحد ما تتأكد من المقاس.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <span className="font-bold text-m3-body-md text-m3-on-surface">عنوان الاستلام والتسليم</span>
                <div className="bg-m3-surface-container-low rounded-xl p-3 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-m3-primary-container text-[20px] mt-0.5">location_on</span>
                  <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="اكتب عنوان الاستلام" className="flex-1 bg-transparent outline-none text-m3-body-md text-m3-on-surface resize-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <span className="font-bold text-m3-body-md text-m3-on-surface">الموعد المفضل للزيارة</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {([["morning", "الفترة الصباحية", "10:00 ص – 02:00 م", "wb_sunny"], ["evening", "الفترة المسائية", "04:00 م – 08:00 م", "bedtime"]] as const).map(([v, t, h, ic]) => (
                    <button key={v} type="button" onClick={() => setSlot(v)} className={`text-right bg-m3-surface-container-low rounded-xl p-3 flex flex-col gap-1 transition-all ${slot === v ? "ring-2 ring-primary-container" : "opacity-70"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-m3-body-sm text-m3-on-surface">{t}</span>
                        <span className={`material-symbols-outlined text-[18px] ${slot === v ? "text-primary-container" : "text-on-surface-variant"}`}>{ic}</span>
                      </div>
                      <span className="text-m3-label-md text-m3-on-surface-variant">{h}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm flex items-center justify-between gap-m3-space-md">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <h4 className="font-bold text-m3-body-md text-m3-on-surface">عايز مساعدة في اختيار المقاس المناسب؟</h4>
              </div>
              <a href={buildSupportWhatsAppUrl(`محتاج مساعدة في اختيار المقاس البديل (طلب #${order.orderNumber || order._id.slice(-6).toUpperCase()})`)} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-m3-surface-container-high text-m3-on-surface px-3 py-2 rounded-xl flex items-center gap-1.5">
                <WhatsAppIcon className="w-[18px] h-[18px] text-emerald-600" />
                <span className="font-m3-label-md text-m3-label-md font-bold">واتساب</span>
              </a>
            </section>
          </>
        )}
      </div>

      {item && (
        <div className="fixed bottom-16 left-0 right-0 bg-m3-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(15,23,42,0.08)] px-m3-margin py-3 z-40">
          <div className="max-w-md mx-auto flex flex-col gap-2">
            <button disabled={sending} onClick={submit} className="w-full min-h-[52px] bg-m3-primary-container hover:bg-m3-primary active:scale-[0.98] text-m3-on-primary rounded-full font-bold text-m3-body-lg flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60">
              <span className="material-symbols-outlined text-[22px]">published_with_changes</span>
              <span>{sending ? "جارٍ الإرسال..." : type === "exchange" ? "تأكيد طلب الاستبدال" : "تأكيد طلب الإرجاع"}</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-m3-on-surface-variant text-center">
              <span className="material-symbols-outlined text-m3-primary-container text-[16px]">how_to_reg</span>
              <p className="text-m3-label-sm font-medium">المعاينة والقياس متاحة أمام المندوب قبل الاستلام النهائي</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
