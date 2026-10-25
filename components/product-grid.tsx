"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Filter,
  X,
  AlertCircle,
  Megaphone,
  Truck,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"
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
import { ProductCard } from "@/components/ProductCard"
import { ProductSearch } from "@/components/ProductSearch"
import { announcementService, categoryService, productService, wishlistService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthProvider"

// Types
interface Product {
  _id: string;
  title: string;
  description: string;
  images: string[];
  sizes: string[];
  colors: Array<{
    name: string;
    value: string;
    available: boolean;
  }>;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  quantity: number;
  sold: number;
  status: 'available' | 'sold';
  sellerPercentage: number;
  isApproved: boolean;
  category: {
    _id: string;
    name: string;
    nameEn: string;
  };
  isFeatured: boolean;
  ratings: {
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

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  productCount?: number;
}

interface Announcement {
  _id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  image?: string;
  type: "info" | "promotion" | "warning";
  status: "active" | "inactive";
  isMain: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  sort: string;
  searchQuery: string;
  sizes: string[];
  colors: string[];
  minRating: number;
}

// Constants
const MAX_PRICE = 3000;

const INITIAL_FILTERS: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, MAX_PRICE],
  sort: "newest",
  searchQuery: "",
  sizes: [],
  colors: [],
  minRating: 0
};

const RATING_OPTIONS = [4, 3, 2, 1];

const SORT_OPTIONS = [
  { value: "newest", label: { ar: "الأحدث", en: "Newest" } },
  { value: "priceHighToLow", label: { ar: "السعر: من الأعلى للأدنى", en: "Price: High to Low" } },
  { value: "priceLowToHigh", label: { ar: "السعر: من الأدنى للأعلى", en: "Price: Low to High" } },
  { value: "topRated", label: { ar: "الأعلى تقييماً", en: "Top Rated" } },
];

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case "info":
      return Truck;
    case "promotion":
      return Megaphone;
    case "warning":
      return AlertCircle;
    default:
      return Megaphone;
  }
};

const getAnnouncementStyle = (type: string) => {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300",
    promotion: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-300",
    warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300"
  };
  return styles[type as keyof typeof styles] || "bg-muted";
};

// Helper function to check if announcement is currently active
const isAnnouncementActive = (announcement: Announcement): boolean => {
  if (announcement.status !== "active") return false;

  const now = new Date();
  const startDate = new Date(announcement.startDate);
  const endDate = new Date(announcement.endDate);

  return now >= startDate && now <= endDate;
};

export function ProductGrid() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.id || user?._id);

  // استخراج قيمة البحث الأولية من الرابط
  const initialQuery = searchParams.get('q') || "";

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    ...INITIAL_FILTERS,
    searchQuery: initialQuery
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalPages: 1,
    totalProducts: 0
  });
  // Available sizes/colors/price bounds, computed on the DB for the active filters
  const [facets, setFacets] = useState<{ sizes: { size: string; count: number }[]; colors: { name: string; value: string; count: number }[] }>({ sizes: [], colors: [] });
  const [uiState, setUiState] = useState({
    isFilterOpen: false,
    isLoading: false,
    isInitialLoading: false,
    currentAnnouncement: 0,
    error: null as string | null,
    favorites: new Set<string>()
  });

  const fetchWishlistFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setUiState(prev => ({ ...prev, favorites: new Set() }));
      return;
    }

    try {
      const response = await wishlistService.getWishlist();
      const wishlistData = response.data?.data;
      const products = wishlistData?.products ?? [];

      const favoriteIds = products
        .map((item: any) => {
          const product = item?.product;
          if (!product) return null;
          if (typeof product === "string") return product;
          return product._id;
        })
        .filter(Boolean) as string[];

      setUiState(prev => ({ ...prev, favorites: new Set(favoriteIds) }));
    } catch (error) {
      console.error("Error fetching wishlist favorites:", error);
    }
  }, [isAuthenticated]);

  // Memoized values
  const hasActiveFilters = React.useMemo(() =>
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < MAX_PRICE ||
    filters.searchQuery.trim() !== "" ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.minRating > 0
    , [filters]);

  const activeAnnouncements = React.useMemo(() =>
    announcements.filter(announcement => isAnnouncementActive(announcement))
    , [announcements]);

  // Data fetching
  const fetchInitialData = useCallback(async () => {
    try {
      setUiState(prev => ({ ...prev, isInitialLoading: true, error: null }));

      const [categoriesResponse, announcementsResponse] = await Promise.all([
        categoryService.getCategories(),
        announcementService.getAnnouncements(),
      ]);

      setCategories(categoriesResponse.data || []);
      const nonMainAnnouncements = (announcementsResponse.data || []).filter((a: any) => !a.isMain);
      setAnnouncements(nonMainAnnouncements);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      const message = language === "ar" ? "فشل تحميل البيانات" : "Failed to load data";
      setUiState(prev => ({
        ...prev,
        error: message
      }));
      toast.error(message);
    } finally {
      setUiState(prev => ({ ...prev, isInitialLoading: false }));
    }
  }, [language]);

  const fetchProducts = useCallback(
    async (page: number, pageSize: number) => {
      try {
        setUiState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        let response: any;

        if (filters.searchQuery.trim()) {
          const searchParamsData: any = {
            q: filters.searchQuery.trim(),
            page,
            limit: pageSize,
          };

          if (filters.categories.length > 0) {
            searchParamsData.category = filters.categories[0];
          }

          if (filters.priceRange[0] > 0) {
            searchParamsData.minPrice = filters.priceRange[0];
          }

          if (filters.priceRange[1] < MAX_PRICE) {
            searchParamsData.maxPrice = filters.priceRange[1];
          }

          if (filters.sizes.length) searchParamsData.size = filters.sizes.join(",");
          if (filters.colors.length) searchParamsData.color = filters.colors.join(",");
          if (filters.minRating > 0) searchParamsData.minRating = filters.minRating;

          const sortMap: Record<string, string> = {
            newest: "latest",
            priceHighToLow: "price_desc",
            priceLowToHigh: "price_asc",
            topRated: "top_rated",
          };

          searchParamsData.sort =
            sortMap[filters.sort] || "relevance";

          response =
            await productService.advancedSearch(searchParamsData);

          setProducts(response.data.products || []);

          setPagination((prev) => ({
            ...prev,
            totalPages:
              response.data.pagination?.totalPages || 1,
            totalProducts:
              response.data.pagination?.total || 0,
          }));
        } else {
          const params: any = {
            page,
            limit: pageSize,
          };

          if (filters.categories.length > 0) {
            params.category = filters.categories[0];
          }

          if (filters.priceRange[0] > 0) {
            params.minPrice = filters.priceRange[0];
          }

          if (filters.priceRange[1] < MAX_PRICE) {
            params.maxPrice = filters.priceRange[1];
          }

          if (filters.sizes.length) params.size = filters.sizes.join(",");
          if (filters.colors.length) params.color = filters.colors.join(",");
          if (filters.minRating > 0) params.minRating = filters.minRating;

          params.sort =
            filters.sort === "newest"
              ? "-createdAt"
              : filters.sort === "priceHighToLow"
                ? "-price"
                : filters.sort === "priceLowToHigh"
                  ? "price"
                  : "-ratings.average";

          response =
            await productService.getProducts(params);

          setProducts(response.data.data || []);

          setPagination((prev) => ({
            ...prev,
            totalPages:
              response.data.pagination?.totalPages || 1,
            totalProducts:
              response.data.pagination?.total || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);

        const message =
          language === "ar"
            ? "فشل تحميل المنتجات"
            : "Failed to load products";

        setUiState((prev) => ({
          ...prev,
          error: message,
        }));
      } finally {
        setUiState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    [filters, language]
  );
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const params: any = {};
        if (filters.categories.length) params.category = filters.categories[0];
        const res = await productService.getProductFilterFacets(params);
        const data = res.data?.data;
        if (active && data) {
          setFacets({ sizes: data.sizes || [], colors: data.colors || [] });
        }
      } catch {
        /* facets are optional — the filters still work without them */
      }
    })();
    return () => { active = false; };
  }, [filters.categories]);

  useEffect(() => {
    fetchWishlistFavorites();
  }, [fetchWishlistFavorites]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Read search query from URL params and sync with state
  useEffect(() => {
    const searchQuery = searchParams.get("q") || "";

    setFilters((prev) => {
      if (prev.searchQuery === searchQuery) {
        return prev;
      }

      return {
        ...prev,
        searchQuery,
      };
    });

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [searchParams]);
  useEffect(() => {
    fetchProducts(
      pagination.page,
      pagination.pageSize
    );
  }, [
    fetchProducts,
    pagination.page,
    pagination.pageSize,
  ]);
  // Announcements rotation
  useEffect(() => {
    if (activeAnnouncements.length === 0) return;

    const interval = setInterval(() => {
      setUiState(prev => {
        if (activeAnnouncements.length === 0) return prev;
        const nextAnnouncement = (prev.currentAnnouncement + 1) % activeAnnouncements.length;
        return {
          ...prev,
          currentAnnouncement: nextAnnouncement
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeAnnouncements]);

  // Filter handlers
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // ✅ Single-select category logic: اختيار كاتيجوري واحدة بس، الضغط عليها تاني يمسحها
  const handleCategoryChange = useCallback((categoryId: string) => {
    if (categoryId === 'clear') {
      updateFilter('categories', []);
      return;
    }

    setFilters(prev => ({
      ...prev,
      categories: prev.categories[0] === categoryId ? [] : [categoryId]
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [updateFilter]);

  const handlePriceChange = useCallback((value: number[]) => {
    updateFilter('priceRange', value as [number, number]);
  }, [updateFilter]);

  const handleSortChange = useCallback((value: string) => {
    updateFilter('sort', value);
  }, [updateFilter]);

  const handleSearch = useCallback((query: string) => {
    updateFilter('searchQuery', query);
  }, [updateFilter]);

  const handleClearSearch = useCallback(() => {
    updateFilter('searchQuery', '');
  }, [updateFilter]);

  const toggleArrayFilter = useCallback((key: 'sizes' | 'colors', value: string) => {
    setFilters(prev => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter(v => v !== value) : [...list, value]
      };
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // ✅ Render helper جديد: single-select category filter (زر واحد مختار بس)
  const renderCategoryFilter = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{t("categories")}</h3>
        {filters.categories.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => handleCategoryChange('clear')}>
            <X className="h-4 w-4 mr-1" />
            {language === "ar" ? "مسح" : "Clear"}
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {categories.map((category) => {
          const isSelected = filters.categories[0] === category._id;
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => handleCategoryChange(category._id)}
              className="flex items-center gap-2 w-full text-left rtl:text-right"
            >
              <span
                className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-primary" : "border-gray-300"
                  }`}
              >
                {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              <Label className="flex-1 text-sm font-normal cursor-pointer">
                {language === "ar" ? category.name : category.nameEn || category.name}
                {category.productCount !== undefined && ` (${category.productCount})`}
              </Label>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderFacetFilters = () => (
    <div className="space-y-6">
      {/* Active filter chips — each one removable on its own */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.sizes.map(size => (
            <Badge key={`chip-size-${size}`} variant="secondary" className="gap-1">
              {size}
              <button type="button" onClick={() => toggleArrayFilter('sizes', size)} aria-label={`remove ${size}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.colors.map(color => (
            <Badge key={`chip-color-${color}`} variant="secondary" className="gap-1">
              {facets.colors.find(c => c.value === color)?.name || color}
              <button type="button" onClick={() => toggleArrayFilter('colors', color)} aria-label={`remove ${color}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRating}+ ★
              <button type="button" onClick={() => updateFilter('minRating', 0)} aria-label="remove rating">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Sizes — only sizes that exist with stock */}
      {facets.sizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">{language === "ar" ? "المقاس" : "Size"}</h3>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map(({ size, count }) => {
              const selected = filters.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleArrayFilter('sizes', size)}
                  className={`min-w-11 rounded-md border px-2 py-1 text-sm transition ${selected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}
                >
                  {size}
                  <span className="ms-1 text-[10px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors — the real colors of the products, with their swatch */}
      {facets.colors.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">{language === "ar" ? "اللون" : "Color"}</h3>
          <div className="flex flex-wrap gap-2">
            {facets.colors.map(({ name, value, count }) => {
              const selected = filters.colors.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleArrayFilter('colors', value)}
                  title={`${name} (${count})`}
                  className={`flex items-center gap-1 rounded-full border p-1 pe-2 text-xs transition ${selected ? "border-primary" : "hover:border-primary"}`}
                >
                  <span
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: value }}
                    aria-hidden
                  />
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="font-medium">{language === "ar" ? "التقييم" : "Rating"}</h3>
        <div className="space-y-1">
          {RATING_OPTIONS.map(rating => (
            <button
              key={rating}
              type="button"
              onClick={() => updateFilter('minRating', filters.minRating === rating ? 0 : rating)}
              className="flex items-center gap-2 text-sm"
            >
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${filters.minRating === rating ? "border-primary" : "border-gray-300"}`}>
                {filters.minRating === rating && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              <span>{rating} ★ {language === "ar" ? "وأعلى" : "& up"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden shadow-md animate-pulse">
          <div className="aspect-square bg-muted"></div>
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-muted rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-5 bg-muted rounded w-1/2"></div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">
        {language === "ar" ? "لا توجد منتجات" : "No products found"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {language === "ar" ? "لا توجد منتجات تطابق معاييرك" : "No products match your criteria"}
      </p>
      <Button variant="outline" onClick={resetFilters}>
        {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
      </Button>
    </div>
  );

  const renderPagination = () => {
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const totalPages = pagination.totalPages;
      const currentPage = pagination.page;

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex flex-col items-center gap-4 border-t pt-6">
        {/* Results info */}
        <div className="text-sm text-muted-foreground">
          {language === "ar"
            ? `عرض ${(pagination.page - 1) * pagination.pageSize + 1}-${Math.min(pagination.page * pagination.pageSize, pagination.totalProducts)} من ${pagination.totalProducts} منتج`
            : `Showing ${(pagination.page - 1) * pagination.pageSize + 1}-${Math.min(pagination.page * pagination.pageSize, pagination.totalProducts)} of ${pagination.totalProducts} products`
          }
        </div>

        {/* Mobile Pagination */}
        <div className="flex items-center gap-2 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-3">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop Pagination */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            {language === "ar" ? "السابق" : "Previous"}
          </Button>

          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-1 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum as number)}
                className="w-10"
              >
                {pageNum}
              </Button>
            )
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            {language === "ar" ? "التالي" : "Next"}
          </Button>
        </div>
      </div>
    );
  };

  const renderAnnouncement = () => {
    if (activeAnnouncements.length === 0) return null;

    const currentAnnouncement = activeAnnouncements[uiState.currentAnnouncement];
    const IconComponent = getAnnouncementIcon(currentAnnouncement.type);

    return (
      <Alert className={`transition-all duration-500 ${getAnnouncementStyle(currentAnnouncement.type)}`}>
        <IconComponent className="h-4 w-4" />
        <AlertDescription>
          {language === "ar" ? currentAnnouncement.title : currentAnnouncement.titleEn}
        </AlertDescription>
      </Alert>
    );
  };

  // Show initial loading state
  if (uiState.isInitialLoading) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          {/* Search Bar (filters + sort sit right below it) */}
          {/* Search Bar */}
          <ProductSearch
            onSearch={handleSearch}
            onClear={handleClearSearch}
            className="w-full"
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {language === "ar" ? "جميع المنتجات" : "All Products"}
              </h2>
              {!uiState.isLoading && (
                <p className="text-sm text-muted-foreground">
                  {pagination.totalProducts} {language === "ar" ? "نتيجة مطابقة" : "matching results"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Mobile Filter Trigger */}
              <Sheet open={uiState.isFilterOpen} onOpenChange={(open: boolean) => setUiState(prev => ({ ...prev, isFilterOpen: open }))}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 md:hidden">
                    <Filter className="h-4 w-4" />
                    {language === "ar" ? "الفلاتر" : "Filters"}
                  </Button>
                </SheetTrigger>

                <SheetContent side={language === "ar" ? "right" : "left"} className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>{t("categories")}</SheetTitle>
                  </SheetHeader>

                  <div className="py-4">
                    <Accordion type="multiple" className="w-full" defaultValue={["categories", "price"]}>
                      {/* Categories Accordion */}
                      <AccordionItem value="categories">
                        <AccordionTrigger>{t("categories")}</AccordionTrigger>
                        <AccordionContent>
                          {renderCategoryFilter()}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="facets">
                        <AccordionTrigger>{language === "ar" ? "المقاس واللون والتقييم" : "Size, color, rating"}</AccordionTrigger>
                        <AccordionContent>{renderFacetFilters()}</AccordionContent>
                      </AccordionItem>

                      {/* Price Accordion */}
                      <AccordionItem value="price">
                        <AccordionTrigger>{t("price")}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <Slider
                              value={filters.priceRange}
                              max={MAX_PRICE}
                              step={50}
                              onValueChange={handlePriceChange}
                            />
                            <div className="flex items-center justify-between">
                              <span>{filters.priceRange[0]} {language === "ar" ? "ج.م" : "EGP"}</span>
                              <span>{filters.priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <SheetFooter className="flex flex-col gap-2">
                    {hasActiveFilters && (
                      <SheetClose asChild>
                        <Button variant="outline" onClick={resetFilters} className="w-full">
                          {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                        </Button>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Button className="w-full">
                        {language === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <Select value={filters.sort} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder={t("sort")} />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {language === "ar" ? option.label.ar : option.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block space-y-6">
            {renderCategoryFilter()}

            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="font-medium">{t("price")}</h3>
              <div className="space-y-4">
                <Slider
                  value={filters.priceRange}
                  max={MAX_PRICE}
                  step={50}
                  onValueChange={handlePriceChange}
                />
                <div className="flex items-center justify-between">
                  <span>{filters.priceRange[0]} {language === "ar" ? "ج.م" : "EGP"}</span>
                  <span>{filters.priceRange[1]} {language === "ar" ? "ج.م" : "EGP"}</span>
                </div>
              </div>
            </div>

            {/* Sizes / Colors / Rating */}
            {renderFacetFilters()}

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters} className="w-full">
                {language === "ar" ? "مسح جميع الفلاتر" : "Clear all filters"}
              </Button>
            )}
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            {/* Announcement */}
            {renderAnnouncement()}

            {/* Error State */}
            {uiState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uiState.error}</AlertDescription>
              </Alert>
            )}

            {/* Products Grid */}
            {uiState.isLoading ? (
              renderLoadingSkeleton()
            ) : products.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products?.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    language={language}
                    isFavorite={uiState.favorites.has(product._id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!uiState.isLoading && products.length > 0 && renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
}