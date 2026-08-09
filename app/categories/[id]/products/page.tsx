"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Filter, AlertCircle, Megaphone, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { announcementService, categoryService, productService } from "@/lib/api"
import { ProductCard } from "@/components/ProductCard" 

// Define Product type
interface Product {
  brand?: string | { _id: string; name: string };
  _id: string;
  title: string;
  description: string;
  images: string[];
  sizes: string[];
  colors?: { name: string; value: string; available: boolean }[];
  price: number;
  discountPercentage?: number;
  discountedPrice?: number;
  quantity: number;
  status: 'available' | 'sold';
  sellerPercentage: number;
  isApproved: boolean;
  isTrusted?: boolean;
  category: {
    _id: string;
    name: string;
    nameEn: string;
  };
  isFeatured: boolean;
  sold?: number;
  ratings?: {
    average: number;
    count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  image?: string;
  isMain: boolean;
  status: string;
  link?: string;
}

export default function CategoryProductsGrid() {
  const { language, t } = useLanguage();
  const params = useParams();
  const rawCategoryParam = params?.id as string | string[] | undefined;
  const categoryId = Array.isArray(rawCategoryParam) ? rawCategoryParam[0] : rawCategoryParam;

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; count: number }[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Fetch category details
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoryId) return;

      setIsLoading(true);
      setError(null);
      try {
        const categoryResponse = await categoryService.getCategoryById(categoryId);
        setCategory(categoryResponse.data);
      } catch (error: any) {
        console.error("Error fetching category data:", error);
        setError(language === "ar" ? "خطأ في جلب بيانات الفئة" : "Error fetching category data");
        toast.error(language === "ar" ? "خطأ في جلب بيانات الفئة" : "Error fetching category data");
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId, language]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await announcementService.getAnnouncements();
        setAnnouncements(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setAnnouncements([]);
      }
    };

    fetchAnnouncements();
  }, []);

  // Rotate announcements safely
  useEffect(() => {
    if (!announcements.length) return;

    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements]);

  // Fetch products when filters change
  const fetchCategoryProducts = async () => {
    if (!categoryId) return;

    setIsLoading(true);
    try {
      const queryParams = {
        page,
        limit: pageSize,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort: sortOption === "newest" ? "-createdAt" :
          sortOption === "priceHighToLow" ? "-price" :
            sortOption === "priceLowToHigh" ? "price" :
              sortOption === "topRated" ? "-ratings.average" : "-createdAt",
      };

      const response = await productService.getProductsByCategory(categoryId, queryParams);
      if (response.data) {
        const rawData = response.data;
        const fetchedProducts: Product[] = rawData.data || [];
        setProducts(fetchedProducts);

        // Derive brands list with counts
        const brandMap: Record<string, { id: string; name: string; count: number }> = {};
        fetchedProducts.forEach((p) => {
          const brandName = typeof p.brand === "string" ? p.brand : p.brand?.name;
          if (brandName) {
            if (!brandMap[brandName]) {
              brandMap[brandName] = { id: brandName, name: brandName, count: 0 };
            }
            brandMap[brandName].count += 1;
          }
        });

        setBrands(Object.values(brandMap));

        const pagination = rawData?.pagination;
        setTotalProducts(pagination?.total ?? fetchedProducts.length);
        setTotalPages(pagination?.pages ?? pagination?.totalPages ?? 1);
      }
    } catch (error: any) {
      console.error("Error fetching category products:", error);
      setError(language === "ar" ? "خطأ في جلب المنتجات" : "Error fetching products");
      toast.error(language === "ar" ? "خطأ في جلب المنتجات" : "Error fetching products");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products when filters or pagination changes
  useEffect(() => {
    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [selectedBrands, priceRange, sortOption, page, categoryId]);

  const handleBrandChange = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
    setPage(1);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 10000]);
    setSortOption("newest");
    setPage(1);
  };

  return (
    <div className="py-6">
      <div className="flex flex-col gap-6">
        {/* Category Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {category ? (language === "ar" ? category.name : category.nameEn) : (language === "ar" ? "الفئة" : "Category")}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {language === "ar"
                  ? `عرض ${totalProducts} منتج في هذه الفئة`
                  : `Showing ${totalProducts} products in this category`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 md:hidden">
                    <Filter className="h-4 w-4" />
                    {language === "ar" ? "الفلاتر" : "Filters"}
                  </Button>
                </SheetTrigger>
                <SheetContent side={language === "ar" ? "right" : "left"} className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>{language === "ar" ? "الفلاتر" : "Filters"}</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <Accordion type="multiple" className="w-full" defaultValue={["brands", "price"]}>
                      <AccordionItem value="brands">
                        {/* Brands filter content can go here if desired */}
                      </AccordionItem>
                      <AccordionItem value="price">
                        <AccordionTrigger>{language === "ar" ? "السعر" : "Price"}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <Slider
                              value={priceRange}
                              max={10000}
                              step={50}
                              onValueChange={handlePriceChange}
                            />
                            <div className="flex items-center justify-between">
                              <span>
                                {priceRange[0]} {language === "ar" ? "ج.م" : "EGP"}
                              </span>
                              <span>
                                {priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}
                              </span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button variant="outline" onClick={resetFilters} className="w-full">
                        {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="w-full">{language === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder={language === "ar" ? "ترتيب حسب" : "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{language === "ar" ? "الأحدث" : "Newest"}</SelectItem>
                  <SelectItem value="priceHighToLow">{language === "ar" ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</SelectItem>
                  <SelectItem value="priceLowToHigh">{language === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</SelectItem>
                  <SelectItem value="topRated">{language === "ar" ? "الأعلى تقييماً" : "Top Rated"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Filters Sidebar */}
          <div className="hidden md:block space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={selectedBrands.includes(brand.name)}
                      onCheckedChange={() => handleBrandChange(brand.name)}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="flex-1 text-sm font-normal">
                      {brand.name} ({brand.count})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">{language === "ar" ? "السعر" : "Price"}</h3>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  max={10000}
                  step={50}
                  onValueChange={handlePriceChange}
                />
                <div className="flex items-center justify-between">
                  <span>
                    {priceRange[0]} {language === "ar" ? "ج.م" : "EGP"}
                  </span>
                  <span>
                    {priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}
                  </span>
                </div>
              </div>
            </div>
            {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Button variant="outline" onClick={resetFilters} className="w-full">
                {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              </Button>
            )}
          </div>

          {/* Products Grid */}
          <div className="space-y-6">
            {/* Announcements Section */}
            {announcements.length > 0 && (
              <Alert className="transition-all duration-500 border-primary/20">
                <Megaphone className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {announcements[currentAnnouncement]?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {announcements[currentAnnouncement]?.content}
                      </p>
                    </div>
                    {announcements[currentAnnouncement]?.link && (
                      <Link
                        href={announcements[currentAnnouncement].link!}
                        className="text-primary text-sm font-medium"
                      >
                        {language === "ar" ? "عرض" : "View"}
                      </Link>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error state */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-lg shadow-sm animate-pulse bg-white">
                    <div className="aspect-square bg-muted"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                      <div className="h-8 bg-muted rounded w-full mt-3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === "ar" ? "لا توجد منتجات" : "No products found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === "ar"
                    ? "لا توجد منتجات في هذه الفئة حالياً"
                    : "No products available in this category at the moment"
                  }
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      language={language}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-6">
                    <div className="flex flex-1 items-center justify-between sm:hidden">
                      <Button
                        variant="outline"
                        className="-ml-px"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                      </span>
                      <Button
                        variant="outline"
                        className="-ml-px"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="hidden sm:flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        {language === "ar" ? "السابق" : "Previous"}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        {language === "ar" ? "التالي" : "Next"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}  