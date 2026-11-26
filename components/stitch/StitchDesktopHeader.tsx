"use client"
import Link from "next/link"
import { PRODUCTS_NAV_LABEL } from "@/lib/nav-labels"
import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthProvider"
import { cartService, notificationService } from "@/lib/api"
import { getGuestCartCount } from "@/lib/guestCart"
import { SuggestPanel, saveRecent } from "./SearchSuggest"

/** Desktop header in the Stitch design language (extension of the mobile Stitch header). Replaces MainNav on md+ for non-classic pages. */
const links: [string, string][] = [["الرئيسية", "/"], [PRODUCTS_NAV_LABEL, "/products"], ["العروض", "/offers"], ["المساعدة", "/help"]]

export function StitchDesktopHeader() {
  const { user, cookiesReady, logout } = useAuth()
  const authed = Boolean(user)
  const pathname = usePathname() || "/"
  const router = useRouter()
  const [cart, setCart] = useState(0)
  const [unread, setUnread] = useState(0)
  const [menu, setMenu] = useState(false)
  const [q, setQ] = useState("")
  const [sOpen, setSOpen] = useState(false)

  const load = useCallback(async () => {
    if (!authed) return setCart(getGuestCartCount())
    if (!cookiesReady) return
    try { setCart((await cartService.getCartCount()).data?.count || 0) } catch { setCart(0) }
  }, [authed, cookiesReady])
  useEffect(() => { load() }, [load, pathname])
  useEffect(() => { window.addEventListener("cart-updated", load); return () => window.removeEventListener("cart-updated", load) }, [load])
  useEffect(() => {
    if (!authed) return setUnread(0)
    notificationService.getNotificationCount().then((r: any) => { const n = r.data?.data ?? r.data?.count ?? 0; setUnread(typeof n === "number" ? n : 0) }).catch(() => setUnread(0))
  }, [authed, pathname])
  useEffect(() => setMenu(false), [pathname])

  const circle = "relative w-10 h-10 flex items-center justify-center rounded-[9999px] text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
  return (
    <header dir="rtl" className="hidden md:block sticky top-0 z-50 w-full bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(15,23,42,0.06)] border-b border-[#e2e8f0]/60 font-[Cairo,sans-serif]">
      <div className="mx-auto max-w-6xl h-[72px] px-[2rem] flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 select-none shrink-0">
          <span className="font-extrabold text-[20px] tracking-wider text-slate-950 font-['Space_Grotesk'] uppercase">MIRVORY</span>
          <span className="px-2 py-0.5 rounded-[9999px] bg-slate-900 text-white font-bold text-[10px] tracking-widest flex items-center gap-1"><span>EGYPT</span><span className="w-1.5 h-1.5 rounded-[9999px] bg-emerald-400" /></span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(([t, h]) => {
            const active = h === "/" ? pathname === "/" : pathname.startsWith(h)
            return <Link key={h} href={h} className={`px-3 py-2 rounded-[0.875rem] text-sm font-semibold transition-colors ${active ? "bg-[#dbeafe] text-[#004ac6]" : "text-slate-600 hover:bg-[#f1f5f9] hover:text-slate-900"}`}>{t}</Link>
          })}
        </nav>
        <form onSubmit={(e) => { e.preventDefault(); saveRecent(q); setSOpen(false); router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products") }} className="relative flex-1 min-w-[180px]">
          <label className="flex w-full items-center h-10 px-3.5 bg-[#f1f5f9] rounded-[0.875rem] focus-within:ring-2 focus-within:ring-[#004ac6]/20">
            <span className="material-symbols-outlined text-[#475569] text-[20px] ml-2">search</span>
            <input value={q} type="search" style={{ WebkitAppearance: "none" }} autoComplete="off" onFocus={() => setSOpen(true)} onBlur={() => setSOpen(false)} onChange={(e) => { setQ(e.target.value); setSOpen(true) }} placeholder="ابحث بالموديل، الماركة (Nike, NB, Asics)..." className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-[#475569]/80" />
          </label>
          <SuggestPanel q={q} open={sOpen} onClose={() => setSOpen(false)} onPick={(t) => { saveRecent(t); setSOpen(false); router.push(`/products?q=${encodeURIComponent(t)}`) }} />
        </form>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link aria-label="الإشعارات" href={authed ? "/notifications" : "/auth/login"} className={circle}>
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unread > 0 && <span className="absolute top-2 left-2 w-2 h-2 rounded-[9999px] bg-rose-500 ring-2 ring-white" />}
          </Link>
          <Link aria-label="المفضلة" href={authed ? "/wishlist" : "/auth/login"} className={circle}><span className="material-symbols-outlined text-[22px]">favorite</span></Link>
          <Link aria-label="السلة" href="/cart" className={circle}>
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {cart > 0 && <span className="absolute top-1 left-1 min-w-[16px] h-4 px-1 rounded-[9999px] bg-[#2563eb] text-white text-[10px] font-bold flex items-center justify-center leading-none">{cart}</span>}
          </Link>
          {authed ? (
            <div className="relative">
              <button aria-label="حسابي" onClick={() => setMenu((v) => !v)} className="w-9 h-9 rounded-[9999px] bg-gradient-to-tr from-[#004ac6] to-blue-500 text-white flex items-center justify-center ring-2 ring-[#dbeafe]">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </button>
              {menu && (
                <div className="absolute left-0 mt-2 w-52 rounded-[1.25rem] bg-white shadow-xl border border-slate-100 p-2 text-sm font-semibold text-slate-700">
                  {[["حسابي", "/profile"], ["طلباتي", "/orders"], ["نادي ميرفوري", "/loyalty"], ["المفضلة", "/wishlist"]].map(([t, h]) => (
                    <Link key={h} href={h} className="block px-3 py-2 rounded-[0.75rem] hover:bg-slate-50">{t}</Link>
                  ))}
                  <button onClick={async () => { await logout(); router.replace("/auth/login") }} className="w-full text-right px-3 py-2 rounded-[0.75rem] text-rose-600 hover:bg-rose-50">تسجيل الخروج</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="h-10 px-4 rounded-[0.875rem] bg-[#004ac6] text-white text-sm font-bold flex items-center">تسجيل الدخول</Link>
          )}
        </div>
      </div>
    </header>
  )
}

/** Classic pages (admin, vendor, auth, checkout) keep the old MainNav; everything else gets the Stitch desktop header on md+. */
export function NavSwitch({ classic }: { classic: React.ReactNode }) {
  const pathname = usePathname() || "/"
  const isClassic = ["/admin", "/vendor", "/auth", "/checkout", "/guest-checkout", "/verifyEmail"].some((x) => pathname.startsWith(x))
  return isClassic ? <>{classic}</> : <StitchDesktopHeader />
}
