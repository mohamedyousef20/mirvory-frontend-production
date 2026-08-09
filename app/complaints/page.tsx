"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { complaintService } from "@/lib/api"
import { toast } from "react-hot-toast"
import {
    PlusCircle, Eye, FileText, Clock, CheckCircle, XCircle,
    AlertCircle, Search, Filter, Calendar, Package, MessageSquare,
    Image as ImageIcon, ChevronLeft, ChevronRight, RefreshCw,
    Download, BarChart3, TrendingUp, Shield, X
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdminReply {
    user: { firstName: string; lastName: string; role: string }
    message: string
    createdAt: string
}

interface Complaint {
    _id: string
    title: string
    message: string
    status: "pending" | "in_progress" | "resolved" | "cancelled"
    priority?: "low" | "medium" | "high" | "critical"
    images: string[]
    order?: { _id: string; orderNumber: string }
    user: { _id: string; firstName: string; lastName: string; email: string }
    createdAt: string
    updatedAt: string
    resolvedAt?: string
    adminReplies?: AdminReply[]
}

// ── Status & priority config ──────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending: { label: "قيد الانتظار", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400", icon: Clock },
    in_progress: { label: "قيد المعالجة", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400", icon: AlertCircle },
    resolved: { label: "تم الحل", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", icon: CheckCircle },
    cancelled: { label: "ملغي", color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-400", icon: XCircle },
} as const

const PRIORITY_CONFIG = {
    low: { label: "منخفض", color: "bg-slate-100 text-slate-600" },
    medium: { label: "متوسط", color: "bg-sky-100 text-sky-700" },
    high: { label: "عالي", color: "bg-orange-100 text-orange-700" },
    critical: { label: "حرج", color: "bg-red-100 text-red-700 font-semibold" },
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ar-SA", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    })

// ── Main component ────────────────────────────────────────────────────────────
export default function ComplaintsListPage() {
    const router = useRouter()
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selected, setSelected] = useState<Complaint | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [lightboxImg, setLightboxImg] = useState<string | null>(null)

    const fetchComplaints = useCallback(async () => {
        setLoading(true)
        try {
            const res = await complaintService.getMyComplaints({
                page,
                limit: 10,
                status: statusFilter !== "all" ? statusFilter : undefined,
                search: search || undefined,
            } as any)
            const d = res.data?.data || []
            const p = res.data?.pagination || {}
            setComplaints(Array.isArray(d) ? d : [])
            setTotalPages(p.pages || p.totalPages || 1)
            setTotal(p.total || d.length || 0)
        } catch (err: any) {
            if (err.response?.status === 401) router.push("/auth/login")
            toast.error("فشل في تحميل الشكاوى")
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter, search, router])

    useEffect(() => { fetchComplaints() }, [fetchComplaints])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchComplaints()
    }

    const downloadComplaint = (c: Complaint) => {
        const lines = [
            `شكوى رقم: ${c._id}`,
            `العنوان: ${c.title}`,
            `الحالة: ${STATUS_CONFIG[c.status]?.label}`,
            c.priority ? `الأولوية: ${PRIORITY_CONFIG[c.priority]?.label}` : "",
            `تاريخ الإنشاء: ${formatDate(c.createdAt)}`,
            "",
            "تفاصيل الشكوى:",
            c.message,
            "",
            c.order ? `الطلب المرتبط: #${c.order.orderNumber}` : "",
            "",
            ...(c.adminReplies?.length
                ? ["ردود الإدارة:", ...c.adminReplies.map((r, i) =>
                    `${i + 1}. ${r.user.firstName} ${r.user.lastName} — ${formatDate(r.createdAt)}\n   ${r.message}`
                )]
                : []),
        ].filter(Boolean).join("\n")

        const a = Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(new Blob([lines], { type: "text/plain" })),
            download: `شكوى-${c._id.slice(-8)}.txt`,
        })
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        toast.success("تم تحميل الشكوى", { icon: "📥" })
    }

    // Counts for stats cards
    const counts = {
        pending: complaints.filter(c => c.status === "pending").length,
        in_progress: complaints.filter(c => c.status === "in_progress").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
    }

    return (
        <>
            {/* ── Google Fonts (Cairo) ─────────────────────────────────────── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
                * { font-family: 'Cairo', sans-serif !important; }
            `}</style>

            <div className="min-h-screen bg-[#f4f6fb]" dir="rtl">

                {/* ── Top bar ────────────────────────────────────────────── */}
                <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1a4fba] flex items-center justify-center shadow-md shadow-blue-200">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 leading-none">مركز الدعم</p>
                                <h1 className="text-base font-bold text-slate-800 leading-tight">الشكاوى المقدمة</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { fetchComplaints(); toast.success("تم التحديث", { icon: "🔄" }) }}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => router.push("/complaints/new")}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-[#1a4fba] text-white text-sm font-semibold rounded-xl hover:bg-[#1640a0] transition shadow-md shadow-blue-200"
                            >
                                <PlusCircle className="w-4 h-4" />
                                شكوى جديدة
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                    {/* ── Stats cards ─────────────────────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "إجمالي الشكاوى", val: total, color: "from-[#1a4fba] to-[#2d63d4]", text: "text-white", icon: BarChart3 },
                            { label: "قيد الانتظار", val: counts.pending, color: "from-amber-400 to-amber-500", text: "text-white", icon: Clock },
                            { label: "قيد المعالجة", val: counts.in_progress, color: "from-sky-400 to-sky-500", text: "text-white", icon: TrendingUp },
                            { label: "تم الحل", val: counts.resolved, color: "from-emerald-400 to-emerald-500", text: "text-white", icon: CheckCircle },
                        ].map(({ label, val, color, text, icon: Icon }) => (
                            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-sm`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs font-medium opacity-80 ${text}`}>{label}</p>
                                        <p className={`text-3xl font-black mt-1 ${text}`}>{val}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <Icon className={`w-6 h-6 ${text}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Filters ─────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالعنوان أو التفاصيل..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4fba]/30 focus:border-[#1a4fba] bg-slate-50 transition"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                                    className="appearance-none pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1a4fba]/30 focus:border-[#1a4fba] min-w-[170px] transition"
                                >
                                    <option value="all">جميع الحالات</option>
                                    <option value="pending">قيد الانتظار</option>
                                    <option value="in_progress">قيد المعالجة</option>
                                    <option value="resolved">تم الحل</option>
                                    <option value="cancelled">ملغي</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-[#1a4fba] text-white text-sm font-semibold rounded-xl hover:bg-[#1640a0] transition"
                            >
                                بحث
                            </button>
                        </form>
                    </div>

                    {/* ── Table ───────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="w-12 h-12 border-4 border-[#1a4fba] border-t-transparent rounded-full animate-spin" />
                                <p className="text-slate-500 text-sm">جاري تحميل الشكاوى...</p>
                            </div>
                        ) : complaints.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                                    <FileText className="w-10 h-10 text-slate-300" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-slate-700">
                                        {search || statusFilter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد شكاوى بعد"}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {search || statusFilter !== "all"
                                            ? "حاول تعديل معايير البحث"
                                            : "ابدأ بتقديم شكواك الأولى"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/complaints/new")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a4fba] text-white text-sm font-semibold rounded-xl hover:bg-[#1640a0] transition"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    تقديم شكوى جديدة
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* desktop table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                {["الشكوى", "الحالة", "الطلب", "التاريخ", ""].map(h => (
                                                    <th key={h} className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {complaints.map(c => {
                                                const StatusIcon = STATUS_CONFIG[c.status]?.icon ?? FileText
                                                return (
                                                    <tr
                                                        key={c._id}
                                                        onClick={() => setSelected(c)}
                                                        className="hover:bg-slate-50/70 cursor-pointer transition group"
                                                    >
                                                        {/* Title + preview */}
                                                        <td className="px-5 py-4 max-w-xs">
                                                            <p className="font-semibold text-slate-800 group-hover:text-[#1a4fba] transition line-clamp-1">
                                                                {c.title}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                                                {c.message.substring(0, 80)}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                {c.images?.length > 0 && (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                                                        <ImageIcon className="w-3 h-3" />
                                                                        {c.images.length}
                                                                    </span>
                                                                )}
                                                                {c.adminReplies?.length ? (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-blue-500">
                                                                        <MessageSquare className="w-3 h-3" />
                                                                        {c.adminReplies.length} رد
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </td>

                                                        {/* Status + priority */}
                                                        <td className="px-5 py-4">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap",
                                                                STATUS_CONFIG[c.status]?.color
                                                            )}>
                                                                <StatusIcon className="w-3.5 h-3.5" />
                                                                {STATUS_CONFIG[c.status]?.label}
                                                            </span>
                                                            {c.priority && (
                                                                <span className={cn(
                                                                    "mt-1.5 inline-flex px-2.5 py-0.5 rounded-full text-xs",
                                                                    PRIORITY_CONFIG[c.priority]?.color
                                                                )}>
                                                                    {PRIORITY_CONFIG[c.priority]?.label}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Order */}
                                                        <td className="px-5 py-4">
                                                            {c.order
                                                                ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                                                                    <Package className="w-3.5 h-3.5" />
                                                                    #{c.order.orderNumber}
                                                                </span>
                                                                : <span className="text-slate-300 text-xs">—</span>
                                                            }
                                                        </td>

                                                        {/* Date */}
                                                        <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {formatDate(c.createdAt)}
                                                            </div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); setSelected(c) }}
                                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                                    title="عرض"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); downloadComplaint(c) }}
                                                                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                                                                    title="تحميل"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* mobile cards */}
                                <div className="md:hidden divide-y divide-slate-100">
                                    {complaints.map(c => {
                                        const StatusIcon = STATUS_CONFIG[c.status]?.icon ?? FileText
                                        return (
                                            <div
                                                key={c._id}
                                                onClick={() => setSelected(c)}
                                                className="p-4 hover:bg-slate-50 transition cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-800 text-sm line-clamp-1">{c.title}</p>
                                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.message}</p>
                                                    </div>
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border shrink-0",
                                                        STATUS_CONFIG[c.status]?.color
                                                    )}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {STATUS_CONFIG[c.status]?.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(c.createdAt)}
                                                    </span>
                                                    {c.order && (
                                                        <span className="flex items-center gap-1 text-blue-500">
                                                            <Package className="w-3 h-3" />
                                                            #{c.order.orderNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                                        <p className="text-xs text-slate-500">
                                            عرض {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} من {total}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                                disabled={page === 1}
                                                className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const n = totalPages <= 5 ? i + 1
                                                    : page <= 3 ? i + 1
                                                        : page >= totalPages - 2 ? totalPages - 4 + i
                                                            : page - 2 + i
                                                return (
                                                    <button
                                                        key={n}
                                                        onClick={() => setPage(n)}
                                                        className={cn(
                                                            "w-9 h-9 rounded-lg border text-xs font-semibold transition",
                                                            page === n
                                                                ? "bg-[#1a4fba] text-white border-[#1a4fba]"
                                                                : "border-slate-200 text-slate-600 hover:bg-slate-100"
                                                        )}
                                                    >
                                                        {n}
                                                    </button>
                                                )
                                            })}
                                            <button
                                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                                disabled={page === totalPages}
                                                className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Detail modal ───────────────────────────────────────────────── */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white w-full max-w-3xl rounded-t-3xl md:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-[#1a4fba]" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-base line-clamp-1">{selected.title}</p>
                                    <p className="text-xs text-slate-400">#{selected._id.slice(-8)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Meta badges */}
                            <div className="flex flex-wrap gap-2">
                                {(() => {
                                    const StatusIcon = STATUS_CONFIG[selected.status]?.icon ?? FileText
                                    return (
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border",
                                            STATUS_CONFIG[selected.status]?.color
                                        )}>
                                            <StatusIcon className="w-4 h-4" />
                                            {STATUS_CONFIG[selected.status]?.label}
                                        </span>
                                    )
                                })()}
                                {selected.priority && (
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-xl text-sm font-semibold",
                                        PRIORITY_CONFIG[selected.priority]?.color
                                    )}>
                                        {PRIORITY_CONFIG[selected.priority]?.label}
                                    </span>
                                )}
                                {selected.order && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold">
                                        <Package className="w-4 h-4" />
                                        #{selected.order.orderNumber}
                                    </span>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { label: "تاريخ الإنشاء", val: formatDate(selected.createdAt) },
                                    { label: "آخر تحديث", val: formatDate(selected.updatedAt) },
                                    ...(selected.resolvedAt
                                        ? [{ label: "تاريخ الحل", val: formatDate(selected.resolvedAt) }]
                                        : []),
                                ].map(({ label, val }) => (
                                    <div key={label} className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-400 mb-1">{label}</p>
                                        <p className="text-sm font-semibold text-slate-700">{val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Message */}
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-2">تفاصيل الشكوى</p>
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <p className="text-sm text-slate-700 whitespace-pre-line leading-7">{selected.message}</p>
                                </div>
                            </div>

                            {/* Images */}
                            {selected.images?.length > 0 && (
                                <div>
                                    <p className="text-sm font-bold text-slate-700 mb-3">
                                        المرفقات <span className="text-slate-400 font-normal">({selected.images.length})</span>
                                    </p>
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                        {selected.images.map((img, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setLightboxImg(img)}
                                                className="aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in hover:ring-2 hover:ring-[#1a4fba] transition"
                                            >
                                                <img src={img} alt={`مرفق ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin replies */}
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-3">
                                    ردود الإدارة{" "}
                                    {selected.adminReplies?.length
                                        ? <span className="text-slate-400 font-normal">({selected.adminReplies.length})</span>
                                        : null}
                                </p>
                                {selected.adminReplies?.length ? (
                                    <div className="space-y-3">
                                        {selected.adminReplies.map((reply, i) => (
                                            <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-[#1a4fba] text-white text-xs font-bold flex items-center justify-center">
                                                            {reply.user.firstName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-blue-900">
                                                                {reply.user.firstName} {reply.user.lastName}
                                                            </p>
                                                            <p className="text-xs text-blue-500">{reply.user.role}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-blue-500">{formatDate(reply.createdAt)}</p>
                                                </div>
                                                <p className="text-sm text-slate-700 bg-white rounded-xl p-3 leading-6">{reply.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <p className="text-sm text-amber-700">
                                            لم يتم الرد بعد — سيتواصل معك فريق الدعم في أقرب وقت ممكن.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                            <button
                                onClick={() => downloadComplaint(selected)}
                                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
                            >
                                <Download className="w-4 h-4" />
                                تحميل الشكوى
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="px-5 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
                                >
                                    إغلاق
                                </button>
                                {/* {!["resolved", "cancelled"].includes(selected.status) && (
                                    <button
                                        onClick={() => {
                                            router.push(`/complaints/${selected._id}/follow-up`)
                                            setSelected(null)
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-[#1a4fba] text-white text-sm font-semibold rounded-xl hover:bg-[#1640a0] transition"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        متابعة
                                    </button>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Lightbox ─────────────────────────────────────────────────── */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <button className="absolute top-4 left-4 p-2 text-white/70 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={lightboxImg}
                        alt="مرفق"
                        className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    )
}