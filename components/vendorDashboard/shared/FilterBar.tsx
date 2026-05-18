import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SelectConfig {
    value: string
    onChange: (val: string) => void
    placeholder: string
    items: { value: string; label: string }[]
}

interface FilterBarProps {
    searchValue: string
    onSearchChange: (val: string) => void
    onSearchSubmit?: () => void
    searchPlaceholder: string
    selects: SelectConfig[]
    onClear: () => void
    showClear: boolean
    clearLabel: string
}

export function FilterBar({
    searchValue, onSearchChange, onSearchSubmit,
    searchPlaceholder, selects, onClear, showClear, clearLabel
}: FilterBarProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        className="h-10 pl-9 rounded-xl border-slate-200 text-sm"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit?.()}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {selects.map((sel, i) => (
                        <Select key={i} value={sel.value} onValueChange={sel.onChange}>
                            <SelectTrigger className="h-10 w-[160px] rounded-xl border-slate-200 text-sm">
                                <SelectValue placeholder={sel.placeholder} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {sel.items.map(item => (
                                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}
                    {showClear && (
                        <Button
                            variant="outline"
                            onClick={onClear}
                            className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <X className="h-4 w-4 mr-1.5" />
                            {clearLabel}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}