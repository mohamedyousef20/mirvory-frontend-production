import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PaginationControls from "@/components/pagination-controls"

interface TransactionsTabProps {
    language: string
    transactions: any[]
    transactionsLoading: boolean
    transactionPage: number
    transactionTotalPages: number
    transactionTypeFilter: 'all' | 'credit' | 'debit'
    onTypeFilterChange: (val: 'all' | 'credit' | 'debit') => void
    onPageChange: (page: number) => void
}

export function TransactionsTab({
    language, transactions, transactionsLoading,
    transactionPage, transactionTotalPages,
    transactionTypeFilter, onTypeFilterChange, onPageChange
}: TransactionsTabProps) {
    const headers = ['#', language === 'ar' ? 'النوع' : 'Type', language === 'ar' ? 'المصدر' : 'Source', language === 'ar' ? 'المبلغ' : 'Amount', language === 'ar' ? 'الرصيد بعد العملية' : 'Balance After', language === 'ar' ? 'الحالة' : 'Status', language === 'ar' ? 'التاريخ' : 'Date']

    return (
        <Card className="border border-slate-200 rounded-2xl shadow-sm">
            <CardHeader className="px-5 pt-5 pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-800">
                        {language === 'ar' ? 'المعاملات المالية' : 'Financial Transactions'}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-400 mt-1">
                        {language === 'ar' ? 'تتبع أرصدتك وسجل جميع العمليات المالية' : 'Track your wallet balance and payout history'}
                    </CardDescription>
                </div>
                <Select value={transactionTypeFilter} onValueChange={(val: 'all' | 'credit' | 'debit') => { onTypeFilterChange(val) }}>
                    <SelectTrigger className="h-10 w-[180px] rounded-xl border-slate-200 text-sm">
                        <SelectValue placeholder={language === 'ar' ? 'نوع المعاملة' : 'Transaction type'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                        <SelectItem value="credit">{language === 'ar' ? 'إيداع (Credit)' : 'Credit'}</SelectItem>
                        <SelectItem value="debit">{language === 'ar' ? 'سحب (Debit)' : 'Debit'}</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-5 pb-6 space-y-4">
                <div className="rounded-xl border border-slate-200 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                {headers.map(h => <TableHead key={h} className="text-xs font-semibold text-slate-500">{h}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
                                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {language === 'ar' ? 'جاري تحميل المعاملات...' : 'Loading transactions...'}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                                        {language === 'ar' ? 'لا توجد معاملات في الفترة الحالية' : 'No transactions found for this period'}
                                    </TableCell>
                                </TableRow>
                            ) : transactions.map((txn) => (
                                <TableRow key={txn._id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="text-slate-500 text-sm">#{txn._id.slice(-6)}</TableCell>
                                    <TableCell>
                                        <Badge variant={txn.type === 'credit' ? 'secondary' : 'outline'} className="rounded-full text-xs font-medium px-2.5">
                                            {txn.type === 'credit' ? (language === 'ar' ? 'إيداع' : 'Credit') : (language === 'ar' ? 'سحب' : 'Debit')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{txn.source}</TableCell>
                                    <TableCell className={`font-semibold text-sm ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {txn.type === 'credit' ? '+' : '-'}{txn.amount.toFixed(2)} <span className="text-slate-400 font-normal">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-700">
                                        {txn.balanceAfter?.toFixed(2)} <span className="text-slate-400">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'outline' : 'destructive'} className="rounded-full text-xs font-medium px-2.5">
                                            {language === 'ar' ? (txn.status === 'completed' ? 'مكتملة' : txn.status === 'pending' ? 'معلقة' : 'فاشلة') : txn.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {new Date(txn.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {transactions.length > 0 && (
                    <PaginationControls currentPage={transactionPage} totalPages={transactionTotalPages} onPageChange={onPageChange} className="justify-end pt-2" />
                )}
            </CardContent>
        </Card>
    )
}