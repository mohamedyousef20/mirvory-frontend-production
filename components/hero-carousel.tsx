"use client"

import { useState, useEffect, useMemo } from "react"
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([])   // main (carousel)
  const [sideAnnouncements, setSideAnnouncements] = useState<Announcement[]>([]) // non-main (sidebar)
  const [loading, setLoading] = useState(true)

  // Fetch main announcements (carousel) + all announcements (to derive the sidebar)
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
        // Sidebar = active announcements that are NOT in the main carousel
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

  const nextSlide = () => {
    if (announcements.length <= 1) return;
    setCurrentSlide((prev) => (prev === announcements.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    if (announcements.length <= 1) return;
    setCurrentSlide((prev) => (prev === 0 ? announcements.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (announcements.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === announcements.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [announcements.length])

  const hasSidebar = sideAnnouncements.length > 0
  const hasMultipleSlides = announcements.length > 1
  const layoutCls = useMemo(
    () => `container mx-auto grid grid-cols-1 gap-4 py-4 ${hasSidebar || loading ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : ''}`,
    [hasSidebar, loading]
  )

  // ── Sidebar card (full-bleed image + gradient + text) ────────────────────────
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

  // ── Loading skeleton ─────────────────────────────────────────────────────────
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
      <div className="relative aspect-[21/9] md:aspect-[3/1] bg-muted">
        <div className="container h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              {ar ? "لا توجد إعلانات متاحة" : "No announcements available"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className={layoutCls}>
        {/* ── Main carousel ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl shadow-sm">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(${ar ? currentSlide * 100 : -currentSlide * 100}%)`
            }}
          >
            {announcements.map((announcement) => (
              <div key={announcement._id} className="min-w-full relative">
                <div className="relative aspect-[21/9] md:aspect-[3/1]">
                  <Image
                    src={announcement.image || "/placeholder.svg"}
                    alt={ar ? announcement.title : announcement.titleEn || announcement.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20 dark:from-background/90 dark:to-background/30">
                    <div className="flex h-full items-center px-6 md:px-10">
                      <div className="max-w-lg space-y-4">
                        <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                          {ar ? announcement.title : announcement.titleEn || announcement.title}
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground">
                          {ar ? announcement.content : announcement.contentEn || announcement.content}
                        </p>
                        <Button asChild size="lg">
                          <Link href={announcement.link || "/"}>
                            {ar ? "تسوق الآن" : "Shop Now"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMultipleSlides && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full h-10 w-10"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Previous slide</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full h-10 w-10"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next slide</span>
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 rtl:space-x-reverse">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all ${currentSlide === index ? "w-6 bg-primary" : "w-2 bg-muted"}`}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <span className="sr-only">Go to slide {index + 1}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar: non-main announcements (desktop: stacked beside carousel) ── */}
        {hasSidebar && (
          <div
            className="hidden gap-4 lg:grid"
            style={{ gridTemplateRows: `repeat(${sideAnnouncements.length}, minmax(0, 1fr))` }}
          >
            {sideAnnouncements.map(a => renderSideCard(a, ""))}
          </div>
        )}
      </div>

      {/* ── Sidebar on mobile/tablet: horizontal swipe row under the carousel ── */}
      {hasSidebar && (
        <div className="container mx-auto lg:hidden">
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
            {sideAnnouncements.map(a => renderSideCard(a, "aspect-[16/9] w-[75%] shrink-0 snap-start sm:w-[45%]"))}
          </div>
        </div>
      )}
    </div>
  )
}