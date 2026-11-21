// Mirrors backend loyalty rules (controllers/loyalty.controller.js): 1 point per 1 EGP,
// bronze 0 / silver 1000 / gold 5000 / platinum 10000.
export const POINTS_PER_EGP = 1
export const TIERS = [
  { key: "bronze", min: 0, ar: "برونزي", en: "Bronze" },
  { key: "silver", min: 1000, ar: "فضي", en: "Silver" },
  { key: "gold", min: 5000, ar: "ذهبي", en: "Gold" },
  { key: "platinum", min: 10000, ar: "بلاتيني", en: "Platinum" },
] as const

export function getTierProgress(totalEarned: number) {
  let idx = 0
  TIERS.forEach((t, i) => { if (totalEarned >= t.min) idx = i })
  const current = TIERS[idx]
  const next = TIERS[idx + 1] ?? null
  const pct = next ? Math.min(100, Math.round(((totalEarned - current.min) / (next.min - current.min)) * 100)) : 100
  return { current, next, pct, remaining: next ? Math.max(0, next.min - totalEarned) : 0 }
}
