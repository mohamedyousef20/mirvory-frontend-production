import { FilterBar } from "../shared/FilterBar"
import { ActiveFilters } from "../shared/ActiveFilters"
import { ProductsTable } from "../tables/ProductsTable"
import { EmptyState } from "../shared/EmptyState"
import { Package, ChevronLeft, ChevronRight } from "lucide-react"

interface ProductsTabProps {
    language: string
    products: any[]
    categories: any[]
    searchTerm: string
    statusFilter: string
    sortOption: string
    selectedCategories: string[]
    priceRange: number[]
    page: number
    pageSize: number
    totalProducts: number
    editingProductId: string | null
    editingProductData: any
    updatingProductId: string | null
    onSearchChange: (val: string) => void
    onStatusFilterChange: (val: string) => void
    onSortChange: (val: string) => void
    onCategoryChange: (val: string) => void
    onClearFilters: () => void
    onEdit: (product: any) => void
    onUpdate: (id: string) => void
    onDelete: (id: string) => void
    onCancelEdit: () => void
    onEditDataChange: (data: any) => void
    onPageChange: (page: number) => void
    setPriceRange: (range: number[]) => void
    setStatusFilter: (val: string) => void
    setSelectedCategories: (val: string[]) => void
    setSearchTerm: (val: string) => void
}

export function ProductsTab({
    language, products, categories, searchTerm, statusFilter, sortOption,
    selectedCategories, priceRange, page, pageSize, totalProducts,
    editingProductId, editingProductData, updatingProductId,
    onSearchChange, onStatusFilterChange, onSortChange, onCategoryChange,
    onClearFilters, onEdit, onUpdate, onDelete, onCancelEdit, onEditDataChange,
    onPageChange, setPriceRange, setStatusFilter, setSelectedCategories, setSearchTerm
}: ProductsTabProps) {
    const ar = language === "ar"
    const hasActiveFilters =
        selectedCategories.length > 0 || statusFilter !== "all" ||
        priceRange[0] > 0 || priceRange[1] < 10000 || !!searchTerm

    const activeFilterList = [
        selectedCategories.length > 0 && {
            label: `${ar ? "الفئة:" : "Category:"} ${categories.find(c => c._id === selectedCategories[0])?.name}`,
            onRemove: () => setSelectedCategories([])
        },
        statusFilter !== "all" && {
            label: `${ar ? "الحالة:" : "Status:"} ${statusFilter}`,
            onRemove: () => setStatusFilter("all")
        },
        (priceRange[0] > 0 || priceRange[1] < 10000) && {
            label: `${ar ? "السعر:" : "Price:"} ${priceRange[0]} - ${priceRange[1]}`,
            onRemove: () => setPriceRange([0, 10000])
        },
        searchTerm && {
            label: `${ar ? "بحث:" : "Search:"} ${searchTerm}`,
            onRemove: () => setSearchTerm("")
        },
    ].filter(Boolean) as { label: string; onRemove: () => void }[]
    console.log("categories =", categories);
    return (
        <div className="space-y-5">

            {/* ── Page heading strip ───────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-800">
                        {ar ? 'المنتجات' : 'Products'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {ar
                            ? 'إدارة وتعديل منتجاتك المعروضة'
                            : 'Manage and edit your listed products'}
                    </p>
                </div>

                {/* product count pill */}
                {totalProducts > 0 && (
                    <span className="mr-auto text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                        {totalProducts} {ar ? 'منتج' : 'products'}
                    </span>
                )}
            </div>

            {/* ── Filter bar ───────────────────────────────────────── */}
            <FilterBar
                searchValue={searchTerm}
                onSearchChange={onSearchChange}
                searchPlaceholder={ar ? "البحث عن المنتجات..." : "Search products..."}
                selects={[
                    {
                        value: selectedCategories.length > 0 ? selectedCategories[0] : "all",
                        onChange: onCategoryChange,
                        placeholder: ar ? "الفئة" : "Category",
                        items: [
                            { value: "all", label: ar ? "جميع الفئات" : "All Categories" },
                            ...categories.map(c => ({ value: c._id, label: c.name }))
                        ]
                    },
                    {
                        value: statusFilter,
                        onChange: onStatusFilterChange,
                        placeholder: ar ? "الحالة" : "Status",
                        items: [
                            { value: "all", label: ar ? "جميع الحالات" : "All Statuses" },
                            { value: "available", label: ar ? "نشط" : "Active" },
                            { value: "pending", label: ar ? "قيد المراجعة" : "Pending" },
                            { value: "draft", label: ar ? "مسودة" : "Draft" },
                        ]
                    },
                    {
                        value: sortOption,
                        onChange: onSortChange,
                        placeholder: ar ? "ترتيب حسب" : "Sort By",
                        items: [
                            { value: "newest", label: ar ? "الأحدث" : "Newest" },
                            { value: "priceHighToLow", label: ar ? "السعر: من الأعلى" : "Price: High to Low" },
                            { value: "priceLowToHigh", label: ar ? "السعر: من الأدنى" : "Price: Low to High" },
                            { value: "topRated", label: ar ? "الأعلى تقييماً" : "Top Rated" },
                            { value: "mostSold", label: ar ? "الأكثر مبيعاً" : "Most Sold" },
                        ]
                    },
                ]}
                onClear={onClearFilters}
                showClear={hasActiveFilters}
                clearLabel={ar ? "مسح" : "Clear"}
            />

            {/* ── Active filter badges ─────────────────────────────── */}
            {hasActiveFilters && (
                <ActiveFilters
                    label={ar ? "الفلاتر النشطة:" : "Active filters:"}
                    filters={activeFilterList}
                />
            )}

            {/* ── Products table card ──────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <ProductsTable
                    products={products}
                    language={language}
                    categories={categories}
                    editingProductId={editingProductId}
                    editingProductData={editingProductData}
                    updatingProductId={updatingProductId}
                    onEdit={onEdit}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onCancelEdit={onCancelEdit}
                    onEditDataChange={onEditDataChange}
                />
            </div>

            {/* ── Pagination + count row ───────────────────────────── */}
            {products.length > 0 && (
                <div className="flex items-center justify-between pt-1">
                    <p className="text-sm text-slate-400">
                        {ar
                            ? `عرض ${products.length} من ${totalProducts} منتج`
                            : `Showing ${products.length} of ${totalProducts} products`}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            aria-label={ar ? "السابق" : "Previous"}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="text-sm text-slate-600 font-medium px-2">
                            {ar ? `${page}` : `${page}`}
                        </span>

                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={products.length < pageSize}
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            aria-label={ar ? "التالي" : "Next"}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Empty state ──────────────────────────────────────── */}
            {products.length === 0 && (
                <EmptyState
                    title={ar ? "لا توجد منتجات" : "No products found"}
                    description={ar
                        ? "لم تقم بإضافة أي منتجات بعد أو لا توجد منتجات تطابق الفلاتر المحددة."
                        : "You haven't added any products yet or no products match the selected filters."}
                    actionLabel={ar ? "إضافة منتج جديد" : "Add New Product"}
                    actionHref="/vendor/dashboard/products/new"
                />
            )}
        </div>
    )
}