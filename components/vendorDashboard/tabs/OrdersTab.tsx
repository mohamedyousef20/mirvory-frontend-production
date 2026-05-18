import { FilterBar } from "../shared/FilterBar"
import { OrdersTable } from "../tables/OrdersTable"
import { ShoppingBag } from "lucide-react"

interface OrdersTabProps {
    language: string
    filteredOrders: any[]
    searchTerm: string
    filters: any
    sortBy: string
    preparingOrderId: string | null
    cancellingOrderId?: string | null
    onSearchChange: (val: string) => void
    onSearchSubmit: () => void
    onFilterChange: (type: string, val: string) => void
    onSortChange: (val: string) => void
    onClearFilters: () => void
    onConfirmPreparation: (id: string) => void
    onViewDetails?: (order: any) => void
    onPrintInvoice?: (order: any) => void
    onContactBuyer?: (order: any) => void
    onCancelOrder?: (id: string) => void
    onViewShipping?: (order: any) => void
}

export function OrdersTab({
    language, filteredOrders, searchTerm, filters, sortBy,
    preparingOrderId, cancellingOrderId, onSearchChange, onSearchSubmit,
    onFilterChange, onSortChange, onClearFilters, onConfirmPreparation,
    onViewDetails, onPrintInvoice, onContactBuyer, onCancelOrder, onViewShipping
}: OrdersTabProps) {
    const ar = language === "ar"
    const hasFilters = Object.keys(filters).length > 0 || !!searchTerm

    return (
        <div className="space-y-5">

            {/* ── Page heading strip ───────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-800">
                        {ar ? 'الطلبات' : 'Orders'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {ar
                            ? 'تصفح وإدارة جميع طلباتك'
                            : 'Browse and manage all your orders'}
                    </p>
                </div>

                {/* order count pill */}
                {filteredOrders.length > 0 && (
                    <span className="mr-auto text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                        {filteredOrders.length} {ar ? 'طلب' : 'orders'}
                    </span>
                )}
            </div>

            {/* ── Filter bar ───────────────────────────────────────── */}
            <FilterBar
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                searchPlaceholder={ar ? "البحث عن الطلبات..." : "Search orders..."}
                selects={[
                    {
                        value: filters.deliveryStatus || 'all',
                        onChange: (v) => onFilterChange('deliveryStatus', v),
                        placeholder: ar ? "الحالة" : "Status",
                        items: [
                            { value: 'all', label: ar ? "الكل" : "All" },
                            { value: 'pending', label: ar ? "قيد الانتظار" : "Pending" },
                            { value: 'shipped', label: ar ? "تم الشحن" : "Shipped" },
                            { value: 'delivered', label: ar ? "تم التسليم" : "Delivered" },
                            { value: 'cancelled', label: ar ? "ملغي" : "Cancelled" },
                        ]
                    },
                    {
                        value: filters.isPrepared || 'all',
                        onChange: (v) => onFilterChange('isPrepared', v),
                        placeholder: ar ? "حالة التجهيز" : "Preparation",
                        items: [
                            { value: 'all', label: ar ? "الكل" : "All" },
                            { value: 'prepared', label: ar ? "تم التجهيز" : "Prepared" },
                            { value: 'preparing', label: ar ? "قيد التجهيز" : "Preparing" },
                        ]
                    },
                    {
                        value: sortBy,
                        onChange: onSortChange,
                        placeholder: ar ? "الترتيب" : "Sort",
                        items: [
                            { value: 'recent', label: ar ? "الأحدث" : "Recent" },
                            { value: 'oldest', label: ar ? "الأقدم" : "Oldest" },
                            { value: 'total-high', label: ar ? "الأعلى سعراً" : "Highest Total" },
                            { value: 'total-low', label: ar ? "الأقل سعراً" : "Lowest Total" },
                        ]
                    },
                ]}
                onClear={onClearFilters}
                showClear={hasFilters}
                clearLabel={ar ? "مسح" : "Clear"}
            />

            {/* ── Orders table card ────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <OrdersTable
                    orders={filteredOrders}
                    language={language}
                    preparingOrderId={preparingOrderId}
                    cancellingOrderId={cancellingOrderId}
                    onConfirmPreparation={onConfirmPreparation}
                    onViewDetails={onViewDetails}
                    onPrintInvoice={onPrintInvoice}
                    onContactBuyer={onContactBuyer}
                    onCancelOrder={onCancelOrder}
                    onViewShipping={onViewShipping}
                />
            </div>
        </div>
    )
}