import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReturnsTable } from "../tables/ReturnsTable"
import { RotateCcw } from "lucide-react"

interface ReturnsTabProps {
    language: string
    returnTab: string
    onReturnTabChange: (val: string) => void
    returnTabMeta: any[]
    currentReturnList: any[]
    getReturnStatusLabel: (status: string) => string
}

export function ReturnsTab({
    language, returnTab, onReturnTabChange,
    returnTabMeta, currentReturnList, getReturnStatusLabel
}: ReturnsTabProps) {
    const ar = language === 'ar'

    return (
        <div className="space-y-5">

            {/* ── Page heading strip ───────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <RotateCcw className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-800">
                        {ar ? 'طلبات الإرجاع' : 'Return Requests'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {ar
                            ? 'تابع طلبات الإرجاع القادمة من العملاء وكيفية معالجتها'
                            : 'Track return requests coming from your customers and their progress'}
                    </p>
                </div>
            </div>

            {/* ── Tab switcher ─────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                {/* sub-tabs */}
                <div className="px-4 pt-4 pb-0 overflow-x-auto">
                    <Tabs value={returnTab} onValueChange={onReturnTabChange} className="space-y-0">
                        <div className="bg-slate-100 border border-slate-200 rounded-xl p-1 inline-flex gap-1 w-max min-w-full">
                            <TabsList className="flex gap-1 bg-transparent w-max min-w-full">
                                {Array.isArray(returnTabMeta) ? returnTabMeta.map((tab) => (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="
                                            flex-1 min-w-[180px] h-auto py-2.5 px-4 rounded-xl
                                            data-[state=active]:bg-white data-[state=active]:shadow-sm
                                            data-[state=inactive]:text-slate-500
                                            transition-all
                                        "
                                    >
                                        <div className="flex flex-col items-start gap-0.5 w-full">
                                            <span className="font-semibold text-sm flex items-center gap-2 whitespace-nowrap">
                                                {tab.title}
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-full text-xs px-2 py-0.5 bg-slate-100 text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                                                >
                                                    {tab.count}
                                                </Badge>
                                            </span>
                                            <span className="text-xs text-slate-400 font-normal text-left whitespace-nowrap">
                                                {tab.description}
                                            </span>
                                        </div>
                                    </TabsTrigger>
                                )) : null}
                            </TabsList>
                        </div>

                        {/* Table content */}
                        <TabsContent value={returnTab} className="mt-0 px-4 pb-4 pt-4">
                            <ReturnsTable
                                data={currentReturnList}
                                language={language}
                                getReturnStatusLabel={getReturnStatusLabel}
                                emptyTitle={ar ? 'لا توجد طلبات في هذا القسم' : 'No requests in this section'}
                                emptyDescription={ar ? 'سيتم تحويل الطلبات إلى هنا بعد موافقة الإدارة' : 'Requests will appear here once they reach this stage'}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}