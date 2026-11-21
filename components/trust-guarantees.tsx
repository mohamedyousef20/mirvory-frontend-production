"use client"

import { BadgeCheck, Banknote, PackageCheck, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { TRUST_ITEMS, type TrustItem } from "@/lib/store-policies"

const ICONS: Record<TrustItem["icon"], typeof BadgeCheck> = {
  inspect: PackageCheck,
  return: RefreshCcw,
  authentic: BadgeCheck,
  cod: Banknote,
}

export function TrustGuarantees({ isArabic = true, className }: { isArabic?: boolean; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2.5", className)}>
      {TRUST_ITEMS.map((item) => {
        const Icon = ICONS[item.icon]
        return (
          <div key={item.icon} className="rounded-2xl border bg-card p-3">
            <Icon className="mb-2 h-5 w-5 text-primary" />
            <p className="text-xs font-bold leading-snug">{isArabic ? item.title : item.titleEn}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{isArabic ? item.text : item.textEn}</p>
          </div>
        )
      })}
    </div>
  )
}
