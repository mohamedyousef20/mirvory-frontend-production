"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { productService } from "@/lib/api"
import { getProductImage } from "@/lib/productVariants"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")

/** "منتجات مشابهة": other live products, same category first. Hidden when there is nothing to show. */
export function RelatedProducts({ productId }: { productId: string }) {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    let alive = true
    productService
      .getProducts({ limit: 12, exclude: productId } as any)
      .then((r: any) => {
        const d = r?.data?.data ?? r?.data ?? {}
        const list: any[] = d.products ?? d.items ?? (Array.isArray(d) ? d : [])
        if (alive) setItems(list.filter((x) => String(x._id) !== productId).slice(0, 6))
      })
      .catch(() => {})
    return () => { alive = false }
  }, [productId])
  if (items.length === 0) return null
  return (
    <section dir="rtl" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 [font-family:var(--font-cairo),Cairo,sans-serif] md:pb-12">
      <h2 className="mb-3 text-[18px] font-extrabold text-slate-900">منتجات مشابهة</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] md:grid md:grid-cols-6 md:overflow-visible">
        {items.map((p) => {
          const price = Number(p.price) || 0
          const final = p.discountedPrice && p.discountedPrice < price ? Number(p.discountedPrice) : price
          const img = normalizeImageUrl(p.image || getProductImage(p) || "", "card")
          return (
            <Link key={p._id} href={`/products/${p._id}`} className="w-[9.5rem] shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)] md:w-auto">
              <div className="aspect-square bg-slate-100">
                {img && <img src={img} alt={p.title || ""} loading="lazy" className="h-full w-full object-cover" />}
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-bold leading-5 text-slate-800">{p.title}</p>
                <p className="mt-1 text-[14px] font-extrabold text-[#004ac6]">
                  {fmt(final)} <span className="text-[11px] font-bold">ج.م</span>
                  {final < price && <span className="ms-1.5 text-[11px] font-medium text-slate-400 line-through">{fmt(price)}</span>}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
