"use client"

import { useLanguage } from "@/components/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    RotateCcw,
    PackageCheck,
    AlertCircle,
    Truck,
    ShieldCheck,
} from "lucide-react"

const trustedRules = [
    {
        icon: ShieldCheck,
        titleAr: "منتج موثوق",
        titleEn: "Trusted Product",
        contentAr:
            "المنتجات الحاصلة على شارة (منتج موثوق) تم تقييمها وفق معايير الجودة والثقة الخاصة بمنصة Mirvory.",
        contentEn:
            "Products with the Trusted Product badge have been evaluated according to Mirvory's quality and trust standards.",
    },
    {
        icon: PackageCheck,
        titleAr: "ضمان المطابقة",
        titleEn: "Matching Guarantee",
        contentAr:
            "في حالة وجود اختلاف جوهري بين المنتج المستلم والوصف أو الصور المعروضة، يمكن للعميل تقديم طلب إرجاع أو استبدال.",
        contentEn:
            "If there is a significant difference between the delivered product and the displayed description or images, the customer may request a return or exchange.",
    },
    {
        icon: RotateCcw,
        titleAr: "إرجاع واستبدال",
        titleEn: "Returns & Exchanges",
        contentAr:
            "يمكن طلب الإرجاع أو الاستبدال خلال 7 أيام من تاريخ الاستلام وفق شروط وأحكام المنصة.",
        contentEn:
            "Returns or exchanges may be requested within 7 days of delivery, subject to platform terms and conditions.",
    },
]

export default function ReturnPolicyPage() {
    const { language } = useLanguage()
    const isArabic = language === "ar"

    return (
        <div className="space-y-8 pb-12">
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 text-sm">
                    {isArabic ? "المنتجات الموثوقة" : "Trusted Products"}
                </Badge>

                <h1
                    className={cn(
                        "text-3xl font-bold",
                        isArabic && "font-[Cairo]"
                    )}
                >
                    {isArabic
                        ? "سياسة المنتجات الموثوقة"
                        : "Trusted Products Policy"}
                </h1>

                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {isArabic
                        ? "توضح هذه الصفحة المزايا والسياسات الإضافية المطبقة على المنتجات الحاصلة على شارة (منتج موثوق) داخل منصة Mirvory."
                        : "This page explains the additional benefits and policies applied to products carrying the Trusted Product badge on Mirvory."}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {trustedRules.map((rule, idx) => {
                    const Icon = rule.icon

                    return (
                        <Card
                            key={idx}
                            className="border-t-4 border-t-primary"
                        >
                            <CardHeader className="pb-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                    <Icon className="w-5 h-5 text-primary" />
                                </div>

                                <CardTitle className="text-lg">
                                    {isArabic
                                        ? rule.titleAr
                                        : rule.titleEn}
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {isArabic
                                        ? rule.contentAr
                                        : rule.contentEn}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {isArabic
                            ? "ماذا تعني شارة المنتج الموثوق؟"
                            : "What Does the Trusted Product Badge Mean?"}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <ul
                        className="space-y-3 text-muted-foreground"
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        <li>
                            {isArabic
                                ? "المنتج اجتاز معايير الجودة الخاصة بمنصة Mirvory."
                                : "The product has passed Mirvory quality standards."}
                        </li>

                        <li>
                            {isArabic
                                ? "تمت مراجعة أداء البائع وسجل التقييمات الخاص به."
                                : "The seller's performance and ratings history have been reviewed."}
                        </li>

                        <li>
                            {isArabic
                                ? "يتمتع المنتج بمزايا إضافية في الإرجاع والاستبدال وفق سياسة المنصة."
                                : "The product benefits from additional return and exchange privileges according to platform policy."}
                        </li>

                        <li>
                            {isArabic
                                ? "الحصول على الشارة لا يعني ضماناً مطلقاً أو التزاماً يتجاوز شروط وأحكام المنصة."
                                : "The badge does not constitute an absolute guarantee and remains subject to platform terms and conditions."}
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-muted/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />

                        {isArabic
                            ? "كيفية طلب الإرجاع أو الاستبدال"
                            : "How to Request a Return or Exchange"}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <ol
                        className="list-decimal list-inside space-y-3 text-muted-foreground"
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        <li>
                            {isArabic
                                ? "قم بتسجيل الدخول إلى حسابك."
                                : "Sign in to your account."}
                        </li>

                        <li>
                            {isArabic
                                ? "انتقل إلى صفحة الطلبات."
                                : "Go to your orders page."}
                        </li>

                        <li>
                            {isArabic
                                ? "اختر الطلب المطلوب إرجاعه أو استبداله."
                                : "Select the order you wish to return or exchange."}
                        </li>

                        <li>
                            {isArabic
                                ? "حدد السبب وأرفق الصور عند الحاجة."
                                : "Select the reason and attach photos if necessary."}
                        </li>

                        <li>
                            {isArabic
                                ? "سيتم مراجعة الطلب وإشعارك بالخطوات التالية."
                                : "Your request will be reviewed and you will be notified of the next steps."}
                        </li>
                    </ol>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />

                        {isArabic
                            ? "حالات عدم قبول الإرجاع"
                            : "Non-Eligible Return Cases"}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <ul
                        className="space-y-3 text-muted-foreground"
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        <li>
                            {isArabic
                                ? "المنتجات المتضررة نتيجة سوء الاستخدام."
                                : "Products damaged due to misuse."}
                        </li>

                        <li>
                            {isArabic
                                ? "المنتجات التي تم استخدامها بشكل واضح بعد الاستلام."
                                : "Products showing clear signs of use after delivery."}
                        </li>

                        <li>
                            {isArabic
                                ? "الطلبات المقدمة بعد انتهاء فترة الإرجاع المحددة."
                                : "Requests submitted after the return period expires."}
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <div className="text-center p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">
                    {isArabic
                        ? "هل لديك استفسار؟"
                        : "Need Assistance?"}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                    {isArabic
                        ? "يمكنك التواصل مع فريق الدعم للمساعدة."
                        : "You can contact our support team for assistance."}
                </p>

                <Badge
                    variant="secondary"
                    className="px-4 py-2 text-md"
                >
                    support.mirvory@gmail.com
                </Badge>
            </div>
        </div>
    )
}