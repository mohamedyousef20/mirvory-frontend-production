"use client"

import { useCallback, useEffect, useState } from "react"
import { PRODUCTS_NAV_LABEL } from "@/lib/nav-labels"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthProvider"
import { cartService, notificationService, wishlistService } from "@/lib/api"
import { getGuestCartCount } from "@/lib/guestCart"
import { StitchHeader, StitchNav } from "@/components/stitch/StitchChrome"

// Pages that keep the classic navbar on mobile (own layout / flow)
export const CLASSIC_PREFIXES = ["/admin", "/vendor"]
// Focus flows: unified header, but no bottom tab bar (it would cover the sticky submit buttons)
export const NO_BOTTOM_PREFIXES = ["/admin", "/vendor", "/auth", "/checkout", "/guest-checkout", "/verifyEmail"]
// Screens that render their own header (with the search row) and tab bar inline
export const SELF_CHROME = ["/", "/cart"]
export const STITCH_PATHS = ["/", "/cart"]
export const isStitchPath = (p: string) => STITCH_PATHS.includes(p) || /^\/products\/[^/]+$/.test(p)
export const isClassicPath = (p: string) => CLASSIC_PREFIXES.some((x) => p.startsWith(x))

/** Wraps the classic navbar/announcement bar: visible on desktop always, on mobile only for classic paths. */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  return <div className={isClassicPath(pathname) ? "contents" : "hidden md:contents"}>{children}</div>
}

/** Top padding wrapper: the fixed mobile header takes the space on redesigned pages. */
// Exact paths whose mobile screen already reserves the header space itself (update as screens are rebuilt).
const SELF_SPACED = ["/", "/products", "/cart"]  // loyalty/wishlist/request-product use the default pt-16
/** Hides the legacy mobile chrome on pages that render their own Stitch header/nav. */
export function HideOnStitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  return isStitchPath(pathname) || isBarPath(pathname) ? null : <>{children}</>
}

export function PageOffset({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  const self = SELF_SPACED.includes(pathname) || isStitchPath(pathname)
  // Desktop: the Stitch header is sticky (in flow), so no offset on non-classic pages. Classic pages keep the old offset.
  return <div className={isClassicPath(pathname) ? "pt-16" : self ? "md:pt-0" : "pt-16 md:pt-0"}>{children}</div>
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
    { href: "/products", icon: "grid_view", label: PRODUCTS_NAV_LABEL },
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

/** Screens whose Stitch design uses a centered-title top bar (back arrow, title, more) and no bottom nav. */
export const BAR_SCREENS: Record<string, { title: string; sizeGuide?: boolean; eg?: boolean }> = {
  "/help": { title: "مركز المساعدة والمحادثة الفورية مع موثق المنتجات Mirvory Support" },
  "/size-guide": { title: "دليل المقاسات المعتمد Mirvory", sizeGuide: true },
  "/orders": { title: "تتبع الشحنة وسجل الطلبات" },
  "/returns/new": { title: "طلب إرجاع واستبدال Mirvory", sizeGuide: true },
  "/request-product": { title: "طلب منتج", eg: true },
}
export const isBarPath = (p: string) => p in BAR_SCREENS

export function StitchBackBar() {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const { user } = useAuth()
  const cfg = BAR_SCREENS[pathname]
  if (!cfg) return null
  const btn = "w-11 h-11 min-w-[44px] min-h-[44px] rounded-[9999px] flex items-center justify-center text-[#191c1e] hover:bg-[#eceef0] transition-colors"
  return (
    <header dir="rtl" className="md:hidden fixed top-0 w-full z-50 bg-[#ffffff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.03)] pt-[env(safe-area-inset-top)] font-[Cairo,sans-serif]">
      <div className="h-16 px-[1rem] flex items-center justify-between">
        <button aria-label="رجوع" className={btn} onClick={() => router.back()}>
          <span className="material-symbols-outlined text-[24px] rtl:rotate-180">arrow_back</span>
        </button>
        <h1 className="text-[16px] font-bold text-[#191c1e] truncate text-center flex-1 px-2 tracking-tight">{cfg.title}</h1>
        {cfg.eg ? (
          <Link aria-label="حسابي" href={user ? "/profile" : "/auth/login"} className="w-8 h-8 rounded-[9999px] bg-[#2563eb] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </Link>
        ) : (
          <div className="flex items-center gap-1 -me-2">
            {cfg.sizeGuide && (
              <Link aria-label="دليل المقاسات" href="/size-guide" className={btn}>
                <span className="material-symbols-outlined text-[22px]">straighten</span>
              </Link>
            )}
            <button aria-label="المزيد" className={btn} type="button">
              <span className="material-symbols-outlined text-[22px]">more_vert</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

/** Screens with the Stitch wordmark top bar (MIRVORY + EG pill, bell, profile) and the regular bottom nav. */
export const BRAND_SCREENS = ["/wishlist", "/loyalty", "/products"]
export function HideHeaderOnBrand({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  return BRAND_SCREENS.includes(pathname) ? null : <>{children}</>
}
export function StitchBrandBar() {
  const pathname = usePathname() || "/"
  const { user } = useAuth()
  if (!BRAND_SCREENS.includes(pathname)) return null
  const cat = pathname === "/products" // mirvory_7 variant: blue-tinted pill and profile circle
  return (
    <header dir="rtl" className="md:hidden fixed top-0 w-full z-50 bg-[#ffffff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-[env(safe-area-inset-top)] font-[Cairo,sans-serif]">
      <div className="h-16 px-[1rem] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[22px] leading-[30px] tracking-wider text-[#191c1e] uppercase font-bold select-none">MIRVORY</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-[9999px] ${cat ? "bg-[#dbe1ff] text-[#00174b]" : "bg-[#e6e8ea]"}`}>
            <span className="text-[11px] leading-none font-bold text-[#191c1e]">EG</span>
            <span className="text-xs select-none leading-none">🇪🇬</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link aria-label="الإشعارات" href="/notifications" className="w-11 h-11 rounded-[9999px] flex items-center justify-center text-[#434655] hover:bg-[#e6e8ea] transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </Link>
          <Link aria-label="حسابي" href={user ? "/profile" : "/auth/login"} className={`w-10 h-10 rounded-[9999px] flex items-center justify-center ${cat ? "bg-[#dbe1ff] text-[#00174b]" : "bg-[#2563eb] text-white"}`}>
            <span className="material-symbols-outlined text-[20px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

/** ONE mobile header for every page except admin/vendor (and "/" and "/cart", which render the same header with a search row inline). */
export function UnifiedMobileHeader() {
  const pathname = usePathname() || "/"
  if (isClassicPath(pathname) || SELF_CHROME.includes(pathname)) return null
  return <StitchHeader variant="plain" />
}
/** ONE bottom tab bar for every browsing page. Hidden on admin/vendor and on auth/checkout flows. */
export function UnifiedMobileNav() {
  const pathname = usePathname() || "/"
  if (NO_BOTTOM_PREFIXES.some((x) => pathname.startsWith(x)) || SELF_CHROME.includes(pathname)) return null
  return <StitchNav />
}
