"use client"
import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Step = { key: string; label: string; n: number; ofPrev: number; ofVisits: number }
type Prod = { id: string; title: string; views: number; carts: number; qty: number; revenue: number; returns: number; cartRate: number; buyRate: number; returnRate: number }
interface Data {
  days: number
  funnel: Step[]
  byDevice: Record<string, Record<string, number>>
  search: { top: { term: string; count: number; avgResults: number }[]; zero: { term: string; count: number }[] }
  sources: { source: string; sessions: number }[]
  products: { mostViewed: Prod[]; viewedNotBought: Prod[]; highReturn: Prod[] }
  returnReasons: { reason: string; type: string; count: number }[]
  abandonedCarts: { count: number; value: number; list: { name: string; phone: string; value: number; items: string[]; updatedAt: string }[] }
  customers: { guest: { orders: number; aov: number }; registered: { orders: number; aov: number }; registeredBuyers: number; repeatBuyers: number; repeatRate: number; avgDaysBetweenOrders: number | null }
  tracking: { events: number }
}
const fmt = (n: number) => new Intl.NumberFormat("ar-EG").format(Math.round(n))
const DEV: Record<string, string> = { mobile: "موبايل", tablet: "تابلت", desktop: "كمبيوتر" }

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-black mt-1">{value}</p>{hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}</CardContent></Card>
  )
}
function ProdTable({ rows, cols }: { rows: Prod[]; cols: { h: string; v: (p: Prod) => string }[] }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">لا توجد بيانات كافية بعد</p>
  return (
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-right text-muted-foreground text-xs"><th className="py-1.5">المنتج</th>{cols.map((c) => <th key={c.h} className="py-1.5">{c.h}</th>)}</tr></thead>
      <tbody>{rows.map((p) => <tr key={p.id} className="border-t"><td className="py-1.5 font-semibold max-w-[220px] truncate">{p.title}</td>{cols.map((c) => <td key={c.h} className="py-1.5">{c.v(p)}</td>)}</tr>)}</tbody></table></div>
  )
}

export function BehaviorTab() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const r = await fetch(`/api/behavior/admin?days=${days}`, { credentials: "include" })
      const j = await r.json()
      if (j.success) setData(j.data); else setError(j.message || "خطأ في جلب البيانات")
    } catch { setError("تعذر الاتصال بالسيرفر") } finally { setLoading(false) }
  }, [days])
  useEffect(() => { load() }, [load])

  const maxN = Math.max(1, ...(data?.funnel.map((s) => s.n) || [1]))
  const noEvents = data && data.funnel[0].n === 0

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h2 className="text-xl font-black">تحليل سلوك المشترين</h2><p className="text-xs text-muted-foreground">تتبع مجهول الهوية: بدون اسم أو تليفون أو IP للزوار. السلات المتروكة من بيانات حسابات المسجلين فقط.</p></div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>{d} يوم</Button>)}
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>تحديث</Button>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading && !data && <p className="text-sm text-muted-foreground">جاري التحميل...</p>}
      {data && (<>
        {noEvents && <Card><CardContent className="p-4 text-sm">لسه مفيش زيارات متسجلة. التتبع بدأ مع آخر تحديث للموقع، والأرقام هتظهر مع أول زيارات.</CardContent></Card>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="جلسات الزيارة" value={fmt(data.funnel[0].n)} />
          <Kpi label="نسبة إتمام الطلب من الزيارات" value={`${data.funnel[4].ofVisits}%`} hint={`${fmt(data.funnel[4].n)} طلب`} />
          <Kpi label="سلات متروكة (24 ساعة+)" value={fmt(data.abandonedCarts.count)} hint={`${fmt(data.abandonedCarts.value)} ج.م`} />
          <Kpi label="نسبة العملاء المكررين" value={`${data.customers.repeatRate}%`} hint={data.customers.avgDaysBetweenOrders ? `كل ${fmt(data.customers.avgDaysBetweenOrders)} يوم تقريباً` : undefined} />
        </div>

        <Card><CardHeader><CardTitle className="text-base">قمع الشراء (جلسات)</CardTitle></CardHeader><CardContent className="space-y-3">
          {data.funnel.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{s.label}</span><span>{fmt(s.n)} <span className="text-muted-foreground text-xs">({s.key === "sessions" ? "100%" : `${s.ofPrev}% من اللي قبله`})</span></span></div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-[#004ac6] rounded-full" style={{ width: `${(s.n / maxN) * 100}%` }} /></div>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {Object.entries(data.byDevice).map(([d, v]) => (
              <div key={d} className="rounded-xl bg-slate-50 p-3 text-xs"><p className="font-bold mb-1">{DEV[d] || d}</p><p>زيارات: {fmt(v.pageview || 0)}</p><p>سلة: {fmt(v.add_to_cart || 0)}</p><p>طلبات: {fmt(v.purchase || 0)}</p></div>
            ))}
          </div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">سلات متروكة (حسابات مسجلة)</CardTitle></CardHeader><CardContent>
          {!data.abandonedCarts.list.length ? <p className="text-sm text-muted-foreground">لا توجد سلات متروكة</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-right text-muted-foreground text-xs"><th className="py-1.5">العميل</th><th>المنتجات</th><th>القيمة</th><th>آخر نشاط</th><th></th></tr></thead>
              <tbody>{data.abandonedCarts.list.map((c, i) => (
                <tr key={i} className="border-t"><td className="py-1.5 font-semibold">{c.name || "—"}</td><td className="max-w-[240px] truncate">{c.items.join("، ")}</td><td>{fmt(c.value)} ج.م</td><td>{new Date(c.updatedAt).toLocaleDateString("ar-EG")}</td>
                  <td>{c.phone && <a className="text-[#25D366] font-bold" target="_blank" rel="noopener noreferrer" href={`https://wa.me/2${c.phone.replace(/\D/g, "").replace(/^2/, "")}?text=${encodeURIComponent("أهلاً، لاحظنا إنك سبت منتجات في سلتك على MIRVORY. محتاج مساعدة تكمل طلبك؟")}`}>واتساب</a>}</td></tr>
              ))}</tbody></table></div>
          )}
        </CardContent></Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">الأكثر مشاهدة</CardTitle></CardHeader><CardContent>
            <ProdTable rows={data.products.mostViewed} cols={[{ h: "مشاهدات", v: (p) => fmt(p.views) }, { h: "للسلة", v: (p) => `${p.cartRate}%` }, { h: "مباع", v: (p) => fmt(p.qty) }]} /></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">مشاهدات كتير ومفيش شراء</CardTitle></CardHeader><CardContent>
            <ProdTable rows={data.products.viewedNotBought} cols={[{ h: "مشاهدات", v: (p) => fmt(p.views) }, { h: "للسلة", v: (p) => fmt(p.carts) }]} /></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">أعلى نسبة مرتجع</CardTitle></CardHeader><CardContent>
            <ProdTable rows={data.products.highReturn} cols={[{ h: "مرتجع", v: (p) => fmt(p.returns) }, { h: "النسبة", v: (p) => `${p.returnRate}%` }]} /></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">أسباب الإرجاع والاستبدال</CardTitle></CardHeader><CardContent>
            {!data.returnReasons.length ? <p className="text-sm text-muted-foreground">لا توجد طلبات إرجاع</p> : <ul className="space-y-1.5 text-sm">{data.returnReasons.map((r, i) => <li key={i} className="flex justify-between gap-2"><span className="truncate">{r.reason} <span className="text-xs text-muted-foreground">({r.type === "exchange" ? "استبدال" : "إرجاع"})</span></span><b>{fmt(r.count)}</b></li>)}</ul>}</CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">العملاء</CardTitle></CardHeader><CardContent className="text-sm space-y-2">
            <p>متوسط قيمة الطلب: مسجل <b>{fmt(data.customers.registered.aov)}</b> ج.م ({fmt(data.customers.registered.orders)} طلب) • ضيف <b>{fmt(data.customers.guest.aov)}</b> ج.م ({fmt(data.customers.guest.orders)} طلب)</p>
            <p>عملاء مسجلين اشتروا: <b>{fmt(data.customers.registeredBuyers)}</b> • اشتروا مرتين أو أكتر: <b>{fmt(data.customers.repeatBuyers)}</b> ({data.customers.repeatRate}%)</p>
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">مصادر الزيارات</CardTitle></CardHeader><CardContent>
            {!data.sources.length ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : <ul className="space-y-1.5 text-sm">{data.sources.map((s) => <li key={s.source} className="flex justify-between"><span>{s.source}</span><b>{fmt(s.sessions)}</b></li>)}</ul>}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">أكتر كلمات بحث</CardTitle></CardHeader><CardContent>
            {!data.search.top.length ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : <ul className="space-y-1.5 text-sm">{data.search.top.slice(0, 12).map((s) => <li key={s.term} className="flex justify-between"><span>{s.term}</span><span><b>{fmt(s.count)}</b> <span className="text-xs text-muted-foreground">(نتائج {s.avgResults})</span></span></li>)}</ul>}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">بحث بدون نتيجة (اللي الناس عايزاه ومش عندك)</CardTitle></CardHeader><CardContent>
            {!data.search.zero.length ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> : <ul className="space-y-1.5 text-sm">{data.search.zero.map((s) => <li key={s.term} className="flex justify-between"><span>{s.term}</span><b>{fmt(s.count)}</b></li>)}</ul>}</CardContent></Card>
        </div>
      </>)}
    </div>
  )
}
