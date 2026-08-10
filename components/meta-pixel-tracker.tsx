"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

declare global {
    interface Window {
        fbq?: (...args: any[]) => void
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