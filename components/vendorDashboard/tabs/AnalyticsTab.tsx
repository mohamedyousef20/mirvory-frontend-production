import { Loader2, Star } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"



interface AnalyticsTabProps {

    language: string

    analytics: any

    analyticsLoading: boolean

    analyticsError: string | null

    onRefresh: () => void

}



export function AnalyticsTab({ language, analytics, analyticsLoading, analyticsError, onRefresh }: AnalyticsTabProps) {

    return (

        <Card className="border border-slate-200 rounded-2xl shadow-sm">

            <CardHeader className="px-5 pt-5 pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <CardTitle className="text-base font-semibold text-slate-800">

                        {language === 'ar' ? 'ملخص الأداء' : 'Performance Overview'}

                    </CardTitle>

                    <CardDescription className="text-sm text-slate-400 mt-1">

                        {language === 'ar' ? 'نقدّم لك لمحة عن الطلبات، المنتجات الأعلى، ومستوى رضا العملاء.' : 'Key insights about orders, products, and satisfaction.'}

                    </CardDescription>

                </div>

                <Button variant="outline" size="sm" onClick={onRefresh} disabled={analyticsLoading} className="h-9 rounded-xl border-slate-200 text-sm font-medium">

                    {analyticsLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}

                    {language === 'ar' ? 'تحديث البيانات' : 'Refresh'}

                </Button>

            </CardHeader>

            <CardContent className="px-5 pb-6 space-y-6">

                {analyticsLoading && (

                    <div className="flex items-center gap-2 text-slate-400 text-sm">

                        <Loader2 className="h-4 w-4 animate-spin" />

                        {language === 'ar' ? 'جاري تحميل التحليلات...' : 'Loading analytics...'}

                    </div>

                )}

                {analyticsError && (

                    <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{analyticsError}</div>

                )}

                {!analyticsLoading && !analyticsError && analytics && (

                    <>

                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">

                            {[

                                { key: 'avgPrep', title: language === 'ar' ? 'متوسط زمن التجهيز (ساعات)' : 'Avg Preparation (hours)', value: analytics.avgPreparationTime.toFixed(1) },

                                { key: 'satisfaction', title: language === 'ar' ? 'رضا العملاء' : 'Satisfaction score', value: analytics.satisfactionScore.toFixed(2) },

                                { key: 'topSellCount', title: language === 'ar' ? 'أفضل المنتجات مبيعًا' : 'Top sellers', value: analytics.topSellingProducts.length },

                                { key: 'topRatedCount', title: language === 'ar' ? 'أعلى المنتجات تقييمًا' : 'Top rated', value: analytics.highestRatedProducts.length },

                            ].map(metric => (

                                <div key={metric.key} className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                                    <p className="text-xs font-medium text-slate-400 mb-2">{metric.title}</p>

                                    <div className="text-2xl font-bold text-slate-900">{metric.value}</div>

                                </div>

                            ))}

                        </div>



                        <div className="grid gap-6 lg:grid-cols-2">

                            <div className="space-y-3">

                                <h3 className="text-sm font-semibold text-slate-700">

                                    {language === 'ar' ? 'عدد الطلبات آخر 30 يوم' : 'Orders last 30 days'}

                                </h3>

                                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">

                                    {analytics.ordersPerDay.length === 0 ? (

                                        <p className="text-sm text-slate-400">{language === 'ar' ? 'لا يوجد بيانات' : 'No data'}</p>

                                    ) : analytics.ordersPerDay.map((day: any) => (

                                        <div key={day._id} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm">

                                            <span className="text-slate-600">{day._id}</span>

                                            <span className="font-semibold text-slate-800">{day.count}</span>

                                        </div>

                                    ))}

                                </div>

                            </div>



                            <div className="grid gap-4 sm:grid-cols-2">

                                {[

                                    {

                                        title: language === 'ar' ? 'الأكثر مبيعًا' : 'Top selling products',

                                        items: analytics.topSellingProducts,

                                        renderSub: (p: any) => `${language === 'ar' ? 'مبيعات' : 'Sold'}: ${p.sold}`

                                    },

                                    {

                                        title: language === 'ar' ? 'الأعلى تقييمًا' : 'Highest rated',

                                        items: analytics.highestRatedProducts,

                                        renderSub: (p: any) => (

                                            <span className="flex items-center gap-1">

                                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />

                                                {p.ratingsAverage?.toFixed(2)}

                                            </span>

                                        )

                                    }

                                ].map(section => (

                                    <div key={section.title} className="space-y-3">

                                        <h3 className="text-sm font-semibold text-slate-700">{section.title}</h3>

                                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">

                                            {section.items.length === 0 ? (

                                                <p className="text-sm text-slate-400">{language === 'ar' ? 'لا يوجد بيانات' : 'No data'}</p>

                                            ) : section.items.map((p: any) => (

                                                <div key={p._id} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm">

                                                    <p className="font-semibold text-slate-800 truncate">{p.title}</p>

                                                    <p className="text-xs text-slate-400 mt-0.5">{section.renderSub(p)}</p>

                                                </div>

                                            ))}

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </>

                )}

            </CardContent>

        </Card>

    )

}