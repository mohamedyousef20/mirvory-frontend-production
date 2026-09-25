"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { unavailableProductRequestService } from "@/lib/api";
import ImageUploader from "@/components/ImageUploader";
export default function RequestProductPage() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const copy = language === "ar"
    ? {
      title: "طلب منتج غير متوفر",
      description: "إذا كنت تبحث عن كوتشي معين غير متوفر حالياً، يمكنك طلبه وسنتواصل معك عند توفره",
      phoneLabel: "رقم الهاتف",
      phonePlaceholder: "01xxxxxxxxx",
      sizeLabel: "المقاس المطلوب",
      sizePlaceholder: "مثال: 40, 42, M, L",
      nameLabel: "الاسم (اختياري)",
      namePlaceholder: "اسمك الكامل",
      emailLabel: "البريد الإلكتروني (اختياري)",
      emailPlaceholder: "example@email.com",
      uploadLabel: "صورة المنتج",
      uploadDescription: "ارفع صورة للكوتشي الذي تبحث عنه",
      uploadButton: "اختر صورة",
      removeImage: "حذف الصورة",
      submitButton: "إرسال الطلب",
      submitting: "جاري الإرسال...",
      success: "تم إرسال طلبك بنجاح! سنتواصل معك قريباً",
      error: "حدث خطأ أثناء إرسال الطلب",
      backToHome: "العودة للرئيسية",
      validation: {
        imageRequired: "الصورة مطلوبة",
        phoneRequired: "رقم الهاتف مطلوب",
        phoneInvalid: "رقم الهاتف غير صحيح",
        sizeRequired: "المقاس مطلوب",
        emailInvalid: "البريد الإلكتروني غير صحيح",
      }
    }
    : {
      title: "Request Unavailable Product",
      description: "If you're looking for a specific bag that's not currently available, you can request it and we'll contact you when it's available",
      phoneLabel: "Phone Number",
      phonePlaceholder: "01xxxxxxxxx",
      sizeLabel: "Required Size",
      sizePlaceholder: "e.g., 40, 42, M, L",
      nameLabel: "Name (Optional)",
      namePlaceholder: "Your full name",
      emailLabel: "Email (Optional)",
      emailPlaceholder: "example@email.com",
      uploadLabel: "Product Image",
      uploadDescription: "Upload an image of the bag you're looking for",
      uploadButton: "Choose Image",
      removeImage: "Remove Image",
      submitButton: "Submit Request",
      submitting: "Submitting...",
      success: "Your request has been submitted successfully! We'll contact you soon",
      error: "An error occurred while submitting the request",
      backToHome: "Back to Home",
      validation: {
        imageRequired: "Image is required",
        phoneRequired: "Phone number is required",
        phoneInvalid: "Invalid phone number",
        sizeRequired: "Size is required",
        emailInvalid: "Invalid email address",
      }
    };

  const validatePhone = (phone: string) => {
    return /^01[0125][0-9]{8}$/.test(phone);
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageUrl) {
      toast.error(copy.validation.imageRequired)
      return
    }

    if (!phone) {
      toast.error(copy.validation.phoneRequired)
      return
    }

    if (!validatePhone(phone)) {
      toast.error(copy.validation.phoneInvalid)
      return
    }

    if (!size) {
      toast.error(copy.validation.sizeRequired)
      return
    }

    if (guestEmail && !validateEmail(guestEmail)) {
      toast.error(copy.validation.emailInvalid)
      return
    }

    setLoading(true)

    try {
      await unavailableProductRequestService.createRequest({
        imageUrl,
        phone,
        size,
        ...(guestName ? { guestName } : {}),
        ...(guestEmail ? { guestEmail } : {}),
      })

      toast.success(copy.success)

      setImageUrl(null)
      setPhone("")
      setSize("")
      setGuestName("")
      setGuestEmail("")
    } catch (error: any) {
      console.error("Error submitting request:", error)

      toast.error(
        error.response?.data?.message || copy.error
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{copy.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {copy.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {copy.uploadLabel}
                </Label>

                <p className="text-sm text-muted-foreground">
                  {copy.uploadDescription}
                </p>

                <ImageUploader
                  maxSizeMb={5}
                  onUpload={(url) => {
                    setImageUrl(url)
                  }}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">
                  {copy.phoneLabel} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={copy.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  maxLength={11}
                />
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label htmlFor="size" className="text-base font-semibold">
                  {copy.sizeLabel} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="size"
                  type="text"
                  placeholder={copy.sizePlaceholder}
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Guest Name */}
              <div className="space-y-2">
                <Label htmlFor="guestName" className="text-base font-semibold">
                  {copy.nameLabel}
                </Label>
                <Input
                  id="guestName"
                  type="text"
                  placeholder={copy.namePlaceholder}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Guest Email */}
              <div className="space-y-2">
                <Label htmlFor="guestEmail" className="text-base font-semibold">
                  {copy.emailLabel}
                </Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-6 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {copy.submitting}
                  </>
                ) : (
                  copy.submitButton
                )}
              </Button>

              {/* Back to Home */}
              <div className="text-center">
                <Link href="/">
                  <Button variant="ghost" type="button">
                    {copy.backToHome}
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
