// components/admin/OffersTab.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PaginationControls from "@/components/pagination-controls";
import { Loader2, Package, Check, X, Clock, Percent, DollarSign, Eye, Edit, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type OfferStatus = "active" | "expired" | "inactive";
type OfferType = "percentage" | "fixed" | "buy_x_get_y" | "free_shipping";

interface Offer {
  _id: string;
  title: string;
  description: string;
  type: OfferType;
  value: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  image: string;
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
}

interface OffersTabProps {
  offers: Offer[];
  loadingOffers: boolean;
  errorOffers: string | null;
  isArabic: boolean;
  pagination: { currentPage: number; totalPages: number };
  onPageChange: (page: number) => void;
  handleToggleOffer: (offerId: string) => void;
  handleDeleteOffer: (offerId: string) => void;
  fetchOffers?: () => Promise<any>;
}

export function OffersTab({
  offers,
  loadingOffers,
  errorOffers,
  isArabic,
  pagination,
  onPageChange,
  handleToggleOffer,
  handleDeleteOffer,
  fetchOffers
}: OffersTabProps) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleDeleteClick = async (offerId: string) => {
    setDeleteLoading(offerId);
    try {
      await handleDeleteOffer(offerId);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleClick = async (offerId: string) => {
    setToggleLoading(offerId);
    try {
      await handleToggleOffer(offerId);
    } finally {
      setToggleLoading(null);
    }
  };

  const getOfferStatus = (offer: Offer): OfferStatus => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);

    if (!offer.isActive) return 'inactive';
    if (now < start) return 'inactive';
    if (now > end) return 'expired';
    return 'active';
  };

  const getStatusBadge = (offer: Offer) => {
    const status = getOfferStatus(offer);
    switch (status) {
      case 'active':
        return {
          variant: "default" as const,
          color: "bg-green-100 text-green-800 hover:bg-green-100",
          icon: <Check className="h-3 w-3" />,
          text: isArabic ? "نشط" : "Active"
        };
      case 'expired':
        return {
          variant: "destructive" as const,
          color: "bg-red-100 text-red-800 hover:bg-red-100",
          icon: <X className="h-3 w-3" />,
          text: isArabic ? "منتهي" : "Expired"
        };
      case 'inactive':
        return {
          variant: "secondary" as const,
          color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
          icon: <Clock className="h-3 w-3" />,
          text: isArabic ? "غير نشط" : "Inactive"
        };
      default:
        return {
          variant: "secondary" as const,
          color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
          icon: <Clock className="h-3 w-3" />,
          text: status
        };
    }
  };

  const getTypeBadge = (type: OfferType) => {
    switch (type) {
      case 'percentage':
        return {
          icon: <Percent className="h-3 w-3" />,
          text: isArabic ? "نسبة مئوية" : "Percentage"
        };
      case 'fixed':
        return {
          icon: <DollarSign className="h-3 w-3" />,
          text: isArabic ? "مبلغ ثابت" : "Fixed"
        };
      case 'buy_x_get_y':
        return {
          icon: <Package className="h-3 w-3" />,
          text: isArabic ? "اشترِ واحصل" : "Buy X Get Y"
        };
      case 'free_shipping':
        return {
          icon: <Package className="h-3 w-3" />,
          text: isArabic ? "شحن مجاني" : "Free Shipping"
        };
      default:
        return {
          icon: <Package className="h-3 w-3" />,
          text: type
        };
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (activeFilter === 'all') return true;
    return getOfferStatus(offer) === activeFilter;
  });

  const statusFilters = [
    { value: 'all', label: isArabic ? 'الكل' : 'All' },
    { value: 'active', label: isArabic ? 'نشط' : 'Active' },
    { value: 'expired', label: isArabic ? 'منتهي' : 'Expired' },
    { value: 'inactive', label: isArabic ? 'غير نشط' : 'Inactive' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isArabic ? "إدارة العروض" : "Offers Management"}
        </h2>
        <Button
          onClick={() => router.push('/admin/offers/new')}
          className="bg-[#1a4fba] hover:bg-[#1640a0]"
        >
          <Plus className="h-4 w-4 ml-2" />
          {isArabic ? "عرض جديد" : "New Offer"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {statusFilters.map(filter => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">{isArabic ? "المعرف" : "ID"}</TableHead>
                <TableHead>{isArabic ? "العنوان" : "Title"}</TableHead>
                <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                <TableHead>{isArabic ? "القيمة" : "Value"}</TableHead>
                <TableHead>{isArabic ? "تاريخ البداية" : "Start Date"}</TableHead>
                <TableHead>{isArabic ? "تاريخ النهاية" : "End Date"}</TableHead>
                <TableHead>{isArabic ? "الاستخدام" : "Usage"}</TableHead>
                <TableHead className="w-[130px]">{isArabic ? "الحالة" : "Status"}</TableHead>
                <TableHead className="w-[200px]">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingOffers ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : errorOffers ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-destructive py-8">
                    {errorOffers}
                  </TableCell>
                </TableRow>
              ) : filteredOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {isArabic
                          ? `لا توجد عروض ${activeFilter !== 'all' ? `بحالة ${statusFilters.find(f => f.value === activeFilter)?.label}` : ''}`
                          : `No offers ${activeFilter !== 'all' ? `with ${activeFilter} status` : ''} found`
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOffers.map((offer) => {
                  const statusBadge = getStatusBadge(offer);
                  const typeBadge = getTypeBadge(offer.type);
                  const isLoading = toggleLoading === offer._id;
                  const isDeleting = deleteLoading === offer._id;

                  return (
                    <TableRow key={offer._id}>
                      <TableCell className="font-medium">
                        #{offer._id?.slice(-6) ?? 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{offer.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {offer.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 w-fit"
                        >
                          {typeBadge.icon}
                          <span>{typeBadge.text}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {offer.type === 'percentage' ? `${offer.value}%` : `${offer.value} EGP`}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(offer.startDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(offer.endDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {offer.usageCount}
                          {offer.usageLimit && ` / ${offer.usageLimit}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusBadge.variant}
                          className={`${statusBadge.color} flex items-center gap-1 w-fit`}
                        >
                          {statusBadge.icon}
                          <span>{statusBadge.text}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/offers/${offer._id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/offers/${offer._id}/edit`)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleClick(offer._id)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : offer.isActive ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(offer._id)}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}