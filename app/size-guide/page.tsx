"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark, Ruler } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { userService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"
import { WhatsAppHelpButton } from "@/components/whatsapp-help-button"
import { BRAND_FIT, MEN_SIZES, WOMEN_SIZES, type SizeRow } from "@/lib/size-chart"

const FIT_POS = { snug: "10%", tts: "50%", roomy: "90%" } as const

function SizeTable({ rows, mine, onPick }: { rows: SizeRow[]; mine: string | null; onPick: (eu: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <table className="w-full text-center text-sm">
        <thead className="bg-muted text-xs text-muted-foreground">
          <tr><th className="p-2">EU</th><th>US</th><th>UK</th><th>طول القدم (سم)</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.eu}
              onClick={() => onPick(r.eu)}
              className={cn("cursor-pointer border-t", mine === r.eu && "bg-primary/10 font-bold")}
            >
              <td className="p-2.5">{r.eu}</td><td>{r.us}</td><td>{r.uk}</td><td>{r.cm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SizeGuidePage() {
  const { user } = useAuth()
  const [brand, setBrand] = useState(BRAND_FIT[0].brand)
  const [mine, setMine] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fit = BRAND_FIT.find((b) => b.brand === brand)!

  useEffect(() => {
    const saved = (user as any)?.preferredSize
    if (saved) setMine(String(saved))
  }, [user])

  const save = async () => {
    if (!mine) return
    if (!user) { toast.info("سجّل الدخول لحفظ مقاسك"); return }
    setSaving(true)
    try {
      await userService.updatePreferredSize(mine)
      toast.success(`تم حفظ EU ${mine} كمقاسك المفضل`)
    } catch {
      toast.error("تعذر حفظ المقاس")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 pb-32 pt-6" dir="rtl">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-xl font-extrabold"><Ruler className="h-5 w-5" /> دليل المقاسات</h1>
        <p className="text-sm text-muted-foreground">اختر الماركة وشوف طبيعة مقاسها، وبعدها حدد مقاسك من الجدول.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {BRAND_FIT.map((b) => (
          <button
            key={b.brand}
            onClick={() => setBrand(b.brand)}
            className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", brand === b.brand ? "border-primary bg-primary text-primary-foreground" : "bg-background")}
          >
            {b.brand}
          </button>
        ))}
      </div>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">{fit.brand}</h2>
        <div className="relative pt-5">
          <div className="h-2 rounded-full bg-gradient-to-l from-primary/20 via-primary/50 to-primary/20" />
          <span className="absolute top-3 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-background bg-primary" style={{ insetInlineStart: FIT_POS[fit.fit] }} />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>ضيق</span><span>مطابق للقياس</span><span>واسع</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{fit.note}</p>
      </section>

      <Tabs defaultValue="men">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="men">رجال</TabsTrigger>
          <TabsTrigger value="women">نساء</TabsTrigger>
        </TabsList>
        <TabsContent value="men"><SizeTable rows={MEN_SIZES} mine={mine} onPick={setMine} /></TabsContent>
        <TabsContent value="women"><SizeTable rows={WOMEN_SIZES} mine={mine} onPick={setMine} /></TabsContent>
      </Tabs>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">كيف تقيس قدمك في البيت؟</h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li><b className="text-foreground">١. تثبيت الورقة:</b> ضع ورقة A4 على أرضية مستوية بمحاذاة الحائط وثبّت كعبك على الحائط.</li>
          <li><b className="text-foreground">٢. تحديد أطول نقطة:</b> قف باستقامة وحدد بالقلم أبعد نقطة عند أطول إصبع.</li>
          <li><b className="text-foreground">٣. قياس المسافة:</b> قس المسافة بالسنتيمتر من حافة الورقة للعلامة وقارنها بالجدول.</li>
        </ol>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">محتار بين مقاسين؟</h2>
        <p className="text-sm text-muted-foreground">اسأل خبير السنيكرز عندنا مباشرة.</p>
        <WhatsAppHelpButton className="w-full" label="استشارة مقاس عبر واتساب" message="مرحبًا، محتاج مساعدة في اختيار المقاس المناسب" />
      </section>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t bg-background/95 p-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button className="flex-1 gap-2" onClick={save} disabled={!mine || saving}>
            <Bookmark className="h-4 w-4" />
            {mine ? `حفظ EU ${mine} كمقاسي المفضل` : "اختر مقاسك من الجدول"}
          </Button>
          <Link href="/products" className="text-sm font-semibold text-primary">تسوق</Link>
        </div>
      </div>
    </main>
  )
}
