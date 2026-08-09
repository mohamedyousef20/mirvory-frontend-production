import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface VendorHeaderProps {
    title: string
    description: string
    addLabel: string
}

export function VendorHeader({ title, description, addLabel }: VendorHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
            <Button asChild className="h-11 rounded-xl px-5 shadow-sm font-medium">
                <Link href="/vendor/dashboard/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {addLabel}
                </Link>
            </Button>
        </div>
    )
}