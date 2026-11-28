"use client"

import { useState } from "react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutDashboard, ShoppingBag, Package, Users, ChartNoAxesCombined, Settings2, Search, ChevronLeft } from "lucide-react"

type Item = { value: string; label: string }
const groups = [
  { ar: "المتابعة", en: "Workspace", values: ["overview", "orders", "returns", "complaints", "product-requests"] },
  { ar: "الكتالوج", en: "Catalog", values: ["products", "inventory", "categories", "vendors", "users"] },
  { ar: "التسويق", en: "Marketing", values: ["coupons", "offers", "promotions", "announcements", "loyalty"] },
  { ar: "التقارير والإعدادات", en: "Reports & settings", values: ["analytics", "behavior", "transactions", "shipping-settings", "pickup"] },
]
const iconFor = (value: string) => value === "overview" ? LayoutDashboard : ["orders", "returns"].includes(value) ? ShoppingBag : ["products", "inventory", "categories"].includes(value) ? Package : ["users", "vendors"].includes(value) ? Users : ["analytics", "behavior", "transactions"].includes(value) ? ChartNoAxesCombined : Settings2

export function ControlPanelNav({ items, active, onChange, ar = true }: { items: Item[]; active: string; onChange: (value: string) => void; ar?: boolean }) {
  const [search, setSearch] = useState("")
  const selected = items.find(item => item.value === active)
  return <>
    <div className="cp-mobile-nav lg:hidden">
      <label className="cp-eyebrow" htmlFor="control-panel-section">{ar ? "انتقل إلى القسم" : "Go to section"}</label>
      <Select value={active} onValueChange={onChange}>
        <SelectTrigger id="control-panel-section" className="h-12 bg-white rounded-xl"><SelectValue placeholder={ar ? "اختر القسم" : "Select section"} /></SelectTrigger>
        <SelectContent>{items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
      </Select>
      <div className="cp-quick-links" aria-label={ar ? "أقسام سريعة" : "Quick sections"}>{items.filter(item => ["overview", "orders", "products"].includes(item.value)).map(item => {
        const Icon = iconFor(item.value)
        return <button type="button" key={item.value} aria-pressed={active === item.value} onClick={() => onChange(item.value)}><Icon size={16} />{item.label}</button>
      })}</div>
    </div>
    <aside className="cp-sidebar hidden lg:block">
      <div className="cp-sidebar-title"><span className="cp-brand-mark">M</span><div><strong>MIRVORY</strong><p>{ar ? "مساحة الإدارة" : "Management workspace"}</p></div></div>
      <label className="cp-nav-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={ar ? "ابحث عن قسم..." : "Find a section..."} aria-label={ar ? "ابحث عن قسم" : "Find section"} /></label>
      <TabsList className="cp-nav-list" aria-label={ar ? "أقسام لوحة التحكم" : "Control panel sections"}>
        {groups.map(group => {
          const matches = items.filter(item => group.values.includes(item.value) && item.label.toLowerCase().includes(search.trim().toLowerCase()))
          if (!matches.length) return null
          return <div key={group.en} className="cp-nav-group"><p>{ar ? group.ar : group.en}</p>{matches.map(item => {
            const Icon = iconFor(item.value)
            return <TabsTrigger key={item.value} value={item.value} className="cp-nav-item"><Icon size={18} /><span>{item.label}</span>{active === item.value && <ChevronLeft size={14} className="cp-nav-chevron" />}</TabsTrigger>
          })}</div>
        })}
        {!items.some(item => item.label.toLowerCase().includes(search.trim().toLowerCase())) && <p className="p-3 text-sm text-slate-500">{ar ? "مفيش قسم بالاسم ده" : "No matching section"}</p>}
      </TabsList>
      <div className="cp-sidebar-foot">{ar ? "كل أدوات متجرك، في مكان واحد." : "Your store tools, in one place."}<span>{selected?.label}</span></div>
    </aside>
  </>
}
