import { Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-white">
            <Package className="h-12 w-12 text-slate-200 mb-4" />
            <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
            <p className="text-sm text-slate-400 mb-5 max-w-xs">{description}</p>
            {actionLabel && actionHref && (
                <Button asChild className="h-10 rounded-xl px-5 text-sm font-medium">
                    <Link href={actionHref}>
                        <Plus className="h-4 w-4 mr-2" />
                        {actionLabel}
                    </Link>
                </Button>
            )}
        </div>
    )
}