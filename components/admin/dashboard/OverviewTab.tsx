import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingBag, Users, TrendingUp, TrendingDown } from "lucide-react";
import Image from "next/image";

interface DashboardCounters {
    newOrders: number;
    ongoingOrders: number;
    returns: number;
    reviews: number;
    totalUsers: number;
    totalSellers: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    pendingProducts: number;
    totalRevenue: number;
    totalDiscounts: number;
    totalCommissions: number;
    totalProfits: number;
}

interface OverviewTabProps {
    orders: any[];
    products: any[];
    sellers: any[];
    users: any[];
    platformEarnings?: {
        totalAmount: number;
        totalCommission: number;
        totalDiscounts: number;
        totalRecords: number;
        monthly: Array<{ year: number; month: number; totalAmount: number }>;
    } | null;
    isArabic: boolean;
    loadingEarnings?: boolean;
    errorEarnings?: string | null;
    dashboardCounters?: DashboardCounters;
    fetchPlatformEarnings?: () => Promise<any>;
    fetchDashboardCounters?: () => Promise<any>;
}

export function OverviewTab({
    orders,
    products,
    sellers,
    users,
    platformEarnings,
    isArabic,
    loadingEarnings = false,
    errorEarnings,
    dashboardCounters,
    fetchPlatformEarnings,
    fetchDashboardCounters
}: OverviewTabProps) {

    const safeProducts = Array.isArray(products) ? products : [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeSellers = Array.isArray(sellers) ? sellers : [];
    const safeUsers = Array.isArray(users) ? users : [];

    const earningsSummary = platformEarnings || {
        totalAmount: 0,
        totalCommission: 0,
        totalDiscounts: 0,
        totalRecords: 0,
        monthly: []
    };

    // Calculate statistics
    const totalRevenue = earningsSummary.totalAmount;
    const totalOrders = safeOrders.length;
    const totalProductsCount = safeProducts.length;
    const totalSellersCount = safeSellers.length;
    const totalUsersCount = safeUsers.length;

    // Calculate monthly growth based on the last two months available
    let monthlyGrowth = 0;
    if (earningsSummary.monthly && earningsSummary.monthly.length >= 2) {
        // Ensure the data is sorted by year & month
        const sorted = [...earningsSummary.monthly].sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
        const last = sorted[sorted.length - 1].totalAmount;
        const prev = sorted[sorted.length - 2].totalAmount;
        if (prev !== 0) {
            monthlyGrowth = ((last - prev) / prev) * 100;
        }
    }

    const counters = dashboardCounters || {
        newOrders: 0,
        ongoingOrders: 0,
        returns: 0,
        reviews: 0,
        totalUsers: 0,
        totalSellers: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        pendingProducts: 0,
        totalRevenue: 0,
        totalDiscounts: 0,
        totalCommissions: 0,
        totalProfits: 0
    };

    // Use dashboardCounters data if available, otherwise fall back to platformEarnings
    const displayRevenue = counters.totalRevenue || earningsSummary.totalAmount;
    const displayDiscounts = counters.totalDiscounts || earningsSummary.totalDiscounts;
    const displayCommission = counters.totalCommissions || earningsSummary.totalCommission;
    const displayProfits = counters.totalProfits || earningsSummary.totalCommission;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        key: 'new',
                        title: isArabic ? "طلبات جديدة (24 ساعة)" : "New Orders (24h)",
                        value: counters.newOrders,
                        icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    },
                    {
                        key: 'ongoing',
                        title: isArabic ? "طلبات قيد التنفيذ" : "Ongoing Orders",
                        value: counters.ongoingOrders,
                        icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    },
                    {
                        key: 'returns',
                        title: isArabic ? "طلبات الإرجاع" : "Return Requests",
                        value: counters.returns,
                        icon: <Package className="h-4 w-4 text-muted-foreground" />
                    },
                    {
                        key: 'reviews',
                        title: isArabic ? "التقييمات" : "Reviews",
                        value: counters.reviews,
                        icon: <Users className="h-4 w-4 text-muted-foreground" />
                    }
                ].map((card) => (
                    <Card key={card.key} className="border border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                            <CardTitle className="text-xs md:text-sm font-medium">{card.title}</CardTitle>
                            {card.icon}
                        </CardHeader>
                        <CardContent className="p-3 md:p-6 pt-0">
                            <div className="text-2xl md:text-3xl font-semibold">{card.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {isArabic ? "محدثة لحظيًا" : "Live data"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">
                            {isArabic ? "إجمالي الأرباح" : "Total Earnings"}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">
                            {loadingEarnings ? (
                                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                `${displayRevenue.toFixed(2)} ${isArabic ? "ج.م" : "EGP"}`
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            {monthlyGrowth >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            {!loadingEarnings && `${Math.abs(monthlyGrowth).toFixed(1)}% ${isArabic ? "من الشهر الماضي" : "from last month"}`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">
                            {isArabic ? "إجمالي الخصومات" : "Total Discounts"}
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">
                            {loadingEarnings ? (
                                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                `${displayDiscounts.toFixed(2)} ${isArabic ? "ج.م" : "EGP"}`
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isArabic ? "بعد التطبيقات" : "after coupons"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">
                            {isArabic ? "إجمالي العمولات" : "Total Commission"}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">
                            {loadingEarnings ? (
                                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                `${displayCommission.toFixed(2)} ${isArabic ? "ج.م" : "EGP"}`
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isArabic ? "من جميع المبيعات" : "from all sales"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">
                            {isArabic ? "إجمالي الأرباح" : "Total Profits"}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">
                            {loadingEarnings ? (
                                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                `${displayProfits.toFixed(2)} ${isArabic ? "ج.م" : "EGP"}`
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isArabic ? "أرباح المنصة" : "platform earnings"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">
                            {isArabic ? "الطلبات" : "Orders"}
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">{counters.totalOrders || totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            {isArabic ? "إجمالي الطلبات" : "total orders"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">
                            {isArabic ? "المنتجات" : "Products"}
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">{counters.totalProducts || totalProductsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {isArabic ? "إجمالي المنتجات" : "total products"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">
                            {isArabic ? "البائعين" : "Sellers"}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">{counters.totalSellers || totalSellersCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {isArabic ? "إجمالي البائعين" : "total sellers"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">
                            {isArabic ? "المستخدمين" : "Users"}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">{counters.totalUsers || totalUsersCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {isArabic ? "إجمالي المستخدمين" : "total users"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-base md:text-lg">{isArabic ? "أحدث الطلبات" : "Recent Orders"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs md:text-sm">{isArabic ? "رقم الطلب" : "Order ID"}</TableHead>
                                        <TableHead className="text-xs md:text-sm">{isArabic ? "التاريخ" : "Date"}</TableHead>
                                        <TableHead className="text-xs md:text-sm">{isArabic ? "العميل" : "Customer"}</TableHead>
                                        <TableHead className="text-xs md:text-sm">{isArabic ? "البائع" : "Vendor"}</TableHead>
                                        <TableHead className="text-xs md:text-sm">{isArabic ? "الحالة" : "Status"}</TableHead>
                                        <TableHead className="text-xs md:text-sm">{isArabic ? "الإجمالي" : "Total"}</TableHead>
                                        <TableHead className="text-xs md:text-sm">{isArabic ? "العناصر" : "Items"}</TableHead>
                                        <TableHead className="text-xs md:text-sm">{isArabic ? "طريقة الدفع" : "Payment"}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.isArray(orders) && orders.map((order: any) => (
                                        <TableRow key={order._id}>
                                            <TableCell className="font-medium text-xs md:text-sm">#{order._id?.substring(0, 6) || 'N/A'}</TableCell>
                                            <TableCell className="text-xs md:text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell className="text-xs md:text-sm">{order.buyer?.fullName || "N/A"}</TableCell>
                                            <TableCell className="text-xs md:text-sm">{order.seller?.fullName}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    order.deliveryStatus === "processing" ? "secondary"
                                                        : order.deliveryStatus === "shipped" ? "default"
                                                            : order.deliveryStatus === "delivered" ? "default"
                                                                : "destructive"
                                                }>
                                                    {isArabic
                                                        ? order.deliveryStatus === "delivered" ? "تم التسليم"
                                                            : order.deliveryStatus === "shipped" ? "تم الشحن"
                                                                : order.deliveryStatus === "cancelled" ? "ملغي"
                                                                    : "قيد المعالجة"
                                                        : order.deliveryStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={isArabic ? "text-right" : "text-left"}>
                                                {order.total || 0} {isArabic ? "ج.م" : "EGP"}
                                            </TableCell>
                                            <TableCell>{order.items?.length || 0}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    order.paymentStatus === "paid" ? "default"
                                                        : order.paymentStatus === "failed" ? "destructive"
                                                            : "secondary"
                                                }>
                                                    {isArabic
                                                        ? order.paymentStatus === "paid" ? "مدفوع"
                                                            : order.paymentStatus === "failed" ? "فشل"
                                                                : "قيد الانتظار"
                                                        : order.paymentStatus}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader className="p-3 md:p-6">
                        <CardTitle className="text-base md:text-lg">{isArabic ? "أحدث المنتجات" : "Recent Products"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                        {safeProducts.length > 0 ? (
                            safeProducts.slice(0, 5).map((product: any) => (
                                <div key={product._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div className="flex items-center">
                                        {product.images && product.images.length > 0 ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={isArabic ? product.title : product.nameEn}
                                                width={40}
                                                height={40}
                                                className="rounded-md object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                <Package className="h-5 w-5 text-gray-500" />
                                            </div>
                                        )}
                                        <div className="ml-3">
                                            <p className="text-xs md:text-sm font-medium line-clamp-1">{isArabic ? product.title : product.nameEn}</p>
                                            <p className="text-xs text-muted-foreground">{product.price || 0} {isArabic ? "ج.م" : "EGP"}</p>
                                        </div>
                                    </div>
                                    <Badge variant={product.isApproved ? "default" : "secondary"}>
                                        {product.isApproved ? (isArabic ? "مقبول" : "Approved") : (isArabic ? "قيد المراجعة" : "Pending")}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">
                                {isArabic ? "لا توجد منتجات" : "No products available"}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}