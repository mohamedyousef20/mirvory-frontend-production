"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Truck, CheckCircle, XCircle, Clock, ArrowLeft, Package, Home, Store } from "lucide-react"
import { format } from "date-fns"
import { useLanguage } from "@/components/language-provider";
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { orderService } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

type DeliveryStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled'
type PaymentStatus = 'pending' | 'paid' | 'failed'
type PaymentMethod = 'cash' | 'card'
type DeliveryMethod = 'home' | 'pickup'

interface OrderItem {
    _id: string
    product: {
        _id: string
        title: string
        titleEn?: string
        price: number
        images: string[]
    }
    seller: {
        _id: string
        name: string
        email: string
        phone?: string
    }
    quantity: number
    price: number
    color?: string
    size?: string
    isPrepared: boolean
}

interface OrderDetails {
    _id: string
    buyer: {
        _id: string
        firstName: string
        lastName: string
        email: string
        phone?: string
    }
    items: OrderItem[]
    deliveryInfo: {
        fullName: string
        phoneNumber: string
        address: string
        pickupPoint?: {
            _id: string
            stationName: string
            address: string
            phone: string
        }
    }
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    deliveryMethod: DeliveryMethod
    deliveryStatus: DeliveryStatus
    subtotal: number
    discount: number
    shippingFee: number
    total: number
    isPrepared: boolean
    createdAt: string
    updatedAt: string
    isSellerView?: boolean
}

export default function VendorOrderDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { language, t } = useLanguage()
    const [order, setOrder] = useState<OrderDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true)
                const idStr = Array.isArray(id) ? id[0] : id;
                if (!idStr) throw new Error('Invalid order id');
                
                const response = await orderService.getOrderById(idStr as string);

                if (response?.data) {
                    setOrder(response.data);
                } else {
                    toast.error(language === 'ar' ? 'حدث خطأ أثناء جلب تفاصيل الطلب' : 'Failed to load order details')
                }
            } catch (error: any) {
                console.error('Error fetching order details:', error)
                if (error?.response?.status === 403) {
                    toast.error(language === 'ar' ? 'ليس لديك صلاحية لعرض هذا الطلب' : 'You do not have permission to view this order')
                } else {
                    toast.error(language === 'ar' ? 'حدث خطأ أثناء جلب تفاصيل الطلب' : 'Failed to load order details')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchOrderDetails()
    }, [id, language])

    const getDeliveryStatusInfo = (status: DeliveryStatus) => {
        switch (status) {
            case 'pending':
                return {
                    text: language === 'ar' ? 'قيد الانتظار' : 'Pending',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <Clock className="h-4 w-4" />
                }
            case 'shipped':
                return {
                    text: language === 'ar' ? 'تم الشحن' : 'Shipped',
                    color: 'bg-blue-100 text-blue-800',
                    icon: <Truck className="h-4 w-4" />
                }
            case 'delivered':
                return {
                    text: language === 'ar' ? 'تم التوصيل' : 'Delivered',
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="h-4 w-4" />
                }
            case 'cancelled':
                return {
                    text: language === 'ar' ? 'ملغي' : 'Cancelled',
                    color: 'bg-red-100 text-red-800',
                    icon: <XCircle className="h-4 w-4" />
                }
            default:
                return {
                    text: language === 'ar' ? 'غير معروف' : 'Unknown',
                    color: 'bg-gray-100 text-gray-800',
                    icon: null
                }
        }
    }

    const getPaymentStatusInfo = (status: PaymentStatus) => {
        switch (status) {
            case 'paid':
                return {
                    text: language === 'ar' ? 'مدفوع' : 'Paid',
                    color: 'bg-green-100 text-green-800'
                }
            case 'pending':
                return {
                    text: language === 'ar' ? 'قيد الانتظار' : 'Pending',
                    color: 'bg-yellow-100 text-yellow-800'
                }
            case 'failed':
                return {
                    text: language === 'ar' ? 'فشل الدفع' : 'Failed',
                    color: 'bg-red-100 text-red-800'
                }
            default:
                return {
                    text: language === 'ar' ? 'غير معروف' : 'Unknown',
                    color: 'bg-gray-100 text-gray-800'
                }
        }
    }

    const getPaymentMethodInfo = (method: PaymentMethod) => {
        switch (method) {
            case 'cash':
                return language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'
            case 'card':
                return language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'
            default:
                return method
        }
    }

    const getDeliveryMethodInfo = (method: DeliveryMethod) => {
        switch (method) {
            case 'home':
                return {
                    text: language === 'ar' ? 'توصيل للمنزل' : 'Home Delivery',
                    icon: <Home className="h-4 w-4" />
                }
            case 'pickup':
                return {
                    text: language === 'ar' ? 'استلام من نقطة التوصيل' : 'Pickup Point',
                    icon: <Store className="h-4 w-4" />
                }
            default:
                return {
                    text: method,
                    icon: <Package className="h-4 w-4" />
                }
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">{language === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">{language === 'ar' ? 'الطلب غير موجود' : 'Order Not Found'}</h2>
                <p className="text-muted-foreground mb-6">{language === 'ar' ? 'عذراً، لا يمكن العثور على تفاصيل الطلب المطلوبة' : 'Sorry, the requested order details cannot be found'}</p>
                <Button onClick={() => router.push('/vendor/dashboard')}>
                    {language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
                </Button>
            </div>
        )
    }

    const deliveryStatusInfo = getDeliveryStatusInfo(order.deliveryStatus)
    const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)
    const deliveryMethodInfo = getDeliveryMethodInfo(order.deliveryMethod)
    const sellerSubtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={() => router.push('/vendor/dashboard')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">
                        {language === 'ar' ? `طلب #${order._id.slice(-6)}` : `Order #${order._id.slice(-6)}`}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'PPP')}
                    </p>
                </div>
                {order.isSellerView && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {language === 'ar' ? 'عرض البائع' : 'Seller View'}
                    </Badge>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Order Items - Seller's Items Only */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{language === 'ar' ? 'منتجاتك في هذا الطلب' : 'Your Products in this Order'}</CardTitle>
                        <CardDescription>
                            {language === 'ar' 
                                ? `هذا الطلب يحتوي على ${order.items.length} منتج/منتجات خاصة بك`
                                : `This order contains ${order.items.length} of your product(s)`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item._id} className="flex gap-4 p-4 border rounded-lg">
                                <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.product?.images?.[0] || "/placeholder.svg"}
                                        alt={language === 'ar' ? item.product?.title : item.product?.titleEn || item.product?.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-medium">
                                        {language === 'ar' ? item.product?.title : item.product?.titleEn || item.product?.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} × {item.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                                    </p>
                                    {(item.color || item.size) && (
                                        <p className="text-sm text-muted-foreground">
                                            {item.color && `${language === 'ar' ? 'اللون:' : 'Color:'} ${item.color}`}
                                            {item.color && item.size && ' | '}
                                            {item.size && `${language === 'ar' ? 'المقاس:' : 'Size:'} ${item.size}`}
                                        </p>
                                    )}
                                    <div className="pt-2">
                                        <p className="text-sm font-semibold text-green-600">
                                            {language === 'ar' ? 'الإجمالي:' : 'Total:'} {item.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}
                                        </p>
                                    </div>
                                    {item.isPrepared ? (
                                        <Badge className="bg-green-100 text-green-800 mt-2">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {language === 'ar' ? 'تم التجهيز' : 'Prepared'}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="mt-2">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}

                        <Separator className="my-4" />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                                <span>{sellerSubtotal} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <div className="space-y-6">
                    {/* Customer Info */}
                 

                    {/* Delivery Info */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>{language === 'ar' ? 'معلومات التوصيل' : 'Delivery Info'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                {deliveryMethodInfo.icon}
                                <span className="text-sm">{deliveryMethodInfo.text}</span>
                            </div>
                            
                            {order.deliveryMethod === 'home' && order.deliveryInfo?.address ? (
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium">{language === 'ar' ? 'الاسم:' : 'Name:'}</p>
                                        <p className="text-sm text-muted-foreground">{order.deliveryInfo.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{language === 'ar' ? 'الهاتف:' : 'Phone:'}</p>
                                        <p className="text-sm text-muted-foreground">{order.deliveryInfo.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{language === 'ar' ? 'العنوان:' : 'Address:'}</p>
                                        <p className="text-sm text-muted-foreground">{order.deliveryInfo.address}</p>
                                    </div>
                                </div>
                            ) : order.deliveryMethod === 'pickup' && order.deliveryInfo?.pickupPoint ? (
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium">{language === 'ar' ? 'نقطة الاستلام:' : 'Pickup Point:'}</p>
                                        <p className="text-sm text-muted-foreground">{order.deliveryInfo.pickupPoint.stationName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{language === 'ar' ? 'العنوان:' : 'Address:'}</p>
                                        <p className="text-sm text-muted-foreground">{order.deliveryInfo.pickupPoint.address}</p>
                                    </div>
                                    {order.deliveryInfo.pickupPoint.phone && (
                                        <div>
                                            <p className="text-sm font-medium">{language === 'ar' ? 'هاتف النقطة:' : 'Point Phone:'}</p>
                                            <p className="text-sm text-muted-foreground">{order.deliveryInfo.pickupPoint.phone}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'لا توجد معلومات توصيل متاحة' : 'No delivery information available'}</p>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{language === 'ar' ? 'حالة التوصيل:' : 'Delivery Status:'}</span>
                                <Badge className={deliveryStatusInfo.color}>
                                    {deliveryStatusInfo.icon}
                                    <span className="ml-1">{deliveryStatusInfo.text}</span>
                                </Badge>
                            </div>
                        </CardContent>
                    </Card> */}

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{language === 'ar' ? 'معلومات الدفع' : 'Payment Info'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm">{language === 'ar' ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                                <span className="text-sm font-medium">{getPaymentMethodInfo(order.paymentMethod)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">{language === 'ar' ? 'حالة الدفع:' : 'Payment Status:'}</span>
                                <Badge className={paymentStatusInfo.color}>{paymentStatusInfo.text}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
