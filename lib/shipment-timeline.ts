/**
 * Turns the raw shipment data (admin entered or courier synced) into a CUSTOMER-safe timeline:
 * friendly Arabic steps, internal notes dropped, phone numbers and staff text removed.
 * Pure functions, no network. The raw `shipment` object is unchanged.
 */
export type RawEvent = { status?: string; title: string; description?: string; station?: string; occurredAt?: string }
export type StageKey = "placed" | "confirmed" | "shipped" | "transit" | "outfor" | "delivered"
export const STAGES: { key: StageKey; label: string; icon: string }[] = [
  { key: "placed", label: "تم الطلب", icon: "receipt_long" },
  { key: "confirmed", label: "تم التأكيد", icon: "task_alt" },
  { key: "shipped", label: "خرج للشحن", icon: "inventory_2" },
  { key: "transit", label: "في الطريق", icon: "local_shipping" },
  { key: "outfor", label: "خرج للتوصيل", icon: "two_wheeler" },
  { key: "delivered", label: "تم التسليم", icon: "check_circle" },
]
export type Kind = StageKey | "attempt" | "return_start" | "return_done" | "other"
export type CleanEvent = { kind: Kind; title: string; detail: string; city: string; at: string; day: string }

const INTERNAL = /مخزون|stock|طباعة|printed|print\b|ملصق|label|فروبو|vrobo|ملاحظة داخلية|internal|admin note|audit/i
const RX: [Kind, RegExp][] = [
  ["return_done", /returned to (the )?(warehouse|stock)|received (at|in) warehouse|استلام المرتجع|بالمخزن|اكتمل الاسترجاع|return(ed)? completed/i],
  ["return_start", /return(ed)? to (the )?(sender|shipper|merchant)|\brts\b|refus|reject|مرتجع|إرجاع|ارجاع|استرجاع|راجع/i],
  ["attempt", /fail|unable|no answer|not available|undeliver|reschedul|لم يرد|تعذر|محاولة/i],
  ["delivered", /delivered|تم التسليم|تم تسليم|signed on receiver|received by (the )?(customer|receiver)/i],
  ["outfor", /out for delivery|delivery (in progress|courier)|with (the )?courier|dispatch(ed)? to (courier|rider)|خرج للتوصيل|مع المندوب|خرج للتسليم/i],
  ["transit", /transit|arriv|depart|hub|sort|scan|linehaul|في الطريق|وصلت|وصل |فرز|مركز|منفذ|فرع/i],
  ["shipped", /pick(ed)?[ -]?up|collected|shipped|handed over|تم الشحن|خرج للشحن|تم استلام الشحنة|استلام من/i],
  ["confirmed", /confirm|تم التأكيد|تأكيد|مؤكد/i],
  ["placed", /placed|created|new order|تم إنشاء|تم الطلب/i],
]
const FRIENDLY: Record<Kind, string> = {
  placed: "استلمنا طلبك",
  confirmed: "تم تأكيد طلبك وجاري تجهيزه",
  shipped: "تم تسليم الشحنة لشركة الشحن",
  transit: "الشحنة في الطريق إليك",
  outfor: "المندوب خرج لتوصيل طلبك",
  delivered: "تم تسليم طلبك",
  attempt: "تعذر التسليم، هنحاول مرة تانية",
  return_start: "الشحنة راجعة إلى المرسل",
  return_done: "تم استلام المرتجع",
  other: "تحديث من شركة الشحن",
}
const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s)
/** Remove phone numbers, 【…】 blocks and "contact …" boilerplate. */
export function scrub(s?: string): string {
  return (s || "")
    .replace(/【[^】]*】/g, " ")
    .replace(/(if you|contact|call|questions?|appeal)[^.—-]*/gi, " ")
    .replace(/\+?\d[\d\s-]{7,}\d/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
export function classify(e: RawEvent): Kind {
  const t = `${e.status || ""} ${e.title || ""} ${e.description || ""}`
  for (const [k, rx] of RX) if (rx.test(t)) return k
  return "other"
}
export function cleanEvents(events?: RawEvent[] | null): CleanEvent[] {
  const out: CleanEvent[] = []
  for (const e of events || []) {
    if (!e || !e.title) continue
    const text = `${e.status || ""} ${e.title} ${e.description || ""}`
    const kind = classify(e)
    if (INTERNAL.test(text) && kind !== "confirmed") continue
    const title = FRIENDLY[kind]
    // keep the original wording only when it is plain Arabic with no leftovers worth hiding
    const own = scrub(e.title)
    const nice = kind === "other" && own && hasArabic(own) && !INTERNAL.test(own) ? own : title
    const city = scrub(e.station).slice(0, 60)
    const at = e.occurredAt || ""
    const d = at ? new Date(at) : null
    out.push({ kind, title: nice, detail: "", city, at, day: d && !isNaN(+d) ? d.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" }) : "" })
  }
  const sorted = out.sort((a, b) => +new Date(b.at || 0) - +new Date(a.at || 0))
  // collapse repeated scans of the same kind in the same city (keep the latest)
  return sorted.filter((e, i) => !(i > 0 && sorted[i - 1].kind === e.kind && sorted[i - 1].city === e.city && e.kind === "transit"))
}
export function groupByDay(list: CleanEvent[]): { day: string; items: CleanEvent[] }[] {
  const g: { day: string; items: CleanEvent[] }[] = []
  for (const e of list) {
    const last = g[g.length - 1]
    if (last && last.day === e.day) last.items.push(e)
    else g.push({ day: e.day || "—", items: [e] })
  }
  return g
}
/** Index of the furthest reached stage, from events and the order's own deliveryStatus. */
export function reachedStage(events: CleanEvent[], deliveryStatus?: string, hasShipment?: boolean): number {
  const idx = (k: Kind) => STAGES.findIndex((s) => s.key === k)
  let r = 0
  for (const e of events) { const i = idx(e.kind); if (i > r) r = i }
  if (events.some((e) => e.kind === "attempt")) r = Math.max(r, 4)
  if (deliveryStatus === "shipped") r = Math.max(r, 2)
  if (deliveryStatus === "delivered") r = 5
  if (hasShipment) r = Math.max(r, 1)
  return r
}
export const isReturned = (events: CleanEvent[]) => events.some((e) => e.kind === "return_start" || e.kind === "return_done")
