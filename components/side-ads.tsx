'use client'

/**
 * SideAds
 * Displays active side advertisements fetched from /api/side-ads
 * (with fallback to announcements filtered by type='side_ad').
 *
 * Usage:
 *   <SideAds position="right" />
 *   <SideAds position="left" />
 *   <SideAds />          — shows all active ads regardless of position
 */

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { sideAdService, type SideAd } from '@/lib/api/services/sideAdService'
import { X } from 'lucide-react'

interface SideAdsProps {
  position?: 'left' | 'right' | 'both' | 'all'
  maxAds?: number
  className?: string
  /** If true, each ad can be dismissed locally (session) */
  dismissible?: boolean
}

export function SideAds({
  position = 'all',
  maxAds = 3,
  className = '',
  dismissible = true,
}: SideAdsProps) {
  const [ads, setAds] = useState<SideAd[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    sideAdService.getActive().then((all) => {
      const filtered =
        position === 'all'
          ? all
          : all.filter(
              (ad) =>
                !ad.position ||
                ad.position === position ||
                ad.position === 'both'
            )
      setAds(filtered.slice(0, maxAds))
    })
  }, [position, maxAds])

  const visible = ads.filter((ad) => !dismissed.has(ad._id))
  if (visible.length === 0) return null

  return (
    <aside className={`flex flex-col gap-3 ${className}`} aria-label="إعلانات جانبية">
      {visible.map((ad) => (
        <AdCard
          key={ad._id}
          ad={ad}
          dismissible={dismissible}
          onDismiss={() => setDismissed((prev) => new Set([...prev, ad._id]))}
        />
      ))}
    </aside>
  )
}

/* ── Single ad card ──────────────────────────────────────────────────────── */

function AdCard({
  ad,
  dismissible,
  onDismiss,
}: {
  ad: SideAd
  dismissible: boolean
  onDismiss: () => void
}) {
  const isValidUrl = (url?: string) => {
    if (!url) return false
    try { new URL(url); return true } catch { return false }
  }

  const card = (
    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss() }}
          className="absolute top-2 end-2 z-10 w-6 h-6 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="إغلاق الإعلان"
        >
          <X size={12} />
        </button>
      )}

      {/* Image */}
      {isValidUrl(ad.imageUrl) ? (
        <div className="relative w-full aspect-[4/3] bg-slate-100">
          <Image
            src={ad.imageUrl!}
            alt={ad.title}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover"
            unoptimized={ad.imageUrl?.includes('cloudinary') === false}
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#0d2f75] to-[#2465d4] flex items-center justify-center p-4">
          <p className="text-white text-sm font-bold text-center leading-snug">{ad.title}</p>
        </div>
      )}

      {/* Content */}
      {(ad.title || ad.content) && (
        <div className="p-3 space-y-1">
          {ad.title && (
            <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
              {ad.title}
            </p>
          )}
          {ad.content && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
              {ad.content}
            </p>
          )}
          {isValidUrl(ad.linkUrl) && (
            <span className="inline-block mt-1.5 text-xs font-semibold text-[#1a4fba] hover:underline">
              اعرف أكثر ←
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (isValidUrl(ad.linkUrl)) {
    return (
      <Link
        href={ad.linkUrl!}
        target={ad.linkUrl?.startsWith('http') ? '_blank' : undefined}
        rel={ad.linkUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="block"
      >
        {card}
      </Link>
    )
  }

  return card
}
