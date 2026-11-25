"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { unavailableProductRequestService } from "@/lib/api"
import ImageUploader from "@/components/ImageUploader"

const BRANDS = ["New Balance", "Nike", "Jordan", "Adidas", "Asics", "ماركة تانية"]
const SIZES = ["40", "41", "42", "42.5", "43", "44", "44.5", "45", "45.5", "46", "47"]
const BUDGETS: [string, number][] = [["٦،٠٠٠ - ٨،٥٠٠ ج.م", 7500], ["٨،٥٠٠ - ١٢،٠٠٠ ج.م", 10000], ["+١٢،٠٠٠ ج.م (قطع نادرة جداً)", 15000]]

export function ConciergeMobile() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [model, setModel] = useState("")
  const [brand, setBrand] = useState("")
  const [size, setSize] = useState("")
  const [budget, setBudget] = useState("")
  const [notes, setNotes] = useState("")
  const [phone, setPhone] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (!model.trim() && !imageUrl) return toast.error("اكتب اسم الموديل أو ارفع صورة")
    if (!/^01[0125][0-9]{8}$/.test(phone)) return toast.error("رقم الواتساب غير صحيح (010XXXXXXXX)")
    setSending(true)
    try {
      await unavailableProductRequestService.createRequest({
        phone,
        ...(imageUrl ? { imageUrl } : {}),
        ...(model.trim() ? { productName: model.trim() } : {}),
        ...(brand ? { brand } : {}),
        ...(size ? { size } : {}),
        ...(budget && Number(budget) > 0 ? { maxBudget: Number(budget) } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
      setDone(true)
      setImageUrl(null)
      setModel("")
      setBrand("")
      setSize("")
      setBudget("")
      setNotes("")
      setPhone("")
      setTimeout(() => setDone(false), 6000)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "حدث خطأ أثناء إرسال الطلب")
    } finally {
      setSending(false)
    }
  }

  const input = "w-full h-12 pr-10 pl-4 rounded-[0.75rem] bg-[#f2f4f6] text-[#191c1e] placeholder:text-[#737686] text-[14px] leading-[22px] tracking-[0em] font-[400] focus:outline-none focus:bg-[#ffffff] focus:ring-2 focus:ring-[#004ac6]/20 transition-all"

  return (
    <div dir="rtl" className="md:hidden flex flex-col w-full bg-[#f7f9fb] min-h-screen [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif]">
      {done && (
        <div className="fixed top-20 inset-x-4 z-50">
          <div className="bg-[#2d3133] text-[#eff1f3] p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-[9999px] bg-[#004ac6] flex items-center justify-center text-[#ffffff] shrink-0">
              <span className="material-symbols-outlined text-[24px]">check</span>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] font-bold">تم استلام طلب المنتج بنجاح!</h5>
              <p className="text-[12px] leading-[18px] tracking-[0.01em] font-[400] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] opacity-90">فريق كونسيرج ميرفوري هيتواصل معاك على واتساب بالتسعير.</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full pb-40">
        <div className="px-[1rem] pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[9999px] bg-[#dae2fd] text-[#131b2e] text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-[9999px] bg-[#004ac6] opacity-75" />
              <span className="relative inline-flex rounded-[9999px] h-2 w-2 bg-[#004ac6]" />
            </span>
            <span>خدمة كونسيرج حصرية • الإصدارات النادرة</span>
            <span className="material-symbols-outlined text-[16px] text-[#004ac6]">verified</span>
          </div>
        </div>

        <section className="px-[1rem] pt-2 pb-5">
          <h1 className="text-[26px] leading-[34px] tracking-[-0.02em] font-[700] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] tracking-tight leading-snug">
            مش لاقي منتج أحلامك في مصر؟ <span className="text-[#2563eb]">إحنا هنجيبهولك</span> لحد باب بيتك 📦✈️
          </h1>
          <p className="text-[14px] leading-[22px] tracking-[0em] font-[400] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[#434655] mt-2.5 leading-relaxed">
            سواء كان إصدار نادر، لون مخصص، أو مقاس مش متوفر في السوق المصري؛ فريق ميرفوري يوفرهولك أصلي 100% مع ضمان الفحص الشامل والمعاينة قبل الدفع.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              ["verified_user", "أصلي 100%", "فحص خبير معتمد"],
              ["payments", "معاينة قبل الدفع", "بدون مقدم للطلب"],
              ["flight_takeoff", "شحن آمن سريع", "من الخارج لباب بيتك"],
            ].map(([i, a, b]) => (
              <div key={a} className="flex flex-col items-center justify-center p-3 rounded-[0.75rem] bg-[#f2f4f6] text-center">
                <span className="material-symbols-outlined text-[#004ac6] text-[22px] mb-1">{i}</span>
                <span className="text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] font-bold">{a}</span>
                <span className="text-[11px] text-[#434655]">{b}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-[1rem] my-2">
          <div className="bg-[#ffffff] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[9999px] bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <div>
                  <h3 className="text-[18px] leading-[26px] tracking-[-0.01em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e]">بيانات المنتج المطلوب</h3>
                  <p className="text-[12px] leading-[18px] tracking-[0.01em] font-[400] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[#434655]">املأ التفاصيل وسنقوم بالبحث والمطابقة فوراً</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-[9999px] bg-[#dae2fd] text-[#131b2e] text-[10px] leading-[14px] tracking-[0.06em] font-[700] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif]">مجاناً</span>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit() }}>
              <div>
                <label className="block text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] mb-1.5">ارفع صورة الحذاء أو لقطة شاشة</label>
                <ImageUploader onUpload={setImageUrl} />
              </div>

              <div>
                <label className="block text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] mb-1.5">اسم الموديل أو كود الستايل (Style Code) <span className="text-[#ba1a1a]">*</span></label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute right-3 text-[#737686] text-[20px] pointer-events-none">search</span>
                  <input className={input} placeholder="مثال: New Balance 9060 Rain Cloud أو Jordan 4 Military Black" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] mb-1.5">الماركة (Brand)</label>
                <div className="flex flex-wrap gap-2">
                  {BRANDS.map((b) => (
                    <button key={b} type="button" onClick={() => setBrand(brand === b ? "" : b)} className={`px-3.5 py-1.5 rounded-[9999px] text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] transition-all ${brand === b ? "bg-[#191c1e] text-[#f7f9fb] font-bold" : "bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea]"}`}>{b}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e]">المقاس المطلوب (EU Size)</label>
                  <Link href="/size-guide" className="text-[10px] leading-[14px] tracking-[0.06em] font-[700] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#004ac6]">دليل المقاسات الأوروبية</Link>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {SIZES.map((s) => (
                    <button key={s} type="button" onClick={() => setSize(size === s ? "" : s)} className={`py-2 rounded-[0.5rem] text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-center transition-all ${size === s ? "bg-[#191c1e] text-[#f7f9fb] font-bold" : "bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e6e8ea]"}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] mb-1.5">أقصى ميزانية تقريبية (بالجنيه المصري)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#434655]">ج.م</span>
                  <input type="number" min={0} className="w-full h-12 pr-4 pl-12 rounded-[0.75rem] bg-[#f2f4f6] text-[#191c1e] placeholder:text-[#737686] text-[14px] leading-[22px] tracking-[0em] font-[400] focus:outline-none focus:bg-[#ffffff] focus:ring-2 focus:ring-[#004ac6]/20 transition-all" placeholder="مثال: 9500" value={budget} onChange={(e) => setBudget(e.target.value)} />
                </div>
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
                  {BUDGETS.map(([l, v]) => (
                    <button key={l} type="button" onClick={() => setBudget(String(v))} className="px-2.5 py-1 rounded-md bg-[#eceef0] text-[11px] text-[#191c1e] whitespace-nowrap hover:bg-[#e6e8ea]">{l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] mb-1.5">أي تفاصيل أو شروط خاصة (اختياري)</label>
                <textarea rows={2} className="w-full p-3 rounded-[0.75rem] bg-[#f2f4f6] text-[#191c1e] placeholder:text-[#737686] text-[14px] leading-[22px] tracking-[0em] font-[400] focus:outline-none focus:bg-[#ffffff] focus:ring-2 focus:ring-[#004ac6]/20 transition-all resize-none" placeholder="مثال: سنة الإصدار 2023، محتاج العلبة الأصلية بحالة ممتازة Deadstock..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div>
                <label className="block text-[12px] leading-[16px] tracking-[0.04em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] mb-1.5">رقم واتساب للتواصل السريع بالتسعير <span className="text-[#ba1a1a]">*</span></label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute right-3 text-[#737686] text-[20px] pointer-events-none">phone</span>
                  <input type="tel" inputMode="numeric" className={input} placeholder="010XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} />
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="px-[1rem] pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[18px] leading-[26px] tracking-[-0.01em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e]">خطوات طلب المنتج الخاص</h3>
              <p className="text-[12px] leading-[18px] tracking-[0.01em] font-[400] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[#434655]">تجربة شراء آمنة وفاخرة من البداية للاستلام</p>
            </div>
            <span className="material-symbols-outlined text-[#004ac6] text-[24px]">route</span>
          </div>
          <div className="space-y-3">
            {[
              ["١", "ابعت الطلب والتفاصيل", "خلال 24 ساعة", "ارسل صورة المنتج أو كود الموديل، وسيقوم فريق المشتريات بالبحث والرد عليك بالسعر الإجمالي وتاريخ الوصول التقريبي."],
              ["٢", "فحص دقيق وتوثيق بالفيديو", "شهادة أصالة", "يتم فحص وتدقيق المنتج وتوثيق الخياطة والباركود، مع إرسال فيديو تفصيلي للمعاينة والموافقة قبل الشحن."],
              ["٣", "شحن لحد باب بيتك والمعاينة", "الدفع عند الاستلام", "المندوب يوصلك لحد باب البيت، تفتح البوكس، تقيس الكوتشي، وتتأكد من كل تفصيلة براحتك قبل ما تدفع."],
            ].map(([n, t, tag, d], i) => (
              <div key={n} className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#ffffff] shadow-sm">
                <div className={`w-10 h-10 rounded-[0.75rem] flex items-center justify-center font-bold text-[14px] leading-[20px] tracking-[0.02em] font-[600] shrink-0 ${i === 0 ? "bg-[#004ac6] text-[#ffffff]" : "bg-[#eceef0] text-[#191c1e]"}`}>{n}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[14px] leading-[20px] tracking-[0.02em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] font-bold">{t}</h4>
                    <span className="text-[10px] leading-[14px] tracking-[0.06em] font-[700] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#004ac6] bg-[#eceef0] px-2 py-0.5 rounded-[9999px] shrink-0">{tag}</span>
                  </div>
                  <p className="text-[12px] leading-[18px] tracking-[0.01em] font-[400] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[#434655] mt-1 leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-[1rem] pt-2 pb-6">
          <div className="bg-[#f2f4f6] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px]">shield</span>
              <h4 className="text-[14px] leading-[20px] tracking-[0.02em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#191c1e] font-bold">ضمانات ميرفوري لخدمة الكونسيرج</h4>
            </div>
            <div className="space-y-2 text-[12px] leading-[18px] tracking-[0.01em] font-[400] [font-family:var(--font-jakarta),Plus_Jakarta_Sans,var(--font-cairo),Cairo,sans-serif] text-[#434655]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px] shrink-0 mt-0.5">check_circle</span>
                <p><strong className="text-[#191c1e] font-semibold">رفض الاستلام بدون مصاريف:</strong> لو المنتج فيه أي اختلاف عن المواصفات المطلوبة أو به أي عيب، لك الحق في رفض الاستلام.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px] shrink-0 mt-0.5">check_circle</span>
                <p><strong className="text-[#191c1e] font-semibold">فحص أصالة:</strong> يتم فحص كل زوج قبل الشحن وتوثيق نتيجة الفحص.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-16 inset-x-0 z-40 bg-[#ffffff]/90 backdrop-blur-xl px-[1rem] py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] leading-[14px] tracking-[0.06em] font-[700] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[#434655]">استفسار وتسعير</span>
            <span className="text-[14px] leading-[20px] tracking-[0.02em] font-[600] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] font-bold text-[#004ac6]">مجاناً ١٠٠٪</span>
          </div>
          <button type="button" disabled={sending} onClick={submit} className="flex-1 min-h-[50px] px-5 rounded-[9999px] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60">
            <span>{sending ? "جارٍ الإرسال..." : "إرسال طلب المنتج الآن"}</span>
            <span className="material-symbols-outlined text-[20px] rotate-180">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
