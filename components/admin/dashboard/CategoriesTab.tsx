import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash, Package } from "lucide-react";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";

interface CategoriesTabProps {
    categories: any[];
    loading: boolean;
    error: string | null;
    newCategory: any;
    setNewCategory: (category: any) => void;
    isCreating: boolean;
    setIsCreating: (creating: boolean) => void;
    editingCategory: any;
    setEditingCategory: (category: any) => void;
    handleCreateCategory: (event: React.FormEvent) => void;
    handleEditCategory: (category: any) => void;
    handleDeleteCategory: (categoryId: string) => void;
    isArabic: boolean;
    showSpinner?: boolean;
    fetchCategories?: () => Promise<any>;
}

export function CategoriesTab({
    categories,
    loading,
    error,
    newCategory,
    setNewCategory,
    isCreating,
    setIsCreating,
    editingCategory,
    setEditingCategory,
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
    showSpinner,
    fetchCategories,
    isArabic
}: CategoriesTabProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCategory((prev: Record<string, unknown>) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatusChange = (value: string) => {
        setNewCategory((prev: Record<string, unknown>) => ({
            ...prev,
            status: value
        }));
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
                <div className="w-full md:w-auto">
                    <h2 className="text-lg md:text-xl font-bold">{isArabic ? "إدارة التصنيفات" : "Category Management"}</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        {isArabic
                            ? "إدارة التصنيفات والتحكم في عرضها في المتجر"
                            : "Manage categories and control how they appear in your store"}
                    </p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    {isArabic ? "إضافة تصنيف" : "Add Category"}
                </Button>
            </div>

            {isCreating && (
                <Card className="mb-4 md:mb-6">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg">{isArabic ? "إنشاء تصنيف جديد" : "Create New Category"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        <form onSubmit={handleCreateCategory} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="name">{isArabic ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={newCategory.name}
                                    onChange={handleInputChange}
                                    placeholder={isArabic ? "أدخل الاسم بالعربية" : "Enter name in Arabic"}
                                    required
                                />
                            </div>
                    
                            <div>
                                <Label htmlFor="description">{isArabic ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    value={newCategory.description}
                                    onChange={handleInputChange}
                                    placeholder={isArabic ? "أدخل الوصف بالعربية" : "Enter description in Arabic"}
                                />
                            </div>
                
                            <div>
                                <Label htmlFor="image">{isArabic ? "صورة التصنيف" : "Category Image"}</Label>
                                <ImageUploader onUpload={(url) => setNewCategory({ ...newCategory, image: url })} />
                            </div>
                            <div>
                                <Label htmlFor="status">{isArabic ? "الحالة" : "Status"}</Label>
                                <Select value={newCategory.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isArabic ? "اختر الحالة" : "Select status"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
                                        <SelectItem value="inactive">{isArabic ? "غير نشط" : "Inactive"}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                                <Button variant="outline" onClick={() => setIsCreating(false)} className="w-full md:w-auto">
                                    {isArabic ? "إلغاء" : "Cancel"}
                                </Button>
                                <Button type="submit" disabled={!newCategory.name} className="w-full md:w-auto">
                                    {isArabic ? "إنشاء" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {editingCategory && (
                <Card className="mb-4 md:mb-6">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg">{isArabic ? "تعديل التصنيف" : "Edit Category"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="edit-name">{isArabic ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
                                <Input
                                    id="edit-name"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-nameEn">{isArabic ? "الاسم (إنجليزي)" : "Name (English)"}</Label>
                                <Input
                                    id="edit-nameEn"
                                    value={editingCategory.nameEn}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">{isArabic ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                                <Input
                                    id="edit-description"
                                    value={editingCategory.description}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-descriptionEn">{isArabic ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
                                <Input
                                    id="edit-descriptionEn"
                                    value={editingCategory.descriptionEn}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, descriptionEn: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="image">{isArabic ? "صورة التصنيف" : "Category Image"}</Label>
                                <ImageUploader onUpload={(url) => setEditingCategory({ ...editingCategory, image: url })} />
                            </div>
                            <div>
                                <Label htmlFor="edit-status">{isArabic ? "الحالة" : "Status"}</Label>
                                <Select
                                    value={editingCategory.status}
                                    onValueChange={(value) => setEditingCategory({ ...editingCategory, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
                                        <SelectItem value="inactive">{isArabic ? "غير نشط" : "Inactive"}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                                <Button variant="outline" onClick={() => setEditingCategory(null)} className="w-full md:w-auto">
                                    {isArabic ? "إلغاء" : "Cancel"}
                                </Button>
                                <Button onClick={() => handleEditCategory(editingCategory)} className="w-full md:w-auto">
                                    {isArabic ? "تحديث التصنيف" : "Update Category"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="text-destructive mb-4">{error}</div>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        {isArabic ? "إعادة المحاولة" : "Try Again"}
                    </Button>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-medium mb-2">
                        {isArabic ? "لا توجد تصنيفات" : "No Categories Found"}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {isArabic
                            ? "لم يتم العثور على أي تصنيفات. ابدأ بإضافة تصنيف جديد."
                            : "No categories found. Start by adding a new category."}
                    </p>
                    <Button onClick={() => setIsCreating(true)}>
                        {isArabic ? "إضافة تصنيف" : "Add Category"}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {categories.map((category: any) => (
                            <Card key={category._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="p-3 md:p-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm md:text-lg line-clamp-2">
                                            {isArabic ? category.name : category.nameEn}
                                        </CardTitle>
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                                            {category.image ? (
                                                <Image
                                                    src={category.image}
                                                    alt={isArabic ? category.name : category.nameEn}
                                                    width={40}
                                                    height={40}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <Package className="h-6 w-6 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 md:p-6">
                                    <div className="space-y-3">
                                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                            {isArabic ? category.description : category.descriptionEn || "-"}
                                        </p>
                                        <Badge variant={category.status === "active" ? "default" : "secondary"}>
                                            {isArabic ? (category.status === "active" ? "نشط" : "غير نشط") : category.status}
                                        </Badge>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(category.createdAt).toLocaleDateString()}
                                            </span>
                                            <div className="flex space-x-2 w-full md:w-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingCategory(category)}
                                                    className="flex-1 md:flex-none"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive flex-1 md:flex-none"
                                                    onClick={() => handleDeleteCategory(category._id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 md:mt-8">
                        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{isArabic ? "جميع التصنيفات" : "All Categories"}</h3>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs md:text-sm">{isArabic ? "المعرف" : "ID"}</TableHead>
                                            <TableHead className="text-xs md:text-sm">{isArabic ? "اسم التصنيف" : "Category Name"}</TableHead>
                                            <TableHead className="text-xs md:text-sm">{isArabic ? "الوصف" : "Description"}</TableHead>
                                            <TableHead className="text-xs md:text-sm">{isArabic ? "الحالة" : "Status"}</TableHead>
                                            <TableHead className="text-xs md:text-sm">{isArabic ? "تاريخ الإنشاء" : "Created At"}</TableHead>
                                            <TableHead className="text-xs md:text-sm">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((category: any) => (
                                            <TableRow key={category._id}>
                                                <TableCell className="font-medium text-xs md:text-sm">#{category._id.substring(0, 6)}</TableCell>
                                                <TableCell className="text-xs md:text-sm">
                                                    <div className="font-medium">
                                                        {isArabic ? category.name : category.nameEn}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs md:text-sm">
                                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                                        {isArabic ? category.description : category.descriptionEn || "-"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={category.status === "active" ? "default" : "secondary"}>
                                                        {isArabic ? (category.status === "active" ? "نشط" : "غير نشط") : category.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(category.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-xs md:text-sm">
                                                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingCategory(category)}
                                                            className="w-full md:w-auto"
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            {isArabic ? "تعديل" : "Edit"}
                                                        </Button>
                                                        <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive w-full md:w-auto"
                                                        onClick={() => handleDeleteCategory(category._id)}
                                                    >
                                                        <Trash className="h-4 w-4 mr-1" />
                                                        {isArabic ? "حذف" : "Delete"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}