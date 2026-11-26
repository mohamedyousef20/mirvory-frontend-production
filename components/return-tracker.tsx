"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { rememberPath } from "@/lib/returnTo"

/** Remembers the last non-auth page so login can send the customer back to it. */
export function ReturnTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname) rememberPath(pathname + (typeof window !== 'undefined' ? window.location.search : ''))
  }, [pathname])
  return null
}
