"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Star, TrendingUp, Gift, History, Crown } from "lucide-react";
import { toast } from "sonner";
import PaginationControls from "@/components/pagination-controls";
import Link from "next/link";
import { loyaltyService } from "@/lib/api";
import { Input } from "@/components/ui/input";

interface LoyaltyData {
  points: number;
  tier: string;
  totalEarned: number;
  totalRedeemed: number;
}

interface Transaction {
  _id: string;
  type: 'earned' | 'redeemed' | 'adjusted';
  points: number;
  source: string;
  description: string;
  balanceAfter: number;
  tierBefore?: string;
  tierAfter?: string;
  createdAt: string;
}

export default function LoyaltyPage() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");

  const copy = isArabic
    ? {
      title: "برنامج الولاء",
      description: "اكسب نقاط مع كل طلب واستبدلها بخصومات",
      currentPoints: "نقاطك الحالية",
      tier: "المستوى",
      totalEarned: "إجمالي النقاط المكتسبة",
      totalRedeemed: "إجمالي النقاط المستبدلة",
      pointsToNextTier: "نقاط للمستوى التالي",
      maxTier: "لقد وصلت لأعلى مستوى!",
      transactions: "سجل المعاملات",
      earned: "مكتسبة",
      redeemed: "مستبدلة",
      adjusted: "تعديل",
      orderCompletion: "إكمال الطلب",
      redemption: "استبدال",
      manualAdjustment: "تعديل يدوي",
      balanceAfter: "الرصيد بعد",
      redeemPoints: "استبدال نقاط",
      redeemDescription: "استبدل نقاطك للحصول على خصم على طلبك القادم",
      pointsToRedeem: "عدد النقاط",
      confirmRedeem: "تأكيد الاستبدال",
      loading: "جاري التحميل...",
      error: "حدث خطأ أثناء تحميل البيانات",
      successRedeem: "تم استبدال النقاط بنجاح",
      backToHome: "العودة للرئيسية",
      tierNames: {
        bronze: "برونزي",
        silver: "فضي",
        gold: "ذهبي",
        platinum: "بلاتيني"
      },
      tierColors: {
        bronze: "bg-orange-100 text-orange-800 border-orange-200",
        silver: "bg-gray-100 text-gray-800 border-gray-200",
        gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
        platinum: "bg-purple-100 text-purple-800 border-purple-200"
      }
    }
    : {
      title: "Loyalty Program",
      description: "Earn points with every order and redeem for discounts",
      currentPoints: "Current Points",
      tier: "Tier",
      totalEarned: "Total Points Earned",
      totalRedeemed: "Total Points Redeemed",
      pointsToNextTier: "Points to Next Tier",
      maxTier: "You've reached the highest tier!",
      transactions: "Transaction History",
      earned: "Earned",
      redeemed: "Redeemed",
      adjusted: "Adjusted",
      orderCompletion: "Order Completion",
      redemption: "Redemption",
      manualAdjustment: "Manual Adjustment",
      balanceAfter: "Balance After",
      redeemPoints: "Redeem Points",
      redeemDescription: "Redeem your points for a discount on your next order",
      pointsToRedeem: "Points to Redeem",
      confirmRedeem: "Confirm Redemption",
      loading: "Loading...",
      error: "Error loading data",
      successRedeem: "Points redeemed successfully",
      backToHome: "Back to Home",
      tierNames: {
        bronze: "Bronze",
        silver: "Silver",
        gold: "Gold",
        platinum: "Platinum"
      },
      tierColors: {
        bronze: "bg-orange-100 text-orange-800 border-orange-200",
        silver: "bg-gray-100 text-gray-800 border-gray-200",
        gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
        platinum: "bg-purple-100 text-purple-800 border-purple-200"
      }
    };
  const fetchLoyalty = async () => {
    try {
      setLoading(true);
      const res = await loyaltyService.getMyLoyalty();
      setLoyalty(res.data.loyalty);
    } catch (error: any) {
      console.error("Error fetching loyalty:", error);
      toast.error(error.response?.data?.message || copy.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await loyaltyService.getMyTransactions({
        page: transactionsPage,
        limit: 10
      });
      setTransactions(res.data.transactions);
      setTransactionsTotalPages(res.data.pagination.totalPages);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [transactionsPage]);

  const handleRedeem = async () => {
    const points = parseInt(redeemAmount);
    if (!points || points <= 0) {
      toast.error(isArabic ? "يرجى إدخال عدد نقاط صحيح" : "Please enter a valid number of points");
      return;
    }

    if (!loyalty || loyalty.points < points) {
      toast.error(isArabic ? "رصيد النقاط غير كافٍ" : "Insufficient points balance");
      return;
    }

    setRedeeming(true);
    try {
      await loyaltyService.redeemPoints({ points });
      toast.success(copy.successRedeem);
      setRedeemAmount("");
      await fetchLoyalty();
      await fetchTransactions();
    } catch (error: any) {
      console.error("Error redeeming points:", error);
      toast.error(error.response?.data?.message || (isArabic ? "فشل استبدال النقاط" : "Failed to redeem points"));
    } finally {
      setRedeeming(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <Crown className="h-5 w-5" />;
      case 'gold':
        return <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />;
      case 'silver':
        return <Star className="h-5 w-5 fill-gray-400 text-gray-400" />;
      default:
        return <Star className="h-5 w-5 fill-orange-500 text-orange-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      order_completion: { ar: copy.orderCompletion, en: "Order Completion" },
      redemption: { ar: copy.redemption, en: "Redemption" },
      manual_adjustment: { ar: copy.manualAdjustment, en: "Manual Adjustment" },
      referral: { ar: "إحالة", en: "Referral" },
      bonus: { ar: "مكافأة", en: "Bonus" }
    };
    return map[source]?.[isArabic ? "ar" : "en"] || source;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{copy.title}</h1>
          <p className="text-muted-foreground">{copy.description}</p>
        </div>

        {/* Loyalty Overview Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6" />
              {copy.currentPoints}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loyalty && (
              <div className="space-y-6">
                {/* Points Display */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">{loyalty.points}</div>
                  <p className="text-sm text-muted-foreground mt-1">{isArabic ? "نقطة" : "points"}</p>
                </div>

                {/* Tier Badge */}
                <div className="flex justify-center">
                  <Badge className={`text-lg px-4 py-2 ${copy.tierColors[loyalty.tier as keyof typeof copy.tierColors]}`}>
                    <span className="flex items-center gap-2">
                      {getTierIcon(loyalty.tier)}
                      {copy.tierNames[loyalty.tier as keyof typeof copy.tierNames]}
                    </span>
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{loyalty.totalEarned}</div>
                    <p className="text-xs text-muted-foreground">{copy.totalEarned}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Gift className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{loyalty.totalRedeemed}</div>
                    <p className="text-xs text-muted-foreground">{copy.totalRedeemed}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Transactions and Redeem */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {copy.transactions}
            </TabsTrigger>
            <TabsTrigger value="redeem" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              {copy.redeemPoints}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {isArabic ? "لا توجد معاملات بعد" : "No transactions yet"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                              className={
                                transaction.type === 'earned'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.type === 'redeemed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-orange-100 text-orange-800'
                              }
                            >
                              {transaction.type === 'earned'
                                ? copy.earned
                                : transaction.type === 'redeemed'
                                  ? copy.redeemed
                                  : copy.adjusted}
                            </Badge>
                            <span className="text-sm font-medium">{getSourceLabel(transaction.source)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </div>
                          <p className="text-xs text-muted-foreground">{copy.balanceAfter}: {transaction.balanceAfter}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {transactionsTotalPages > 1 && (
                  <PaginationControls
                    currentPage={transactionsPage}
                    totalPages={transactionsTotalPages}
                    onPageChange={setTransactionsPage}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redeem">
            <Card>
              <CardHeader>
                <CardTitle>{copy.redeemPoints}</CardTitle>
                <CardDescription>{copy.redeemDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{copy.pointsToRedeem}</label>
                  <Input
                    type="number"
                    placeholder={isArabic ? "أدخل عدد النقاط" : "Enter points amount"}
                    value={redeemAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRedeemAmount(e.target.value)
                    } min="1"
                    max={loyalty?.points || 0}
                  />
                  {loyalty && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? "متاح" : "Available"}: {loyalty.points} {isArabic ? "نقطة" : "points"}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleRedeem}
                  disabled={redeeming || !redeemAmount}
                  className="w-full"
                >
                  {redeeming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isArabic ? "جاري الاستبدال..." : "Redeeming..."}
                    </>
                  ) : (
                    copy.confirmRedeem
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost">
              {copy.backToHome}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
