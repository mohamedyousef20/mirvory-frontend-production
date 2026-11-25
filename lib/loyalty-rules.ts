// Points-only loyalty rules (no tiers). Mirrors backend utils/loyaltyMath.js, which is the
// source of truth: the server recomputes and validates everything at checkout.
//   100 points = 5 EGP, earn 1 point per 5 EGP paid, minimum redeem 200 points,
//   max 10% of the order (merchandise after promotions and coupon, before shipping).
export const EGP_PER_EARNED_POINT = 5
export const EGP_PER_100_POINTS = 5
export const MIN_REDEEM_POINTS = 200
export const MAX_REDEEM_SHARE = 0.1
export const pointsToEgp = (points: number) => Math.floor((points / 100) * EGP_PER_100_POINTS)
/** Points that can be spent on an order whose capped base (EGP) is `baseEgp`, given a balance. */
export const maxRedeemPoints = (baseEgp: number, balance: number) =>
  Math.max(0, Math.min(Math.floor((Math.max(0, baseEgp) * MAX_REDEEM_SHARE * 100) / EGP_PER_100_POINTS), Math.floor(balance || 0)))
