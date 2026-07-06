"use client"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Megaphone } from "lucide-react"
import { useState, useRef, useEffect, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react"
import { cartService, productService } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthProvider"
import { addToGuestCart } from "@/lib/guestCart"
import { ProductCard } from "./ProductCard"
// import { addToCart as addToCartAction } from "@/src/redux/slices/cartSlice"

interface Product {
    id: number;
    title: string;
    nameEn: string;
    image: string;
    price: number;
    oldPrice?: number;
    ratings: number;
    count: number;
    isNew?: boolean;
    brand?: string;
}

interface NewestProductsProps {
    title: string;
}

export function NewestProducts({ title }: NewestProductsProps) {
    const { language, t } = useLanguage();
    const { user } = useAuth();
    const isLoggedIn = Boolean(user);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // State for products and loading status
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchNewestProducts = async () => {
            try {
                setLoading(true);
                const response = await productService.getNewArrivals();

                console.log('NewestProducts response:', response);

                // Handle the new response format: { success: true, data: products }
                let productsData = [];
                if (response.data) {
                    if (response.data.success && response.data.data) {
                        productsData = response.data.data;
                    } else if (Array.isArray(response.data)) {
                        productsData = response.data;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        productsData = response.data.data;
                    }
                }

                console.log('Products data:', productsData);
                setProducts(productsData);
            } catch (err) {
                console.error('Error fetching newest products:', err);
                setError(language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
                toast.error(language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchNewestProducts();
    }, [language]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            if (direction === 'left') {
                scrollContainerRef.current.scrollLeft -= scrollAmount;
            } else {
                scrollContainerRef.current.scrollLeft += scrollAmount;
            }
        }
    };

    const toggleWishlist = (productId: number) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(productId)) {
                newFavorites.delete(productId);
                toast.success(language === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist");
            } else {
                newFavorites.add(productId);
                toast.success(language === "ar" ? "تمت الإضافة إلى المفضلة" : "Added to wishlist");
            }
            return newFavorites;
        });
    };

    const addToCart = async (productId: string) => {
        if (isLoggedIn) {
            try {
                await cartService.addToCart({ productId, quantity: 1 });
                toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
            } catch (error) {
                toast.error(language === "ar" ? "فشل في إضافة المنتج إلى السلة" : "Failed to add product to cart");
            }
        } else {
            const product = products.find((p: any) => p._id === productId);
            addToGuestCart({
                productId,
                quantity: 1,
                size: null,
                color: null,
                title: (product as any)?.title,
                image: (product as any)?.images?.[0] ?? null,
                price: (product as any)?.discountedPrice || (product as any)?.price,
                maxQuantity: (product as any)?.quantity,
            });
            toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart");
        }
    };

    return (
        <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">{title}</h2>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : /* Products Grid */
            products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            language={language}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12">
                    <Megaphone className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                        {language === "ar" ? "لا توجد منتجات في هذا التصنيف" : "No products found in this category"}
                    </p>
                </div>
            )}
        </div>
    );
}