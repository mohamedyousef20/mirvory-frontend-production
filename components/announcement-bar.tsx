"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { announcementService } from "@/lib/api"

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Announcement {
  _id: string
  title: string
  titleEn?: string
  content?: string
  link?: string
  status?: string
  isMain?: boolean
}

/* ─── Separator between items ────────────────────────────────────────────── */
const Separator = () => (
  <span
    className="mx-3 text-blue-300 select-none opacity-70"
    aria-hidden="true"
  >
    ✦
  </span>
)

/* ─── Main Component ──────────────────────────────────────────────────────── */
export function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const trackRef = useRef<HTMLDivElement>(null)

  /* fetch non-main announcements */
  useEffect(() => {
    announcementService
      .getAnnouncements()
      .then((res: any) => {
        const raw: Announcement[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : []

        /* keep only active announcements that are NOT marked as main */
        const active = raw.filter(
          (a) =>
            (!a.status || a.status === "active") &&
            !a.isMain
        )
        setItems(active)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  /* don't render anything until data arrives or if empty */
  if (loading || items.length === 0) return null

  /*
   * Seamless RTL marquee (text flows Left → Right):
   *  - Duplicate the items array so the strip is 2× wide
   *  - Animate translateX(-50%) → translateX(0%)
   *  - At -50%: second copy is visible (first copy is off-screen to the left)
   *  - At   0%: first copy is visible  (second copy is off-screen to the right)
   *  - Seamless jump back because copies are identical
   */
  const doubled = [...items, ...items]

  /* pause / resume helpers */
  const pause = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = "paused"
    }
  }
  const resume = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = "running"
    }
  }

  return (
    <div
      role="region"
      aria-label="إعلانات المتجر"
      className="
        w-full overflow-hidden
        bg-[#0f2557]
        text-white
        select-none
        z-[60]
        relative
      "
      style={{ height: "34px" }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      /* touch: no pause on mobile intentionally */
    >
      {/* subtle gradient edges to hint infinite content */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10"
        style={{
          background:
            "linear-gradient(to left, #0f2557 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10"
        style={{
          background:
            "linear-gradient(to right, #0f2557 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="marquee-track flex items-center h-full whitespace-nowrap"
        aria-live="off"
      >
        {doubled.map((item, i) => (
          <span
            key={`${item._id}-${i}`}
            className="inline-flex items-center"
          >
            {item.link ? (
              <Link
                href={item.link}
                className="
                  text-sm font-semibold
                  text-white/95 hover:text-white
                  hover:underline underline-offset-2
                  transition-colors duration-150
                  px-3
                "
                style={{ fontFamily: "var(--font-cairo), Cairo, sans-serif" }}
                tabIndex={i >= items.length ? -1 : 0} /* only first copy is focusable */
              >
                {item.title}
              </Link>
            ) : (
              <span
                className="text-sm font-semibold text-white/95 px-3"
                style={{ fontFamily: "var(--font-cairo), Cairo, sans-serif" }}
              >
                {item.title}
              </span>
            )}
            <Separator />
          </span>
        ))}
      </div>
    </div>
  )
}
