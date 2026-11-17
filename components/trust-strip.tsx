"use client"

import Link from "next/link"
import type { ElementType, ReactNode } from "react"
import { Banknote, RotateCcw, Truck } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

/**
 * Three short reassurance badges shown on the home page (shipping, cash on delivery, returns).
 * The returns badge links to the return policy; the other two are informational.
 */

type TrustItem = {
  icon: ElementType
  title: { ar: string; en: string }
  sub: { ar: string; en: string }
  href?: string
}

const ITEMS: TrustItem[] = [
  {
    icon: Truck,
    title: { ar: "شحن للمحافظات", en: "Nationwide shipping" },
    sub: { ar: "لكل محافظات مصر", en: "All Egyptian governorates" },
  },
  {
    icon: Banknote,
    title: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
    sub: { ar: "ادفع وانت مستلم طلبك", en: "Pay when you receive" },
  },
  {
    icon: RotateCcw,
    title: { ar: "إرجاع واضح", en: "Clear returns" },
    sub: { ar: "اعرف سياسة الإرجاع", en: "See the return policy" },
    href: "/return-policy",
  },
]

const CARD_CLASS =
  "flex h-full flex-col items-center gap-1.5 rounded-2xl border bg-card px-2 py-4 text-center"

function Card({ href, children }: { href?: string; children: ReactNode }) {
  if (href) {
    return (
      <Link href={href} className={`${CARD_CLASS} transition-colors hover:bg-accent`}>
        {children}
      </Link>
    )
  }
  return <div className={CARD_CLASS}>{children}</div>
}

export function TrustStrip() {
  const { language } = useLanguage()
  const ar = language === "ar"

  return (
    <section aria-label={ar ? "مميزات التسوق" : "Shopping benefits"} className="py-4">
      <ul className="grid grid-cols-3 gap-2 sm:gap-3">
        {ITEMS.map(({ icon: Icon, title, sub, href }) => (
          <li key={title.en}>
            <Card href={href}>
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-[13px] font-extrabold leading-tight">
                {ar ? title.ar : title.en}
              </span>
              <span className="text-[11px] leading-tight text-muted-foreground">
                {ar ? sub.ar : sub.en}
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
