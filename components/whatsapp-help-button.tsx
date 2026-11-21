"use client"

import { cn } from "@/lib/utils"
import { buildSupportWhatsAppUrl } from "@/lib/support-contact"

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.5 14.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 2C6.5 2 2 6.5 2 12.04c0 1.77.46 3.5 1.34 5.02L2 22l5.07-1.33a10 10 0 0 0 4.97 1.27C17.58 21.94 22 17.5 22 11.96 22 6.5 17.55 2 12.04 2zm0 18.2c-1.5 0-2.96-.4-4.24-1.16l-.3-.18-3.01.79.8-2.93-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.23 3.7 8.23 8.25 0 4.54-3.7 8.15-8.27 8.15z" />
    </svg>
  )
}

interface Props {
  message?: string
  label?: string
  className?: string
  variant?: "solid" | "outline"
}

/** WhatsApp support button (replaces live chat). */
export function WhatsAppHelpButton({ message, label, className, variant = "solid" }: Props) {
  return (
    <a
      href={buildSupportWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-colors",
        variant === "solid"
          ? "bg-[#25D366] text-white hover:bg-[#1ebe5a]"
          : "border border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10",
        className
      )}
    >
      <WhatsAppIcon className="h-5 w-5" />
      {label ?? "تواصل معنا عبر واتساب"}
    </a>
  )
}
