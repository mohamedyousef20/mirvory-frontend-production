// Estimated delivery time in HOURS per governorate, as given by the store owner (from the shipping company).
// Ids match lib/data/greater-cairo-area.ts. Internal courier pickup rules are NOT shown to customers.
export interface DeliveryZone {
  key: "cairo_giza" | "delta_canal" | "upper" | "remote"
  hours: string
  hoursEn: string
  label: string
  labelEn: string
  governorates: string[]
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { key: "cairo_giza", hours: "24 – 48 ساعة", hoursEn: "24 – 48 hours", label: "القاهرة والجيزة", labelEn: "Cairo & Giza", governorates: ["cairo", "giza"] },
  {
    key: "delta_canal", hours: "48 – 72 ساعة", hoursEn: "48 – 72 hours", label: "الدلتا والقناة", labelEn: "Delta & Canal",
    governorates: ["alexandria", "dakahlia", "qalyubia", "gharbia", "kafr_el_sheikh", "monufia", "sharqia", "damietta", "ismailia", "port_said", "suez", "beheira"],
  },
  { key: "upper", hours: "72 – 96 ساعة", hoursEn: "72 – 96 hours", label: "الصعيد", labelEn: "Upper Egypt", governorates: ["fayoum", "beni_suef", "minya", "asyut", "sohag", "qena", "luxor", "aswan"] },
  {
    key: "remote", hours: "حتى 120 ساعة", hoursEn: "Up to 120 hours", label: "البحر الأحمر وسيناء والمناطق البعيدة", labelEn: "Red Sea, Sinai & remote areas",
    governorates: ["red_sea", "south_sinai", "north_sinai", "new_valley", "matrouh"],
  },
]

export const DELIVERY_NOTE = "المدة تقديرية من شركة الشحن وقد تختلف قليلاً حسب المنطقة."
export const DELIVERY_NOTE_EN = "Estimated by the shipping company; may vary slightly by area."

export function zoneFor(governorateId?: string | null): DeliveryZone | null {
  if (!governorateId) return null
  return DELIVERY_ZONES.find((z) => z.governorates.includes(governorateId)) ?? null
}
