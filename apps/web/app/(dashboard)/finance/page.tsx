'use client';

import { useState } from 'react';

import { useFinanceSummary, useCategories, useSeedDefaultCategories } from '@/lib/api/finance/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { AccountsList } from './_components/AccountsList';
import { TransactionsList } from './_components/TransactionsList';
import { AddAccountDialog } from './_components/AddAccountDialog';
import { AddTransactionDialog } from './_components/AddTransactionDialog';
import { AddTransferDialog } from './_components/AddTransferDialog';
import { DateFilter } from './_components/DateFilter';
import { CashFlowChart } from './_components/CashFlowChart';
import { CategoryDonutChart } from './_components/CategoryDonutChart';

export default function FinanceDashboardPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const { data: summary, isLoading, error } = useFinanceSummary(
    selectedAccountId || undefined,
    startDate || undefined,
    endDate || undefined
  );
  const { data: categories } = useCategories();
  const seedCategories = useSeedDefaultCategories();

  const handleDateFilterChange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSeed = () => {
    seedCategories.mutate(undefined, {
      onSuccess: () => toast.success('Default categories created'),
      onError: () => toast.error('Failed to create categories')
    });
  };



  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-500">
        <p>Failed to load finance data.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
        <div className="flex space-x-2">
          {!categories?.length && (
            <Button variant="secondary" onClick={handleSeed} disabled={seedCategories.isPending}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${seedCategories.isPending ? 'animate-spin' : ''}`} />
              Setup Categories
            </Button>
          )}
          <AddAccountDialog />
          <AddTransactionDialog />
          <AddTransferDialog />
        </div>
      </div>

      <DateFilter onChange={handleDateFilterChange} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(summary?.totalBalance || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedAccountId ? 'For selected account' : 'Across all active accounts'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-emerald-500">{formatCurrency(summary?.monthlyIncome || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {startDate || endDate ? 'In selected period' : (selectedAccountId ? 'For selected account this month' : 'This month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-rose-500">{formatCurrency(summary?.monthlyExpense || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {startDate || endDate ? 'In selected period' : (selectedAccountId ? 'For selected account this month' : 'This month')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : (
              <CashFlowChart data={summary?.dailySummaries || []} />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full rounded-xl" />
            ) : (
              <CategoryDonutChart data={summary?.categoryBreakdowns || []} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsList 
              accountId={selectedAccountId || undefined} 
              startDate={startDate || undefined} 
              endDate={endDate || undefined} 
            />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Accounts Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountsList 
              selectedAccountId={selectedAccountId} 
              onSelectAccount={(id) => setSelectedAccountId(prev => prev === id ? null : id)} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
