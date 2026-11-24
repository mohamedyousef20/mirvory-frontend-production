"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { orderService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"
import { WhatsAppIcon } from "@/components/whatsapp-help-button"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

const FAQS: [string, string][] = [
  ["لو استلمت الحذاء ومقاسه ضيق، إيه اللي بيحصل؟", "تقدر تعاين وتجرب الحذاء عند الاستلام. لو المقاس مش مناسب ترفضه، أو تطلب استبداله بمقاس تاني خلال 14 يوم من الاستلام مع الحفاظ على التاج الأصلي."],
  ["كيف أتتبع طلباتي؟", "من صفحة \"طلباتي\" هتلاقي حالة كل طلب بالتفصيل، وبيانات شركة الشحن والمندوب ورقم البوليصة."],
  ["كيف أعدل أو ألغي طلب؟", "لو الطلب لسه قيد الانتظار تواصل معنا على واتساب لإلغائه أو تعديله قبل الشحن."],
  ["ما هي خيارات الدفع المتاحة؟", "نقبل الدفع بالبطاقات البنكية، المحافظ الإلكترونية، والدفع عند الاستلام في بعض المناطق."],
  ["كم يستغرق التوصيل؟", "عادةً من 2 إلى 5 أيام عمل داخل مصر حسب المدينة ومنطقة التوصيل."],
]
const QUICK = ["المقاس ضيق أو واسع، أعمل إيه؟", "عايز أتتبع شحنتي", "عايز أعدل أو ألغي طلبي", "استفسار عن الاستبدال والاسترجاع"]

export function HelpMobile() {
  const { user, cookiesReady } = useAuth()
  const authed = Boolean(user)
  const [order, setOrder] = useState<any | null>(null)
  const [text, setText] = useState("")
  const [open, setOpen] = useState<number | null>(0)

  useEffect(() => {
    if (!authed || !cookiesReady) return
    orderService
      .getUserOrders()
      .then((r: any) => {
        const list: any[] = r.data?.data ?? []
        const act = list.filter((o) => ["pending", "processing", "shipped"].includes(o.deliveryStatus)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0]
        setOrder(act || null)
      })
      .catch(() => {})
  }, [authed, cookiesReady])

  const orderNo = order ? order.orderNumber || order._id.slice(-6).toUpperCase() : ""
  const send = (msg: string) => {
    const full = order ? `${msg}\n(رقم الطلب: ${orderNo})` : msg
    window.open(buildSupportWhatsAppUrl(full), "_blank", "noopener")
  }
  const it = order?.items?.[0]

  return (
    <div dir="rtl" className="md:hidden flex flex-col w-full bg-[#f7f9fb] min-h-screen pb-24 [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif]">
      <div className="bg-[#ffffff] shadow-sm px-[1rem] py-3 mb-[0.5rem]">
        <div className="flex items-center justify-between gap-[0.5rem]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-[9999px] bg-[#dbe1ff] flex items-center justify-center text-[#00174b] shrink-0">
              <span className="material-symbols-outlined text-[26px]">support_agent</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-bold text-[#191c1e] text-[15px] truncate">خدمة عملاء ميرفوري</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[9999px] bg-[#dae2fd] text-[#004ac6] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  فريق رسمي
                </span>
              </div>
              <span className="text-[#434655] text-[11px] mt-0.5">التواصل المباشر عبر واتساب</span>
            </div>
          </div>
          <button aria-label="واتساب" onClick={() => send("مرحباً، أحتاج مساعدة")} className="flex items-center justify-center w-10 h-10 rounded-[9999px] bg-[#eceef0] text-emerald-600 shrink-0">
            <WhatsAppIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {order && (
        <div className="px-[1rem] mb-[1rem]">
          <div className="bg-[#ffffff] rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-[0.75rem] overflow-hidden bg-[#f2f4f6] shrink-0 flex items-center justify-center p-1">
                {it?.image && <img loading="lazy" decoding="async" alt={it.title} className="w-full h-full object-contain mix-blend-multiply" src={normalizeImageUrl(it.image, "thumbnail")} />}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] uppercase font-bold tracking-wider">طلب قيد المتابعة</span>
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] bg-[#eceef0] px-1.5 py-0.5 rounded-[0.25rem]">#{orderNo}</span>
                </div>
                <h3 className="font-bold text-[#191c1e] text-[14px] truncate mt-0.5">{it?.title || it?.product?.title}</h3>
                <p className="text-[#434655] text-[11px]">{it?.size ? `مقاس ${it.size} EU` : ""}</p>
              </div>
            </div>
            <Link href="/orders" className="shrink-0 px-2.5 py-1.5 rounded-[0.5rem] bg-[#eceef0] text-[#434655] text-[11px] font-semibold flex items-center gap-1">
              <span>تتبع</span>
              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
            </Link>
          </div>
        </div>
      )}

      <div className="px-[1rem] flex flex-col gap-4 mb-[1rem]">
        <div className="flex flex-col items-start max-w-[92%]">
          <div className="bg-[#ffffff] rounded-2xl rounded-tr-sm p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1 text-[#004ac6]">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span className="font-bold text-[12px]">مساعدة ميرفوري</span>
            </div>
            <p className="text-[#191c1e] text-[13px] leading-relaxed">أهلاً بك! تقدر تسأل عن المقاسات، الاستبدال والاسترجاع، أو تتبع شحنتك. اختر سؤالاً سريعاً أو اكتب استفسارك وهنكمل معاك على واتساب.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button key={q} onClick={() => send(q)} className="px-3 py-2 rounded-[9999px] bg-[#ffffff] text-[#191c1e] text-[12px] font-semibold shadow-sm active:scale-95 transition-transform">
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="px-[1rem] mb-[1rem]">
        <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] mb-2">الأسئلة الشائعة</h3>
        <div className="bg-[#ffffff] rounded-2xl shadow-sm overflow-hidden divide-y divide-[#eceef0]">
          {FAQS.map(([q, a], i) => (
            <div key={q}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3 p-4 text-right">
                <span className="font-bold text-[#191c1e] text-[13px]">{q}</span>
                <span className={`material-symbols-outlined text-[#434655] transition-transform ${open === i ? "rotate-180" : ""}`}>expand_more</span>
              </button>
              {open === i && <p className="px-4 pb-4 text-[#434655] text-[13px] leading-relaxed">{a}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="px-[1rem] mb-[0.5rem]">
        <div className="rounded-2xl p-4 bg-[#ffffff] shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[9999px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#191c1e] text-[13px]">تفضل محادثات الواتساب؟</h4>
              <p className="text-[#434655] text-[11px]">متاحون لمشاركتك صور وفيديوهات تفاصيل المنتج</p>
            </div>
          </div>
          <a className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-[0.75rem] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] active:scale-[0.98] shadow-sm" href={buildSupportWhatsAppUrl()} rel="noopener noreferrer" target="_blank">
            <WhatsAppIcon className="w-5 h-5" />
            <span>متابعة الشات عبر الواتساب الرسمي</span>
          </a>
        </div>
      </div>

      <div className="px-[1rem] sticky bottom-16 z-20 pt-1">
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { send(text.trim()); setText("") } }} className="bg-[#ffffff] p-2 rounded-2xl shadow-lg flex items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب استفسارك هنا وهنكمل على واتساب..." className="flex-1 h-11 bg-[#f2f4f6] text-[#191c1e] placeholder:text-[#737686] text-[13px] px-3.5 rounded-[0.75rem] outline-none focus:bg-[#ffffff] focus:ring-2 focus:ring-[#004ac6]/20" />
          <button type="submit" aria-label="إرسال عبر واتساب" className="w-11 h-11 rounded-[0.75rem] bg-emerald-600 text-white flex items-center justify-center shrink-0 active:scale-95 shadow-sm">
            <WhatsAppIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
