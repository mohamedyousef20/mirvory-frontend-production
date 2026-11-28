import { ControlPanelNav } from "@/components/dashboard/ControlPanelNav"
export function VendorTabBar({ tabs, activeTab, onTabChange, ar = true }: {
  tabs: { value: string; label: string }[]; activeTab: string; onTabChange: (value: string) => void; ar?: boolean
}) {
  return <ControlPanelNav items={tabs} active={activeTab} onChange={onTabChange} ar={ar} />
}
