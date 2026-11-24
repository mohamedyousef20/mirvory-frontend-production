// Points-only loyalty rules (no tiers). Earn rate matches the backend today (1 point per 1 EGP).
// PLACEHOLDER VALUES: the redeem value and limits are pending the shop owner's decision.
export const POINTS_PER_EGP = 1
export const EGP_PER_100_POINTS = 5 // placeholder: 100 points = 5 EGP
export const MIN_REDEEM_POINTS = 200 // placeholder
export const MAX_REDEEM_SHARE = 0.2 // placeholder: points can pay up to 20% of the order
export const pointsToEgp = (points: number) => Math.floor((points / 100) * EGP_PER_100_POINTS)
