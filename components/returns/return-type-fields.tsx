"use client"

import { ArrowLeftRight, Banknote, Sun, Moon, Smartphone, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type ReturnTypeValue = {
  type: "return" | "exchange"
  exchangeSize: string
  refundMethod: "" | "instapay" | "e_wallet" | "cash"
  refundAccount: string
  preferredSlot: "" | "morning" | "evening"
  pickupAddress: string
}

interface Props {
  isArabic: boolean
  value: ReturnTypeValue
  onChange: (patch: Partial<ReturnTypeValue>) => void
}

const SIZES = ["38", "39", "40", "41", "42", "42.5", "43", "43.5", "44", "45", "46"]

function Option({
  active, onClick, icon, title, hint,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-start transition-colors",
        active ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/50"
      )}
    >
      <span className={cn("mt-0.5 rounded-full p-2", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold">{title}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </button>
  )
}

export function ReturnTypeFields({ isArabic, value, onChange }: Props) {
  const ar = isArabic
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">{ar ? "نوع المعاملة المطلوبة" : "Request type"}</Label>
        <div className="grid grid-cols-1 gap-2.5">
          <Option
            active={value.type === "exchange"}
            onClick={() => onChange({ type: "exchange" })}
            icon={<ArrowLeftRight className="h-4 w-4" />}
            title={ar ? "استبدال مقاس أو موديل" : "Exchange size or model"}
            hint={ar ? "المندوب يوصلك المقاس الجديد ويستلم القديم." : "The courier brings the new size and collects the old one."}
          />
          <Option
            active={value.type === "return"}
            onClick={() => onChange({ type: "return" })}
            icon={<Banknote className="h-4 w-4" />}
            title={ar ? "إرجاع واسترداد المبلغ" : "Return and refund"}
            hint={ar ? "يتم تحويل المبلغ بعد مراجعة الطلب والموافقة عليه." : "The amount is refunded after the request is reviewed and approved."}
          />
        </div>
      </div>

      {value.type === "exchange" && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {ar ? "اختر المقاس البديل (EU)" : "Replacement size (EU)"}
            <span className="mx-1 text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ exchangeSize: s })}
                aria-pressed={value.exchangeSize === s}
                className={cn(
                  "h-10 rounded-xl border text-sm font-semibold transition-colors",
                  value.exchangeSize === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {ar ? "التوفر يتأكد بعد مراجعة الطلب." : "Availability is confirmed after review."}
          </p>
        </div>
      )}

      {value.type === "return" && (
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">{ar ? "طريقة استرداد المبلغ" : "Refund method"}</Label>
          <div className="grid grid-cols-1 gap-2.5">
            <Option active={value.refundMethod === "instapay"} onClick={() => onChange({ refundMethod: "instapay" })}
              icon={<Smartphone className="h-4 w-4" />} title={ar ? "إنستاباي (InstaPay)" : "InstaPay"} />
            <Option active={value.refundMethod === "e_wallet"} onClick={() => onChange({ refundMethod: "e_wallet" })}
              icon={<Wallet className="h-4 w-4" />} title={ar ? "محفظة إلكترونية (فودافون كاش / أورانج / وي)" : "E-wallet (Vodafone Cash / Orange / WE)"} />
            <Option active={value.refundMethod === "cash"} onClick={() => onChange({ refundMethod: "cash" })}
              icon={<Banknote className="h-4 w-4" />} title={ar ? "كاش" : "Cash"} />
          </div>
          {(value.refundMethod === "instapay" || value.refundMethod === "e_wallet") && (
            <Input
              value={value.refundAccount}
              onChange={(e) => onChange({ refundAccount: e.target.value })}
              placeholder={ar ? "رقم الهاتف أو عنوان الدفع (IPA)" : "Phone number or payment address (IPA)"}
              className="h-11 rounded-xl"
              dir="ltr"
            />
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">{ar ? "الموعد المفضل للزيارة" : "Preferred visit time"}</Label>
        <div className="grid grid-cols-2 gap-2.5">
          <Option active={value.preferredSlot === "morning"} onClick={() => onChange({ preferredSlot: "morning" })}
            icon={<Sun className="h-4 w-4" />} title={ar ? "الفترة الصباحية" : "Morning"} hint="10:00 – 14:00" />
          <Option active={value.preferredSlot === "evening"} onClick={() => onChange({ preferredSlot: "evening" })}
            icon={<Moon className="h-4 w-4" />} title={ar ? "الفترة المسائية" : "Evening"} hint="16:00 – 20:00" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{ar ? "عنوان الاستلام (اختياري)" : "Pickup address (optional)"}</Label>
        <Input
          value={value.pickupAddress}
          onChange={(e) => onChange({ pickupAddress: e.target.value })}
          placeholder={ar ? "اتركه فارغًا لاستخدام عنوان الطلب" : "Leave empty to use the order address"}
          className="h-11 rounded-xl"
        />
      </div>
    </div>
  )
}
