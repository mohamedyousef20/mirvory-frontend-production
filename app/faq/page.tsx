"use client"

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { HelpCircle, ShoppingBag, Store, CreditCard, ShieldCheck } from "lucide-react"

const faqCategories = [
    {
        id: "general",
        titleAr: "أسئلة عامة",
        titleEn: "General Questions",
        icon: HelpCircle,
        faqs: [
            {
                qAr: "ما هي منصة ميرفورى (Mirvory)؟",
                qEn: "What is Mirvory?",
                aAr: "هي منصة تجارة إلكترونية تركز على الجودة وتقليل المرتجعات، حيث نربط بين البائعين المحترفين والمشترين الباحثين عن منتجات مطابقة تماماً للوصف.",
                aEn: "It is an e-commerce platform focused on quality and minimizing returns, connecting professional sellers with buyers looking for items that strictly match their descriptions."
            },
            {
                qAr: "كيف يمكنني التواصل مع الدعم الفني؟",
                qEn: "How can I contact technical support?",
                aAr: "يمكنك التواصل معنا عبر البريد الإلكتروني support.mirvory@gmail.com أو من خلال نموذج 'اتصل بنا' المتاح في الموقع.",
                aEn: "You can reach us via email at support.mirvory@gmail.com or through the 'Contact Us' form available on the website."
            }
        ]
    },
    {
        id: "buyers",
        titleAr: "الأسئلة الخاصة بالمشترين",
        titleEn: "Questions for Buyers",
        icon: ShoppingBag,
        faqs: [
            {
                qAr: "كيف أضمن جودة المنتج قبل الشراء؟",
                qEn: "How do I ensure product quality before buying?",
                aAr: "نحن نلزم البائعين بمعايير صارمة لوصف المنتجات بدقة، ونراقب التقييمات ومعدلات الإرجاع باستمرار لضمان بقاء المنتجات الموثوقة فقط على المنصة.",
                aEn: "We strictly enforce accurate product descriptions for sellers and continuously monitor ratings and return rates to ensure only reliable products remain on the platform."
            },
            {
                qAr: "ما هي سياسة الاسترجاع الخاصة بكم؟",
                qEn: "What is your return policy?",
                aAr: "يمكنك طلب إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام إذا كان معيباً، أو غير مطابق للوصف والصور المعروضة، بشرط أن يكون في حالته الأصلية.",
                aEn: "You can request a return within 14 days of receipt if the product is defective or does not match the description and photos, provided it is in its original condition."
            },
            {
                qAr: "كم يستغرق شحن الطلب؟",
                qEn: "How long does shipping take?",
                aAr: "تختلف مدة الشحن حسب موقعك وموقع التاجر، وعادةً ما تستغرق بين 2 إلى 5 أيام عمل داخل المحافظات الرئيسية.",
                aEn: "Shipping times vary based on your location and the seller's location, typically taking 2 to 5 business days within major governorates."
            }
        ]
    },
    {
        id: "payments",
        titleAr: "الدفع والمعاملات المالية",
        titleEn: "Payments & Transactions",
        icon: CreditCard,
        faqs: [
            {
                qAr: "ما هي طرق الدفع المتاحة؟",
                qEn: "What payment methods are available?",
                aAr: "نوفر خيارات دفع متعددة تشمل البطاقات الائتمانية (فيزا، ماستركارد)، المحافظ الإلكترونية، وخيار الدفع عند الاستلام (COD).",
                aEn: "We offer multiple payment options including credit cards (Visa, Mastercard), e-wallets, and Cash on Delivery (COD)."
            },
            {
                qAr: "هل بيانات بطاقتي البنكية آمنة؟",
                qEn: "Are my credit card details secure?",
                aAr: "نعم، جميع معاملات الدفع مشفرة وتتم عبر بوابات دفع عالمية معتمدة، ولا نقوم بتخزين بيانات بطاقتك على خوادمنا نهائياً.",
                aEn: "Yes, all payment transactions are encrypted and processed through certified global payment gateways. We never store your card details on our servers."
            }
        ]
    },
    {
        id: "sellers",
        titleAr: "الأسئلة الخاصة للبائعين",
        titleEn: "Questions for Sellers",
        icon: Store,
        faqs: [
            // {
            //     qAr: "كيف يمكنني فتح متجر على ميرفورى؟",
            //     qEn: "How can I open a store on Mirvory?",
            //     aAr: "حالياً، الانضمام متاح لتجار الدفعة الأولى عبر دعوات حصرية أو من خلال تسجيل بياناتك في قائمة الانتظار ليتم مراجعة طلبك من قبل فريقنا.",
            //     aEn: "Currently, joining is available for the first batch of sellers via exclusive invitations or by joining the waitlist for our team to review your application."
            // },
            {
                qAr: "متى يتم تحويل أرباح المبيعات لحسابي؟",
                qEn: "When are sales profits transferred to my account?",
                aAr: "يتم تحويل الأرباح بشكل دوري (أسبوعياً أو نصف شهرياً) بعد انتهاء فترة الاسترجاع القانونية للطلبات المسلمة بنجاح.",
                aEn: "Profits are transferred periodically (weekly or bi-weekly) after the legal return period for successfully delivered orders has expired."
            },
            {
                qAr: "كيف تساعدني المنصة في تقليل المرتجعات؟",
                qEn: "How does the platform help me reduce returns?",
                aAr: "نوفر لك أدوات تحليلية دقيقة، وننصحك بكتابة وصف مفصل وإضافة صور واقعية. المنصة تمنح البائعين ذوي المرتجعات الأقل ظهوراً أعلى للمشترين.",
                aEn: "We provide precise analytical tools and advise you to write detailed descriptions and add realistic photos. Sellers with lower return rates receive higher visibility to buyers."
            }
        ]
    }
]

export default function FAQPage() {
    const { language } = useLanguage()
    const isArabic = language === "ar"

    return (
        <div className="space-y-8 pb-10">
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 text-sm">
                    {isArabic ? "مركز المساعدة" : "Help Center"}
                </Badge>
                <div className="space-y-3">
                    <h1 className={cn("text-3xl font-bold tracking-tight", isArabic && "font-[Cairo]")}
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto" dir={isArabic ? "rtl" : "ltr"}>
                        {isArabic
                            ? "إليك الإجابات على أكثر الأسئلة شيوعاً حول الشراء، البيع، وطرق الدفع في منصة ميرفورى."
                            : "Here are the answers to the most common questions about buying, selling, and payments on Mirvory."}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {faqCategories.map((category) => {
                    const Icon = category.icon
                    const categoryTitle = isArabic ? category.titleAr : category.titleEn

                    return (
                        <Card key={category.id} id={category.id} className="scroll-mt-20">
                            <CardHeader className="flex flex-row items-center gap-3 border-b bg-muted/20 pb-4" dir={isArabic ? "rtl" : "ltr"}>
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-xl">{categoryTitle}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
                                    {category.faqs.map((faq, idx) => {
                                        const question = isArabic ? faq.qAr : faq.qEn
                                        const answer = isArabic ? faq.aAr : faq.aEn

                                        return (
                                            <div key={idx} className="space-y-2">
                                                <h4 className="font-semibold text-base flex items-start gap-2">
                                                    <span className="text-primary mt-1 text-sm">●</span>
                                                    <span>{question}</span>
                                                </h4>
                                                <p className={cn(
                                                    "text-muted-foreground leading-relaxed text-sm",
                                                    isArabic ? "pr-5" : "pl-5"
                                                )}>
                                                    {answer}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="space-y-4 pt-6 text-center" dir={isArabic ? "rtl" : "ltr"}>
                    <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="text-lg font-semibold">
                        {isArabic ? "لم تجد إجابة لسؤالك؟" : "Didn't find an answer to your question?"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        {isArabic
                            ? "فريق الدعم الفني الخاص بنا متواجد دائماً لمساعدتك. لا تتردد في التواصل معنا في أي وقت."
                            : "Our technical support team is always here to help. Feel free to contact us at any time."}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}