"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Home, Package, ShoppingCart, Tag } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/contexts/AuthProvider"
import { cartService, wishlistService } from "@/lib/api"
import { getGuestCartCount } from "@/lib/guestCart"

/**
 * v5: Mobile bottom navigation (hidden from md and up).
 * Order is written for RTL: Home, Products, Offers, Wishlist, Cart.
 * The top navbar is NOT touched — it keeps account, notifications, dark mode, menu and search.
 */

// Pages where the bottom bar must not appear (they have their own layout / flow)
const HIDDEN_PREFIXES = ["/admin", "/vendor", "/auth", "/checkout", "/guest-checkout", "/verifyEmail"]

export function MobileBottomNav() {
  const pathname = usePathname() || "/"
  const { language } = useLanguage()
  const { user, cookiesReady } = useAuth()
  const isLoggedIn = Boolean(user)
  const ar = language === "ar"

  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  const loadCounts = useCallback(async () => {
    if (!isLoggedIn) {
      setCartCount(getGuestCartCount())
      setWishlistCount(0)
      return
    }
    if (!cookiesReady) return
    try {
      const res = await cartService.getCartCount()
      setCartCount(res.data?.count || 0)
    } catch {
      setCartCount(0)
    }
    try {
      const res = await wishlistService.getWishlistCount()
      setWishlistCount(res.data?.count || 0)
    } catch {
      setWishlistCount(0)
    }
  }, [isLoggedIn, cookiesReady])

  // Refresh on navigation and whenever the app announces a cart / wishlist change
  useEffect(() => {
    loadCounts()
  }, [loadCounts, pathname])

  useEffect(() => {
    window.addEventListener("cart-updated", loadCounts)
    window.addEventListener("wishlist-updated", loadCounts)
    return () => {
      window.removeEventListener("cart-updated", loadCounts)
      window.removeEventListener("wishlist-updated", loadCounts)
    }
  }, [loadCounts])

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  const items = [
    { href: "/", label: ar ? "الرئيسية" : "Home", icon: Home, exact: true },
    { href: "/products", label: ar ? "المنتجات" : "Products", icon: Package },
    { href: "/offers", label: ar ? "العروض" : "Offers", icon: Tag },
    { href: "/wishlist", label: ar ? "المفضلة" : "Wishlist", icon: Heart, badge: wishlistCount },
    { href: "/cart", label: ar ? "السلة" : "Cart", icon: ShoppingCart, badge: cartCount },
  ]

  return (
    <nav
      aria-label={ar ? "التنقل السفلي" : "Bottom navigation"}
      dir="rtl"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                  active ? "text-[#1d4ed8] dark:text-blue-400" : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  {badge ? (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
