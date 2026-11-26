/** Guest orders remembered on this device so a guest never loses the tracking code. */
const KEY = "mirvory_guest_orders"
export type SavedGuestOrder = { token: string; orderNumber?: string; phone?: string; at: number }

export function listGuestOrders(): SavedGuestOrder[] {
  try { return (JSON.parse(localStorage.getItem(KEY) || "[]") as SavedGuestOrder[]).filter((o) => o && o.token) } catch { return [] }
}
export function saveGuestOrder(o: Omit<SavedGuestOrder, "at">) {
  try {
    const rest = listGuestOrders().filter((x) => x.token !== o.token)
    localStorage.setItem(KEY, JSON.stringify([{ ...o, at: Date.now() }, ...rest].slice(0, 20)))
  } catch { /* storage full or blocked */ }
}
export function removeGuestOrder(token: string) {
  try { localStorage.setItem(KEY, JSON.stringify(listGuestOrders().filter((x) => x.token !== token))) } catch { /* ignore */ }
}
export const trackUrl = (token: string) => `${typeof window !== "undefined" ? window.location.origin : "https://www.mirvory.net"}/track-order?token=${token}`
/** wa.me link that opens WhatsApp to the customer's own number with the confirmation text ready to send. */
export function whatsappToSelf(phone: string, orderNumber: string | undefined, token: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "20")
  const text = `تم تأكيد طلبك من MIRVORY ✅${orderNumber ? `\nرقم الطلب: ${orderNumber}` : ""}\nتابع طلبك من هنا:\n${trackUrl(token)}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
