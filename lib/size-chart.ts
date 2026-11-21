// Static sizing reference for the size guide page. Edit freely — it is plain content, not backend data.
export type SizeRow = { eu: string; us: string; uk: string; cm: string }

export const MEN_SIZES: SizeRow[] = [
  { eu: "40", us: "7.0", uk: "6.5", cm: "25.5" },
  { eu: "41", us: "8.0", uk: "7.5", cm: "26.0" },
  { eu: "42", us: "8.5", uk: "8.0", cm: "26.5" },
  { eu: "42.5", us: "9.0", uk: "8.5", cm: "27.0" },
  { eu: "43", us: "9.5", uk: "9.0", cm: "27.5" },
  { eu: "44", us: "10.0", uk: "9.5", cm: "28.0" },
  { eu: "45", us: "11.0", uk: "10.5", cm: "29.0" },
]

export const WOMEN_SIZES: SizeRow[] = [
  { eu: "36", us: "5.5", uk: "3.5", cm: "22.5" },
  { eu: "37", us: "6.5", uk: "4.5", cm: "23.5" },
  { eu: "38", us: "7.5", uk: "5.5", cm: "24.0" },
  { eu: "39", us: "8.5", uk: "6.5", cm: "25.0" },
  { eu: "40", us: "9.0", uk: "7.0", cm: "25.5" },
  { eu: "41", us: "10.0", uk: "8.0", cm: "26.0" },
]

export type BrandFit = { brand: string; fit: "snug" | "tts" | "roomy"; note: string }

export const BRAND_FIT: BrandFit[] = [
  { brand: "New Balance", fit: "tts", note: "مطابق للقياس الحقيقي مع راحة إضافية بمشط القدم." },
  { brand: "Nike / Jordan", fit: "snug", note: "يميل للضيق قليلًا، ويفضل اختيار نصف نمرة أكبر لو بين مقاسين." },
  { brand: "Asics", fit: "tts", note: "مطابق للقياس الحقيقي في أغلب الموديلات." },
  { brand: "Adidas / Yeezy", fit: "roomy", note: "يميل للاتساع، ويفضل نصف نمرة أصغر في بعض الموديلات." },
]
