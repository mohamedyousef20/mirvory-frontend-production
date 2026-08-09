import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ActiveFilter {
    label: string
    onRemove: () => void
}

interface ActiveFiltersProps {
    label: string
    filters: ActiveFilter[]
}

export function ActiveFilters({ label, filters }: ActiveFiltersProps) {
    if (!filters.length) return null
    return (
        <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-slate-100 mt-3">
            <span className="text-xs text-slate-400 font-medium">{label}</span>
            {filters.map((f, i) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1 rounded-full text-xs">
                    {f.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={f.onRemove} />
                </Badge>
            ))}
        </div>
    )
}