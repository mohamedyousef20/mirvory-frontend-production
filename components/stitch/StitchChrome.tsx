"use client"
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthProvider"
import { cartService, notificationService, wishlistService } from "@/lib/api"
import { getGuestCartCount } from "@/lib/guestCart"

/** Header from the Stitch home screen (brand + EGYPT pill, icons, search row). Pixel values copied from the Stitch code. */
export function StitchHeader({ variant = "home" }: { variant?: "home" | "cart" }) {
  const { user } = useAuth()
  const authed = Boolean(user)
  const pathname = usePathname() || "/"
  const [unread, setUnread] = useState(0)
  const [favs, setFavs] = useState(0)

  useEffect(() => {
    if (!authed) {
      setUnread(0)
      setFavs(0)
      return
    }
    notificationService.getNotificationCount().then((r: any) => {
      const n = r.data?.data ?? r.data?.count ?? 0
      setUnread(typeof n === "number" ? n : 0)
    }).catch(() => setUnread(0))
    wishlistService.getWishlist().then((r: any) => setFavs((r.data?.data?.products ?? []).length)).catch(() => setFavs(0))
  }, [authed, pathname])

  const circle = "relative w-10 h-10 flex items-center justify-center rounded-[9999px] text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
  return (
    <header dir="rtl" className="md:hidden fixed top-0 w-full z-50 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(15,23,42,0.06)] pt-safe border-b border-[#e2e8f0]/60 font-[Cairo,sans-serif]">
      <div className="h-28 px-[1rem] flex flex-col justify-center gap-[0.25rem]">
        <div className="flex items-center justify-between gap-[0.5rem]">
          <div className="flex items-center gap-2.5">
            <Link className="flex items-center gap-2 select-none group" href="/">
              <div className="flex items-center tracking-tight">
                {variant === "home" && (
                  <span className="inline-flex items-center justify-center font-black text-xl italic tracking-tighter text-slate-900 group-hover:scale-105 transition-transform">
                    V<span className="text-rose-600 ml-[-2px]">O</span>
                  </span>
                )}
                <span className="font-extrabold text-[19px] tracking-wider text-slate-950 font-['Space_Grotesk'] mr-1.5 uppercase">MIRVORY</span>
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded-[9999px] bg-slate-900 text-white font-bold text-[10px] tracking-widest flex items-center gap-1 shadow-sm">
              <span>EGYPT</span> <span className="w-1.5 h-1.5 rounded-[9999px] bg-emerald-400"></span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link aria-label="الإشعارات" href={authed ? "/notifications" : "/auth/login"} className={circle}>
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unread > 0 && <span className="absolute top-2 left-2 w-2 h-2 rounded-[9999px] bg-rose-500 ring-2 ring-white"></span>}
            </Link>
            <Link aria-label="المفضلة" href={authed ? "/wishlist" : "/auth/login"} className={circle}>
              <span className="material-symbols-outlined text-[22px]">favorite</span>
              {favs > 0 && <span className="absolute top-1 left-1 min-w-[16px] h-4 px-1 rounded-[9999px] bg-[#2563eb] text-white text-[10px] font-bold flex items-center justify-center leading-none">{favs}</span>}
            </Link>
            <Link aria-label="حسابي" href={authed ? "/profile" : "/auth/login"} className="w-8 h-8 rounded-[9999px] bg-gradient-to-tr from-[#004ac6] to-blue-500 text-white flex items-center justify-center shrink-0 mr-1 shadow-sm ring-2 ring-[#dbeafe]">
              <span className="material-symbols-outlined text-[17px]">person</span>
            </Link>
          </div>
        </div>
        <div className="w-full">
          <Link href="/products" className="relative flex items-center w-full h-10 px-3.5 bg-[#f1f5f9] rounded-[0.875rem] text-[#475569] hover:bg-[#e2e8f0] transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[#475569] text-[20px] ml-2 shrink-0">search</span>
            <span className="text-sm font-semibold text-[#475569]/80 truncate select-none">{variant === "cart" ? "ابحث عن حذائك المفضل..." : "ابحث بالموديل، الماركة (Nike, NB, Asics)..."}</span>
            <span className="material-symbols-outlined text-[#475569] text-[18px] mr-auto shrink-0 bg-white p-1 rounded-md shadow-xs">tune</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

/** Bottom tab bar from the Stitch home screen. */
export function StitchNav() {
  const { user, cookiesReady } = useAuth()
  const authed = Boolean(user)
  const pathname = usePathname() || "/"
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
  useEffect(() => { load() }, [load, pathname])
  useEffect(() => {
    window.addEventListener("cart-updated", load)
    return () => window.removeEventListener("cart-updated", load)
  }, [load])

  const items = [
    { href: "/", icon: "home", label: "الرئيسية", exact: true },
    { href: "/products", icon: "grid_view", label: "الأقسام", exact: true },
    { href: authed ? "/wishlist" : "/auth/login", icon: "favorite", label: "المفضلة", match: "/wishlist" },
    { href: "/cart", icon: "shopping_bag", label: "السلة", badge: cart },
    { href: authed ? "/profile" : "/auth/login", icon: "person", label: "حسابي", match: "/profile" },
  ]
  return (
    <nav dir="rtl" className="md:hidden fixed bottom-0 w-full z-50 pb-safe bg-[#ffffff]/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(15,23,42,0.05)] font-[Cairo,sans-serif]">
      <div className="flex justify-around items-center h-16 px-[0.25rem]">
        {items.map((it) => {
          const base = it.match || it.href
          const active = it.exact ? pathname === it.href : pathname === base || pathname.startsWith(base + "/")
          return (
            <Link
              key={it.label}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-12 transition-colors ${active ? "text-[#004ac6] font-bold" : "text-[#475569] hover:text-slate-900"}`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{it.icon}</span>
              <span className={`text-[11px] ${active ? "font-bold" : "font-semibold"}`}>{it.label}</span>
              {it.badge ? <span className="absolute top-1.5 left-3 min-w-[16px] h-4 px-1 rounded-[9999px] bg-[#2563eb] text-white text-[10px] font-bold flex items-center justify-center leading-none">{it.badge > 99 ? "99+" : it.badge}</span> : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
