"use client"

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Shield, Scale, Info, Package, AlertTriangle, DollarSign } from "lucide-react"

const sections = [
    {
        id: "seller-eligibility",
        titleEn: "Seller Eligibility",
        titleAr: "أهلية البائع",
        icon: Shield,
        contentEn: [
            "To register as a seller on Mirvory, you must be legally eligible to enter into commercial contracts.",
            "You must provide accurate personal and business information during registration.",
            "Mirvory reserves the right to verify seller identity and reject applications that do not meet platform requirements.",
            "Each user may register only one seller account. Creating duplicate accounts is strictly prohibited.",
        ],
        contentAr: [
            "لتسجيل حساب بائع على Mirvory، يجب أن تكون مؤهلاً قانونياً لإبرام عقود تجارية.",
            "يجب تقديم بيانات شخصية وتجارية صحيحة أثناء التسجيل.",
            "يحتفظ Mirvory بحق التحقق من هوية البائع ورفض الطلبات غير المستوفية لمتطلبات المنصة.",
            "يُسمح لكل مستخدم بتسجيل حساب بائع واحد فقط، ويُحظر إنشاء حسابات مكررة.",
        ],
    },
    {
        id: "product-listing",
        titleEn: "Product Listing & Content Policy",
        titleAr: "سياسة عرض المنتجات والمحتوى",
        icon: Package,
        contentEn: [
            "Sellers are solely responsible for the accuracy, completeness, and legality of product listings.",
            "Products must include clear descriptions, accurate pricing, and real images.",
            "Prohibited products include: counterfeit goods, illegal items, or any product that violates applicable laws.",
            "Mirvory may review, edit, or remove any listing that violates platform policies without prior notice.",
            "All product descriptions and images must be original or properly licensed.",
        ],
        contentAr: [
            "يتحمل البائع المسؤولية الكاملة عن دقة واكتمال وقانونية قوائم المنتجات.",
            "يجب أن تتضمن المنتجات أوصافاً واضحة وأسعاراً دقيقة وصوراً حقيقية.",
            "المنتجات المحظورة تشمل: البضائع  والمواد غير القانونية وأي منتج يخالف القوانين المعمول بها.",
            "يحق لـ Mirvory مراجعة أو تعديل أو إزالة أي قائمة منتجات تخالف سياسات المنصة دون إشعار مسبق.",
            "يجب أن تكون جميع أوصاف المنتجات والصور أصلية أو مرخصة بشكل صحيح.",
        ],
    },
    {
        id: "pricing-payments",
        titleEn: "Pricing, Commissions & Payments",
        titleAr: "التسعير والعمولات والمدفوعات",
        icon: DollarSign,
        contentEn: [
            "Sellers set their own product prices, subject to platform pricing guidelines.",
            "Mirvory charges a commission on each sale as per the agreed-upon rate at the time of registration.",
            "Seller earnings are transferred to the seller balance after order completion and any applicable holding period.",
            "Mirvory is not responsible for payment delays caused by external payment providers or banking systems.",
            "Sellers are responsible for any applicable taxes on their earnings in accordance with local laws.",
        ],
        contentAr: [
            "يحدد البائع أسعار منتجاته بنفسه وفق إرشادات تسعير المنصة.",
            "يفرض Mirvory عمولة على كل عملية بيع وفقاً للنسبة المتفق عليها عند التسجيل.",
            "تُحوَّل أرباح البائع إلى رصيده بعد اكتمال الطلب وانتهاء أي فترة احتجاز مطبقة.",
            "لا يتحمل Mirvory المسؤولية عن تأخيرات الدفع الناجمة عن مزودي خدمات الدفع الخارجيين أو الأنظمة المصرفية.",
            "البائع مسؤول عن أي ضرائب مستحقة على أرباحه وفقاً للقوانين المحلية.",
        ],
    },
    {
        id: "orders-fulfillment",
        titleEn: "Orders & Fulfillment",
        titleAr: "الطلبات والتنفيذ",
        icon: CheckCircle,
        contentEn: [
            "Sellers must fulfill orders promptly and within the stated preparation time.",
            "Sellers are responsible for ensuring products are properly packaged before dispatch.",
            "Failure to fulfill orders repeatedly may result in account suspension or termination.",
            "Sellers must update order status accurately through the seller dashboard.",
            "Cancellations should be minimized; excessive cancellations may affect seller ratings and account standing.",
        ],
        contentAr: [
            "يجب على البائعين تنفيذ الطلبات بسرعة وضمن وقت التحضير المحدد.",
            "يتحمل البائع مسؤولية التأكد من تغليف المنتجات بشكل صحيح قبل الشحن.",
            "قد يؤدي الإخفاق المتكرر في تنفيذ الطلبات إلى تعليق الحساب أو إنهائه.",
            "يجب على البائعين تحديث حالة الطلب بدقة من خلال لوحة تحكم البائع.",
            "يجب تقليل عمليات الإلغاء إلى الحد الأدنى؛ فالإلغاءات المتكررة قد تؤثر على تقييمات البائع وحالة حسابه.",
        ],
    },
    {
        id: "returns-refunds",
        titleEn: "Returns & Refunds Policy",
        titleAr: "سياسة الإرجاع والاسترداد",
        icon: Scale,
        contentEn: [
            "Sellers must comply with the Mirvory return and refund policy.",
            "Return requests approved by the admin must be honored by the seller.",
            "Sellers are responsible for reviewing and responding to return requests through their dashboard.",
            "Refunds for valid return requests will be processed according to platform policy.",
            "Sellers who repeatedly fail to comply with return policies may face penalties or account restrictions.",
        ],
        contentAr: [
            "يجب على البائعين الالتزام بسياسة الإرجاع والاسترداد الخاصة بـ Mirvory.",
            "يجب على البائع الالتزام بطلبات الإرجاع التي يوافق عليها المسؤول.",
            "يتحمل البائعون مسؤولية مراجعة طلبات الإرجاع والرد عليها من خلال لوحة التحكم الخاصة بهم.",
            "تُعالَج المبالغ المستردة لطلبات الإرجاع الصحيحة وفقاً لسياسة المنصة.",
            "البائعون الذين يخفقون بشكل متكرر في الالتزام بسياسات الإرجاع قد يواجهون عقوبات أو قيوداً على حساباتهم.",
        ],
    },
    {
        id: "seller-conduct",
        titleEn: "Seller Conduct & Prohibited Activities",
        titleAr: "سلوك البائع والأنشطة المحظورة",
        icon: AlertTriangle,
        contentEn: [
            "Sellers must not engage in fraudulent activities, including fake reviews or order manipulation.",
            "Direct communication with buyers outside of the platform to bypass fees is strictly prohibited.",
            "Sellers must not list products that infringe on intellectual property rights.",
            "Price manipulation, artificial inflation, or predatory pricing tactics are not allowed.",
            "Violation of these conduct rules may result in immediate account suspension without prior warning.",
        ],
        contentAr: [
            "يجب على البائعين عدم الانخراط في أنشطة احتيالية، بما في ذلك التقييمات الوهمية أو التلاعب بالطلبات.",
            "يُحظر تماماً التواصل المباشر مع المشترين خارج المنصة لتجنب الرسوم.",
            "يجب على البائعين عدم إدراج منتجات تنتهك حقوق الملكية الفكرية.",
            "لا يُسمح بالتلاعب في الأسعار أو التضخيم الاصطناعي أو أساليب التسعير الافتراسية.",
            "قد تؤدي مخالفة قواعد السلوك هذه إلى تعليق الحساب فوراً دون إنذار مسبق.",
        ],
    },
    {
        id: "account-termination",
        titleEn: "Account Suspension & Termination",
        titleAr: "تعليق الحساب وإنهاؤه",
        icon: Info,
        contentEn: [
            "Mirvory reserves the right to suspend or terminate seller accounts at its sole discretion for policy violations.",
            "Suspended sellers will be notified via registered email.",
            "Sellers may appeal account decisions by contacting support.mirvory@gmail.com.",
            "Upon termination, pending balances will be handled according to platform policy and any outstanding disputes.",
        ],
        contentAr: [
            "يحتفظ Mirvory بحق تعليق حسابات البائعين أو إنهائها وفق تقديره المطلق في حالة انتهاك السياسات.",
            "سيتم إخطار البائعين الموقوفين عبر البريد الإلكتروني المسجل.",
            "يمكن للبائعين الطعن في قرارات الحساب عن طريق الاتصال بـ support.mirvory@gmail.com.",
            "عند الإنهاء، يتم التعامل مع الأرصدة المعلقة وفقاً لسياسة المنصة وأي نزاعات قائمة.",
        ],
    },
]

export default function SellerTermsAndConditionsPage() {
    const { language } = useLanguage()
    const isArabic = language === "ar"

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 text-sm">
                    {isArabic ? "وثيقة قانونية" : "Legal Document"}
                </Badge>
                <div className="space-y-3">
                    <h1
                        className={cn("text-3xl font-bold tracking-tight", isArabic && "font-[Cairo]")}
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        {isArabic ? "شروط وأحكام البائع - Mirvory" : "Mirvory Seller Terms & Conditions"}
                    </h1>
                    <p className="text-muted-foreground" dir={isArabic ? "rtl" : "ltr"}>
                        {isArabic
                            ? "آخر تحديث: 27 أغسطس 2026"
                            : "Last updated: 27 August 2026"}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle dir={isArabic ? "rtl" : "ltr"}>
                        {isArabic ? "ملخص سريع للبائع" : "Seller Quick Highlights"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2" dir={isArabic ? "rtl" : "ltr"}>
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                {isArabic ? "العمولات" : "Commissions"}
                            </h3>
                            <p className="text-sm">
                                {isArabic
                                    ? "يطبق Mirvory عمولة على كل عملية بيع ناجحة، ويتم تحويل الأرباح بعد اكتمال الطلب."
                                    : "Mirvory applies a commission on every successful sale; earnings are transferred after order completion."}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                {isArabic ? "الإرجاع والاسترداد" : "Returns & Refunds"}
                            </h3>
                            <p className="text-sm">
                                {isArabic
                                    ? "يجب على البائع الالتزام بسياسة الإرجاع الخاصة بالمنصة ومعالجة طلبات الإرجاع من خلال لوحة التحكم."
                                    : "Sellers must comply with the platform return policy and handle return requests through the dashboard."}
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
