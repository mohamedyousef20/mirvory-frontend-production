import { SafeImage } from "@/components/SafeImage"
import { useRouter } from "next/navigation"
import {
    CheckCircle,
    Clock,
    MoreHorizontal,
    Eye,
    Loader2,
    Printer,
    MapPin,
    Package,
    Calendar,
    ShoppingBag
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface OrdersTableProps {
    orders: any[]
    language: string
    preparingOrderId: string | null
    onConfirmPreparation: (orderId: string, itemId: string) => void
    onViewDetails?: (order: any) => void
    onPrintInvoice?: (order: any) => void
    onContactBuyer?: (order: any) => void
    onCancelOrder?: (id: string) => void
    onViewShipping?: (order: any) => void
    cancellingOrderId?: string | null
}

export function OrdersTable({
    orders,
    language,
    preparingOrderId,
    onConfirmPreparation,
    onViewDetails,
    onPrintInvoice,
    onContactBuyer,
    onCancelOrder,
    onViewShipping,
    cancellingOrderId
}: OrdersTableProps) {
    const router = useRouter()
    const headers = [
        language === "ar" ? "رقم الطلب" : "Order ID",
        language === "ar" ? "التاريخ" : "Date",
        language === "ar" ? "المنتجات" : "Products",
        language === "ar" ? "عنوان الشحن" : "Shipping Address",
        language === "ar" ? "حالة التوصيل" : "Delivery Status",
        language === "ar" ? "إجراءات" : "Actions",
    ]
    console.log(orders, 'orde2526')
    const getDeliveryBadge = (status: string) => {
        switch (status) {
            case "delivered":
                return {
                    label: language === "ar" ? "تم التسليم" : "Delivered",
                    className: "bg-emerald-50 text-emerald-700 border-emerald-200"
                }
            case "shipped":
                return {
                    label: language === "ar" ? "تم الشحن" : "Shipped",
                    className: "bg-blue-50 text-blue-700 border-blue-200"
                }
            case "cancelled":
                return {
                    label: language === "ar" ? "ملغي" : "Cancelled",
                    className: "bg-rose-50 text-rose-700 border-rose-200"
                }
            default:
                return {
                    label: language === "ar" ? "قيد الانتظار" : "Pending",
                    className: "bg-amber-50 text-amber-700 border-amber-200"
                }
        }
    }

    return (
        <div className="w-full space-y-4">
            {/* Desktop View Table - Hidden on Mobile Screens */}
            <div className="hidden md:block bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            {headers.map((header) => (
                                <TableHead
                                    key={header}
                                    className="text-xs font-semibold text-slate-500 whitespace-nowrap"
                                >
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {orders.length > 0 ? (
                            orders.map((order) => {
                                const deliveryBadge = getDeliveryBadge(order.deliveryStatus)

                                return (
                                    <TableRow key={order._id} className="hover:bg-slate-50 transition-colors">
                                        {/* Order ID */}
                                        <TableCell className="font-medium text-slate-800 text-sm">
                                            #{order.orderNumber}
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString(
                                                language === "ar" ? "ar-EG" : "en-US"
                                            )}
                                        </TableCell>

                                        {/* Items */}
                                        <TableCell>
                                            <div className="space-y-3 min-w-[320px]">
                                                {order.items?.map((item: any) => {
                                                    const product = item.product
                                                    const unitPrice = item.discountedPrice != null ? item.discountedPrice : item.price;
                                                    const itemTotal = unitPrice * (item.quantity || 1); const isItemPrepared = item.isPrepared

                                                    return (
                                                        <div key={item._id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100">
                                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                                                                <SafeImage
                                                                    src={product?.images?.[0] || "/placeholder.png"}
                                                                    alt={product?.title || "Product"}
                                                                    width={48}
                                                                    height={48}
                                                                    className="object-cover rounded-lg"
                                                                />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-slate-800 truncate">
                                                                    {language === "ar"
                                                                        ? product?.title
                                                                        : product?.titleEn || product?.title}
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {item.quantity} × {item.price}{" "}
                                                                    {language === "ar" ? "ج.م" : "EGP"}
                                                                </p>

                                                                {(item.color || item.size) && (
                                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                                        {item.color && (
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                                                                {item.color}
                                                                            </span>
                                                                        )}
                                                                        {item.color && item.size && (
                                                                            <span className="mx-1 text-slate-300">|</span>
                                                                        )}
                                                                        {item.size && (
                                                                            <span className="font-medium">{item.size}</span>
                                                                        )}
                                                                    </p>
                                                                )}

                                                                <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                                                                    {language === "ar" ? "الإجمالي:" : "Total:"} {itemTotal} {language === "ar" ? "ج.م" : "EGP"}
                                                                </p>
                                                            </div>

                                                            <div className="flex-shrink-0">
                                                                {isItemPrepared ? (
                                                                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs flex items-center gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        {language === "ar" ? "تم التجهيز" : "Prepared"}
                                                                    </Badge>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8 text-xs px-5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                                                                        onClick={() => onConfirmPreparation(order._id, item._id)}
                                                                        disabled={preparingOrderId === `${order._id}-${item._id}`}
                                                                    >
                                                                        {preparingOrderId === `${order._id}-${item._id}` ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                                        ) : (
                                                                            <Clock className="h-3 w-3 mr-1" />
                                                                        )}
                                                                        {language === "ar" ? "تجهيز" : "Prepare"}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                                {order.items?.length > 0 && (
                                                    <div className="pt-2 mt-2 border-t border-slate-100">
                                                        <p className="text-sm font-bold text-slate-800">
                                                            {language === "ar" ? "إجمالي الطلب:" : "Order Total:"}{" "}
                                                            <span className="text-emerald-600">
                                                                {order.items.reduce((acc: number, item: any) => {
                                                                    const price = item.discountedPrice ?? item.price ?? 0;
                                                                    return acc + price * (item.quantity ?? 1);
                                                                }, 0)}                                                                {language === "ar" ? "ج.م" : "EGP"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Shipping Address */}
                                        <TableCell>
                                            <div className="text-sm text-slate-600 max-w-[200px]">
                                                {order.deliveryInfo?.address ? (
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-slate-800">{order.deliveryInfo.fullName}</p>
                                                        <p className="text-xs">{order.deliveryInfo.phoneNumber}</p>
                                                        <p className="text-xs text-slate-500 truncate" title={order.deliveryInfo.address}>
                                                            {order.deliveryInfo.address}
                                                        </p>
                                                    </div>
                                                ) : order.deliveryMethod === 'pickup' && order.deliveryInfo?.pickupPoint ? (
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-slate-800">{order.deliveryInfo.pickupPoint.stationName}</p>
                                                        <p className="text-xs text-slate-500">{order.deliveryInfo.pickupPoint.address}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">{language === "ar" ? " الطلب من الادارة " : "N/A"}</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-full text-xs ${deliveryBadge.className}`}>
                                                {deliveryBadge.label}
                                            </Badge>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuLabel>
                                                        {language === "ar" ? "إجراءات" : "Actions"}
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => router.push(`/vendor/orders/${order._id}`)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        {language === "ar" ? "التفاصيل" : "Details"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onPrintInvoice?.(order)}>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        {language === "ar" ? "طباعة" : "Print"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                    {language === "ar" ? "لا توجد طلبات" : "No orders found"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View Card Layout - Visible only on Mobile Screens */}
            <div className="block md:hidden space-y-4">
                {orders.length > 0 ? (
                    orders.map((order) => {
                        const deliveryBadge = getDeliveryBadge(order.deliveryStatus)

                        return (
                            <div key={order._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                {/* Header Info */}
                                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {new Date(order.createdAt).toLocaleDateString(
                                                    language === "ar" ? "ar-EG" : "en-US"
                                                )}
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-800 text-base block">
                                            #{order.orderNumber}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`rounded-full text-xs ${deliveryBadge.className}`}>
                                            {deliveryBadge.label}
                                        </Badge>

                                        {/* Actions Menu for Mobile */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuLabel>
                                                    {language === "ar" ? "إجراءات" : "Actions"}
                                                </DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/vendor/orders/${order._id}`)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {language === "ar" ? "التفاصيل" : "Details"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onPrintInvoice?.(order)}>
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    {language === "ar" ? "طباعة" : "Print"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Products/Items inside the Order */}
                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                        <ShoppingBag className="h-3.5 w-3.5" />
                                        <span>{language === "ar" ? "المنتجات:" : "Products:"}</span>
                                    </div>

                                    {order.items?.map((item: any) => {
                                        const product = item.product
                                        const itemTotal = item.price * item.quantity
                                        const isItemPrepared = item.isPrepared

                                        return (
                                            <div key={item._id} className="flex gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                                                <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-white">
                                                    <SafeImage
                                                        src={product?.images?.[0] || "/placeholder.png"}
                                                        alt={product?.title || "Product"}
                                                        width={56}
                                                        height={56}
                                                        className="object-cover rounded-lg"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1 space-y-0.5">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                                        {language === "ar"
                                                            ? product?.title
                                                            : product?.titleEn || product?.title}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {item.quantity} × {item.price}{" "}
                                                        {language === "ar" ? "ج.م" : "EGP"}
                                                    </p>

                                                    {(item.color || item.size) && (
                                                        <div className="text-[11px] text-slate-400">
                                                            {item.color && (
                                                                <span className="inline-flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                                    {item.color}
                                                                </span>
                                                            )}
                                                            {item.color && item.size && <span className="mx-1">|</span>}
                                                            {item.size && <span className="font-medium">{item.size}</span>}
                                                        </div>
                                                    )}

                                                    <p className="text-xs font-bold text-emerald-600">
                                                        {language === "ar" ? "الإجمالي:" : "Total:"} {itemTotal} {language === "ar" ? "ج.م" : "EGP"}
                                                    </p>
                                                </div>

                                                {/* Preparation Button Side */}
                                                <div className="flex-shrink-0 flex items-center">
                                                    {isItemPrepared ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] py-0.5 px-2 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            {language === "ar" ? "تم" : "Ready"}
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs px-5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                                                            onClick={() => onConfirmPreparation(order._id, item._id)}
                                                            disabled={preparingOrderId === `${order._id}-${item._id}`}
                                                        >
                                                            {preparingOrderId === `${order._id}-${item._id}` ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Clock className="h-3 w-3 mr-1" />
                                                            )}
                                                            {language === "ar" ? "تجهيز" : "Prepare"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Order Address Information */}
                                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                                    <div className="font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{language === "ar" ? "وجهة الشحن:" : "Shipping Destination:"}</span>
                                    </div>
                                    {order.deliveryInfo?.address ? (
                                        <>
                                            <p className="font-semibold text-slate-800">{order.deliveryInfo.fullName}</p>
                                            <p className="text-slate-500">{order.deliveryInfo.phoneNumber}</p>
                                            <p className="text-slate-500 leading-relaxed break-words">{order.deliveryInfo.address}</p>
                                        </>
                                    ) : order.deliveryMethod === 'pickup' && order.deliveryInfo?.pickupPoint ? (
                                        <>
                                            <p className="font-semibold text-slate-800">{order.deliveryInfo.pickupPoint.stationName}</p>
                                            <p className="text-slate-500 leading-relaxed break-words">{order.deliveryInfo.pickupPoint.address}</p>
                                        </>
                                    ) : (
                                        <span className="text-slate-400 italic">{language === "ar" ? "غير متوفر" : "N/A"}</span>
                                    )}
                                </div>

                                {/* Order Total Summary block inside Card */}
                                {order.items?.length > 0 && (
                                    <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                                        <span className="text-sm font-medium text-slate-500">
                                            {language === "ar" ? "إجمالي الطلب:" : "Order Total:"}
                                        </span>
                                        <span className="text-base font-bold text-emerald-600">
                                            {order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)}{" "}
                                            {language === "ar" ? "ج.م" : "EGP"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-2">
                        <Package className="h-8 w-8 text-slate-300" />
                        <span>{language === "ar" ? "لا توجد طلبات" : "No orders found"}</span>
                    </div>
                )}
            </div>
        </div>
    )
}