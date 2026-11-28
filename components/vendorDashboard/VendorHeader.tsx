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
        <div className="cp-page-header">
            <div><p className="cp-eyebrow">MIRVORY / SELLER</p>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                <p className="cp-header-description">{description}</p>
            </div>
            <Button asChild className="h-12 rounded-xl px-5 shadow-sm font-medium bg-[#16332c] hover:bg-[#244b40]">
                <Link href="/vendor/dashboard/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {addLabel}
                </Link>
            </Button>
        </div>
    )
}