// Store promises shown across the mobile UI (cart, product page, home).
// Edit the text here once and it updates everywhere. These are business policies
// stated by the store owner; they are not enforced by backend code except the 14-day return window.
export const STORE_POLICIES = {
  inspectionMinutes: 15,
  returnDays: 14,
  deliveryWindow: "24 – 48 ساعة",
  deliveryWindowEn: "24 – 48 hours",
} as const

export interface TrustItem {
  icon: "inspect" | "return" | "authentic" | "cod"
  title: string
  titleEn: string
  text: string
  textEn: string
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: "inspect",
    title: "معاينة قبل الاستلام",
    titleEn: "Try before you accept",
    text: `جرّب المنتج لمدة ${STORE_POLICIES.inspectionMinutes} دقيقة مع المندوب.`,
    textEn: `Try the item for ${STORE_POLICIES.inspectionMinutes} minutes with the courier.`,
  },
  {
    icon: "return",
    title: `إرجاع واستبدال خلال ${STORE_POLICIES.returnDays} يومًا`,
    titleEn: `${STORE_POLICIES.returnDays}-day returns & exchanges`,
    text: "اطلب الإرجاع أو الاستبدال من صفحة طلبك.",
    textEn: "Request a return or exchange from your order page.",
  },
  {
    icon: "authentic",
    title: "بائعون موثوقون",
    titleEn: "Trusted sellers",
    text: "منتجات من بائعين موثوقين على المنصة.",
    textEn: "Products from trusted sellers on the platform.",
  },
  {
    icon: "cod",
    title: "الدفع عند الاستلام",
    titleEn: "Cash on delivery",
    text: `توصيل خلال ${STORE_POLICIES.deliveryWindow}.`,
    textEn: `Delivery within ${STORE_POLICIES.deliveryWindowEn}.`,
  },
]
