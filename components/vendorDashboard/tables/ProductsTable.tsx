'use client';



import Link from "next/link";

import {

    CheckCircle,

    Clock,

    TrendingUp,

    Star,

    MoreHorizontal,

    Eye,

    Edit,

    Trash,

    Save,

    Loader2,

    Package,

} from "lucide-react";



import {

    Table,

    TableBody,

    TableCell,

    TableHead,

    TableHeader,

    TableRow

} from "@/components/ui/table";



import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {

    Select,

    SelectContent,

    SelectItem,

    SelectTrigger,

    SelectValue

} from "@/components/ui/select";



import {

    DropdownMenu,

    DropdownMenuContent,

    DropdownMenuItem,

    DropdownMenuLabel,

    DropdownMenuSeparator,

    DropdownMenuTrigger

} from "@/components/ui/dropdown-menu";



import { SafeImage } from "@/components/SafeImage";



interface ProductsTableProps {

    products: any[];

    language: string;

    categories: any[];

    editingProductId: string | null;

    editingProductData: any;

    updatingProductId: string | null;

    onEdit: (product: any) => void;

    onUpdate: (id: string) => void;

    onDelete: (id: string) => void;

    onCancelEdit: () => void;

    onEditDataChange: (data: any) => void;

}



export function ProductsTable({

    products,

    language,

    categories,

    editingProductId,

    editingProductData,

    updatingProductId,

    onEdit,

    onUpdate,

    onDelete,

    onCancelEdit,

    onEditDataChange

}: ProductsTableProps) {

    console.log(products,'2526');



    return (

        <div className="space-y-4">



            {/* Table Wrapper */}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">



                <div className="overflow-x-auto">



                    <Table>



                        {/* HEADER */}

                        <TableHeader>

                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">



                                <TableHead>{language === "ar" ? "المنتج" : "Product"}</TableHead>



                                <TableHead className="hidden md:table-cell">

                                    {language === "ar" ? "السعر" : "Price"}

                                </TableHead>



                                <TableHead className="hidden md:table-cell">

                                    {language === "ar" ? "المخزون" : "Stock"}

                                </TableHead>



                                <TableHead className="hidden md:table-cell">

                                    {language === "ar" ? "التقييم" : "Rating"}

                                </TableHead>



                                <TableHead>

                                    {language === "ar" ? "الحالة" : "Status"}

                                </TableHead>



                                <TableHead className="text-right">

                                    {language === "ar" ? "الإجراءات" : "Actions"}

                                </TableHead>



                            </TableRow>

                        </TableHeader>



                        {/* BODY */}

                        <TableBody>



                            {products.map((product) => (

                                <TableRow

                                    key={product._id}

                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"

                                >



                                    {/* PRODUCT */}

                                    <TableCell>



                                        <div className="flex items-center gap-3">



                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200">

                                                <SafeImage

                                                    src={product.images?.[0] || "/placeholder.svg"}

                                                    alt={product.title}

                                                    width={40}

                                                    height={40}

                                                    className="object-cover"

                                                />

                                            </div>



                                            <div className="flex flex-col">



                                                <span className="text-sm font-medium text-slate-800">

                                                    {product.title}

                                                </span>



                                                <span className="text-xs text-slate-400 md:hidden">

                                                    {product.price} EGP

                                                </span>



                                                <span className="text-xs text-slate-400">

                                                    ID: {product._id.slice(-6)}

                                                </span>



                                            </div>



                                        </div>



                                    </TableCell>



                                    {/* PRICE */}

                                    <TableCell className="hidden md:table-cell">

                                        <span className="font-medium text-sm">

                                            {product.price} EGP

                                        </span>

                                    </TableCell>



                                    {/* STOCK */}

                                    <TableCell className="hidden md:table-cell">



                                        <div className="flex items-center gap-2">



                                            <span className="text-sm">

                                                {product.quantity}

                                            </span>



                                            {product.quantity < 10 && (

                                                <Badge className="bg-red-50 text-red-600 text-xs">

                                                    Low

                                                </Badge>

                                            )}



                                        </div>



                                    </TableCell>



                                    {/* RATING */}

                                    <TableCell className="hidden md:table-cell">



                                        <div className="flex items-center gap-1 text-sm">



                                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />



                                            {product.ratingsAverage?.toFixed(1) || "0.0"}



                                        </div>



                                    </TableCell>



                                    {/* STATUS */}

                                    <TableCell>



                                        <Badge

                                            className={`text-xs rounded-full px-2 py-1 flex items-center gap-1 w-fit ${product.isApproved

                                                    ? "bg-green-50 text-green-700 border border-green-200"

                                                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"

                                                }`}

                                        >



                                            {product.isApproved ? (

                                                <CheckCircle className="h-3 w-3" />

                                            ) : (

                                                <Clock className="h-3 w-3" />

                                            )}



                                            {product.isApproved

                                                ? (language === "ar" ? "معتمد" : "Approved")

                                                : (language === "ar" ? "قيد المراجعة" : "Pending")

                                            }



                                        </Badge>



                                    </TableCell>



                                    {/* ACTIONS */}

                                    <TableCell className="text-right">



                                        <DropdownMenu>



                                            <DropdownMenuTrigger asChild>

                                                <Button

                                                    variant="ghost"

                                                    size="icon"

                                                    className="h-8 w-8 rounded-lg"

                                                >

                                                    <MoreHorizontal className="h-4 w-4" />

                                                </Button>

                                            </DropdownMenuTrigger>



                                            <DropdownMenuContent align="end" className="rounded-xl">



                                                <DropdownMenuLabel>

                                                    {language === "ar" ? "الإجراءات" : "Actions"}

                                                </DropdownMenuLabel>



                                                <DropdownMenuItem asChild>

                                                    <Link href={`/products/${product._id}`}>

                                                        <Eye className="h-4 w-4 mr-2" />

                                                        {language === "ar" ? "عرض" : "View"}

                                                    </Link>

                                                </DropdownMenuItem>



                                                <DropdownMenuItem onClick={() => onEdit(product)}>

                                                    <Edit className="h-4 w-4 mr-2" />

                                                    {language === "ar" ? "تعديل" : "Edit"}

                                                </DropdownMenuItem>



                                                <DropdownMenuSeparator />



                                                <DropdownMenuItem

                                                    className="text-red-600"

                                                    onClick={() => onDelete(product._id)}

                                                >

                                                    <Trash className="h-4 w-4 mr-2" />

                                                    {language === "ar" ? "حذف" : "Delete"}

                                                </DropdownMenuItem>



                                            </DropdownMenuContent>



                                        </DropdownMenu>



                                    </TableCell>



                                </TableRow>

                            ))}



                        </TableBody>



                    </Table>



                </div>



            </div>



        </div>

    );

}