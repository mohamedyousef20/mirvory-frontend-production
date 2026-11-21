"use client"

import { useState } from "react"
import { Plus, Trash2, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { orderService } from "@/lib/api"

interface Props {
  order: any
  onSaved?: (shipment: any) => void
}

export function ShipmentEditorDialog({ order, onSaved }: Props) {
  const s = order?.shipment || {}
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    courier: s.courier || "",
    waybillNumber: s.waybillNumber || "",
    currentStatus: s.currentStatus || "",
    currentStation: s.currentStation || "",
    agentName: s.courierAgent?.name || "",
    agentPhone: s.courierAgent?.phone || "",
    branchName: s.branch?.name || "",
    branchManager: s.branch?.manager || "",
    branchPhone: s.branch?.phone || "",
  })
  type Ev = { title: string; description: string; station: string; occurredAt: string }
  type Stop = { label: string; station: string; note: string }
  const toLocal = (d?: string) => {
    if (!d) return ""
    const x = new Date(d)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`
  }
  const [events, setEvents] = useState<Ev[]>(
    (s.events || []).map((e: any) => ({
      title: e.title || "", description: e.description || "", station: e.station || "", occurredAt: toLocal(e.occurredAt),
    }))
  )
  const [route, setRoute] = useState<Stop[]>(
    (s.route || []).map((r: any) => ({ label: r.label || "", station: r.station || "", note: r.note || "" }))
  )
  const patchEv = (i: number, k: keyof Ev, v: string) => setEvents((p) => p.map((e, j) => (j === i ? { ...e, [k]: v } : e)))
  const patchStop = (i: number, k: keyof Stop, v: string) => setRoute((p) => p.map((e, j) => (j === i ? { ...e, [k]: v } : e)))

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await orderService.updateShipment({
        id: order._id,
        courier: form.courier,
        waybillNumber: form.waybillNumber,
        currentStatus: form.currentStatus,
        currentStation: form.currentStation,
        courierAgent: { name: form.agentName, phone: form.agentPhone },
        branch: { name: form.branchName, manager: form.branchManager, phone: form.branchPhone },
        replaceEvents: true,
        events: events
          .filter((e) => e.title.trim())
          .map((e) => ({
            title: e.title.trim(),
            description: e.description.trim(),
            station: e.station.trim(),
            occurredAt: e.occurredAt ? new Date(e.occurredAt).toISOString() : undefined,
          })),
        route: route.filter((r) => r.label.trim() || r.station.trim()),
      })
      toast.success("تم حفظ بيانات الشحن")
      onSaved?.(res.data?.data)
      setOpen(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "تعذر حفظ بيانات الشحن")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Truck className="h-4 w-4" /> بيانات الشحن
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>بيانات شركة الشحن</DialogTitle>
          <DialogDescription>عدّل كل بيانات التتبع (الحالة، المحطات، السجل، المندوب والفرع). ما تحفظه يظهر للعميل في صفحة الطلب.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>شركة الشحن</Label><Input value={form.courier} onChange={set("courier")} /></div>
          <div className="space-y-1"><Label>رقم البوليصة</Label><Input value={form.waybillNumber} onChange={set("waybillNumber")} dir="ltr" /></div>
          <div className="space-y-1"><Label>الحالة الحالية</Label><Input value={form.currentStatus} onChange={set("currentStatus")} placeholder="قيد التوصيل الآن مع المندوب" /></div>
          <div className="space-y-1"><Label>المحطة الحالية</Label><Input value={form.currentStation} onChange={set("currentStation")} /></div>
          <div className="space-y-1"><Label>اسم المندوب</Label><Input value={form.agentName} onChange={set("agentName")} /></div>
          <div className="space-y-1"><Label>هاتف المندوب</Label><Input value={form.agentPhone} onChange={set("agentPhone")} dir="ltr" /></div>
          <div className="space-y-1"><Label>الفرع</Label><Input value={form.branchName} onChange={set("branchName")} /></div>
          <div className="space-y-1"><Label>مسؤول الفرع</Label><Input value={form.branchManager} onChange={set("branchManager")} /></div>
          <div className="col-span-2 space-y-1"><Label>هاتف الفرع</Label><Input value={form.branchPhone} onChange={set("branchPhone")} dir="ltr" /></div>
        </div>

        <div className="space-y-2 rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">محطات العبور</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setRoute((p) => [...p, { label: "", station: "", note: "" }])}>
              <Plus className="h-4 w-4" /> محطة
            </Button>
          </div>
          {route.map((r, i) => (
            <div key={i} className="space-y-1.5 rounded-lg bg-muted/40 p-2">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="العنوان، مثل: محطة المنشأ" value={r.label} onChange={(e) => patchStop(i, "label", e.target.value)} />
                <Input placeholder="المحطة" value={r.station} onChange={(e) => patchStop(i, "station", e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Input placeholder="ملاحظة" value={r.note} onChange={(e) => patchStop(i, "note", e.target.value)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setRoute((p) => p.filter((_, j) => j !== i))} aria-label="حذف المحطة">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">سجل الشحنة (Timeline)</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEvents((p) => [{ title: "", description: "", station: "", occurredAt: toLocal(new Date().toISOString()) }, ...p])}
            >
              <Plus className="h-4 w-4" /> حدث
            </Button>
          </div>
          {events.map((e, i) => (
            <div key={i} className="space-y-1.5 rounded-lg bg-muted/40 p-2">
              <div className="flex gap-2">
                <Input placeholder="العنوان، مثل: وصول الشحنة إلى محطة القليوبية" value={e.title} onChange={(ev) => patchEv(i, "title", ev.target.value)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setEvents((p) => p.filter((_, j) => j !== i))} aria-label="حذف الحدث">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea placeholder="التفاصيل" value={e.description} onChange={(ev) => patchEv(i, "description", ev.target.value)} className="min-h-[56px]" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="المحطة" value={e.station} onChange={(ev) => patchEv(i, "station", ev.target.value)} />
                <Input type="datetime-local" value={e.occurredAt} onChange={(ev) => patchEv(i, "occurredAt", ev.target.value)} dir="ltr" />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
