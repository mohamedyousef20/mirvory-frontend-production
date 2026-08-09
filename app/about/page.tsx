"use client"

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Target, Eye, ShoppingBag, Store, Star, Users } from "lucide-react"

const sections = [
    {
        id: "mission",
        titleAr: "رسالتنا",
        titleEn: "Our Mission",
        icon: Target,
        contentAr: [
            "بناء بيئة تجارة إلكترونية صحية تعتمد على الجودة الحقيقية والشفافية.",
            "تمكين التجار المحليين من الوصول إلى قاعدة عملاء واسعة بأدوات تكنولوجية متطورة.",
            "تقديم تجربة تسوق للمشترين خالية من المفاجآت، وتقليل معدلات المرتجعات عبر توفير وصف دقيق وصادق للمنتجات.",
        ],
        contentEn: [
            "Building a healthy e-commerce environment based on true quality and transparency.",
            "Empowering local sellers to reach a wider audience with advanced technological tools.",
            "Providing buyers with a surprise-free shopping experience and minimizing return rates through accurate, honest product descriptions.",
        ],
    },
    {
        id: "vision",
        titleAr: "رؤيتنا",
        titleEn: "Our Vision",
        icon: Eye,
        contentAr: [
            "أن تصبح منصة Mirvory الوجهة الأولى والأكثر ثقة للتجارة الإلكترونية في المنطقة.",
            "تغيير ثقافة التسوق الإلكتروني من التركيز على 'أرخص سعر' إلى التركيز على 'أفضل قيمة وأعلى جودة'.",
            "بناء مجتمع تجاري متكامل يربط بين المورد الموثوق والمستهلك الذكي."
        ],
        contentEn: [
            "To become the most trusted and premier e-commerce destination in the region.",
            "To shift the online shopping culture from focusing on 'cheapest price' to 'best value and highest quality'.",
            "To build an integrated business community connecting reliable suppliers with smart consumers."
        ],
    },
    {
        id: "buyers",
        titleAr: "ماذا نقدم للمشترين؟",
        titleEn: "What We Offer Buyers",
        icon: ShoppingBag,
        contentAr: [
            "منتجات تم فحص جودتها ومطابقتها للمواصفات المعروضة.",
            "سياسة استرجاع واضحة وعادلة تحفظ حقوق المشتري.",
            "خدمة عملاء سريعة الاستجابة لحل أي مشكلات بكفاءة.",
            "واجهة مستخدم بسيطة وتجربة تسوق سلسة من الطلب حتى الاستلام."
        ],
        contentEn: [
            "Products that are quality-checked and match their descriptions.",
            "A clear, fair return policy that protects buyer rights.",
            "Responsive customer support to resolve issues efficiently.",
            "A simple user interface and a seamless shopping journey from order to delivery."
        ],
    },
    {
        id: "sellers",
        titleAr: "ماذا نقدم للبائعين؟",
        titleEn: "What We Offer Sellers",
        icon: Store,
        contentAr: [
            "بيئة خالية من المنافسة العشوائية، تركز على التجار الجادين فقط.",
            "رسوم وعمولات عادلة تضمن ربحية التاجر واستدامة أعماله.",
            "لوحة تحكم (Dashboard) متطورة لتحليل المبيعات، ومراقبة المخزون.",
            "أدوات تسويقية وتوجيهات لتقليل المرتجعات وبناء قاعدة عملاء مخلصين."
        ],
        contentEn: [
            "An environment free of chaotic competition, focusing strictly on serious sellers.",
            "Fair fees and commissions that ensure seller profitability and business sustainability.",
            "An advanced Dashboard for sales analysis and inventory monitoring.",
            "Marketing tools and guidance to reduce return rates and build a loyal customer base."
        ],
    },
    {
        id: "values",
        titleAr: "قيمنا الأساسية",
        titleEn: "Our Core Values",
        icon: Star,
        contentAr: [
            "الثقة: نبني علاقاتنا مع البائعين والمشترين على المصداقية التامة.",
            "التميز التشغيلي: نعتمد على لغة الأرقام والبيانات لتحسين الأداء المستمر.",
            "الابتكار: التحديث المستمر لأدواتنا التقنية لتسهيل عمليات البيع والشراء.",
            "المنفعة المتبادلة: نؤمن بأن نجاحنا مرتبط ارتباطاً وثيقاً بنجاح شركائنا (التجار)."
        ],
        contentEn: [
            "Trust: We build our relationships with sellers and buyers on absolute credibility.",
            "Operational Excellence: We rely on numbers and data for continuous improvement.",
            "Innovation: Constant updates to our technical tools to facilitate trading.",
            "Mutual Benefit: We believe our success is intrinsically tied to the success of our partners (sellers)."
        ],
    },
]

export default function AboutUsPage() {
    const { language } = useLanguage()
    const isArabic = language === "ar"

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 text-sm">
                    {isArabic ? "من نحن" : "About Us"}
                </Badge>
                <div className="space-y-3">
                    <h1 className={cn("text-3xl font-bold tracking-tight", isArabic && "font-[Cairo]")}
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        {isArabic ? "عن ميرفورى - Mirvory" : "About Mirvory"}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto" dir={isArabic ? "rtl" : "ltr"}>
                        {isArabic
                            ? "نحن نهدف إلى إعادة تعريف معايير التجارة الإلكترونية، لنبني سوقاً يجمع بين التجار المحترفين والمشترين الباحثين عن الجودة والثقة."
                            : "We aim to redefine e-commerce standards, building a marketplace that brings together professional sellers and buyers seeking quality and trust."}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle dir={isArabic ? "rtl" : "ltr"} className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {isArabic ? "لمحة سريعة" : "At a Glance"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                {isArabic ? "المجتمع التجاري" : "Business Community"}
                            </h3>
                            <p className="text-sm mt-1">
                                {isArabic
                                    ? "نسعى لجمع نخبة البائعين النشطين لبناء أصل تجاري متين يخدم آلاف العملاء شهرياً."
                                    : "We strive to gather elite active sellers to build a robust business asset serving thousands of customers monthly."}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-muted/40 p-4" dir={isArabic ? "rtl" : "ltr"}>
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                {isArabic ? "نموذج العمل" : "Business Model"}
                            </h3>
                            <p className="text-sm mt-1">
                                {isArabic
                                    ? "منصة مبنية على شراكات حقيقية، أولوية لدعم البائع، تركيز على الاحتفاظ بالعملاء وتقليل المرتجعات."
                                    : "A platform built on real partnerships, prioritizing seller support, customer retention, and reducing returns."}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {sections.map((section) => {
                    const Icon = section.icon
                    const title = isArabic ? section.titleAr : section.titleEn
                    const content = isArabic ? section.contentAr : section.contentEn

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
                                    {content.map((text, idx) => (
                                        <li key={idx} className="text-muted-foreground leading-relaxed flex items-start gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="space-y-4 pt-6" dir={isArabic ? "rtl" : "ltr"}>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" />
                        {isArabic ? "هل أنت بائع تبحث عن النجاح؟" : "Are you a seller looking for success?"}
                    </h3>
                    <p className="text-muted-foreground">
                        {isArabic
                            ? "إذا كنت تمتلك منتجات ذات جودة عالية وتبحث عن منصة تقدر عملك وتربطك بعملاء حقيقيين، فإن ميرفورى هي المكان الأنسب لك."
                            : "If you have high-quality products and are looking for a platform that values your work and connects you with real customers, Mirvory is the right place for you."}
                    </p>
                    <p className="text-sm font-medium">
                        {isArabic
                            ? "تواصل معنا وانضم إلى مجتمعنا اليوم."
                            : "Contact us and join our community today."}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}