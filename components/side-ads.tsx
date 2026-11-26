'use client'

/**
 * SideAds
 * Text-only (no images). Shows the active NON-main announcements that the admin marked to appear at
 * this placement (home, product, cart, offers, products).
 *
 * - Under 1900px wide: an inline row of cards (1 per row on mobile, up to 3 on desktop).
 * - 1900px and wider: fixed rails in the empty page margins, one on each side.
 * - Each ad can be closed for the session.
 *
 * Usage: <SideAds placement="cart" />
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { announcementService } from '@/lib/api'
import { X } from 'lucide-react'

export type AdPlacement = 'home' | 'product' | 'cart' | 'offers' | 'products'

interface Ad {
  _id: string
  title?: string
  content?: string
  image?: string
  link?: string
  isMain?: boolean
  status?: string
  startDate?: string
  endDate?: string
  placements?: string[]
}

// One shared request for all placements on a page.
let adsPromise: Promise<Ad[]> | null = null
let adsFetchedAt = 0
function loadAds(): Promise<Ad[]> {
  if (!adsPromise || Date.now() - adsFetchedAt > 5 * 60 * 1000) {
    adsFetchedAt = Date.now()
    adsPromise = announcementService
      .getAnnouncements()
      .then((r: any) => {
        const d = r?.data
        return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []
      })
      .catch(() => [])
  }
  return adsPromise
}

const isLive = (a: Ad) => {
  if (a.isMain || (a.status && a.status !== 'active')) return false
  const now = Date.now()
  if (a.startDate && new Date(a.startDate).getTime() > now) return false
  if (a.endDate && new Date(a.endDate).getTime() < now) return false
  return !!(a.title || a.content)
}

// Only http(s) and site-relative links are rendered as links.
const safeHref = (u?: string) => {
  const t = (u || '').trim()
  return /^(https?:\/\/|\/(?!\/))/i.test(t) ? t : ''
}
const isExternal = (h: string) => /^https?:\/\//i.test(h)

const DISMISS_KEY = 'mirvory-dismissed-ads'
const readDismissed = (): string[] => {
  try { return JSON.parse(sessionStorage.getItem(DISMISS_KEY) || '[]') } catch { return [] }
}

export function SideAds({ placement, className = '' }: { placement: AdPlacement; className?: string }) {
  const [ads, setAds] = useState<Ad[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    setDismissed(readDismissed())
    let alive = true
    loadAds().then((all) => {
      if (!alive) return
      setAds(all.filter((a) => isLive(a) && Array.isArray(a.placements) && a.placements.includes(placement)))
    })
    return () => { alive = false }
  }, [placement])

  const close = (id: string) => {
    const next = [...dismissed, id]
    setDismissed(next)
    try { sessionStorage.setItem(DISMISS_KEY, JSON.stringify(next)) } catch {}
  }

  const visible = ads.filter((a) => !dismissed.includes(a._id))
  if (visible.length === 0) return null

  const rightRail = visible.filter((_, i) => i % 2 === 0).slice(0, 2)
  const leftRail = visible.filter((_, i) => i % 2 === 1).slice(0, 2)

  return (
    <>
      <aside
        aria-label="إعلانات"
        dir="rtl"
        className={`mx-auto w-full max-w-7xl px-4 md:px-6 py-4 min-[1900px]:hidden ${className}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.slice(0, 3).map((a, i) => (
            <div key={a._id} className={i >= 2 ? 'hidden lg:block' : ''}>
              <AdCard ad={a} onClose={() => close(a._id)} />
            </div>
          ))}
        </div>
      </aside>

      {rightRail.length > 0 && (
        <aside
          aria-label="إعلانات جانبية"
          dir="rtl"
          className="hidden min-[1900px]:flex fixed top-32 z-20 w-[150px] flex-col gap-3"
          style={{ left: 'calc(50% + 766px)' }}
        >
          {rightRail.map((a) => <AdCard key={a._id} ad={a} compact onClose={() => close(a._id)} />)}
        </aside>
      )}
      {leftRail.length > 0 && (
        <aside
          aria-label="إعلانات جانبية"
          dir="rtl"
          className="hidden min-[1900px]:flex fixed top-32 z-20 w-[150px] flex-col gap-3"
          style={{ right: 'calc(50% + 766px)' }}
        >
          {leftRail.map((a) => <AdCard key={a._id} ad={a} compact onClose={() => close(a._id)} />)}
        </aside>
      )}
    </>
  )
}

function AdCard({ ad, compact = false, onClose }: { ad: Ad; compact?: boolean; onClose: () => void }) {
  const href = safeHref(ad.link)
  const body = (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 shadow-sm transition-shadow hover:shadow-md">
      <span className="absolute inset-y-0 right-0 w-1 bg-[#0b57d0]" aria-hidden />
      <div className={`space-y-1 pe-4 ps-10 ${compact ? 'py-3' : 'py-3.5'}`}>
        {ad.title && <p className={`font-bold leading-snug text-slate-900 ${compact ? 'text-sm' : 'text-[15px]'}`}>{ad.title}</p>}
        {ad.content && <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{ad.content}</p>}
        {href && <span className="inline-block pt-1 text-xs font-bold text-[#0b57d0]">اعرف أكتر ←</span>}
      </div>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose() }}
        aria-label="إغلاق الإعلان"
        className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
      >
        <X size={13} />
      </button>
    </div>
  )
  if (!href) return body
  return isExternal(href)
    ? <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="block">{body}</a>
    : <Link href={href} className="block">{body}</Link>
}
