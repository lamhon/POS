'use client';

import { useTransactions } from '@/lib/api/finance/hooks';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils/format';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Transaction, TransactionType } from '@/lib/api/finance/types';

import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { TransactionDetailDialog } from './TransactionDetailDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TransactionsListProps {
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export function TransactionsList({ accountId, startDate, endDate }: TransactionsListProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: paginatedData, isLoading, error } = useTransactions(accountId, startDate, endDate, page, pageSize);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-4">Error loading transactions.</div>;
  if (!paginatedData || paginatedData.items.length === 0) {
    return <div className="text-muted-foreground p-4">No recent transactions.</div>;
  }

  const transactions = paginatedData.items;

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 0: return <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full"><ArrowDownLeft className="h-4 w-4" /></div>;
      case 1: return <div className="p-2 bg-rose-500/10 text-rose-500 rounded-full"><ArrowUpRight className="h-4 w-4" /></div>;
      case 2: return <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full"><ArrowRightLeft className="h-4 w-4" /></div>;
      default: return null;
    }
  };

  const getAmountClass = (type: TransactionType) => {
    switch (type) {
      case 0: return 'text-emerald-500';
      case 1: return 'text-foreground';
      case 2: return 'text-blue-500';
      default: return 'text-foreground';
    }
  };

  const getPrefix = (type: TransactionType) => {
    switch (type) {
      case 0: return '+';
      case 1: return '-';
      case 2: return '';
      default: return '';
    }
  };

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {transactions.map((tx: Transaction) => (
          <div 
            key={tx.id} 
            onClick={() => handleTransactionClick(tx)}
            className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              {getTransactionIcon(tx.type)}
              <div>
                <p className="text-sm font-medium leading-none">{tx.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(tx.transactionDate), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${getAmountClass(tx.type)}`}>
                {getPrefix(tx.type)}{formatCurrency(tx.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {paginatedData.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-muted-foreground mx-4">
                  Page {paginatedData.pageNumber} of {paginatedData.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(paginatedData.totalPages, p + 1))}
                  className={page === paginatedData.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      <TransactionDetailDialog 
        transaction={selectedTx}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
