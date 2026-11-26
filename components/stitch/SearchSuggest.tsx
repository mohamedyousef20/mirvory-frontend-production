"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { productService } from "@/lib/api"
import { getProductImage } from "@/lib/productVariants"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"

const RECENT_KEY = "mirvory_recent_searches"
let cache: any[] | null = null
let inflight: Promise<any[]> | null = null

/** Loads the product list once per page load (small catalog) so suggestions work instantly, with no extra backend endpoint. */
function loadProducts(): Promise<any[]> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = productService
      .getProducts({ limit: 100 } as any)
      .then((r: any) => (cache = r.data?.data || []))
      .catch(() => [])
      .finally(() => { inflight = null })
  }
  return inflight
}

const norm = (s: string) =>
  String(s || "")
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim()

const shortName = (t: string) => {
  const m = String(t).match(/\(([^)]+)\)/)
  return (m ? m[1] : t).trim()
}

export function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") } catch { return [] }
}
export function saveRecent(q: string) {
  const v = q.trim()
  if (!v) return
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([v, ...getRecent().filter((x) => x !== v)].slice(0, 6))) } catch {}
}

export function useSuggestions(q: string) {
  const [all, setAll] = useState<any[]>(cache || [])
  useEffect(() => { loadProducts().then(setAll) }, [])
  const matches = useMemo(() => {
    const tokens = norm(q).split(/\s+/).filter(Boolean)
    if (!tokens.length) return []
    return all
      .filter((p) => {
        const hay = norm(`${p.title} ${p.brand || ""} ${p.category?.name || ""}`)
        return tokens.every((t) => hay.includes(t))
      })
      .slice(0, 5)
  }, [all, q])
  const popular = useMemo(() => all.slice(0, 6).map((p) => shortName(p.title)), [all])
  return { matches, popular }
}

/** Dropdown under a search input. Parent controls `open`; pick text with onPick, product links navigate directly. */
export function SuggestPanel({ q, open, onPick, onClose }: { q: string; open: boolean; onPick: (text: string) => void; onClose: () => void }) {
  const { matches, popular } = useSuggestions(q)
  const [recent, setRecent] = useState<string[]>([])
  useEffect(() => { if (open) setRecent(getRecent()) }, [open])
  if (!open) return null
  const has = q.trim().length > 0
  // onMouseDown/onTouchStart preventDefault keeps the input focused so taps are not lost to blur
  const keep = (e: React.SyntheticEvent) => e.preventDefault()
  const chip = (t: string) => (
    <button key={t} type="button" onClick={() => onPick(t)} className="rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[12px] font-bold text-slate-700 active:bg-[#e2e8f0]">{t}</button>
  )
  return (
    <div dir="rtl" onMouseDown={keep} className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-[1rem] border border-slate-100 bg-white p-2 text-right shadow-[0_12px_32px_rgba(15,23,42,0.14)]">
      {has ? (
        <>
          {matches.map((p) => {
            const img = normalizeImageUrl(p.image || getProductImage(p) || "", "card")
            const price = Number(p.discountedPrice) && p.discountedPrice < p.price ? p.discountedPrice : p.price
            return (
              <Link key={p._id} href={`/products/${p._id}`} onClick={() => { saveRecent(shortName(p.title)); onClose() }} className="flex items-center gap-3 rounded-xl p-2 active:bg-slate-50 hover:bg-slate-50">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{img && <img src={img} alt="" className="h-full w-full object-cover" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-slate-900">{p.title}</span>
                  <span className="block text-[12px] font-semibold text-slate-500">{Math.round(price).toLocaleString("en-US")} ج.م</span>
                </span>
                <span className="material-symbols-outlined text-[18px] text-slate-300">chevron_left</span>
              </Link>
            )
          })}
          {matches.length === 0 && (
            <div className="p-3">
              <p className="text-[13px] font-bold text-slate-700">مفيش نتائج لـ «{q.trim()}»</p>
              <p className="mt-1 mb-2 text-[12px] text-slate-500">جرب كلمة تانية أو اختر من الأكثر بحثاً:</p>
              <div className="flex flex-wrap gap-1.5">{popular.map(chip)}</div>
            </div>
          )}
          <button type="button" onClick={() => onPick(q.trim())} className="mt-1 flex w-full items-center gap-2 rounded-xl bg-[#eff4ff] p-3 text-[13px] font-bold text-[#004ac6]">
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>ابحث عن «{q.trim()}»</span>
          </button>
        </>
      ) : (
        <div className="space-y-3 p-2">
          {recent.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-400">عمليات بحث سابقة</span>
                <button type="button" onClick={() => { try { localStorage.removeItem(RECENT_KEY) } catch {} ; setRecent([]) }} className="text-[11px] font-bold text-[#004ac6]">مسح</button>
              </div>
              <div className="flex flex-wrap gap-1.5">{recent.map(chip)}</div>
            </div>
          )}
          {popular.length > 0 && (
            <div>
              <span className="mb-1.5 block text-[12px] font-bold text-slate-400">الأكثر بحثاً</span>
              <div className="flex flex-wrap gap-1.5">{popular.map(chip)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
