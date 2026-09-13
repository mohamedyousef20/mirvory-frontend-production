"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fbq?: (command: string, event: string, params?: Record<string, any>) => void
    }
}

export function MetaPixelTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (typeof window !== "undefined" && window.fbq) {
            window.fbq("track", "PageView")
        }
    }, [pathname, searchParams])

    return null
}