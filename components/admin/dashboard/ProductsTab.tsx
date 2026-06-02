"use client";

import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Package,
    Plus,
    CheckCircle,
    XCircle,
    Search
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";

import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl";
import PaginationControls from "@/components/pagination-controls";
import DashboardImageSlider from "@/components/ui/DashboardImageSlider";

interface ProductsTabProps {
    products: any[];
    loadingProducts: boolean;
    errorProducts: string | null;
    isArabic: boolean;
    pagination: { currentPage: number; totalPages: number };
    onPageChange: (page: number) => void;
    handleApproveProduct: (productId: string) => void;
    handleRejectProduct: (
        productId: string,
        sellerId: string,
        title: string,
        reason: string
    ) => void;
}

export function ProductsTab({
    products,
    loadingProducts,
    errorProducts,
    isArabic,
    pagination,
    onPageChange,
    handleApproveProduct,
    handleRejectProduct
}: ProductsTabProps) {

    const [sellerSearch, setSellerSearch] = useState("");

    // Filter products by seller
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const sellerName =
                `${product.seller?.firstName || ""} ${product.seller?.lastName || ""}`
                    .trim()
                    .toLowerCase();

            return sellerName.includes(sellerSearch.toLowerCase());
        });
    }, [products, sellerSearch]);

    return (
        <div className="space-y-4 md:space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-lg md:text-2xl font-bold">
                        {isArabic ? "إدارة المنتجات" : "Products Management"}
                    </h2>

                    <p className="text-xs md:text-sm text-muted-foreground">
                        {isArabic
                            ? "إدارة وعرض جميع المنتجات في النظام"
                            : "Manage and view all products in the system"}
                    </p>
                </div>

                <Button asChild className="w-full md:w-auto">
                    <Link href="/admin/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        {isArabic ? "إضافة منتج جديد" : "Add New Product"}
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                    <input
                        type="text"
                        value={sellerSearch}
                        onChange={(e) => setSellerSearch(e.target.value)}
                        placeholder={
                            isArabic
                                ? "ابحث باسم البائع..."
                                : "Search by seller name..."
                        }
                        className="
                            w-full rounded-lg border bg-background
                            py-2 pl-10 pr-4 text-sm
                            outline-none transition
                            focus:ring-2 focus:ring-primary
                        "
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] text-xs md:text-sm">
                                    {isArabic ? "الصورة" : "Image"}
                                </TableHead>

                                <TableHead className="min-w-[150px] text-xs md:text-sm">
                                    {isArabic ? "المنتج" : "Product"}
                                </TableHead>

                                <TableHead className="text-xs md:text-sm">
                                    {isArabic ? "البائع" : "Vendor"}
                                </TableHead>

                                <TableHead className="min-w-[100px] text-xs md:text-sm">
                                    {isArabic ? "السعر" : "Price"}
                                </TableHead>

                                <TableHead className="min-w-[80px] text-xs md:text-sm">
                                    {isArabic ? "المخزون" : "Stock"}
                                </TableHead>

                                <TableHead className="min-w-[80px] text-xs md:text-sm">
                                    {isArabic ? "تم البيع" : "Sold"}
                                </TableHead>

                                <TableHead className="min-w-[100px] text-xs md:text-sm">
                                    {isArabic ? "التقييم" : "Rating"}
                                </TableHead>

                                <TableHead className="min-w-[120px] text-xs md:text-sm">
                                    {isArabic ? "الفئة" : "Category"}
                                </TableHead>

                                <TableHead className="min-w-[120px] text-xs md:text-sm">
                                    {isArabic ? "الحالة" : "Status"}
                                </TableHead>

                                <TableHead className="min-w-[120px] text-xs md:text-sm">
                                    {isArabic ? "تاريخ التقديم" : "Submitted Date"}
                                </TableHead>

                                <TableHead className="min-w-[150px] text-xs md:text-sm">
                                    {isArabic ? "الإجراءات" : "Actions"}
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>

                            {/* Loading */}
                            {loadingProducts ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center">
                                        <div className="flex flex-col justify-center items-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin mb-4" />

                                            <p className="text-muted-foreground">
                                                {isArabic
                                                    ? "جاري تحميل المنتجات..."
                                                    : "Loading products..."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>

                            ) : errorProducts ? (

                                /* Error */
                                <TableRow>
                                    <TableCell
                                        colSpan={11}
                                        className="text-center text-destructive py-8"
                                    >
                                        <div className="flex flex-col items-center">
                                            <XCircle className="h-12 w-12 mb-4" />

                                            <p>{errorProducts}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>

                            ) : filteredProducts.length === 0 ? (

                                /* Empty */
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <Package className="h-12 w-12 text-muted-foreground mb-4" />

                                            <p className="text-muted-foreground">
                                                {isArabic
                                                    ? "لا توجد منتجات مطابقة"
                                                    : "No matching products found"}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>

                            ) : (

                                /* Products */
                                filteredProducts.map((product: any) => (
                                    <TableRow key={product._id}>

                                        {/* Image */}
                                        <TableCell className="text-xs md:text-sm">
                                            <div className="w-12 md:w-16">
                                                <DashboardImageSlider
                                                    images={
                                                        product.images?.length
                                                            ? product.images.map((img: string) =>
                                                                normalizeImageUrl(img)
                                                            )
                                                            : ["/placeholder.svg"]
                                                    }
                                                    alt={product.title}
                                                    layout="square"
                                                />
                                            </div>
                                        </TableCell>

                                        {/* Product */}
                                        <TableCell className="text-xs md:text-sm">
                                            <div className="space-y-1">
                                                <p className="font-medium truncate max-w-[120px] md:max-w-[150px]">
                                                    {product.title}
                                                </p>

                                                <p className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-[150px]">
                                                    ID: {product._id.slice(-6)}
                                                </p>
                                            </div>
                                        </TableCell>

                                    {/* Seller */}
                                    <TableCell className="text-xs md:text-sm">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {product.seller
                                                    ? `${product.seller.firstName || ""} ${product.seller.lastName || ""}`.trim()
                                                    : "Unknown"}
                                            </p>

                                            {product.seller?.email && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[100px] md:max-w-[120px]">
                                                    {product.seller.email}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Price */}
                                    <TableCell className="text-xs md:text-sm">
                                        {product.discountPercentage > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-green-600">
                                                    {parseFloat(
                                                        product.discountedPrice ||
                                                        product.price ||
                                                        0
                                                    ).toFixed(2)}{" "}
                                                    {isArabic ? "ج.م" : "EGP"}
                                                </span>

                                                <span className="text-xs line-through text-muted-foreground">
                                                    {parseFloat(
                                                        product.price || 0
                                                    ).toFixed(2)}{" "}
                                                    {isArabic ? "ج.م" : "EGP"}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-medium">
                                                {parseFloat(product.price || 0).toFixed(2)}{" "}
                                                {isArabic ? "ج.م" : "EGP"}
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Stock */}
                                    <TableCell className="text-xs md:text-sm">
                                        <div className="flex items-center gap-1">
                                            {product.quantity || 0}

                                            {product.quantity < 10 &&
                                                product.quantity > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-orange-100 text-orange-800 border-orange-200 text-xs"
                                                    >
                                                        {isArabic ? "منخفض" : "Low"}
                                                    </Badge>
                                                )}

                                            {product.quantity === 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-red-100 text-red-800 border-red-200 text-xs"
                                                >
                                                    {isArabic ? "نفذ" : "Out"}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Sold */}
                                    <TableCell className="text-xs md:text-sm">
                                        <div className="flex items-center gap-1">
                                            {product.sold || 0}

                                            {product.sold > 50 && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-green-100 text-green-800 border-green-200 text-xs"
                                                >
                                                    {isArabic ? "مباع" : "Sold"}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Rating */}
                                    <TableCell className="text-xs md:text-sm">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">
                                                    {product.ratingsAverage?.toFixed(1) || "0.0"}
                                                </span>

                                                <span className="text-yellow-500">★</span>
                                            </div>

                                            <span className="text-xs text-muted-foreground">
                                                ({product.ratingsQuantity || 0}{" "}
                                                {isArabic ? "تقييم" : "reviews"})
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Category */}
                                    <TableCell className="text-xs md:text-sm">
                                        <Badge variant="outline" className="bg-blue-50 text-xs">
                                            {product.category
                                                ? (
                                                    isArabic
                                                        ? product.category.name
                                                        : product.category.nameEn ||
                                                        product.category.name
                                                )
                                                : "N/A"}
                                        </Badge>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="text-xs md:text-sm">
                                        <Badge
                                            variant={
                                                product.isApproved
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className={
                                                product.isApproved
                                                    ? "bg-green-100 text-green-800 border-green-200 text-xs"
                                                    : "bg-amber-100 text-amber-800 border-amber-200 text-xs"
                                            }
                                        >
                                            {isArabic
                                                ? product.isApproved
                                                    ? "معتمد"
                                                    : "قيد المراجعة"
                                                : product.isApproved
                                                    ? "Approved"
                                                    : "Pending"}
                                        </Badge>
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell className="text-xs md:text-sm">
                                        <div className="text-xs md:text-sm">
                                            {new Date(product.createdAt).toLocaleDateString(
                                                isArabic ? "ar-EG" : "en-US",
                                                {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric"
                                                }
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-xs md:text-sm">
                                        <div className="flex flex-col gap-2">

                                            {!product.isApproved && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start text-green-600 hover:bg-green-50"
                                                        onClick={() =>
                                                            handleApproveProduct(product._id)
                                                        }
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />

                                                        {isArabic ? "موافقة" : "Approve"}
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                            const reason = prompt(
                                                                isArabic
                                                                    ? `أدخل سبب رفض المنتج "${product.title}"`
                                                                    : `Enter rejection reason`
                                                            );

                                                            if (reason) {
                                                                handleRejectProduct(
                                                                    product._id,
                                                                    product.seller?._id ||
                                                                    product.seller,
                                                                    product.title,
                                                                    reason
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />

                                                        {isArabic ? "رفض" : "Reject"}
                                                    </Button>
                                                </>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start"
                                                asChild
                                            >
                                                <Link href={`/products/${product._id}`}>
                                                    {isArabic
                                                        ? "عرض التفاصيل"
                                                        : "View Details"}
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>
            </div>

            {/* Pagination */}
            {!loadingProducts && filteredProducts.length > 0 && (
                <PaginationControls
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                    className="justify-end pt-4"
                    labels={{
                        previous: "السابق",
                        next: "التالي"
                    }}
                />
            )}
        </div>
    );
}