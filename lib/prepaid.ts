// Flat discount for paying in advance (InstaPay / Vodafone Cash transfer now, card later).
// The server applies it for real (PREPAID_DISCOUNT_EGP on the backend, default 50). Keep the two equal.
export const PREPAID_DISCOUNT = 50

export const isPrepaid = (method?: string) => method === "instapay" || method === "wallet" || method === "card"

/** Discount off the merchandise only: never off shipping, never more than what is left to pay. */
export const prepaidDiscountFor = (method: string | undefined, merchandiseLeft: number) =>
  isPrepaid(method) ? Math.max(0, Math.min(PREPAID_DISCOUNT, merchandiseLeft)) : 0
