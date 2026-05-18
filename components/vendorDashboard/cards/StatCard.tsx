import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface StatCardProps {
    title: string
    value: string | number
    icon: ReactNode
    iconBg: string
    suffix?: string
    subtext?: string
}

export function StatCard({ title, value, icon, iconBg, suffix, subtext }: StatCardProps) {
    return (
        <Card className="border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-5">
                <div className={`inline-flex p-2 rounded-xl ${iconBg} mb-3`}>{icon}</div>
                <div className="text-2xl font-bold text-slate-900">
                    {value ?? 0}
                    {suffix && <span className="text-sm font-medium text-slate-400 ml-1">{suffix}</span>}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">{title}</p>
                {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
            </CardContent>
        </Card>
    )
}