"use client"

import Link from "next/link"
import { Mail, MessageCircle, ChevronLeft } from "lucide-react"
import { PageShell } from "@/components/stitch/PageKit"

const contacts = [
  { label: "واتساب", note: "أسرع طريقة، بنرد في نفس اليوم", href: "https://wa.me/201060167568", value: "+201060167568", Icon: MessageCircle, tone: "bg-emerald-50 text-emerald-600" },
  { label: "البريد الإلكتروني", note: "للاستفسارات والشكاوى", href: "mailto:support.mirvory@gmail.com", value: "support.mirvory@gmail.com", Icon: Mail, tone: "bg-[#dbeafe] text-[#004ac6]" },
]

export default function ContactPage() {
  return (
    <PageShell>
      <div className="mb-8 text-center">
        <span className="inline-flex rounded-full bg-[#dbeafe] px-3.5 py-1 text-[12px] font-bold text-[#004ac6]">الدعم</span>
        <h1 className="mt-3 text-[26px] font-extrabold text-slate-900 md:text-3xl">تواصل معنا</h1>
        <p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-slate-500">لأي استفسار عن طلب أو مقاس أو منتج، اختار الطريقة الأنسب ليك.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {contacts.map(({ label, note, href, value, Icon, tone }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-shadow active:scale-[0.99] hover:shadow-md">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold text-slate-900">{label}</span>
              <span className="block text-[12px] text-slate-500">{note}</span>
              <span dir="ltr" className="mt-0.5 block truncate text-right text-[13px] font-semibold text-slate-700">{value}</span>
            </span>
            <ChevronLeft className="h-5 w-5 text-slate-300" />
          </a>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-[13px] font-bold">
        <Link href="/faq" className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm border border-slate-100">الأسئلة الشائعة</Link>
        <Link href="/return-policy" className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm border border-slate-100">سياسة الاستبدال</Link>
        <Link href="/track-order" className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm border border-slate-100">تتبع طلب</Link>
      </div>
    </PageShell>
  )
}
