"use client";

import { useMemo } from "react";
import { useLanguage } from "@/components/language-provider";
import { Loader2, Search, Crown, Star, TrendingUp, Gift } from "lucide-react";
import PaginationControls from "@/components/pagination-controls";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LoyaltyTabProps {
  loyaltyUsers: any[];
  loadingLoyalty: boolean;
  errorLoyalty: string | null;
  loyaltyPage: number;
  loyaltyPages: number;
  setLoyaltyPage: (page: number) => void;
  loyaltyTierFilter: string;
  setLoyaltyTierFilter: (tier: string) => void;
  loyaltySearchQuery: string;
  setLoyaltySearchQuery: (q: string) => void;
  selectedLoyaltyUser: any | null;
  setSelectedLoyaltyUser: (u: any | null) => void;
  adjustDialogOpen: boolean;
  setAdjustDialogOpen: (open: boolean) => void;
  adjustPoints: string;
  setAdjustPoints: (v: string) => void;
  adjustNotes: string;
  setAdjustNotes: (v: string) => void;
  adjusting: boolean;
  handleLoyaltySearch: () => void;
  handleAdjustPoints: () => void;
}

export function LoyaltyTab({
  loyaltyUsers, loadingLoyalty, errorLoyalty, loyaltyPage, loyaltyPages,
  setLoyaltyPage, loyaltyTierFilter, setLoyaltyTierFilter, loyaltySearchQuery,
  setLoyaltySearchQuery, selectedLoyaltyUser, setSelectedLoyaltyUser,
  adjustDialogOpen, setAdjustDialogOpen, adjustPoints, setAdjustPoints,
  adjustNotes, setAdjustNotes, adjusting, handleLoyaltySearch, handleAdjustPoints,
}: LoyaltyTabProps) {
  const { language, isArabic } = useLanguage();

  // const {
  //   loyaltyUsers,
  //   loadingLoyalty,
  //   errorLoyalty,
  //   loyaltyPage,
  //   loyaltyPages,
  //   setLoyaltyPage,
  //   loyaltyTierFilter,
  //   setLoyaltyTierFilter,
  //   loyaltySearchQuery,
  //   setLoyaltySearchQuery,
  //   selectedLoyaltyUser,
  //   setSelectedLoyaltyUser,
  //   adjustDialogOpen,
  //   setAdjustDialogOpen,
  //   adjustPoints,
  //   setAdjustPoints,
  //   adjustNotes,
  //   setAdjustNotes,
  //   adjusting,
  //   handleLoyaltySearch,
  //   handleAdjustPoints,
  // } = useAdminDashboard();

  const tierOptions = useMemo(
    () => [
      { value: "all", labelAr: "الكل", labelEn: "All" },
      { value: "bronze", labelAr: "برونزي", labelEn: "Bronze" },
      { value: "silver", labelAr: "فضي", labelEn: "Silver" },
      { value: "gold", labelAr: "ذهبي", labelEn: "Gold" },
      { value: "platinum", labelAr: "بلاتيني", labelEn: "Platinum" },
    ],
    []
  );

  const getTierLabel = (tier: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      bronze: { ar: "برونزي", en: "Bronze" },
      silver: { ar: "فضي", en: "Silver" },
      gold: { ar: "ذهبي", en: "Gold" },
      platinum: { ar: "بلاتيني", en: "Platinum" },
    };
    return map[tier]?.[isArabic ? "ar" : "en"] || tier;
  };

  const getTierClass = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "silver":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "platinum":
        return <Crown className="h-4 w-4" />;
      case "gold":
        return <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />;
      case "silver":
        return <Star className="h-4 w-4 fill-gray-400 text-gray-400" />;
      default:
        return <Star className="h-4 w-4 fill-orange-500 text-orange-500" />;
    }
  };

  const copy = {
    title: isArabic ? "برنامج الولاء" : "Loyalty Program",
    searchPlaceholder: isArabic ? "بحث بالاسم أو البريد..." : "Search by name or email...",
    searchButton: isArabic ? "بحث" : "Search",
    name: isArabic ? "الاسم" : "Name",
    email: isArabic ? "البريد الإلكتروني" : "Email",
    phone: isArabic ? "رقم الهاتف" : "Phone",
    tier: isArabic ? "المستوى" : "Tier",
    points: isArabic ? "النقاط" : "Points",
    totalEarned: isArabic ? "إجمالي المكتسب" : "Total Earned",
    totalRedeemed: isArabic ? "إجمالي المستبدل" : "Total Redeemed",
    adjust: isArabic ? "تعديل النقاط" : "Adjust Points",
    adjustTitle: isArabic ? "تعديل نقاط المستخدم" : "Adjust User Points",
    adjustDescription: isArabic ? "أضف أو خصم نقاط من رصيد المستخدم" : "Add or deduct points from user balance",
    pointsLabel: isArabic ? "عدد النقاط (استخدم قيمة سالبة للخصم)" : "Points amount (use negative value to deduct)",
    notesLabel: isArabic ? "ملاحظات" : "Notes",
    confirm: isArabic ? "تأكيد" : "Confirm",
    cancel: isArabic ? "إلغاء" : "Cancel",
    adjusting: isArabic ? "جاري التعديل..." : "Adjusting...",
    noUsers: isArabic ? "لا يوجد مستخدمين" : "No users found",
    loading: isArabic ? "جاري التحميل..." : "Loading...",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{copy.title}</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <Input
              placeholder={copy.searchPlaceholder}
              value={loyaltySearchQuery}
              onChange={(e) => setLoyaltySearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoyaltySearch()}
              className="w-full sm:w-64"
            />
            <Button onClick={handleLoyaltySearch} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={loyaltyTierFilter} onValueChange={setLoyaltyTierFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={copy.tier} />
            </SelectTrigger>
            <SelectContent>
              {tierOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {isArabic ? option.labelAr : option.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading */}
      {loadingLoyalty && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Error */}
      {errorLoyalty && !loadingLoyalty && (
        <div className="text-center py-10 text-destructive">
          {errorLoyalty}
        </div>
      )}

      {/* Users Grid */}
      {!loadingLoyalty && !errorLoyalty && loyaltyUsers.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          {copy.noUsers}
        </div>
      )}

      {!loadingLoyalty && !errorLoyalty && loyaltyUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loyaltyUsers.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4 space-y-3">
                {/* User Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">
                      {user.firstName} {user.lastName}
                    </p>
                    <Badge className={getTierClass(user.loyalty.tier)}>
                      <span className="flex items-center gap-1">
                        {getTierIcon(user.loyalty.tier)}
                        {getTierLabel(user.loyalty.tier)}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{copy.points}:</span>
                    <span className="font-bold">{user.loyalty.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      {copy.totalEarned}:
                    </span>
                    <span className="font-bold">{user.loyalty.totalEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gift className="h-3 w-3 text-blue-600" />
                      {copy.totalRedeemed}:
                    </span>
                    <span className="font-bold">{user.loyalty.totalRedeemed}</span>
                  </div>
                </div>

                {/* Adjust Button */}
                <Dialog open={adjustDialogOpen && selectedLoyaltyUser?._id === user._id} onOpenChange={(open) => {
                  setAdjustDialogOpen(open);
                  if (!open) setSelectedLoyaltyUser(null);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedLoyaltyUser(user)}
                    >
                      {copy.adjust}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{copy.adjustTitle}</DialogTitle>
                      <DialogDescription>
                        {copy.adjustDescription}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{copy.pointsLabel}</Label>
                        <Input
                          type="number"
                          value={adjustPoints}
                          onChange={(e) => setAdjustPoints(e.target.value)}
                          placeholder={isArabic ? "مثال: 100 أو -50" : "e.g., 100 or -50"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{copy.notesLabel}</Label>
                        <Textarea
                          value={adjustNotes}
                          onChange={(e) => setAdjustNotes(e.target.value)}
                          placeholder={isArabic ? "سبب التعديل..." : "Reason for adjustment..."}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAdjustPoints}
                          disabled={adjusting}
                          className="flex-1"
                        >
                          {adjusting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {copy.adjusting}
                            </>
                          ) : (
                            copy.confirm
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAdjustDialogOpen(false);
                            setSelectedLoyaltyUser(null);
                          }}
                        >
                          {copy.cancel}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loadingLoyalty && !errorLoyalty && loyaltyPages > 1 && (
        <PaginationControls
          currentPage={loyaltyPage}
          totalPages={loyaltyPages}
          onPageChange={setLoyaltyPage}
        />
      )}
    </div>
  );
}
