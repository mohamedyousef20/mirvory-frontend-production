import { SafeImage } from "@/components/SafeImage"
import { DollarSign, ShoppingBag, Package, BarChart, Clock, XCircle, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "../cards/StatCard"

interface OverviewTabProps {
    language: string
    t: (key: string) => string
    dashboardCounters: any
    balance: any
    orders: any[]
    products: any[]
}

export function OverviewTab({ language, t, dashboardCounters, balance, orders, products }: OverviewTabProps) {
    // Map backend fields to UI fields
    const counterStats = [
        { key: 'totalOrders', title: language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders', value: dashboardCounters.totalOrders ?? 0, icon: <ShoppingBag className="h-5 w-5 text-[#1a4fba]" />, bg: 'bg-blue-50' },
        { key: 'pendingOrders', title: language === 'ar' ? 'طلبات قيد الانتظار' : 'Pending Orders', value: dashboardCounters.pendingOrders ?? 0, icon: <Clock className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-50' },
        { key: 'completedOrders', title: language === 'ar' ? 'طلبات مكتملة' : 'Completed Orders', value: dashboardCounters.completedOrders ?? 0, icon: <Star className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-50' },
        { key: 'activeProducts', title: language === 'ar' ? 'منتجات نشطة' : 'Active Products', value: dashboardCounters.activeProducts ?? 0, icon: <Package className="h-5 w-5 text-purple-500" />, bg: 'bg-purple-50' },
    ]
console.log(orders,'ovdo')
    // Calculate total balance from available + pending
    const availableBalance = balance?.availableBalance ?? 0;
    const pendingBalance = balance?.pendingBalance ?? 0;
    const totalRevenue = availableBalance + pendingBalance;

    const balanceStats = [
        { key: 'totalRevenue', title: language === "ar" ? "إجمالي الإيرادات" : "Total Revenue", value: totalRevenue.toFixed(2), icon: <DollarSign className="h-5 w-5 text-emerald-500" />, suffix: language === "ar" ? "ج.م" : "EGP", subtext: language === "ar" ? "إجمالي المبيعات" : "Total Sales" },
        { key: 'orders', title: language === "ar" ? "الطلبات" : "Orders", value: orders?.length ?? 0, icon: <ShoppingBag className="h-5 w-5 text-[#1a4fba]" />, subtext: dashboardCounters?.totalOrders ? `${dashboardCounters.totalOrders} ${language === 'ar' ? 'كلي' : 'total'}` : '' },
        { key: 'products', title: language === "ar" ? "المنتجات" : "Products", value: products?.length ?? 0, icon: <Package className="h-5 w-5 text-purple-500" />, subtext: dashboardCounters?.totalProducts ? `${dashboardCounters.totalProducts} ${language === 'ar' ? 'كلي' : 'total'}` : '' },
        { key: 'availableBalance', title: language === "ar" ? "الرصيد المتاح" : "Available Balance", value: availableBalance.toFixed(2), icon: <BarChart className="h-5 w-5 text-teal-500" />, suffix: language === "ar" ? "ج.م" : "EGP", subtext: language === "ar" ? "متاح للسحب" : "Available" },
        { key: 'pendingBalance', title: language === "ar" ? "الرصيد المعلق" : "Pending Balance", value: pendingBalance.toFixed(2), icon: <BarChart className="h-5 w-5 text-orange-500" />, suffix: language === "ar" ? "ج.م" : "EGP", subtext: language === "ar" ? "قيد المراجعة" : "Pending" },
    ]
  

    return (
        <div className="space-y-6">
            {/* Counter cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {counterStats.map(stat => (
                    <StatCard key={stat.key} title={stat.title} value={stat.value} icon={stat.icon} iconBg={stat.bg} />
                ))}
            </div>

            {/* Balance cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                {balanceStats.map(stat => (
                    <StatCard key={stat.key} title={stat.title} value={stat.value} icon={stat.icon} iconBg="bg-slate-50" suffix={stat.suffix} subtext={stat.subtext} />
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                {/* Recent Orders */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <div className="pb-3">
                        <h3 className="text-base font-semibold text-slate-800">
                            {language === "ar" ? "أحدث الطلبات" : "Recent Orders"}
                        </h3>
                    </div>
                    <div>
                        <div className="rounded-xl border border-slate-100 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="text-xs font-semibold text-slate-500">{language === "ar" ? "رقم الطلب" : "Order ID"}</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500">{language === "ar" ? "العناصر" : "Items"}</TableHead>
                                        <TableHead className="text-right text-xs font-semibold text-slate-500">{language === "ar" ? "الإجمالي" : "Total"}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders?.slice(0, 5).map((order) => (
                                        <TableRow key={order._id} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-medium text-slate-800 text-sm">#{order.orderNumber}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {/* Use items from backend, fallback to formattedItems if available */}
                                                    {(order.items || order.formattedItems)?.slice(0, 3).map((item: any, i: number) => (
                                                        <span key={i} className="text-sm text-slate-600">
                                                            {item.product?.title || item.productName}{i < ((order.items || order.formattedItems)?.length || 0) - 1 && ','}
                                                        </span>
                                                    ))}
                                                    {((order.items || order.formattedItems)?.length || 0) > 3 && (
                                                        <span className="text-xs text-slate-400">+{((order.items || order.formattedItems)?.length || 0) - 3} more</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-slate-800 text-sm">
                                                {order.total} <span className="text-slate-400 font-normal">{language === "ar" ? "ج.م" : "EGP"}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <div className="pb-3">
                        <h3 className="text-base font-semibold text-slate-800">
                            {language === "ar" ? "المنتجات الأكثر مبيعًا" : "Top Selling Products"}
                        </h3>
                    </div>
                    <div>
                        <div className="space-y-3">
                            {products.slice(0, 4).map((product) => (
                                <div key={product._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="relative h-11 w-11 rounded-lg overflow-hidden flex-shrink-0">
                                        <SafeImage src={product.images[0] || "/placeholder.svg"} alt={language === "ar" ? product.title : product.titleEn} width={44} height={44} className="object-cover rounded-lg" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 text-sm truncate">{language === "ar" ? product.title : product.titleEn}</p>
                                        <p className="text-xs text-slate-400">{language === "ar" ? "المخزون: " : "Stock: "}{product.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-slate-800 text-sm whitespace-nowrap">
                                        {product.price} <span className="text-slate-400 font-normal">{language === "ar" ? "ج.م" : "EGP"}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}