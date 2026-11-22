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

  const input = "w-full h-12 pr-10 pl-4 rounded-xl bg-m3-surface-container-low text-m3-on-surface placeholder:text-m3-outline text-m3-body-md focus:outline-none focus:bg-m3-surface-container-lowest focus:ring-2 focus:ring-m3-primary/20 transition-all"

  return (
    <div dir="rtl" className="md:hidden flex flex-col w-full bg-m3-surface min-h-screen font-m3-body-md">
      {done && (
        <div className="fixed top-20 inset-x-4 z-50">
          <div className="bg-m3-inverse-surface text-m3-inverse-on-surface p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-m3-primary flex items-center justify-center text-m3-on-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">check</span>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-m3-label-lg font-m3-label-lg font-bold">تم استلام طلب المنتج بنجاح!</h5>
              <p className="text-m3-body-sm font-m3-body-sm opacity-90">فريق كونسيرج ميرفوري هيتواصل معاك على واتساب بالتسعير.</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full pb-40">
        <div className="px-m3-margin pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-m3-secondary-container text-m3-on-secondary-fixed text-m3-label-md font-m3-label-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-m3-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-m3-primary" />
            </span>
            <span>خدمة كونسيرج حصرية • الإصدارات النادرة</span>
            <span className="material-symbols-outlined text-[16px] text-m3-primary">verified</span>
          </div>
        </div>

        <section className="px-m3-margin pt-2 pb-5">
          <h1 className="text-m3-headline-xl-mobile font-m3-headline-xl-mobile text-m3-on-surface tracking-tight leading-snug">
            مش لاقي منتج أحلامك في مصر؟ <span className="text-m3-primary-container">إحنا هنجيبهولك</span> لحد باب بيتك 📦✈️
          </h1>
          <p className="text-m3-body-md font-m3-body-md text-m3-on-surface-variant mt-2.5 leading-relaxed">
            سواء كان إصدار نادر، لون مخصص، أو مقاس مش متوفر في السوق المصري؛ فريق ميرفوري يوفرهولك أصلي 100% مع ضمان الفحص الشامل والمعاينة قبل الدفع.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              ["verified_user", "أصلي 100%", "فحص خبير معتمد"],
              ["payments", "معاينة قبل الدفع", "بدون مقدم للطلب"],
              ["flight_takeoff", "شحن آمن سريع", "من الخارج لباب بيتك"],
            ].map(([i, a, b]) => (
              <div key={a} className="flex flex-col items-center justify-center p-3 rounded-xl bg-m3-surface-container-low text-center">
                <span className="material-symbols-outlined text-m3-primary text-[22px] mb-1">{i}</span>
                <span className="text-m3-label-md font-m3-label-md text-m3-on-surface font-bold">{a}</span>
                <span className="text-[11px] text-m3-on-surface-variant">{b}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-m3-margin my-2">
          <div className="bg-m3-surface-container-lowest rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-m3-primary-fixed flex items-center justify-center text-m3-primary font-bold">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </div>
                <div>
                  <h3 className="text-m3-headline-md font-m3-headline-md text-m3-on-surface">بيانات المنتج المطلوب</h3>
                  <p className="text-m3-body-sm font-m3-body-sm text-m3-on-surface-variant">املأ التفاصيل وسنقوم بالبحث والمطابقة فوراً</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-m3-secondary-fixed text-m3-on-secondary-fixed text-m3-label-sm font-m3-label-sm">مجاناً</span>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit() }}>
              <div>
                <label className="block text-m3-label-md font-m3-label-md text-m3-on-surface mb-1.5">ارفع صورة الحذاء أو لقطة شاشة</label>
                <ImageUploader onUpload={setImageUrl} />
              </div>

              <div>
                <label className="block text-m3-label-md font-m3-label-md text-m3-on-surface mb-1.5">اسم الموديل أو كود الستايل (Style Code) <span className="text-m3-error">*</span></label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute right-3 text-m3-outline text-[20px] pointer-events-none">search</span>
                  <input className={input} placeholder="مثال: New Balance 9060 Rain Cloud أو Jordan 4 Military Black" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-m3-label-md font-m3-label-md text-m3-on-surface mb-1.5">الماركة (Brand)</label>
                <div className="flex flex-wrap gap-2">
                  {BRANDS.map((b) => (
                    <button key={b} type="button" onClick={() => setBrand(brand === b ? "" : b)} className={`px-3.5 py-1.5 rounded-full text-m3-label-md font-m3-label-md transition-all ${brand === b ? "bg-on-surface text-surface font-bold" : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"}`}>{b}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-m3-label-md font-m3-label-md text-m3-on-surface">المقاس المطلوب (EU Size)</label>
                  <Link href="/size-guide" className="text-m3-label-sm font-m3-label-sm text-m3-primary">دليل المقاسات الأوروبية</Link>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {SIZES.map((s) => (
                    <button key={s} type="button" onClick={() => setSize(size === s ? "" : s)} className={`py-2 rounded-lg text-m3-label-md font-m3-label-md text-center transition-all ${size === s ? "bg-on-surface text-surface font-bold" : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-m3-label-md font-m3-label-md text-m3-on-surface mb-1.5">أقصى ميزانية تقريبية (بالجنيه المصري)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-m3-label-md font-m3-label-md text-m3-on-surface-variant">ج.م</span>
                  <input type="number" min={0} className="w-full h-12 pr-4 pl-12 rounded-xl bg-m3-surface-container-low text-m3-on-surface placeholder:text-m3-outline text-m3-body-md focus:outline-none focus:bg-m3-surface-container-lowest focus:ring-2 focus:ring-m3-primary/20 transition-all" placeholder="مثال: 9500" value={budget} onChange={(e) => setBudget(e.target.value)} />
                </div>
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
                  {BUDGETS.map(([l, v]) => (
                    <button key={l} type="button" onClick={() => setBudget(String(v))} className="px-2.5 py-1 rounded-md bg-m3-surface-container text-[11px] text-m3-on-surface whitespace-nowrap hover:bg-m3-surface-container-high">{l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-m3-label-md font-m3-label-md text-m3-on-surface mb-1.5">أي تفاصيل أو شروط خاصة (اختياري)</label>
                <textarea rows={2} className="w-full p-3 rounded-xl bg-m3-surface-container-low text-m3-on-surface placeholder:text-m3-outline text-m3-body-md focus:outline-none focus:bg-m3-surface-container-lowest focus:ring-2 focus:ring-m3-primary/20 transition-all resize-none" placeholder="مثال: سنة الإصدار 2023، محتاج العلبة الأصلية بحالة ممتازة Deadstock..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div>
                <label className="block text-m3-label-md font-m3-label-md text-m3-on-surface mb-1.5">رقم واتساب للتواصل السريع بالتسعير <span className="text-m3-error">*</span></label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute right-3 text-m3-outline text-[20px] pointer-events-none">phone</span>
                  <input type="tel" inputMode="numeric" className={input} placeholder="010XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} />
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="px-m3-margin pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-m3-headline-md font-m3-headline-md text-m3-on-surface">خطوات طلب المنتج الخاص</h3>
              <p className="text-m3-body-sm font-m3-body-sm text-m3-on-surface-variant">تجربة شراء آمنة وفاخرة من البداية للاستلام</p>
            </div>
            <span className="material-symbols-outlined text-m3-primary text-[24px]">route</span>
          </div>
          <div className="space-y-3">
            {[
              ["١", "ابعت الطلب والتفاصيل", "خلال 24 ساعة", "ارسل صورة المنتج أو كود الموديل، وسيقوم فريق المشتريات بالبحث والرد عليك بالسعر الإجمالي وتاريخ الوصول التقريبي."],
              ["٢", "فحص دقيق وتوثيق بالفيديو", "شهادة أصالة", "يتم فحص وتدقيق المنتج وتوثيق الخياطة والباركود، مع إرسال فيديو تفصيلي للمعاينة والموافقة قبل الشحن."],
              ["٣", "شحن لحد باب بيتك والمعاينة", "الدفع عند الاستلام", "المندوب يوصلك لحد باب البيت، تفتح البوكس، تقيس الكوتشي، وتتأكد من كل تفصيلة براحتك قبل ما تدفع."],
            ].map(([n, t, tag, d], i) => (
              <div key={n} className="flex items-start gap-3.5 p-4 rounded-2xl bg-m3-surface-container-lowest shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-m3-label-lg shrink-0 ${i === 0 ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"}`}>{n}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-m3-label-lg font-m3-label-lg text-m3-on-surface font-bold">{t}</h4>
                    <span className="text-m3-label-sm font-m3-label-sm text-m3-primary bg-m3-surface-container px-2 py-0.5 rounded-full shrink-0">{tag}</span>
                  </div>
                  <p className="text-m3-body-sm font-m3-body-sm text-m3-on-surface-variant mt-1 leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-m3-margin pt-2 pb-6">
          <div className="bg-m3-surface-container-low rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-m3-primary text-[20px]">shield</span>
              <h4 className="text-m3-label-lg font-m3-label-lg text-m3-on-surface font-bold">ضمانات ميرفوري لخدمة الكونسيرج</h4>
            </div>
            <div className="space-y-2 text-m3-body-sm font-m3-body-sm text-m3-on-surface-variant">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-m3-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                <p><strong className="text-m3-on-surface font-semibold">رفض الاستلام بدون مصاريف:</strong> لو المنتج فيه أي اختلاف عن المواصفات المطلوبة أو به أي عيب، لك الحق في رفض الاستلام.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-m3-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                <p><strong className="text-m3-on-surface font-semibold">فحص أصالة:</strong> يتم فحص كل زوج قبل الشحن وتوثيق نتيجة الفحص.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-16 inset-x-0 z-40 bg-m3-surface-container-lowest/90 backdrop-blur-xl px-m3-margin py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="flex flex-col">
            <span className="text-m3-label-sm font-m3-label-sm text-m3-on-surface-variant">استفسار وتسعير</span>
            <span className="text-m3-label-lg font-m3-label-lg font-bold text-m3-primary">مجاناً ١٠٠٪</span>
          </div>
          <button type="button" disabled={sending} onClick={submit} className="flex-1 min-h-[50px] px-5 rounded-full bg-m3-primary-container text-m3-on-primary font-m3-headline-md text-m3-headline-md font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60">
            <span>{sending ? "جارٍ الإرسال..." : "إرسال طلب المنتج الآن"}</span>
            <span className="material-symbols-outlined text-[20px] rotate-180">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
