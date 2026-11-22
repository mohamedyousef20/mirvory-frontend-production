"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthProvider"
import { cartService, notificationService, wishlistService } from "@/lib/api"
import { getGuestCartCount } from "@/lib/guestCart"

// Pages that keep the classic navbar on mobile (own layout / flow)
export const CLASSIC_PREFIXES = ["/admin", "/vendor", "/auth", "/checkout", "/guest-checkout", "/verifyEmail"]
export const isClassicPath = (p: string) => CLASSIC_PREFIXES.some((x) => p.startsWith(x))

/** Wraps the classic navbar/announcement bar: visible on desktop always, on mobile only for classic paths. */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  return <div className={isClassicPath(pathname) ? "contents" : "hidden md:contents"}>{children}</div>
}

/** Top padding wrapper: the fixed mobile header takes the space on redesigned pages. */
// Exact paths whose mobile screen already reserves the header space itself (update as screens are rebuilt).
const SELF_SPACED = ["/", "/products", "/cart"]
export function PageOffset({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  const self = SELF_SPACED.includes(pathname) || /^\/products\/[^/]+$/.test(pathname)
  return <div className={!isClassicPath(pathname) && self ? "md:pt-16" : "pt-16"}>{children}</div>
}

export function MobileHeader() {
  const pathname = usePathname() || "/"
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)
  const authed = Boolean(user)

  useEffect(() => {
    if (!authed) return setUnread(0)
    notificationService
      .getNotificationCount()
      .then((r: any) => {
        const n = r.data?.data ?? r.data?.count ?? 0
        setUnread(typeof n === "number" ? n : 0)
      })
      .catch(() => setUnread(0))
  }, [authed, pathname])

  if (isClassicPath(pathname)) return null
  return (
    <header dir="rtl" className="md:hidden fixed top-0 w-full z-50 bg-m3-surface-container-lowest/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.03)] pt-[env(safe-area-inset-top)]">
      <div className="px-m3-margin py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-m3-headline-lg text-m3-headline-lg tracking-tight uppercase text-m3-on-surface font-extrabold select-none">MIRVORY</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-m3-primary-fixed text-m3-on-primary-fixed font-m3-label-sm text-m3-label-sm font-bold tracking-wider">
            <span>🇪🇬</span>
            <span>EG</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/notifications" aria-label="الإشعارات" className="relative w-10 h-10 flex items-center justify-center rounded-full text-m3-on-surface hover:bg-m3-surface-container transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unread > 0 && <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-m3-tertiary" />}
          </Link>
          <Link
            href={authed ? "/profile" : "/auth/login"}
            aria-label="الملف الشخصي"
            className="relative w-10 h-10 rounded-full bg-m3-primary-fixed flex items-center justify-center text-m3-on-primary-fixed hover:bg-m3-primary hover:text-m3-on-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export function MobileNav() {
  const pathname = usePathname() || "/"
  const { user, cookiesReady } = useAuth()
  const authed = Boolean(user)
  const [cart, setCart] = useState(0)

  const load = useCallback(async () => {
    if (!authed) return setCart(getGuestCartCount())
    if (!cookiesReady) return
    try {
      const r = await cartService.getCartCount()
      setCart(r.data?.count || 0)
    } catch {
      setCart(0)
    }
  }, [authed, cookiesReady])

  useEffect(() => {
    load()
  }, [load, pathname])
  useEffect(() => {
    window.addEventListener("cart-updated", load)
    return () => window.removeEventListener("cart-updated", load)
  }, [load])

  if (isClassicPath(pathname)) return null
  const items = [
    { href: "/", icon: "home", label: "الرئيسية", exact: true },
    { href: "/products", icon: "grid_view", label: "المنتجات" },
    { href: "/wishlist", icon: "favorite", label: "المفضلة" },
    { href: "/cart", icon: "shopping_bag", label: "السلة", badge: cart },
    { href: authed ? "/profile" : "/auth/login", icon: "person", label: "حسابي", match: "/profile" },
  ]
  return (
    <nav dir="rtl" aria-label="التنقل السفلي" className="md:hidden fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom)] bg-m3-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-4px_16px_rgba(15,23,42,0.04)]">
      <div className="flex justify-around items-center h-16 px-m3-space-xs">
        {items.map((it) => {
          const base = it.match || it.href
          const active = it.exact ? pathname === it.href : pathname === base || pathname.startsWith(base + "/")
          return (
            <Link
              key={it.label}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-12 transition-colors ${active ? "text-primary-container font-bold" : "text-on-surface-variant"}`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{it.icon}</span>
              <span className="font-m3-label-sm text-m3-label-sm">{it.label}</span>
              {it.badge ? (
                <span className="absolute top-1.5 left-3 min-w-[16px] h-4 px-1 rounded-full bg-m3-primary-container text-m3-on-primary text-[10px] font-bold flex items-center justify-center leading-none">
                  {it.badge > 99 ? "99+" : it.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
