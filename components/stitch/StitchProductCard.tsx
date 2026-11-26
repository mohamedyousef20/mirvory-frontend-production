"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthProvider"
import { cartService } from "@/lib/api"
import { addToGuestCart } from "@/lib/guestCart"
import { getProductImage, getTotalStock } from "@/lib/productVariants"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")

/** Shared horizontal product card (one per row) for the mobile catalog and home (catalog + home). Display only, no data logic. */
export function StitchProductCard({ p, fav, onFav }: { p: any; fav: boolean; onFav: () => void }) {
  const price = Number(p.price) || 0
  const pct = Number(p.discountPercentage) || 0
  const final = p.discountedPrice && p.discountedPrice < price ? Number(p.discountedPrice) : pct > 0 ? price * (1 - pct / 100) : price
  const hasDiscount = final < price
  const off = hasDiscount ? Math.round(pct || ((price - final) / price) * 100) : 0
  const img = normalizeImageUrl(p.image || getProductImage(p) || "", "card")
  const brand = p.brand || p.category?.name || ""
  const stock = getTotalStock(p)
  const out = stock <= 0
  const sizeList: string[] = Array.from(
    new Set<string>(
      (p.colors || [])
        .flatMap((c: any) => (c.available !== false ? c.sizes || [] : []))
        .filter((x: any) => x.quantity > 0)
        .map((x: any) => String(x.size)),
    ),
  ).sort((x, y) => parseFloat(x) - parseFloat(y))
  const href = `/products/${p._id}`
  const tag = out ? null : stock <= 3 ? `باقي ${stock} فقط` : null

  // Quick buy: same data and calls as the product page (colors, sizes, cart, buy-now)
  const router = useRouter()
  const { user, cookiesReady } = useAuth()
  const colors: any[] = (p.colors || []).filter((c: any) => c.available !== false && (c.sizes || []).some((x: any) => x.quantity > 0))
  const [colorValue, setColorValue] = useState<string>(colors[0]?.value || "")
  const [size, setSize] = useState<string>("")
  const color = colors.find((c: any) => c.value === colorValue) || colors[0]
  const colorSizes: { size: string; quantity: number }[] = (color?.sizes || []).filter((x: any) => x.quantity > 0).sort((x: any, y: any) => parseFloat(x.size) - parseFloat(y.size))
  const shownImg = color?.image ? normalizeImageUrl(color.image, "card") : img
  const need = () => {
    if (!size) {
      toast.error("اختر المقاس الأول")
      return false
    }
    return true
  }
  const unitPrice = Number(p.discountedPrice) && Number(p.discountedPrice) < price ? Number(p.discountedPrice) : price
  const addToCart = async () => {
    if (!need()) return
    try {
      if (user) {
        if (!cookiesReady) await new Promise((r) => setTimeout(r, 1500))
        await cartService.addToCart({ productId: p._id, quantity: 1, sizes: [size], colors: [colorValue] })
      } else {
        addToGuestCart({
          productId: p._id,
          quantity: 1,
          size,
          color: colorValue || null,
          colorName: color?.name ?? null,
          colorImage: color?.image ?? null,
          title: p.title,
          image: color?.image ?? null,
          price: unitPrice,
          maxQuantity: colorSizes.find((x) => x.size === size)?.quantity ?? 0,
        })
      }
      toast.success("تمت إضافة المنتج للسلة")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل إضافة المنتج للسلة")
    }
  }
  const buyNow = () => {
    if (!need()) return
    try {
      sessionStorage.setItem(
        "buyNowItem",
        JSON.stringify({ productId: p._id, quantity: 1, color: colorValue || null, size, colorName: color?.name ?? null, image: color?.image ?? null, title: p.title, price: unitPrice }),
      )
    } catch {
      toast.error("تعذر تخزين البيانات، أضف المنتج للسلة بدلاً من ذلك")
      return
    }
    router.push(user ? "/checkout?mode=buyNow" : "/guest-checkout?mode=buyNow")
  }

  return (
    <article className="group relative flex overflow-hidden rounded-[1.25rem] bg-white border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 text-right">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="min-w-0 flex-1">
            {brand && <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{brand}</span>}
            <h4 className="line-clamp-2 text-[13px] font-bold leading-[18px] text-slate-900">{p.title}</h4>
          </Link>
          <button
            aria-label="إضافة للمفضلة"
            aria-pressed={fav}
            type="button"
            onClick={onFav}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full active:scale-90 transition-transform ${fav ? "text-[#ba1a1a]" : "text-slate-400"}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${fav ? 1 : 0}` }}>favorite</span>
          </button>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-[18px] font-extrabold leading-6 text-slate-950">
            {fmt(final)} <span className="text-[11px] font-bold text-slate-500">ج.م</span>
          </span>
          {hasDiscount && <span className="text-[11px] font-semibold text-slate-400 line-through">{fmt(price)}</span>}
        </div>

        {!out && colors.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-hidden" aria-label="الألوان">
            {colors.slice(0, 5).map((c: any) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.name}
                title={c.name}
                onClick={() => { setColorValue(c.value); setSize("") }}
                className={`h-5 w-5 shrink-0 rounded-full border border-slate-300 transition-all ${c.value === colorValue ? "ring-2 ring-[#004ac6] ring-offset-1" : ""}`}
                style={{ backgroundColor: c.value }}
              />
            ))}
            {colors.length > 5 && <span className="text-[10px] font-bold text-slate-400">{colors.length - 5}+</span>}
          </div>
        )}
        {colorSizes.length > 0 && !out && (
          <div className="flex flex-wrap items-center gap-1">
            {colorSizes.map((x) => (
              <button
                key={x.size}
                type="button"
                onClick={() => setSize(x.size === size ? "" : x.size)}
                className={`min-w-[30px] rounded-md border px-1.5 py-1 text-[11px] font-bold transition-colors ${x.size === size ? "border-[#004ac6] bg-[#004ac6] text-white" : "border-slate-200 text-slate-600"}`}
              >
                {x.size}
              </button>
            ))}
          </div>
        )}

        {out ? (
          <Link href={href} className="mt-1 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-[13px] font-bold text-slate-400">
            <span className="material-symbols-outlined text-[18px]">block</span>
            <span>غير متوفر</span>
          </Link>
        ) : (
          <div className="mt-1 flex gap-1.5">
            <button type="button" onClick={addToCart} className="flex h-10 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-[#004ac6] text-[12px] font-bold text-white shadow-sm active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              <span>للسلة</span>
            </button>
            <button type="button" onClick={buyNow} className="flex h-10 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-slate-900 text-[12px] font-bold text-white active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>اشتري الآن</span>
            </button>
          </div>
        )}
      </div>

      <Link href={href} className="relative block w-[46%] max-w-[200px] shrink-0 self-stretch min-h-[200px] bg-slate-50 overflow-hidden">
        {img && (
          <img
            alt={p.title}
            src={shownImg || img}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover ${out ? "opacity-50 grayscale" : ""}`}
          />
        )}
        {off > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-[#ba1a1a] px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm">خصم {off}%</span>
        )}
        {out && <span className="absolute inset-x-0 bottom-0 bg-slate-900/70 py-1 text-center text-[11px] font-bold text-white">نفد المخزون</span>}
        {tag && <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#ba1a1a] shadow-sm">{tag}</span>}
      </Link>
    </article>
  )
}
