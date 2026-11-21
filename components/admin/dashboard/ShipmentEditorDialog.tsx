"use client"

import { useState } from "react"
import { Truck } from "lucide-react"
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
  const [event, setEvent] = useState({ title: "", description: "", station: "", occurredAt: "" })

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
        events: event.title.trim()
          ? [{
              title: event.title.trim(),
              description: event.description.trim(),
              station: event.station.trim(),
              occurredAt: event.occurredAt ? new Date(event.occurredAt).toISOString() : undefined,
            }]
          : undefined,
      })
      toast.success("تم حفظ بيانات الشحن")
      setEvent({ title: "", description: "", station: "", occurredAt: "" })
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
          <DialogDescription>انسخ البيانات من نظام شركة الشحن. تظهر للعميل في صفحة الطلب.</DialogDescription>
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
          <p className="text-sm font-bold">إضافة حدث جديد للسجل (اختياري)</p>
          <Input placeholder="العنوان، مثل: وصول الشحنة إلى محطة القليوبية" value={event.title} onChange={(e) => setEvent((p) => ({ ...p, title: e.target.value }))} />
          <Textarea placeholder="التفاصيل" value={event.description} onChange={(e) => setEvent((p) => ({ ...p, description: e.target.value }))} className="min-h-[64px]" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="المحطة" value={event.station} onChange={(e) => setEvent((p) => ({ ...p, station: e.target.value }))} />
            <Input type="datetime-local" value={event.occurredAt} onChange={(e) => setEvent((p) => ({ ...p, occurredAt: e.target.value }))} dir="ltr" />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
