"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { userService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { STORE_POLICIES } from "@/lib/store-policies"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"
import { BRAND_FIT, MEN_SIZES, WOMEN_SIZES } from "@/lib/size-chart"

const FIT_POS = { snug: 14, tts: 50, roomy: 86 } as const
const FIT_LABEL = { snug: "ضيق (Snug)", tts: "مطابق للقياس (TTS)", roomy: "واسع (Roomy)" } as const
const STEPS = [
  ["تثبيت الورقة", "ضع ورقة A4 على أرضية مستوية تماماً بمحاذاة الحائط واثبت كعبك على الحائط."],
  ["تحديد أطول نقطة", "قف باستقامة طبيعية وحدد أبعد نقطة عند أطول إصبع بالقلم بشكل عمودي مستقيم."],
  ["قياس المسافة", "قس المسافة بالمسطرة بالسنتيمتر (CM) من حافة الورقة للعلامة وقارنها بالجدول أعلاه."],
]

export function SizeGuideMobile() {
  const { user } = useAuth()
  const [brand, setBrand] = useState(BRAND_FIT[0].brand)
  const [gender, setGender] = useState<"men" | "women">("men")
  const [mine, setMine] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fit = BRAND_FIT.find((b) => b.brand === brand)!
  const rows = gender === "men" ? MEN_SIZES : WOMEN_SIZES

  useEffect(() => {
    const s = (user as any)?.preferredSize
    if (s) setMine(String(s))
  }, [user])

  const save = async () => {
    if (!mine) return
    if (!user) return toast.info("سجّل الدخول لحفظ مقاسك")
    setSaving(true)
    try {
      await userService.updatePreferredSize(mine)
      setSaved(true)
      toast.success(`تم حفظ EU ${mine} كمقاسك المفضل`)
    } catch {
      toast.error("تعذر حفظ المقاس")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div dir="rtl" className="md:hidden flex flex-col w-full pb-44 bg-m3-surface text-m3-on-surface min-h-screen">
      <section className="px-m3-margin pt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-m3-secondary-container text-m3-on-secondary-container w-fit">
          <span className="material-symbols-outlined text-[16px] text-m3-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <span className="font-m3-label-sm text-m3-label-sm">دليل مقاسات الماركات المتاحة في ميرفوري</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-m3-margin px-m3-margin">
          {BRAND_FIT.map((b) => (
            <button key={b.brand} type="button" onClick={() => setBrand(b.brand)} className={`flex-shrink-0 px-5 py-2.5 rounded-full font-m3-label-md text-m3-label-md transition-all duration-200 ${brand === b.brand ? "bg-on-surface text-surface shadow-sm" : "bg-surface-container-high text-on-surface-variant"}`}>
              {b.brand}
            </button>
          ))}
        </div>
      </section>

      <section className="px-m3-margin mt-5">
        <div className="p-5 rounded-2xl bg-m3-surface-container-low shadow-sm flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-m3-label-sm text-m3-label-sm text-m3-secondary uppercase tracking-widest">تحليل قالب الماركة</span>
            <h2 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface mt-0.5">{fit.brand}</h2>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between font-m3-label-sm text-m3-label-sm text-m3-secondary">
              <span>ضيق (Snug)</span>
              <span className="text-m3-primary font-bold">{FIT_LABEL[fit.fit]}</span>
              <span>واسع (Roomy)</span>
            </div>
            <div className="relative w-full h-2 rounded-full bg-m3-surface-container-highest flex items-center">
              <div className="absolute w-4 h-4 rounded-full bg-m3-primary shadow-md flex items-center justify-center transition-all" style={{ insetInlineStart: `${FIT_POS[fit.fit]}%`, marginInlineStart: -8 }}>
                <div className="w-1.5 h-1.5 rounded-full bg-m3-on-primary" />
              </div>
            </div>
            <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant pt-1">طبيعة المقاس: {fit.note}</p>
          </div>
        </div>
      </section>

      <section className="px-m3-margin mt-7 flex flex-col gap-3">
        <div className="flex flex-col">
          <h3 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">جدول تحويل المقاسات</h3>
          <p className="font-m3-body-sm text-m3-body-sm text-m3-secondary">اضغط على مقاسك لتحديده</p>
        </div>
        <div className="grid grid-cols-2 p-1 rounded-xl bg-m3-surface-container-high text-center">
          {([["men", "رجال"], ["women", "نساء"]] as const).map(([v, t]) => (
            <button key={v} type="button" onClick={() => setGender(v)} className={`py-1.5 rounded-lg font-m3-label-md text-m3-label-md transition-all ${gender === v ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant"}`}>{t}</button>
          ))}
        </div>
        <div className="rounded-2xl bg-m3-surface-container-lowest overflow-hidden shadow-sm">
          <table className="w-full text-center font-m3-label-md text-m3-label-md">
            <thead>
              <tr className="bg-m3-surface-container text-m3-on-surface-variant text-[11px] uppercase">
                <th className="py-2.5 px-3 text-start" />
                <th className="py-2.5 px-2">EU</th>
                <th className="py-2.5 px-2">US</th>
                <th className="py-2.5 px-2">UK</th>
                <th className="py-2.5 px-3 text-end">طول القدم (CM)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const on = mine === r.eu
                return (
                  <tr key={r.eu} onClick={() => { setMine(r.eu); setSaved(false) }} className={`cursor-pointer transition-colors ${on ? "bg-primary text-on-primary font-bold" : "hover:bg-surface-container-low"}`}>
                    <td className="py-3.5 px-3 text-start font-m3-label-sm text-m3-label-sm">
                      {on && (
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_pin</span>
                          <span>مقاسك</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 font-m3-headline-md text-[15px]">{r.eu}</td>
                    <td className={`py-3 px-2 ${on ? "" : "text-on-surface-variant"}`}>{r.us}</td>
                    <td className={`py-3 px-2 ${on ? "" : "text-on-surface-variant"}`}>{r.uk}</td>
                    <td className="py-3 px-3 text-end font-m3-price-display text-m3-price-display">{r.cm}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-m3-surface-container-low text-m3-secondary">
            <span className="font-m3-body-sm text-m3-body-sm">نصيحة: إذا كنت بين قياسين، يفضل اختيار المقاس الأكبر.</span>
          </div>
        </div>
      </section>

      <section className="px-m3-margin mt-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-m3-secondary-container text-m3-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">straighten</span>
          </div>
          <h3 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">كيف تقيس قدمك في البيت بدقة؟</h3>
        </div>
        <div className="flex flex-col gap-2.5">
          {STEPS.map(([t, d], i) => (
            <div key={t} className="p-3.5 rounded-xl bg-m3-surface-container-low flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-m3-on-surface text-m3-surface flex items-center justify-center font-m3-headline-md flex-shrink-0 text-sm">{["١", "٢", "٣"][i]}</span>
              <div className="flex flex-col">
                <h4 className="font-m3-label-lg text-m3-label-lg text-m3-on-surface">{t}</h4>
                <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant mt-0.5">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-m3-margin mt-7">
        <div className="p-5 rounded-2xl bg-m3-surface-container-lowest shadow-md flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-m3-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              <span className="font-m3-label-sm text-m3-label-sm text-m3-primary uppercase font-bold tracking-wider">ضمان ميرفوري</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-m3-tertiary-fixed text-m3-on-tertiary-fixed font-m3-label-sm text-m3-label-sm font-bold">محتار بين مقاسين؟</span>
          </div>
          <h3 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">جرّب المقاس عند الاستلام</h3>
          <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant leading-relaxed">
            معك {STORE_POLICIES.inspectionMinutes} دقيقة للمعاينة والقياس عند الاستلام، وبعدها لو المقاس مش مناسب تقدر تطلب استبدال خلال {STORE_POLICIES.returnDays} يوم.
          </p>
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-m3-secondary"><span className="material-symbols-outlined text-[16px] text-m3-primary">timer</span><span className="font-m3-label-sm text-m3-label-sm">{STORE_POLICIES.inspectionMinutes} دقيقة معاينة</span></div>
            <div className="flex items-center gap-1.5 text-m3-secondary"><span className="material-symbols-outlined text-[16px] text-m3-primary">swap_horiz</span><span className="font-m3-label-sm text-m3-label-sm">استبدال {STORE_POLICIES.returnDays} يوم</span></div>
            <div className="flex items-center gap-1.5 text-m3-secondary"><span className="material-symbols-outlined text-[16px] text-m3-primary">home</span><span className="font-m3-label-sm text-m3-label-sm">توصيل لباب البيت</span></div>
          </div>
        </div>
      </section>

      <section className="px-m3-margin mt-6">
        <div className="p-4 rounded-2xl bg-m3-surface-container-high flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-m3-on-surface text-m3-surface flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">chat</span>
            </div>
            <div className="flex flex-col">
              <span className="font-m3-headline-md text-[15px] text-m3-on-surface">استشارة مقاس خاصة</span>
              <span className="font-m3-body-sm text-m3-body-sm text-m3-secondary">تواصل مباشرة عبر واتساب</span>
            </div>
          </div>
          <a href={buildSupportWhatsAppUrl("مرحبًا، محتاج مساعدة في اختيار المقاس المناسب")} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-full bg-m3-surface-container-lowest text-m3-on-surface font-m3-label-md text-m3-label-md flex items-center gap-1 flex-shrink-0 shadow-sm">
            <span>واتساب</span>
            <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
          </a>
        </div>
      </section>

      <div className="fixed bottom-16 start-0 end-0 z-40 bg-m3-surface-container-lowest/90 backdrop-blur-xl px-m3-margin py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] flex flex-col gap-2">
        <button type="button" disabled={!mine || saving} onClick={save} className="w-full h-[52px] rounded-full bg-m3-primary-container text-m3-on-primary font-m3-headline-md text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md disabled:opacity-60">
          <span className="material-symbols-outlined text-[20px]">{saved ? "check" : "bookmark"}</span>
          <span>{saved ? "تم حفظ المقاس بنجاح!" : mine ? `حفظ EU ${mine} كمقاسي المفضل في حسابي` : "اختر مقاسك من الجدول"}</span>
        </button>
        {mine && (
          <div className="flex items-center justify-center gap-1.5 text-center">
            <span className="w-1.5 h-1.5 rounded-full bg-m3-primary" />
            <span className="font-m3-label-sm text-m3-label-sm text-m3-secondary">هنعرض لك المنتجات بمقاس {mine} تلقائياً</span>
          </div>
        )}
      </div>
    </div>
  )
}
