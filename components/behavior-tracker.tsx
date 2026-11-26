"use client"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { track } from "@/lib/track"

/** Page-level events: pageview, product_view (from /products/<id>), checkout_start. Admin/vendor are not tracked. */
export function BehaviorTracker() {
  const pathname = usePathname() || "/"
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/vendor")) return
    track("pageview")
    const m = pathname.match(/^\/products\/([0-9a-fA-F]{24})$/)
    if (m) track("product_view", { productId: m[1] })
    if (pathname === "/checkout" || pathname === "/guest-checkout") track("checkout_start")
  }, [pathname])
  return null
}
