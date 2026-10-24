"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { announcementService } from "@/lib/api"

interface Announcement {
  _id: string;
  image?: string;
  title: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  link?: string;
  isMain?: boolean;
  isActive?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toList(data: any): Announcement[] {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.announcements)) return data.announcements
  if (Array.isArray(data?.data)) return data.data
  if (data && typeof data === 'object' && data._id) return [data]
  return []
}

export function HeroCarousel() {
  const { language } = useLanguage()
  const ar = language === "ar"
  const [currentSlide, setCurrentSlide] = useState(0)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [sideAnnouncements, setSideAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  // Touch swipe tracking
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isDragging = useRef(false)

  // Fetch main announcements + all (for sidebar)
  useEffect(() => {
    let cancelled = false
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const [mainRes, allRes] = await Promise.allSettled([
          announcementService.getMainAnnouncements(),
          announcementService.getAnnouncements(),
        ])
        const main = mainRes.status === 'fulfilled' ? toList(mainRes.value.data) : []
        const all = allRes.status === 'fulfilled' ? toList(allRes.value.data) : []
        const mainIds = new Set(main.map(a => a._id))
        const side = all.filter(a => a.isActive !== false && !a.isMain && !mainIds.has(a._id))
        if (!cancelled) {
          setAnnouncements(main)
          setSideAnnouncements(side.slice(0, 2))
        }
      } catch (error) {
        console.error("Error fetching announcements:", error)
        if (!cancelled) { setAnnouncements([]); setSideAnnouncements([]) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAnnouncements()
    return () => { cancelled = true }
  }, [])

  const nextSlide = useCallback(() => {
    if (announcements.length <= 1) return;
    setCurrentSlide((prev) => (prev === announcements.length - 1 ? 0 : prev + 1))
  }, [announcements.length])

  const prevSlide = useCallback(() => {
    if (announcements.length <= 1) return;
    setCurrentSlide((prev) => (prev === 0 ? announcements.length - 1 : prev - 1))
  }, [announcements.length])

  // Auto-play
  useEffect(() => {
    if (announcements.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [announcements.length, nextSlide])

  // ── Touch handlers ────────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDragging.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    // Only treat as horizontal drag (prevents interfering with page scroll)
    if (dx > dy && dx > 8) {
      isDragging.current = true
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const SWIPE_THRESHOLD = 40
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      // RTL: swipe right → previous, swipe left → next (inverted for AR)
      if (ar) {
        dx > 0 ? nextSlide() : prevSlide()
      } else {
        dx < 0 ? nextSlide() : prevSlide()
      }
    }
    touchStartX.current = null
    touchStartY.current = null
    isDragging.current = false
  }, [ar, nextSlide, prevSlide])

  const hasSidebar = sideAnnouncements.length > 0
  const hasMultipleSlides = announcements.length > 1
  const layoutCls = useMemo(
    () => `container mx-auto grid grid-cols-1 gap-4 py-4 overflow-hidden ${hasSidebar || loading ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : ''}`,
    [hasSidebar, loading]
  )

  // ── Sidebar card ─────────────────────────────────────────────────────────────
  const renderSideCard = (a: Announcement, cls: string) => {
    const title = ar ? a.title : a.titleEn || a.title
    const text = ar ? a.content : a.contentEn || a.content
    const inner = (
      <>
        <Image
          src={a.image || "/placeholder.svg"}
          alt={title}
          fill
          sizes="320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-1 p-4 text-white">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug md:text-base">{title}</h3>
          {text && <p className="line-clamp-1 text-xs text-white/80">{text}</p>}
          {a.link && (
            <span className="inline-block pt-0.5 text-xs font-semibold text-orange-300">
              {ar ? "اعرف المزيد ←" : "Learn more →"}
            </span>
          )}
        </div>
      </>
    )
    const base = `group relative block min-h-0 overflow-hidden rounded-2xl bg-slate-900 shadow-sm ${cls}`
    return a.link ? (
      <Link key={a._id} href={a.link} className={base}>{inner}</Link>
    ) : (
      <div key={a._id} className={base}>{inner}</div>
    )
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={layoutCls}>
        <div className="aspect-[21/9] animate-pulse rounded-2xl bg-muted md:aspect-[3/1]" />
        <div className="hidden grid-rows-2 gap-4 lg:grid">
          <div className="animate-pulse rounded-2xl bg-muted" />
          <div className="animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (announcements.length === 0 && !hasSidebar) {
    return (
      <div className="relative aspect-[21/9] md:aspect-[3/1] bg-muted overflow-hidden">
        <div className="container h-full flex items-center justify-center">
          <p className="text-lg text-muted-foreground">
            {ar ? "لا توجد إعلانات متاحة" : "No announcements available"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-hidden">
      <div className={layoutCls}>
        {/* ── Main carousel ──────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-2xl shadow-sm select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(${ar ? currentSlide * 100 : -currentSlide * 100}%)`
            }}
          >
            {announcements.map((announcement) => (
              <div key={announcement._id} className="min-w-full relative flex-shrink-0">
                {/* v5: text section (right in RTL) + separate image section (left) */}
                <div
                  dir="rtl"
                  className="flex h-[190px] w-full overflow-hidden rounded-2xl bg-card md:h-[300px]"
                >
                  {/* Text section */}
                  <div className="flex w-[55%] flex-col justify-center gap-2 px-4 pb-6 text-right md:w-1/2 md:gap-4 md:px-10">
                    <h2 className="line-clamp-2 text-base font-bold leading-snug tracking-tight md:text-4xl md:line-clamp-3">
                      {ar ? announcement.title : announcement.titleEn || announcement.title}
                    </h2>
                    <p className="line-clamp-2 text-xs text-muted-foreground md:text-lg">
                      {ar ? announcement.content : announcement.contentEn || announcement.content}
                    </p>
                    <div>
                      <Button asChild size="sm" className="md:h-11 md:px-8 md:text-base">
                        <Link href={announcement.link || "/"}>
                          {ar ? "تسوق الآن" : "Shop Now"}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Image section */}
                  <div className="relative w-[45%] bg-muted md:w-1/2">
                    <Image
                      src={announcement.image || "/placeholder.svg"}
                      alt={ar ? announcement.title : announcement.titleEn || announcement.title}
                      fill
                      className="object-cover object-center"
                      priority
                      sizes="(max-width: 768px) 45vw, 40vw"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop arrows — hidden on mobile */}
          {hasMultipleSlides && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full h-10 w-10 hidden sm:flex"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full h-10 w-10 hidden sm:flex"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Pill indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                      currentSlide === index
                        ? "w-6 bg-primary"
                        : "w-2 bg-foreground/25 hover:bg-foreground/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar on desktop: stacked beside carousel ─────────────────────── */}
        {hasSidebar && (
          <div
            className="hidden gap-4 lg:grid"
            style={{ gridTemplateRows: `repeat(${sideAnnouncements.length}, minmax(0, 1fr))` }}
          >
            {sideAnnouncements.map(a => renderSideCard(a, ""))}
          </div>
        )}
      </div>

      {/* ── Sidebar on mobile/tablet: horizontal scroll row ──────────────────── */}
      {hasSidebar && (
        <div className="container mx-auto lg:hidden overflow-hidden">
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
            {sideAnnouncements.map(a =>
              renderSideCard(a, "aspect-[16/9] w-[75%] shrink-0 snap-start sm:w-[45%]")
            )}
          </div>
        </div>
      )}
    </div>
  )
}
