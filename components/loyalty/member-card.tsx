"use client"

import { Crown } from "lucide-react"
import { EGP_PER_100_POINTS, MIN_REDEEM_POINTS, EGP_PER_EARNED_POINT, pointsToEgp } from "@/lib/loyalty-rules"

interface Props {
  isArabic: boolean
  points: number
  totalEarned: number
}

/** Points-only card (no tiers). Redeem values come from lib/loyalty-rules.ts (placeholders until the owner confirms). */
export function LoyaltyMemberCard({ isArabic, points }: Props) {
  const nf = (n: number) => n.toLocaleString(isArabic ? "ar-EG" : "en-US")
  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground shadow-lg">
        <Crown className="absolute -top-2 end-3 h-24 w-24 opacity-10" />
        <p className="text-xs opacity-80">{isArabic ? "نادي ميرفوري" : "Mirvory Club"}</p>
        <p className="mt-4 text-xs opacity-80">{isArabic ? "رصيد النقاط" : "Points balance"}</p>
        <p className="text-4xl font-black tabular-nums">{nf(points)}</p>
        <p className="mt-1 text-xs opacity-90">{isArabic ? `يعادل ${nf(pointsToEgp(points))} ج.م خصم` : `Worth EGP ${nf(pointsToEgp(points))} off`}</p>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <h3 className="text-sm font-bold">{isArabic ? "كيف تكسب وتستخدم النقاط؟" : "How points work"}</h3>
        <p className="text-xs text-muted-foreground">
          {isArabic ? `تكسب نقطة عن كل ${EGP_PER_EARNED_POINT} جنيه من قيمة الطلبات المكتملة.` : `Earn 1 point per EGP ${EGP_PER_EARNED_POINT} on completed orders.`}
        </p>
        <p className="text-xs text-muted-foreground">
          {isArabic ? `كل 100 نقطة = ${EGP_PER_100_POINTS} ج.م خصم، بحد أدنى ${nf(MIN_REDEEM_POINTS)} نقطة.` : `Every 100 points = EGP ${EGP_PER_100_POINTS} off, minimum ${nf(MIN_REDEEM_POINTS)} points.`}
        </p>
      </div>
    </section>
  )
}
