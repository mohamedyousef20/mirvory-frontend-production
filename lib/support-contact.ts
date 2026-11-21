// Single source of truth for the support WhatsApp number (same number as app/contact/page.tsx).
export const SUPPORT_WHATSAPP = "201060167568"

export function buildSupportWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${SUPPORT_WHATSAPP}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
