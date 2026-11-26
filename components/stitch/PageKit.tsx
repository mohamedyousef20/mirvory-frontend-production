import * as React from "react"
import { cn } from "@/lib/utils"

/** Stitch-style building blocks for content pages (about, faq, policies...). Same API as the shadcn Card/Badge so pages only change their imports. */
export function PageShell({ children, className, narrow = true }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return (
    <div dir="rtl" className={cn("min-h-screen bg-[#f7f9fb] px-4 pb-28 pt-24 md:pt-10 [font-family:var(--font-cairo),Cairo,sans-serif]", className)}>
      <div className={cn("mx-auto w-full", narrow ? "max-w-3xl" : "max-w-5xl")}>{children}</div>
    </div>
  )
}

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cn("overflow-hidden rounded-[1.25rem] border border-slate-100 bg-white text-slate-900 shadow-[0_2px_10px_rgba(15,23,42,0.05)]", className)} {...p} />
))
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5 md:p-6", className)} {...p} />
))
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cn("text-[17px] font-extrabold leading-tight text-slate-900", className)} {...p} />
))
CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cn("text-sm text-slate-500", className)} {...p} />
))
CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0 md:p-6 md:pt-0", className)} {...p} />
))
CardContent.displayName = "CardContent"

export function Badge({ className, variant: _v, ...p }: React.HTMLAttributes<HTMLSpanElement> & { variant?: string }) {
  return <span className={cn("inline-flex items-center rounded-full bg-[#dbeafe] px-3.5 py-1 text-[12px] font-bold text-[#004ac6]", className)} {...p} />
}
