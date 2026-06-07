"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { orderService, cartService, pickupPointService } from '@/lib/api'
import { useAuth } from "@/contexts/AuthProvider"
import { useLanguage } from "@/components/language-provider"
import { toast } from 'sonner'
import { GREATER_CAIRO_AREA, getCitiesByGovernorate } from '@/lib/data/greater-cairo-area'
import {
    Loader2, MapPin, User, ShoppingBag, CreditCard,
    Truck, Home, Store, ArrowRight, ArrowLeft, Package,
    Banknote, CheckCircle2
} from 'lucide-react'
import Image from 'next/image'

interface PickupPoint {
    _id: string
    stationName: string
    address: string
    workingHours: string
    phone?: string
}

export default function Checkout() {
    const router = useRouter()
    const { user } = useAuth()
    const { language } = useLanguage()
    const isAr = language === 'ar'

    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('home')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
    const [address, setAddress] = useState({
        governorate: '',
        city: '',
        addressLine: '',
    })
    const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([])
    const [selectedPickupPointId, setSelectedPickupPointId] = useState('')


    const [cartItems, setCartItems] = useState<any[]>([])
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
    const [subtotal, setSubtotal] = useState(0)

    const shippingFee = useMemo(() => (subtotal > 500 || deliveryMethod === 'pickup' ? 0 : 70), [subtotal, deliveryMethod])
    const total = useMemo(() => {
        let finalTotal = subtotal + shippingFee;
        if (appliedCoupon?.discountAmount) {
            finalTotal -= appliedCoupon.discountAmount;
        }
        return finalTotal;
    }, [subtotal, shippingFee, appliedCoupon]);


    const availableCities = useMemo(() => {
        if (!address.governorate) return []
        return getCitiesByGovernorate(address.governorate)
    }, [address.governorate])

    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                setLoadingData(true)
                const cartRes = await cartService.getCart();
                console.log(cartRes, 'res2525')
                const items = cartRes?.data?.items || []
                setCartItems(items);
                const couponData = cartRes?.data?.appliedCoupon || null;
                setAppliedCoupon(couponData);

                const sub = items.reduce(
                    (acc: number, item: any) =>
                        acc + ((item?.product?.discountedPrice ?? item?.price ?? 0) * (item?.quantity ?? 1)),
                    0
                );
                setSubtotal(sub)


                try {
                    const pickupRes = await pickupPointService.getPickupPoints();
                    console.log(pickupRes, 'pickupRes')
                    setPickupPoints(pickupRes?.data || [])
                    if (pickupRes?.data?.[0]) setSelectedPickupPointId(pickupRes.data[0]._id)
                } catch (pErr) {
                    console.error("Pickup points fetch error", pErr)
                }

                if (user) {
                    setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim())
                    setPhone(user.phone || '')
                    if (user?.address) {
                        setAddress({
                            governorate: user.address.governorate || '',
                            city: user.address.city || '',
                            addressLine: user.address.addressLine || '',
                        })
                    }
                }
            } catch (err) {
                console.error('Failed to load checkout data:', err)
                toast.error(isAr ? 'فشل تحميل البيانات' : 'Failed to load data')
            } finally {
                setLoadingData(false)
            }
        }
        loadCheckoutData()
    }, [user, isAr])

    const handleSubmit = useCallback(async () => {
        if (!fullName.trim()) {
            toast.error(isAr ? 'الرجاء إدخال الاسم بالكامل' : 'Please enter your full name')
            return
        }

        const phoneRegex = /^01[0125][0-9]{8}$/
        let finalPhone = phone.trim()

        if (!finalPhone || !phoneRegex.test(finalPhone)) {
            toast.error(isAr ? 'الرجاء إدخال رقم هاتف محمول صحيح' : 'Please enter a valid phone number')
            return
        }

        let finalAddressStr = undefined
        let finalFullName = fullName.trim()

        if (deliveryMethod === 'home') {
            if (
                !address.governorate ||
                !address.city ||
                !address.addressLine
            ) {
                toast.error(
                    isAr
                        ? 'الرجاء إدخال بيانات العنوان كاملة'
                        : 'Please complete address information'
                )
                return
            }

            finalAddressStr = `${address.addressLine}, ${address.city}, ${address.governorate}`
        } else if (deliveryMethod === 'pickup' && !selectedPickupPointId) {
            toast.error(isAr ? 'الرجاء اختيار نقطة الاستلام المعتمدة' : 'Please select a pickup point')
            return
        }

        try {
            setLoading(true)
            const orderPayload = {
                deliveryMethod,
                paymentMethod,
                deliveryInfo: {
                    fullName: finalFullName,
                    phone: finalPhone,
                    address: finalAddressStr,
                    pickupPoint: deliveryMethod === 'pickup' ? selectedPickupPointId : undefined
                }
            }

            const response = await orderService.createOrder(orderPayload)
            if (response.data) {
                toast.success(isAr ? 'تم تسجيل طلبك بنجاح' : 'Order placed successfully')
                const orderId = response.data?.data?._id || response.data?._id || response.data?.order?._id
                router.push(`/orders/${orderId}`)
            }
        } catch (error: any) {
            console.error("Order creation failed error response:", error?.response?.data)
            toast.error(error?.response?.data?.message || (isAr ? 'فشل في إنشاء الطلب، حاول ثانية' : 'Failed to process order'))
        } finally {
            setLoading(false)
        }
    }, [fullName, phone, deliveryMethod, paymentMethod, address, selectedPickupPointId, isAr, router])

    if (loadingData) {
        return (
            <>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); * { font-family: 'Cairo', sans-serif !important; }`}</style>
                <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center" dir={isAr ? "rtl" : "ltr"}>
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1a4fba]" />
                        <p className="text-sm text-slate-500 font-medium">{isAr ? "جاري التحميل..." : "Loading..."}</p>
                    </div>
                </div>
            </>
        )
    }

    if (cartItems.length === 0) {
        return (
            <>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); * { font-family: 'Cairo', sans-serif !important; }`}</style>
                <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center px-4" dir={isAr ? "rtl" : "ltr"}>
                    <div className="text-center space-y-4 max-w-sm bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                        <ShoppingBag className="h-10 w-10 text-slate-400 mx-auto" />
                        <h2 className="text-xl font-bold text-slate-800">{isAr ? "سلة التسوق فارغة" : "Cart is empty"}</h2>
                        <Button onClick={() => router.push('/products')} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a4fba] text-white text-sm font-semibold rounded-xl hover:bg-[#1640a0] transition shadow-md shadow-blue-200 h-12">
                            {isAr ? "العودة للتسوق" : "Back to shop"}
                        </Button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); * { font-family: 'Cairo', sans-serif !important; }`}</style>
            <section className="min-h-screen bg-[#f4f6fb] py-8 lg:py-12 antialiased" dir={isAr ? "rtl" : "ltr"}>
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden flex flex-col lg:flex-row min-h-[80vh]">

                    {/* Left Column - Forms (Order Details) */}
                    <div className="w-full lg:w-10/12 p-6 lg:p-10 bg-white">

                        {/* Header */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors font-medium text-lg mb-6"
                        >
                            {isAr ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                            {isAr ? "مواصلة التسوق" : "Continue shopping"}
                        </button>

                        <hr className="mb-6 border-gray-200" />

                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{isAr ? "إتمام الطلب" : "Checkout"}</h2>
                                <p className="text-gray-500 text-sm mt-1">{isAr ? `لديك ${cartItems.length} عناصر في السلة` : `You have ${cartItems.length} items in your cart`}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* 1. Customer Information Card */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <h3 className="font-bold flex items-center gap-2 mb-4 text-slate-800">
                                    <User className="w-5 h-5 text-[#1a4fba]" />
                                    {isAr ? "معلومات الاتصال" : "Contact Information"}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-slate-500 mb-1 block">{isAr ? "الاسم الكامل" : "Full Name"}</Label>
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder={isAr ? "الاسم الأول واللقب" : "John Doe"}
                                            className="h-12 bg-slate-50 rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500 mb-1 block">{isAr ? "رقم الهاتف" : "Phone"}</Label>
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="01XXXXXXXXX"
                                            className="h-12 bg-slate-50 rounded-xl border-slate-200 text-left"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Delivery Method Card */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <h3 className="font-bold flex items-center gap-2 mb-4 text-slate-800">
                                    <Truck className="w-5 h-5 text-[#1a4fba]" />
                                    {isAr ? "طريقة التوصيل" : "Delivery Method"}
                                </h3>

                                <RadioGroup
                                    value={deliveryMethod}
                                    onValueChange={(v) => setDeliveryMethod(v as 'home' | 'pickup')}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5"
                                >
                                    <Label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${deliveryMethod === 'home' ? 'border-[#1a4fba] bg-blue-50/50 ring-1 ring-[#1a4fba]' : 'border-slate-200 hover:border-[#1a4fba]'}`}>
                                        <RadioGroupItem value="home" id="home" className="sr-only" />
                                        <Home className={`w-6 h-6 ${deliveryMethod === 'home' ? 'text-[#1a4fba]' : 'text-slate-400'}`} />
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{isAr ? "توصيل للمنزل (طلب العنوان)" : "Home Delivery (Ask for Address)"}</p>
                                        </div>
                                    </Label>
                                    <Label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'border-[#1a4fba] bg-blue-50/50 ring-1 ring-[#1a4fba]' : 'border-slate-200 hover:border-[#1a4fba]'}`}>
                                        <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                                        <Store className={`w-6 h-6 ${deliveryMethod === 'pickup' ? 'text-[#1a4fba]' : 'text-slate-400'}`} />
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{isAr ? "استلام من نقطة استلام" : "Store Pickup (Show Pickup Points)"}</p>
                                        </div>
                                    </Label>
                                </RadioGroup>
                                {deliveryMethod === 'home' && (
                                    <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-[#1a4fba]" />
                                            {isAr ? "عنوان التوصيل" : "Delivery Address"}
                                        </h3>

                                        {/* Governorate */}
                                        <div>
                                            <Label className="text-xs text-slate-500 mb-1 block">
                                                {isAr ? "المحافظة" : "Governorate"}
                                            </Label>
                                            <select
                                                value={address.governorate}
                                                onChange={(e) =>
                                                    setAddress({
                                                        governorate: e.target.value,
                                                        city: '',
                                                        addressLine: address.addressLine
                                                    })
                                                }
                                                className="w-full h-12 bg-slate-50 rounded-xl px-3 border border-slate-200"
                                            >
                                                <option value="">
                                                    {isAr ? "اختر المحافظة" : "Select governorate"}
                                                </option>

                                                {GREATER_CAIRO_AREA.map((gov) => (
                                                    <option key={gov.id} value={gov.id}>
                                                        {isAr ? gov.nameAr : gov.nameEn}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* City */}
                                        <div>
                                            <Label className="text-xs text-slate-500 mb-1 block">
                                                {isAr ? "المدينة" : "City"}
                                            </Label>
                                            <select
                                                value={address.city}
                                                onChange={(e) =>
                                                    setAddress(prev => ({
                                                        ...prev,
                                                        city: e.target.value
                                                    }))
                                                }
                                                className="w-full h-12 bg-slate-50 rounded-xl px-3 border border-slate-200"
                                                disabled={!address.governorate}
                                            >
                                                <option value="">
                                                    {isAr ? "اختر المدينة" : "Select city"}
                                                </option>

                                                {availableCities.map((city) => (
                                                    <option key={city.id} value={city.id}>
                                                        {isAr ? city.nameAr : city.nameEn}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Address Line */}
                                        <div>
                                            <Label className="text-xs text-slate-500 mb-1 block">
                                                {isAr ? "تفاصيل العنوان" : "Street Address"}
                                            </Label>
                                            <Input
                                                value={address.addressLine}
                                                onChange={(e) =>
                                                    setAddress(prev => ({
                                                        ...prev,
                                                        addressLine: e.target.value
                                                    }))
                                                }
                                                placeholder={isAr ? "الشارع، رقم المنزل..." : "Street, building no..."}
                                                className="h-12 bg-slate-50 rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Pickup Details - Shown dynamically when Store Pickup is selected */}
                                {deliveryMethod === 'pickup' && (
                                    <div className="mt-4 space-y-3 animate-in fade-in">
                                        <Label className="text-xs text-slate-500 mb-2 block">{isAr ? "اختر نقطة الاستلام المناسبة لك:" : "Select your preferred pickup point:"}</Label>
                                        {pickupPoints.length === 0 ? (
                                            <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center">
                                                {isAr ? "لا توجد نقاط استلام متاحة حالياً" : "No pickup points available currently"}
                                            </p>
                                        ) : (
                                            pickupPoints.map((point) => (
                                                <div
                                                    key={point._id}
                                                    onClick={() => setSelectedPickupPointId(point._id)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPickupPointId === point._id ? 'border-[#1a4fba] bg-blue-50/30 ring-1 ring-[#1a4fba]' : 'border-slate-200 hover:border-[#1a4fba]'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-800 text-sm">{point.stationName}</h4>
                                                        {selectedPickupPointId === point._id && <CheckCircle2 className="w-4 h-4 text-[#1a4fba]" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{point.address}</p>
                                                    {point.workingHours && (
                                                        <p className="text-[11px] text-slate-400 mt-1">{isAr ? `مواعيد العمل: ${point.workingHours}` : `Working Hours: ${point.workingHours}`}</p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 3. Payment Method Card */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <h3 className="font-bold flex items-center gap-2 mb-4 text-slate-800">
                                    <CreditCard className="w-5 h-5 text-[#1a4fba]" />
                                    {isAr ? "طريقة الدفع" : "Payment"}
                                </h3>
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as 'cash' | 'card')}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                >
                                    {/* <Label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <RadioGroupItem value="card" id="card" className="sr-only" />
                                        <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{isAr ? "بطاقة ائتمانية" : "Card Payment"}</p>
                                        </div>
                                    </Label> */}
                                    <Label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-[#1a4fba] bg-blue-50/50 ring-1 ring-[#1a4fba]' : 'border-slate-200 hover:border-[#1a4fba]'}`}>
                                        <RadioGroupItem value="cash" id="cash" className="sr-only" />
                                        <Banknote className={`w-12 h-12${paymentMethod === 'cash' ? 'text-[#1a4fba]' : 'text-slate-400'}`} />
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</p>
                                        </div>
                                    </Label>
                                  
                                </RadioGroup>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="w-full lg:w-5/12 bg-[#1a4fba] text-white p-6 lg:p-10 flex flex-col justify-between rounded-t-[2rem] lg:rounded-t-none lg:rounded-s-[2rem] rtl:lg:rounded-s-none rtl:lg:rounded-e-[2rem] shadow-2xl z-10 -mt-6 lg:mt-0 lg:-ms-6 rtl:lg:ms-0 rtl:lg:-me-6">

                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{isAr ? "تفاصيل الطلب" : "Order Summary"}</h3>
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            {/* Cart Items Summary */}
                            <div className="max-h-[35vh] overflow-y-auto custom-scrollbar pe-2 space-y-4 mb-6">
                                {cartItems.map((item: any) => {
                                    const product = item.product || {};
                                    const itemTotal =
                                        (item.quantity || 0) *
                                        ((item.product?.discountedPrice ?? item.price) || 0);
                                    return (
                                        <div
                                            key={item._id}
                                            className="flex gap-4 items-center bg-white/10 p-3 rounded-xl border border-white/20"
                                        >
                                            {/* IMAGE */}
                                            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 relative">
                                                <Image
                                                    src={product.images?.[0] || "/placeholder.png"}
                                                    alt={product.title || "Item"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* DETAILS */}
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-sm text-white truncate">
                                                    {product.title || "Product"}
                                                </h5>

                                                <p className="text-blue-200 text-xs mt-1">
                                                    {isAr ? "الكمية:" : "Qty:"} {item.quantity}
                                                </p>

                                                {/* COLOR */}
                                                {item.colors?.length > 0 && (
                                                    <p className="text-blue-200 text-xs mt-1">
                                                        {isAr ? "اللون:" : "Color:"} {item.colors[0]}
                                                    </p>
                                                )}

                                                {/* SIZE */}
                                                {item.sizes?.length > 0 && (
                                                    <p className="text-blue-200 text-xs mt-1">
                                                        {isAr ? "المقاس:" : "Size:"} {item.sizes[0]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* PRICE */}
                                            <div className="text-white font-bold whitespace-nowrap">
                                                ج.م {itemTotal.toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {appliedCoupon && (
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-400/30 text-green-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">
                                            {isAr ? "كوبون مطبق:" : "Coupon Applied:"} {appliedCoupon.code}
                                        </span>
                                        <span className="font-bold">
                                            -{appliedCoupon.discountAmount} ج.م
                                        </span>
                                    </div>
                                    <div className="text-xs mt-1 text-green-100/80">
                                        {isAr
                                            ? `قبل الخصم: ${appliedCoupon.originalTotal} ج.م`
                                            : `Before discount: ${appliedCoupon.originalTotal} EGP`}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <hr className="border-blue-400/50 mb-4" />

                            <div className="flex justify-between items-center mb-3">
                                <p className="text-blue-100 font-medium">{isAr ? "المجموع الفرعي" : "Subtotal"}</p>
                                <p className="font-bold">ج.م{subtotal.toFixed(2)}</p>
                            </div>

                            <div className="flex justify-between items-center mb-3">
                                <p className="text-blue-100 font-medium">{isAr ? "الشحن" : "Shipping"}</p>
                                <p className="font-bold">{shippingFee === 0 ? (isAr ? 'مجاني' : 'Free') : `ج.م${shippingFee.toFixed(2)}`}</p>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <p className="text-white font-bold text-lg">{isAr ? "الإجمالي" : "Total"}</p>
                                <p className="text-white font-bold text-xl">ج.م{total.toFixed(2)}</p>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full h-14 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl text-lg font-bold flex justify-between items-center px-6 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-[0_4px_14px_0_rgba(0,0,0,0.08)]"
                            >
                                <span>ج.م{total.toFixed(2)}</span>
                                <span className="flex items-center gap-2">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isAr ? "إتمام الطلب" : "Checkout")}
                                </span>
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </section>
        </>
    )
}