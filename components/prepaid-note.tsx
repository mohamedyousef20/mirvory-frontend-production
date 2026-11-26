import { PREPAID_DISCOUNT } from "@/lib/prepaid"

/** One line telling the customer about the discount for paying in advance. */
export function PrepaidNote({ className = "" }: { className?: string }) {
  return (
    <p dir="rtl" className={`flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[12.5px] font-bold leading-snug text-emerald-800 ${className}`}>
      <span className="material-symbols-outlined text-[18px]" aria-hidden>savings</span>
      ادفع مقدمًا بإنستا باي أو فودافون كاش واوفّر {PREPAID_DISCOUNT} ج.م
    </p>
  )
}
