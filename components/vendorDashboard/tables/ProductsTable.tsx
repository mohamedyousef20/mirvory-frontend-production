import Image from "next/image"
import Link from "next/link"
import {
    CheckCircle, Clock, TrendingUp, Star, MoreHorizontal,
    Eye, Edit, Trash, Save, Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface ProductsTableProps {
    products: any[]
    language: string
    categories: any[]
    editingProductId: string | null
    editingProductData: any
    updatingProductId: string | null
    onEdit: (product: any) => void
    onUpdate: (id: string) => void
    onDelete: (id: string) => void
    onCancelEdit: () => void
    onEditDataChange: (data: any) => void
}

export function ProductsTable({
    products, language, categories, editingProductId, editingProductData,
    updatingProductId, onEdit, onUpdate, onDelete, onCancelEdit, onEditDataChange
}: ProductsTableProps) {
    const headers = [
        language === "ar" ? "الصورة" : "Image",
        language === "ar" ? "اسم المنتج" : "Product Name",
        language === "ar" ? "السعر" : "Price",
        language === "ar" ? "الخصم" : "Discount",
        language === "ar" ? "السعر بعد الخصم" : "Discounted Price",
        language === "ar" ? "المخزون" : "Stock",
        language === "ar" ? "الحالة" : "Status",
        language === "ar" ? "المراجعة" : "Approved",
        language === "ar" ? "الفئة" : "Category",
        language === "ar" ? "مباع" : "Sold",
        language === "ar" ? "التقييم" : "Rating",
        language === "ar" ? "عدد التقييمات" : "Rating Count",
        language === "ar" ? "تاريخ الإنشاء" : "Created At",
        language === "ar" ? "الإجراءات" : "Actions",
    ]

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        {headers.map(h => (
                            <TableHead key={h} className="text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product._id} className="hover:bg-slate-50 transition-colors">

                            {/* Image */}
                            <TableCell>
                                <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-slate-100">
                                    <Image
                                        src={product.images[0] || "/placeholder.svg"}
                                        alt={language === "ar" ? product.title : product.titleEn}
                                        fill className="object-cover"
                                    />
                                </div>
                            </TableCell>

                            {/* Name */}
                            <TableCell>
                                {editingProductId === product._id ? (
                                    <Input
                                        value={editingProductData.title || ""}
                                        onChange={(e) => onEditDataChange({ ...editingProductData, title: e.target.value })}
                                        className="h-9 rounded-lg border-slate-200 text-sm w-full"
                                    />
                                ) : (
                                    <div>
                                        <p className="font-medium text-slate-800 text-sm truncate max-w-[140px]">
                                            {language === "ar" ? product.title : product.titleEn}
                                        </p>
                                        <p className="text-xs text-slate-400">ID: {product._id.slice(-6)}</p>
                                    </div>
                                )}
                            </TableCell>

                            {/* Price */}
                            <TableCell>
                                {editingProductId === product._id ? (
                                    <Input type="number" value={editingProductData.price || ""} onChange={(e) => onEditDataChange({ ...editingProductData, price: e.target.value })} className="h-9 rounded-lg border-slate-200 text-sm w-24" />
                                ) : (
                                    <span className="font-medium text-slate-800 text-sm whitespace-nowrap">
                                        {product.price} <span className="text-slate-400 font-normal">{language === "ar" ? "ج.م" : "EGP"}</span>
                                    </span>
                                )}
                            </TableCell>

                            {/* Discount */}
                            <TableCell>
                                {editingProductId === product._id ? (
                                    <Input type="number" value={editingProductData.discountPercentage || ""} onChange={(e) => onEditDataChange({ ...editingProductData, discountPercentage: e.target.value })} min="0" max="100" className="h-9 rounded-lg border-slate-200 text-sm w-20" />
                                ) : product.discountPercentage > 0 ? (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 rounded-full text-xs">{product.discountPercentage}%</Badge>
                                ) : (
                                    <span className="text-slate-300 text-sm">—</span>
                                )}
                            </TableCell>

                            {/* Discounted price */}
                            <TableCell>
                                {product.discountPercentage > 0 ? (
                                    <div>
                                        <span className="font-medium text-emerald-600 text-sm">{product.discountedPrice} {language === "ar" ? "ج.م" : "EGP"}</span>
                                        <span className="block text-xs line-through text-slate-400">{product.price} {language === "ar" ? "ج.م" : "EGP"}</span>
                                    </div>
                                ) : <span className="text-slate-300 text-sm">—</span>}
                            </TableCell>

                            {/* Stock */}
                            <TableCell>
                                {editingProductId === product._id ? (
                                    <Input type="number" value={editingProductData.quantity || ""} onChange={(e) => onEditDataChange({ ...editingProductData, quantity: e.target.value })} min="0" className="h-9 rounded-lg border-slate-200 text-sm w-20" />
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm text-slate-700">{product.quantity}</span>
                                        {product.quantity < 10 && (
                                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 rounded-full text-xs">
                                                {language === "ar" ? "منخفض" : "Low"}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                <Badge className={`rounded-full text-xs flex items-center gap-1 w-fit ${product.status === "available" ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50" : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50"}`}>
                                    {product.status === "available" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                    {language === "ar" ? (product.status === "available" ? "متاح" : "غير متاح") : product.status}
                                </Badge>
                            </TableCell>

                            {/* Approved */}
                            <TableCell>
                                <Badge className={`rounded-full text-xs flex items-center gap-1 w-fit ${product.isApproved ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50" : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50"}`}>
                                    {product.isApproved ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                    {language === "ar" ? (product.isApproved ? "تمت الموافقة" : "قيد المراجعة") : String(product.isApproved)}
                                </Badge>
                            </TableCell>

                            {/* Category */}
                            <TableCell>
                                {editingProductId === product._id ? (
                                    <Select
                                        value={editingProductData.category || (typeof product.category === "object" ? product.category._id : product.category)}
                                        onValueChange={(v) => onEditDataChange({ ...editingProductData, category: v })}
                                    >
                                        <SelectTrigger className="h-9 rounded-lg border-slate-200 text-sm w-36"><SelectValue /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full text-xs">
                                        {typeof product.category === "object" ? product.category.name : product.category}
                                    </Badge>
                                )}
                            </TableCell>

                            {/* Sold */}
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm text-slate-700">
                                    {product.sold}
                                    {product.sold > 50 && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                                </div>
                            </TableCell>

                            {/* Rating */}
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm text-slate-700">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    {product?.ratings?.average.toFixed(1)}
                                </div>
                            </TableCell>

                            {/* Rating count */}
                            <TableCell className="text-sm text-slate-600">{product?.ratings?.count}</TableCell>

                            {/* Created at */}
                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                {new Date(product.createdAt).toLocaleDateString(language === "ar" ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                                {editingProductId === product._id ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={onCancelEdit} className="h-8 rounded-lg text-xs">
                                            {language === "ar" ? "إلغاء" : "Cancel"}
                                        </Button>
                                        <Button size="sm" onClick={() => onUpdate(product._id)} disabled={updatingProductId === product._id} className="h-8 rounded-lg text-xs">
                                            {updatingProductId === product._id
                                                ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />{language === "ar" ? "جاري الحفظ..." : "Saving..."}</>
                                                : <><Save className="h-3 w-3 mr-1" />{language === "ar" ? "حفظ" : "Save"}</>}
                                        </Button>
                                    </div>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuLabel className="text-xs text-slate-500">{language === "ar" ? "الإجراءات" : "Actions"}</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/products/${product._id}`} className="flex items-center cursor-pointer text-sm">
                                                    <Eye className="h-4 w-4 mr-2" />{language === "ar" ? "عرض" : "View"}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(product)} className="text-sm">
                                                <Edit className="h-4 w-4 mr-2" />{language === "ar" ? "تعديل" : "Edit"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600 focus:text-red-700 text-sm" onClick={() => onDelete(product._id)}>
                                                <Trash className="h-4 w-4 mr-2" />{language === "ar" ? "حذف" : "Delete"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}