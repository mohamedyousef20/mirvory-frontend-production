"use client"

/**
 * HomeOffersCountdown
 * Shows offers on the homepage during their scheduled window (startDate → endDate).
 * - Before startDate: shows "starts in" countdown.
 * - Between startDate and endDate: shows "ends in" countdown.
 * - After endDate: hidden.
 * The window is re-checked every second on the client, so an offer appears
 * and disappears on time without a page reload.
 */

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Clock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { offerService } from "@/lib/api"

interface HomeOffer {
  _id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  isActive: boolean
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return { days, text: `${days > 0 ? `${days}:` : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}` }
}

export function HomeOffersCountdown() {
  const { language } = useLanguage()
  const isAr = language === "ar"
  const [offers, setOffers] = useState<HomeOffer[]>([])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    offerService
      .getActiveOffers()
      .then((res) => {
        const data = res?.data?.data ?? res?.data ?? []
        if (!cancelled) setOffers(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setOffers([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const visible = useMemo(
    () =>
      offers
        .filter((o) => o.isActive)
        .map((o) => ({
          ...o,
          start: new Date(o.startDate).getTime(),
          end: new Date(o.endDate).getTime(),
        }))
        .filter((o) => !Number.isNaN(o.start) && !Number.isNaN(o.end) && now < o.end)
        .sort((a, b) => a.end - b.end),
    [offers, now]
  )

  if (visible.length === 0) return null

  return (
    <section className="space-y-3" aria-label={isAr ? "العروض" : "Offers"}>
      {visible.map((o) => {
        const upcoming = now < o.start
        const remaining = formatRemaining(upcoming ? o.start - now : o.end - now)
        return (
          <Link
            key={o._id}
            href="/offers"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/10 to-transparent px-4 py-3 hover:shadow-md transition-shadow"
          >
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate">{o.title}</p>
              {o.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{o.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary whitespace-nowrap" dir="ltr">
              <Clock className="h-4 w-4" />
              <span className="text-muted-foreground font-normal">
                {upcoming ? (isAr ? "يبدأ بعد" : "Starts in") : isAr ? "ينتهي بعد" : "Ends in"}
              </span>
              <span className="tabular-nums">{remaining.text}</span>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
