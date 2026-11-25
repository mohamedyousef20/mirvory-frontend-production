"use client"
import { usePathname } from "next/navigation"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"
import { WhatsAppIcon } from "@/components/whatsapp-help-button"

/** Optional suggestion C: floating WhatsApp button (mobile). Delete this file and its line in layout.tsx to drop it. */
export function FloatingWhatsApp() {
  const pathname = usePathname() || "/"
  const hide = ["/admin", "/vendor", "/auth", "/checkout", "/guest-checkout", "/verifyEmail", "/help", "/cart", "/products/"].some((x) => pathname.startsWith(x))
  if (hide) return null
  return (
    <a
      href={buildSupportWhatsAppUrl("مرحباً، محتاج مساعدة")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="md:hidden fixed left-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 w-12 h-12 rounded-[9999px] bg-[#25D366] text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
    >
      <WhatsAppIcon className="w-6 h-6" />
    </a>
  )
}
