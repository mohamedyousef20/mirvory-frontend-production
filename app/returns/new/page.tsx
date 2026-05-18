"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import ImageUploader from "@/components/ImageUploader"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Info,
  Loader2,
  Package,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Hash,
} from "lucide-react"
import { returnService } from "@/lib/api"
import { useRouter } from 'next/navigation';

// ── Step indicator pill ───────────────────────────────────────────────────────
type StepState = "pending" | "current" | "done"

function StepPill({
  icon, label, index, state,
}: {
  icon: React.ReactNode; label: string; index: number; state: StepState
}) {
  return (
    <div className="flex items-center gap-3">
      {/* circle */}
      <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${state === "done"
          ? "bg-[#2563eb] border-[#2563eb] text-white"
          : state === "current"
            ? "bg-[#eff6ff] border-[#2563eb] text-[#2563eb]"
            : "bg-slate-50 border-slate-200 text-slate-400"
        }`}>
        {state === "done" ? <CheckCircle2 className="h-4 w-4" /> : index}
      </div>
      {/* label */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${state === "done" ? "text-[#2563eb]" : state === "current" ? "text-[#1d4ed8]" : "text-slate-400"
          }`}>{label}</p>
      </div>
      {/* icon */}
      <div className={`shrink-0 ${state === "done" ? "text-[#2563eb]" : state === "current" ? "text-[#2563eb]" : "text-slate-300"
        }`}>{icon}</div>
    </div>
  )
}

// ── Badge pill ────────────────────────────────────────────────────────────────
const BadgePill = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2563eb]/30 bg-white/80 px-3 py-1 text-xs font-semibold text-[#2563eb] backdrop-blur-sm">
    <Hash className="h-3 w-3" />
    {label}
  </span>
)

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 mr-1 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}

export default function ReturnPageRequest() {
  const router = useRouter()
  const { language } = useLanguage()
  const isArabic = language === "ar"
  const searchParams = useSearchParams()
  const orderIdFromParams = searchParams?.get("orderId") || ""
  const itemIdFromParams = searchParams?.get("itemId") || ""

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    orderId: "",
    itemId: "",
    reason: "",
    customerName: "",
    customerPhone: "",
    productName: "",
    productCode: "",
    images: [] as string[],
    termsAccepted: false,
  })

  useEffect(() => {
    if (orderIdFromParams && orderIdFromParams !== formData.orderId) {
      setFormData((prev) => ({ ...prev, orderId: orderIdFromParams }))
    }
    if (itemIdFromParams && itemIdFromParams !== formData.itemId) {
      setFormData((prev) => ({ ...prev, itemId: itemIdFromParams }))
    }
    if (orderIdFromParams && itemIdFromParams && currentStep === 1) {
      setCurrentStep(2)
    }
  }, [orderIdFromParams, itemIdFromParams])

  const steps = useMemo(
    () => [
      { title: isArabic ? "معلومات الطلب" : "Order Info", fields: ["orderId", "itemId"], icon: Package },
      { title: isArabic ? "سبب الإرجاع" : "Return Reason", fields: ["reason"], icon: ClipboardList },
      { title: isArabic ? "الشروط والأحكام" : "Terms & Conditions", fields: ["termsAccepted"], icon: ShieldCheck },
    ],
    [isArabic]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, termsAccepted: !prev.termsAccepted }))
  }

  const validateCurrentStep = () => {
    const currentFields = steps[currentStep - 1].fields
    for (const field of currentFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(isArabic ? "الرجاء ملء جميع الحقول المطلوبة" : "Please fill all required fields")
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.termsAccepted) {
      toast.error(isArabic ? "الرجاء قبول الشروط والأحكام" : "Please accept the terms and conditions")
      return
    }
    setIsSubmitting(true)
    try {
      const returnData = {
        orderId: formData.orderId,
        reason: formData.reason,
        itemId: formData.itemId,
        images: formData.images,
      }
      await returnService.createReturnRequest(returnData)
      toast.success(isArabic ? "تم إرسال طلب الإرجاع بنجاح" : "Return request submitted successfully")
      router.push('/returns')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        (isArabic ? "حدث خطأ أثناء إرسال طلب" : "Failed to send notification")
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      orderId: "", itemId: "", reason: "", customerName: "", customerPhone: "",
      productName: "", productCode: "", images: [] as string[], termsAccepted: false,
    })
    setCurrentStep(0)
  }

  const progressValue = (currentStep / steps.length) * 100

  return (
    <div
      className="min-h-screen bg-slate-50"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">

        {/* ── Hero banner ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-[#2563eb] px-6 py-8 md:px-10 md:py-10 mb-8 shadow-lg shadow-[#2563eb]/20">
          {/* decorative circles */}
          <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
          <div className="absolute -left-6 -bottom-8 h-36 w-36 rounded-full bg-white/5" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isArabic ? "سياسة إرجاع مضمونة" : "Guaranteed Return Policy"}
            </div>

            <h1 className="text-2xl font-bold text-white leading-tight md:text-3xl">
              {isArabic ? "نساعدك في إرجاع مشترياتك بكل سهولة" : "We make returns effortless"}
            </h1>
            <p className="text-blue-100 text-sm md:text-base max-w-xl">
              {isArabic
                ? "ادخل تفاصيل طلبك، صف المشكلة، وراجع السياسة قبل الإرسال."
                : "Provide your order details, describe the issue, and review the policy before submitting."}
            </p>

            {formData.orderId && (
              <div className="pt-1">
                <BadgePill label={`${isArabic ? "رقم الطلب" : "Order"}: ${formData.orderId}`} />
              </div>
            )}
          </div>
        </div>

        {/* ── Main grid ───────────────────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-[300px,1fr]">

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="space-y-4">

            {/* Steps tracker */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Info className="h-4 w-4 text-[#2563eb]" />
                <p className="text-sm font-bold text-slate-800">
                  {isArabic ? "مراحل الطلب" : "Request stages"}
                </p>
              </div>
              <div className="px-5 py-4 space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const state: StepState = currentStep === index + 1 ? "current" : currentStep > index + 1 ? "done" : "pending"
                  return (
                    <div key={step.title}>
                      <StepPill
                        icon={<Icon className="h-4 w-4" />}
                        label={step.title}
                        index={index + 1}
                        state={state}
                      />
                      {index < steps.length - 1 && (
                        <div className={`mr-4 ml-4 mt-1 mb-1 w-0.5 h-5 rounded-full ${currentStep > index + 1 ? 'bg-[#2563eb]' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  )
                })}

                {/* Progress */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{isArabic ? "التقدم" : "Progress"}</span>
                    <span className="font-semibold text-[#2563eb]">{Math.round(progressValue)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Policy reminder */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">
                  {isArabic ? "تذكير بسياسة الإرجاع" : "Quick policy reminder"}
                </p>
              </div>
              <div className="px-5 py-4">
                <ul className="space-y-3">
                  {[
                    isArabic ? "14 يوم من تاريخ الاستلام للإرجاع" : "Return within 14 days of delivery",
                    isArabic ? "يجب أن يكون المنتج بحالته الأصلية" : "Items must stay in original condition",
                    isArabic ? "نغطي تكلفة استرجاع العيوب المصنعية" : "Defects are fully covered",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#eff6ff] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                      </div>
                      <span className="text-xs text-slate-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ── Form card ───────────────────────────────────────────── */}
          <section>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-[#eff6ff]/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center shrink-0">
                    {currentStep === 1 ? <Package className="h-4 w-4 text-white" /> :
                      currentStep === 2 ? <ClipboardList className="h-4 w-4 text-white" /> :
                        <ShieldCheck className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {currentStep === 1 ? (isArabic ? "معلومات الطلب" : "Order Information") :
                        currentStep === 2 ? (isArabic ? "سبب الإرجاع" : "Return Reason") :
                          (isArabic ? "الشروط والأحكام" : "Terms & Conditions")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isArabic
                        ? "أكمل البيانات التالية لنتمكن من مراجعة طلبك"
                        : "Complete the fields below so we can process your request"}
                    </p>
                  </div>
                  <div className="mr-auto">
                    <span className="text-xs font-bold text-[#2563eb] bg-[#eff6ff] border border-[#2563eb]/20 px-2.5 py-1 rounded-full">
                      {currentStep}/{steps.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 space-y-6">

                {/* ── Step 1 ───────────────────────────────────────── */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={isArabic ? "رقم الطلب" : "Order ID"} required>
                        <Input
                          id="orderId" name="orderId"
                          value={formData.orderId} onChange={handleInputChange}
                          placeholder={isArabic ? "أدخل رقم الطلب" : "Enter your order ID"}
                          required
                          className="h-11 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 focus-visible:border-[#2563eb] transition-all"
                        />
                      </Field>
                      <Field label={isArabic ? "رقم المنتج" : "Item ID"} required>
                        <Input
                          id="itemId" name="itemId"
                          value={formData.itemId} onChange={handleInputChange}
                          placeholder={isArabic ? "رقم المنتج" : "Product SKU / item ID"}
                          required
                          className="h-11 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 focus-visible:border-[#2563eb] transition-all"
                        />
                      </Field>
                    </div>

                    {/* Info hint */}
                    <div className="flex items-start gap-3 p-3.5 bg-[#eff6ff] border border-[#2563eb]/20 rounded-xl">
                      <Info className="h-4 w-4 text-[#2563eb] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#1d4ed8] leading-relaxed">
                        {isArabic
                          ? "يمكنك إيجاد رقم الطلب ورقم المنتج في صفحة الطلبات الخاصة بك."
                          : "You can find the Order ID and Item ID in your orders page."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Step 2 ───────────────────────────────────────── */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <Field label={isArabic ? "سبب الإرجاع" : "Return reason"} required>
                      <Textarea
                        id="reason" name="reason"
                        value={formData.reason} onChange={handleInputChange}
                        className="min-h-[140px] rounded-xl border-slate-200 bg-white text-sm resize-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 focus-visible:border-[#2563eb] transition-all"
                        placeholder={isArabic ? "أخبرنا بالتفاصيل......" : "Tell us what went wrong or share defect codes"}
                        required
                      />
                    </Field>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">
                        {isArabic ? "صور المشكلة (اختياري)" : "Issue images (optional)"}
                      </Label>
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden">
                        <ImageUploader
                          onUpload={(url) =>
                            setFormData(prev => ({ ...prev, images: [...prev.images, url] }))
                          }
                        />
                      </div>
                      {formData.images.length > 0 && (
                        <p className="text-xs text-[#2563eb]">
                          {formData.images.length} {isArabic ? "صورة مرفوعة" : "image(s) uploaded"}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Step 3 ───────────────────────────────────────── */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    {/* Policy card */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-200 bg-white">
                        <p className="text-sm font-bold text-slate-800">
                          {isArabic ? "سياسة الإرجاع" : "Return policy"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isArabic ? "نلتزم بإبلاغك بنتيجة الطلب خلال 72 ساعة" : "We'll get back to you within 72 hours"}
                        </p>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        {[
                          isArabic ? "قد نطلب صورًا أو فيديو يوضح حالة المنتج قبل الموافقة" : "We might request photos or videos before approving the return.",
                          isArabic ? "تأكد أن جميع الملحقات متوفرة لضمان سرعة الاسترجاع" : "Ensure every accessory is included for a faster refund.",
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#eff6ff] flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terms checkbox */}
                    <label className="flex items-start gap-3 p-4 bg-[#eff6ff] border border-[#2563eb]/20 rounded-2xl cursor-pointer hover:bg-[#dbeafe]/60 transition-colors">
                      <Checkbox
                        id="termsAccepted"
                        checked={formData.termsAccepted}
                        onCheckedChange={handleCheckboxChange}
                        className="mt-0.5 border-[#2563eb] data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb]"
                      />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-[#1d4ed8]">
                          {isArabic ? "أوافق على الشروط والأحكام" : "I agree to the terms"}
                        </p>
                        <p className="text-xs text-[#2563eb]/70 leading-relaxed">
                          {isArabic
                            ? "بتأكيدك، فأنت توافق على سياسة الإرجاع الخاصة بالمتجر"
                            : "By checking this you confirm our return & refund policy"}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* ── Navigation buttons ──────────────────────────── */}
                <div className="pt-2 border-t border-slate-100">
                  <div className={`flex gap-3 ${isArabic ? "flex-row-reverse" : ""}`}>
                    {/* Back */}
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm gap-1.5 transition-all disabled:opacity-40"
                    >
                      {isArabic ? (
                        <><ChevronRight className="h-4 w-4" /><span>السابق</span></>
                      ) : (
                        <><ChevronLeft className="h-4 w-4" /><span>Back</span></>
                      )}
                    </Button>

                    {/* Next or Submit */}
                    {currentStep < steps.length ? (
                      <Button
                        onClick={handleNext}
                        className="h-11 flex-1 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm gap-1.5 transition-all active:scale-[0.98] shadow-sm shadow-[#2563eb]/30"
                      >
                        {isArabic ? (
                          <><span>التالي</span><ChevronLeft className="h-4 w-4" /></>
                        ) : (
                          <><span>Next</span><ChevronRight className="h-4 w-4" /></>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!formData.termsAccepted || isSubmitting}
                        className="h-11 flex-1 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm gap-2 transition-all active:scale-[0.98] shadow-sm shadow-[#2563eb]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />{isArabic ? "جاري الإرسال..." : "Submitting..."}</>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4" /><span>{isArabic ? "إرسال الطلب" : "Submit request"}</span></>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}