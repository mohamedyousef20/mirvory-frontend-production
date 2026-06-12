"use client"

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Shield, Scale, Info } from "lucide-react"

const sections = [
  {
    id: "definitions",
    titleEn: "Definitions",
    titleAr: "التعريفات",
    icon: Info,
    contentEn: [
      "Mirvory is a multi-vendor commerce platform operated as a digital marketplace.",
      "User refers to any visitor, buyer, or seller using the platform.",
      "Seller is a registered user who publishes products on Mirvory.",
      "Services include browsing, carts, checkout, reviews, notifications, dashboards, loyalty programs, returns, and pickup services."
    ],
    contentAr: [
      "Mirvory: منصة تجارة إلكترونية متعددة البائعين تعمل كسوق رقمي.",
      "المستخدم: أي شخص يستخدم المنصة كمشتري أو بائع أو زائر.",
      "البائع: مستخدم مسجّل يعرض منتجاته عبر Mirvory.",
      "الخدمات: جميع الميزات مثل عرض المنتجات، السلة، الدفع، التقييمات، الإشعارات، لوحة البائع، نظام النقاط، الاسترجاع ونقاط الاستلام."
    ],
  },
  {
    id: "consent",
    titleEn: "Acceptance",
    titleAr: "الموافقة على الشروط",
    icon: CheckCircle,
    contentEn: [
      "Using Mirvory implies acceptance of these terms. If you disagree, stop using the platform.",
      "Mirvory may update the Terms at any time, and continued use means acceptance of changes."
    ],
    contentAr: [
      "استخدامك لـ Mirvory يعني قبولك لهذه الشروط، وفي حال عدم الموافقة يجب التوقف عن استخدام المنصة.",
      "يحق لـ Mirvory تعديل الشروط، واستمرار الاستخدام بعد التعديل يُعد قبولاً لها."
    ],
  },
  {
    id: "eligibility",
    titleEn: "Eligibility & Accounts",
    titleAr: "الأهلية والحساب",
    icon: Shield,
    contentEn: [
      "You must be legally eligible to create an account.",
      "Provide accurate registration information and keep your credentials secure.",
      "Verification may be required for security purposes."
    ],
    contentAr: [
      "يجب أن يكون المستخدم مؤهلاً قانونياً لإنشاء حساب.",
      "يجب إدخال بيانات صحيحة والحفاظ على سرية الحساب.",
      "قد يتم طلب التحقق من البيانات لأسباب أمنية."
    ],
  },
  {
    id: "products",
    titleEn: "Products, Pricing & Payments",
    titleAr: "المنتجات والدفع",
    icon: Scale,
    contentEn: [
      "Sellers are responsible for product accuracy, availability, and descriptions.",
      "Mirvory may review or remove listings that violate platform policies.",
      "Payments are processed through approved third-party payment providers.",
      "Mirvory may operate a marketplace fee model without exposing fixed public rates."
    ],
    contentAr: [
      "البائع مسؤول عن دقة وصف المنتجات وتوفرها.",
      "يحق للمنصة مراجعة أو إزالة المنتجات المخالفة للسياسات.",
      "تتم عمليات الدفع عبر مزودي خدمات دفع معتمدين.",
      "قد تطبق المنصة نموذج رسوم تشغيل داخلي دون إعلان نسب ثابتة."
    ],
  },
  {
    id: "trust",
    titleEn: "Trusted Products, Returns & Protection",
    titleAr: "المنتجات الموثوقة والحماية والاسترجاع",
    icon: CheckCircle,
    contentEn: [
      "Mirvory provides protection mechanisms for products marked as Trusted Product.",
      "Eligible Trusted Products may include return, replacement, or compensation options under platform policy.",
      "Cases are evaluated individually to ensure fairness for both buyer and seller.",
      "Misuse of ratings or fake claims is strictly prohibited."
    ],
    contentAr: [
      "توفر Mirvory آليات حماية للمنتجات التي تحمل شارة 'منتج موثوق'.",
      "قد تشمل المنتجات الموثوقة خيارات استرجاع أو استبدال أو تعويض حسب سياسة المنصة.",
      "يتم تقييم الحالات بشكل فردي لضمان العدالة بين البائع والمشتري.",
      "يُمنع تماماً إساءة استخدام التقييمات أو تقديم بلاغات كاذبة."
    ],
  },
  {
    id: "shipping",
    titleEn: "Shipping & Delivery",
    titleAr: "الشحن والتوصيل",
    icon: Info,
    contentEn: [
      "Shipping and delivery are handled by sellers or logistics partners.",
      "Pickup points and verification codes may be used for secure delivery.",
      "Delivery experience may vary depending on location and seller."
    ],
    contentAr: [
      "تتم عمليات الشحن والتوصيل من خلال البائع أو شركاء الشحن.",
      "قد يتم استخدام نقاط استلام ورموز تحقق لضمان أمان التسليم.",
      "قد تختلف تجربة التوصيل حسب الموقع والبائع."
    ],
  },
  {
    id: "legal",
    titleEn: "Liability & Termination",
    titleAr: "المسؤولية وإنهاء الحساب",
    icon: Shield,
    contentEn: [
      "Mirvory acts as a marketplace intermediary between buyers and sellers.",
      "Accounts may be suspended in case of fraud or policy violations.",
      "Disputes are handled according to applicable local regulations."
    ],
    contentAr: [
      "تعمل Mirvory كوسيط بين البائع والمشتري.",
      "يمكن إيقاف الحسابات في حال المخالفة أو الاحتيال.",
      "تتم معالجة النزاعات وفق القوانين المحلية المعمول بها."
    ],
  },
]
export default function TermsAndConditionsPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 text-sm">
          {isArabic ? "مستند قانوني" : "Legal Document"}
        </Badge>
        <div className="space-y-3">
          <h1 className={cn("text-3xl font-bold tracking-tight", isArabic && "font-[Cairo]")}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {isArabic ? "شروط الاستخدام - Mirvory" : "Mirvory Terms of Service"}
          </h1>
          <p className="text-muted-foreground" dir={isArabic ? "rtl" : "ltr"}>
            {isArabic
              ? "آخر تحديث: 25 نوفمبر 2025"
              : "Last updated: 25 November 2025"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle dir={isArabic ? "rtl" : "ltr"}>
            {isArabic ? "ملخص سريع" : "Quick Highlights"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {isArabic ? "معلومات الشحن" : "Shipping"}
              </h3>
              <p className="text-sm">
                {isArabic
                  ? "البائع أو مقدم الخدمة مسؤول عن الشحن والمهل الزمنية، مع إمكانية استخدام نقاط الاستلام."
                  : "Sellers/logistics partners handle shipping timelines; pickup hubs may apply."}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
              <h3 className="text-sm font-semibold text-muted-foreground">
                {isArabic ? "سياسة العمولات" : "Revenue Split"}
              </h3>
              <p className="text-sm">
                {isArabic
                  ? "النسبة الافتراضية 90% للبائع / 10% للمنصة (13% تشغيل + 2% خصومات)."
                  : "Default split: 85% seller / 15% Mirvory (13% ops + 2% promos)."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon
          const content = isArabic ? section.contentAr : section.contentEn
          const title = isArabic ? section.titleAr : section.titleEn

          return (
            <Card key={section.id} id={section.id} className="scroll-mt-20">
              <CardHeader className="flex flex-row items-center gap-3" dir={isArabic ? "rtl" : "ltr"}>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3" dir={isArabic ? "rtl" : "ltr"}>
                  {content.map((paragraph, idx) => (
                    <li key={idx} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="space-y-4" dir={isArabic ? "rtl" : "ltr"}>
          <h3 className="text-lg font-semibold">
            {isArabic ? "التواصل والدعم" : "Need to reach us?"}
          </h3>
          <p className="text-muted-foreground">
            {isArabic
              ? "للأسئلة القانونية أو التعاقدية راسلنا على support.mirvory@gmail.com أو استخدم صفحة الاتصال."
              : "For legal or commercial queries, email support.mirvory@gmail.com or use the contact form."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
