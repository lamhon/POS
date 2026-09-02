'use client';

import { useAccounts } from '@/lib/api/finance/hooks';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils/format';
import { Building, CreditCard, Landmark, PiggyBank, Wallet } from 'lucide-react';
import { Account, AccountType } from '@/lib/api/finance/types';

import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case 0: return <Wallet className="h-5 w-5 text-emerald-500" />;
    case 1: return <Landmark className="h-5 w-5 text-blue-500" />;
    case 2: return <Wallet className="h-5 w-5 text-purple-500" />;
    case 3: return <CreditCard className="h-5 w-5 text-rose-500" />;
    case 4: return <PiggyBank className="h-5 w-5 text-amber-500" />;
    default: return <Building className="h-5 w-5 text-gray-500" />;
  }
};

interface AccountsListProps {
  selectedAccountId?: string | null;
  onSelectAccount?: (id: string) => void;
}

export function AccountsList({ selectedAccountId, onSelectAccount }: AccountsListProps) {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }
  
  if (error) return <div className="text-red-500 p-4">Error loading accounts.</div>;
  if (!accounts || accounts.length === 0) {
    return <div className="text-muted-foreground p-4">No accounts found. Create one to get started.</div>;
  }

  return (
    <div className="space-y-4">
      {accounts.map((account: Account) => {
        const isSelected = selectedAccountId === account.id;
        return (
          <div
            key={account.id}
            onClick={() => onSelectAccount?.(account.id)}
            className={cn(
              "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
              isSelected && "border-primary ring-2 ring-primary bg-primary/5 hover:bg-primary/5"
            )}
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-full">
                {getAccountIcon(account.type)}
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{account.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{account.currency}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatCurrency(account.currentBalance)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
