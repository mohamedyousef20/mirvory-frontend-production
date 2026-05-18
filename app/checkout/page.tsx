"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { orderService, addressService, cartService } from '@/lib/api'
import { useAuth } from "@/contexts/AuthProvider"
import { useLanguage } from "@/components/language-provider"
import { toast } from 'sonner'
import {
    Loader2,
    MapPin,
    Phone,
    User,
    ShoppingBag,
    CreditCard,
    Truck,
    Home,
    Store,
    ChevronLeft,
    Package
} from 'lucide-react'
import Image from 'next/image'

interface Address {
    _id: string
    address: string
    city: string
    state: string
    phoneNumber?: string
    fullName?: string
    isDefault?: boolean
}

export default function Checkout() {
    const router = useRouter()
    const { user } = useAuth()
    const { language } = useLanguage()
    const isRTL = language === 'ar'

    // Loading states
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)

    // Form states
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('home')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')

    // Data states
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState('')
    const [cartItems, setCartItems] = useState<any[]>([])
    const [subtotal, setSubtotal] = useState(0)
    const [shippingFee, setShippingFee] = useState(70)
    const [total, setTotal] = useState(0)

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true)

                // Load cart
                const cartRes = await cartService.getCart()
                const items = cartRes?.data?.items || []
                setCartItems(items)

                const sub = items.reduce((acc: number, item: any) =>
                    acc + ((item?.price ?? item?.product?.price ?? 0) * (item?.quantity ?? 1)), 0
                )
                setSubtotal(sub)
                setShippingFee(sub > 500 ? 0 : 70)
                setTotal(sub + (sub > 500 ? 0 : 70))

                // Load addresses
                const addrRes = await addressService.getAddresses()
                const addrs = addrRes?.data?.data || []
                setAddresses(addrs)

                // Set default address
                const defaultAddr = addrs.find((a: Address) => a.isDefault) || addrs[0]
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr._id)
                }

                // Pre-fill user data
                if (user) {
                    setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim())
                    setPhone(user.phone || '')
                }
            } catch (err) {
                console.error('Failed to load data:', err)
                toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data')
            } finally {
                setLoadingData(false)
            }
        }

        loadData()
    }, [user, isRTL])

    const selectedAddress = addresses.find(a => a._id === selectedAddressId)

    const handleSubmit = async () => {
        // Validation
        if (!fullName.trim()) {
            toast.error(isRTL ? 'الرجاء إدخال الاسم' : 'Please enter your name')
            return
        }
        if (!phone.trim() || phone.length < 10) {
            toast.error(isRTL ? 'الرجاء إدخال رقم هاتف صحيح' : 'Please enter a valid phone number')
            return
        }
        if (deliveryMethod === 'home' && !selectedAddressId) {
            toast.error(isRTL ? 'الرجاء اختيار عنوان التوصيل' : 'Please select delivery address')
            return
        }

        try {
            setLoading(true)

            const orderData = {
                fullName: fullName.trim(),
                phoneNumber: phone.trim(),
                deliveryMethod,
                paymentMethod,
                addressId: deliveryMethod === 'home' ? selectedAddressId : undefined,
            }

            const response = await orderService.createOrder(orderData)
            if (response.data?.data._id) {
                toast.success(isRTL ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!')
                router.push(`/orders/${response.data.order._id || response.data._id}`)
            }
        } catch (error: any) {
            console.error('Order creation failed:', error)
            toast.error(error?.response?.data?.message || (isRTL ? 'فشل إنشاء الطلب' : 'Failed to create order'))
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-md mx-auto text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-xl font-semibold mb-2">
                        {isRTL ? 'سلة التسوق فارغة' : 'Your cart is empty'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {isRTL ? 'أضف منتجات إلى سلة التسوق أولاً' : 'Add products to your cart first'}
                    </p>
                    <Button onClick={() => router.push('/products')}>
                        {isRTL ? 'تصفح المنتجات' : 'Browse Products'}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full"
                    >
                        <ChevronLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                    <h1 className="text-2xl font-bold">{isRTL ? 'إتمام الطلب' : 'Checkout'}</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-lg font-semibold">
                                        {isRTL ? 'معلومات التواصل' : 'Contact Information'}
                                    </h2>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            {isRTL ? 'الاسم الكامل' : 'Full Name'} *
                                        </Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            {isRTL ? 'رقم الهاتف' : 'Phone Number'} *
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="01XXXXXXXXX"
                                            className="h-11"
                                            type="tel"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Method */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-green-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold">
                                        {isRTL ? 'طريقة الاستلام' : 'Delivery Method'}
                                    </h2>
                                </div>

                                <RadioGroup
                                    value={deliveryMethod}
                                    onValueChange={(v) => setDeliveryMethod(v as 'home' | 'pickup')}
                                    className="grid sm:grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem
                                            value="home"
                                            id="home"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="home"
                                            className="flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-gray-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Home className="h-5 w-5 text-primary" />
                                                <span className="font-semibold">
                                                    {isRTL ? 'توصيل للمنزل' : 'Home Delivery'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500 mt-1">
                                                {shippingFee === 0
                                                    ? (isRTL ? 'توصيل مجاني' : 'Free delivery')
                                                    : (isRTL ? 'توصيل 70 ج.م' : '70 EGP delivery')}
                                            </span>
                                        </Label>
                                    </div>

                                    <div>
                                        <RadioGroupItem
                                            value="pickup"
                                            id="pickup"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="pickup"
                                            className="flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-gray-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Store className="h-5 w-5 text-primary" />
                                                <span className="font-semibold">
                                                    {isRTL ? 'استلام من المتجر' : 'Store Pickup'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500 mt-1">
                                                {isRTL ? 'استلام مجاني' : 'Free pickup'}
                                            </span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {/* Address Selection (only for home delivery) */}
                                {deliveryMethod === 'home' && (
                                    <div className="mt-4 space-y-3">
                                        <Label>{isRTL ? 'اختر العنوان' : 'Select Address'}</Label>
                                        {addresses.length > 0 ? (
                                            <RadioGroup
                                                value={selectedAddressId}
                                                onValueChange={setSelectedAddressId}
                                                className="space-y-2"
                                            >
                                                {addresses.map((addr) => (
                                                    <div key={addr._id}>
                                                        <RadioGroupItem
                                                            value={addr._id}
                                                            id={addr._id}
                                                            className="peer sr-only"
                                                        />
                                                        <Label
                                                            htmlFor={addr._id}
                                                            className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-gray-300"
                                                        >
                                                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                                            <div className="flex-1">
                                                                <p className="font-medium">{addr.address}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {addr.city}, {addr.state}
                                                                </p>
                                                            </div>
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        ) : (
                                            <div className="p-4 bg-yellow-50 rounded-xl text-center">
                                                <p className="text-yellow-700 mb-2">
                                                    {isRTL ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push('/profile/addresses')}
                                                >
                                                    {isRTL ? 'إضافة عنوان' : 'Add Address'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pickup Info (only for pickup) */}
                                {deliveryMethod === 'pickup' && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Store className="h-5 w-5 text-blue-600" />
                                            <span className="font-semibold text-blue-800">
                                                {isRTL ? 'عنوان المتجر' : 'Store Address'}
                                            </span>
                                        </div>
                                        <p className="text-blue-700">
                                            {isRTL
                                                ? 'شارع التحرير، وسط البلد، القاهرة'
                                                : 'Tahrir Street, Downtown, Cairo'}
                                        </p>
                                        <p className="text-sm text-blue-600 mt-1">
                                            {isRTL ? 'مواعيد العمل: 9 ص - 9 م' : 'Working hours: 9 AM - 9 PM'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold">
                                        {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                                    </h2>
                                </div>

                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as 'cash' | 'card')}
                                    className="grid sm:grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem
                                            value="cash"
                                            id="cash"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="cash"
                                            className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-gray-300"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <span className="text-green-600 font-bold text-sm">EGP</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold block">
                                                    {isRTL ? 'نقداً عند الاستلام' : 'Cash on Delivery'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {isRTL ? 'ادفع عند استلام طلبك' : 'Pay when you receive'}
                                                </span>
                                            </div>
                                        </Label>
                                    </div>

                                    <div>
                                        <RadioGroupItem
                                            value="card"
                                            id="card"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="card"
                                            className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-gray-300"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold block">
                                                    {isRTL ? 'بطاقة ائتمان' : 'Credit Card'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {isRTL ? 'دفع آمن online' : 'Secure online payment'}
                                                </span>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-sm sticky top-6">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Package className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-semibold">
                                        {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        ({cartItems.length} {isRTL ? 'منتج' : 'items'})
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {cartItems.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <Image
                                                    src={item.product?.images?.[0] || "/placeholder.png"}
                                                    alt={item.product?.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {isRTL ? item.product?.title : (item.product?.titleEn || item.product?.title)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} × {item.price} {isRTL ? 'ج.م' : 'EGP'}
                                                </p>
                                                {(item.color || item.size) && (
                                                    <p className="text-xs text-gray-400">
                                                        {item.color} {item.color && item.size && '|'} {item.size}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-4" />

                                {/* Totals */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {isRTL ? 'المجموع الفرعي' : 'Subtotal'}
                                        </span>
                                        <span>{subtotal} {isRTL ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {isRTL ? 'التوصيل' : 'Shipping'}
                                        </span>
                                        <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                                            {shippingFee === 0
                                                ? (isRTL ? 'مجاني' : 'Free')
                                                : `${shippingFee} ${isRTL ? 'ج.م' : 'EGP'}`}
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                                        <span className="text-primary">{total} {isRTL ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full mt-6 h-12 text-lg"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            {isRTL ? 'جاري إنشاء الطلب...' : 'Creating order...'}
                                        </>
                                    ) : (
                                        <>
                                            {isRTL ? 'تأكيد الطلب' : 'Place Order'}
                                            <span className="mx-2">•</span>
                                            {total} {isRTL ? 'ج.م' : 'EGP'}
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-gray-500 mt-3">
                                    {isRTL
                                        ? 'بالنقر على تأكيد الطلب، أنت توافق على شروط الاستخدام'
                                        : 'By placing order, you agree to our terms of service'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
