import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Tab {
    value: string
    label: string
}

interface VendorTabBarProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (val: string) => void
}

export function VendorTabBar({ tabs, activeTab, onTabChange }: VendorTabBarProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto mb-6">
            <TabsList className="flex gap-1 bg-transparent w-max min-w-full">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="h-9 px-4 rounded-xl text-sm font-medium whitespace-nowrap
              data-[state=active]:bg-slate-900 data-[state=active]:text-white
              data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-800
              transition-all"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>
    )
}