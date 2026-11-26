"use client"
import { useState } from "react"
import { Check, Copy } from "lucide-react"

/** Selectable text with a copy button. Clicks inside never open the order card. */
export function CopyText({ value, className = "", dir }: { value?: string | null; className?: string; dir?: "ltr" | "rtl" }) {
  const [done, setDone] = useState(false)
  const v = String(value || "").trim()
  if (!v) return <span className={className}>—</span>
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault()
    try { await navigator.clipboard.writeText(v) } catch {
      const t = document.createElement("textarea"); t.value = v; document.body.appendChild(t); t.select()
      try { document.execCommand("copy") } catch { /* ignore */ }
      document.body.removeChild(t)
    }
    setDone(true); setTimeout(() => setDone(false), 1200)
  }
  return (
    <span data-interactive="true" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 max-w-full cursor-text">
      <span dir={dir} className={`select-text ${className}`} style={{ userSelect: "text", WebkitUserSelect: "text" }}>{v}</span>
      <button type="button" aria-label="نسخ" title="نسخ" onClick={copy} className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">
        {done ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  )
}
