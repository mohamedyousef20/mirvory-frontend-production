"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { complaintService } from "@/lib/api"
import { toast } from "sonner"
import ImageUploader from "@/components/ImageUploader"
import {
    ArrowRight, CheckCircle2, FileText, Image as ImageIcon,
    Loader2, UploadCloud, Trash2, Shield, Info,
    Package, MessageSquare, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_FILES = 5

export default function NewComplaintPage() {
    const router = useRouter()
    const [orderId, setOrderId] = useState("")
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    const resetForm = () => {
        setOrderId(""); setTitle(""); setMessage("")
        setImageUrls([]); setError(null)
    }

    const handleAddImage = (url: string) => {
        if (imageUrls.length >= MAX_FILES) {
            setError(`الحد الأقصى ${MAX_FILES} صور`)
            return
        }
        setImageUrls(p => [...p, url])
        setError(null)
    }

    const removeImage = (idx: number) =>
        setImageUrls(p => p.filter((_, i) => i !== idx))

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!title.trim() || !message.trim()) {
            setError("الرجاء إدخال عنوان الشكوى وتفاصيلها")
            return
        }
        try {
            setSubmitting(true)
            setError(null)
            await complaintService.createComplaint({
                title: title.trim(),
                message: message.trim(),
                ...(orderId.trim() && { orderId: orderId.trim() }),
                images: imageUrls,
            })
            toast.success("تم إرسال الشكوى بنجاح", { icon: "✅" })
            setDone(true)
            resetForm()
        } catch (err: any) {
            const msg = err?.response?.data?.message || "حدث خطأ أثناء إرسال الشكوى"
            setError(msg)
            toast.error(msg, { icon: "⚠️" })
        } finally {
            setSubmitting(false)
        }
    }

    // ── Success state ──────────────────────────────────────────────────────────
    if (done) {
        return (
            <>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); * { font-family: 'Cairo', sans-serif !important; }`}</style>
                <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center p-6" dir="rtl">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-3">تم إرسال شكواك!</h2>
                        <p className="text-slate-500 leading-7 mb-8">
                            استلمنا شكواك بنجاح. سيتواصل معك فريق الدعم في أقرب وقت ممكن عبر البريد الإلكتروني أو داخل المنصة.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push("/complaints")}
                                className="w-full py-3 bg-[#1a4fba] text-white font-semibold rounded-xl hover:bg-[#1640a0] transition"
                            >
                                متابعة شكواي
                            </button>
                            <button
                                onClick={() => setDone(false)}
                                className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                            >
                                تقديم شكوى أخرى
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); * { font-family: 'Cairo', sans-serif !important; }`}</style>

            <div className="min-h-screen bg-[#f4f6fb]" dir="rtl">

                {/* ── Top nav ──────────────────────────────────────────────── */}
                <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1a4fba] flex items-center justify-center shadow-md shadow-blue-200">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 leading-none">مركز الدعم</p>
                                <h1 className="text-base font-bold text-slate-800 leading-tight">تقديم شكوى جديدة</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/complaints")}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                            <ArrowRight className="w-4 h-4" />
                            العودة
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-10">
                    <div className="grid md:grid-cols-[1fr_280px] gap-6 items-start">

                        {/* ── Main form ─────────────────────────────────────── */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Error alert */}
                            {error && (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
                                    <Info className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Title */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                    <FileText className="w-5 h-5 text-[#1a4fba]" />
                                    <h2 className="font-bold text-slate-800">معلومات الشكوى</h2>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-600">
                                        عنوان الشكوى <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="مثال: مشكلة في استلام الطلب أو وجود ضرر في المنتج"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4fba]/30 focus:border-[#1a4fba] transition placeholder:text-slate-400"
                                        maxLength={120}
                                        required
                                    />
                                    <p className="text-xs text-slate-400 text-left">{title.length}/120</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-600">
                                        رقم الطلب
                                        <span className="text-slate-400 font-normal mr-1">(اختياري)</span>
                                    </label>
                                    <div className="relative">
                                        <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={orderId}
                                            onChange={e => setOrderId(e.target.value)}
                                            placeholder="أدخل رقم الطلب المرتبط بالمشكلة"
                                            className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4fba]/30 focus:border-[#1a4fba] transition placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                    <MessageSquare className="w-5 h-5 text-[#1a4fba]" />
                                    <h2 className="font-bold text-slate-800">تفاصيل المشكلة</h2>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-600">
                                        اشرح مشكلتك بالتفصيل <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        placeholder="يرجى شرح المشكلة بوضوح: متى حدثت؟ ما الذي تتوقعه؟ وأي تفاصيل أخرى تساعد فريق الدعم."
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4fba]/30 focus:border-[#1a4fba] transition placeholder:text-slate-400 resize-none leading-7"
                                        required
                                    />
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            ستصلك نسخة على بريدك الإلكتروني
                                        </p>
                                        <p className="text-xs text-slate-400 text-left">{message.length}/5000</p>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <UploadCloud className="w-5 h-5 text-[#1a4fba]" />
                                        <h2 className="font-bold text-slate-800">المرفقات</h2>
                                        <span className="text-xs text-slate-400 font-normal">(اختياري)</span>
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold px-2.5 py-1 rounded-lg",
                                        imageUrls.length >= MAX_FILES
                                            ? "bg-red-50 text-red-600"
                                            : "bg-slate-100 text-slate-500"
                                    )}>
                                        {imageUrls.length}/{MAX_FILES}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500">
                                    يمكنك إرفاق حتى {MAX_FILES} صور بصيغ JPG أو PNG أو WEBP لتوضيح المشكلة
                                </p>

                                <ImageUploader onUpload={handleAddImage} className="rounded-xl" />

                                {imageUrls.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {imageUrls.map((url, idx) => (
                                            <div key={url} className="relative group flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                                    <img src={url} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-slate-600 truncate font-medium">
                                                        {url.split("/").pop()?.substring(0, 28) || `صورة ${idx + 1}`}
                                                    </p>
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-[#1a4fba] hover:underline"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        معاينة
                                                    </a>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-[#1a4fba] text-white font-bold text-base rounded-2xl hover:bg-[#1640a0] transition shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        إرسال الشكوى
                                    </>
                                )}
                            </button>
                        </form>

                        {/* ── Sidebar ───────────────────────────────────────── */}
                        <div className="space-y-4 hidden md:block">
                            {/* Tips */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <Info className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <p className="font-bold text-slate-800 text-sm">نصائح للشكوى الفعّالة</p>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    {[
                                        "اذكر رقم الطلب إن وجد",
                                        "صف المشكلة بدقة وتفصيل",
                                        "أرفق صوراً توضيحية",
                                        "اذكر ما الحل الذي تتوقعه",
                                        "تجنب الكلمات المبهمة",
                                    ].map(tip => (
                                        <li key={tip} className="flex items-start gap-2.5">
                                            <div className="w-5 h-5 rounded-full bg-[#1a4fba]/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-3 h-3 text-[#1a4fba]" />
                                            </div>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Steps */}
                            <div className="bg-[#1a4fba] rounded-2xl p-5 text-white">
                                <p className="font-bold text-sm mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    ماذا يحدث بعد ذلك؟
                                </p>
                                <ol className="space-y-3">
                                    {[
                                        "يستلم فريقنا شكواك فوراً",
                                        "يُراجع أحد المتخصصين طلبك",
                                        "نرسل لك الرد خلال 24–48 ساعة",
                                        "نتابع معك حتى يُحل المشكلة",
                                    ].map((step, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-blue-100">
                                            <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}