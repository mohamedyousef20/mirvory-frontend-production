"use client"

import { Crown } from "lucide-react"
import { getTierProgress, POINTS_PER_EGP, TIERS } from "@/lib/loyalty-tiers"
import { cn } from "@/lib/utils"

interface Props {
  isArabic: boolean
  points: number
  totalEarned: number
}

export function LoyaltyMemberCard({ isArabic, points, totalEarned }: Props) {
  const { current, next, pct, remaining } = getTierProgress(totalEarned)
  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground shadow-lg">
        <Crown className="absolute -top-2 end-3 h-24 w-24 opacity-10" />
        <p className="text-xs opacity-80">{isArabic ? "عضوية ميرفوري" : "Mirvory membership"}</p>
        <p className="mt-1 text-2xl font-extrabold">{isArabic ? current.ar : current.en}</p>
        <p className="mt-4 text-xs opacity-80">{isArabic ? "رصيد النقاط" : "Points balance"}</p>
        <p className="text-4xl font-black tabular-nums">{points.toLocaleString(isArabic ? "ar-EG" : "en-US")}</p>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
          <span>{isArabic ? current.ar : current.en}</span>
          <span className="text-muted-foreground">{next ? (isArabic ? next.ar : next.en) : isArabic ? "أعلى مستوى" : "Top tier"}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {next
            ? isArabic
              ? `باقي ${remaining.toLocaleString("ar-EG")} نقطة للوصول إلى المستوى ${next.ar}`
              : `${remaining.toLocaleString()} points to reach ${next.en}`
            : isArabic ? "وصلت لأعلى مستوى في النادي." : "You've reached the highest tier."}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h3 className="mb-1 text-sm font-bold">{isArabic ? "كيف تكسب النقاط؟" : "How to earn points"}</h3>
        <p className="text-xs text-muted-foreground">
          {isArabic
            ? `تكسب ${POINTS_PER_EGP} نقطة عن كل 1 جنيه من قيمة الطلبات المكتملة.`
            : `Earn ${POINTS_PER_EGP} point for every EGP 1 on completed orders.`}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {TIERS.map((t) => (
          <div
            key={t.key}
            className={cn(
              "rounded-xl border p-2 text-center",
              t.key === current.key ? "border-primary bg-primary/5" : "bg-card"
            )}
          >
            <p className="text-xs font-bold">{isArabic ? t.ar : t.en}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{t.min.toLocaleString(isArabic ? "ar-EG" : "en-US")}+</p>
          </div>
        ))}
      </div>
    </section>
  )
}
