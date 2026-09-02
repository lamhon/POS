import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Transaction, TransactionType } from '@/lib/api/finance/types';
import { formatCurrency } from '@/lib/utils/format';
import { format } from 'date-fns';
import { useState } from 'react';
import { CreateTransactionForm } from './CreateTransactionForm';
import { useDeleteTransaction, useAccounts, useCategories } from '@/lib/api/finance/hooks';
import { Trash2, Pencil, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailDialog({ transaction, open, onOpenChange }: TransactionDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTx = useDeleteTransaction();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  // Reset edit/delete state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false);
      setIsDeleting(false);
    }
    onOpenChange(newOpen);
  };

  if (!transaction) return null;

  const isTransfer = transaction.transferId !== null;

  const account = accounts?.find(a => a.id === transaction.accountId);
  const category = categories?.find(c => c.id === transaction.categoryId);

  const accountName = account ? account.name : 'Unknown Account';
  const categoryName = category ? category.name : (transaction.type === 2 ? 'Transfer' : 'No Category');

  const handleDelete = () => {
    deleteTx.mutate(transaction.id, {
      onSuccess: () => {
        toast.success('Transaction deleted successfully');
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete transaction');
      }
    });
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 0: return <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full"><ArrowDownLeft className="h-8 w-8" /></div>;
      case 1: return <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full"><ArrowUpRight className="h-8 w-8" /></div>;
      case 2: return <div className="p-4 bg-blue-500/10 text-blue-500 rounded-full"><ArrowRightLeft className="h-8 w-8" /></div>;
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center space-y-0 gap-2">
          {(isEditing || isDeleting) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsEditing(false);
                setIsDeleting(false);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogTitle>
            {isDeleting ? 'Delete Transaction' : isEditing ? 'Edit Transaction' : 'Transaction Details'}
          </DialogTitle>
        </DialogHeader>

        {isDeleting ? (
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this transaction? This action cannot be undone.
              {isTransfer && " Both transactions associated with this transfer will be deleted, and balances will be restored."}
            </p>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleting(false)}
                disabled={deleteTx.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteTx.isPending}
              >
                {deleteTx.isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        ) : isEditing ? (
          <CreateTransactionForm 
            transactionToEdit={transaction}
            onSuccess={() => handleOpenChange(false)}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
              {getTransactionIcon(transaction.type)}
              <h2 className={`text-3xl font-bold ${getAmountClass(transaction.type)}`}>
                {getPrefix(transaction.type)}{formatCurrency(transaction.amount)}
              </h2>
            </div>

            <div className="space-y-3 rounded-lg border p-4 bg-card">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Description</span>
                <span className="font-semibold text-foreground text-right max-w-[200px] truncate" title={transaction.description}>
                  {transaction.description}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Account</span>
                <span className="font-medium text-foreground">{accountName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Category</span>
                <span className="font-medium text-foreground">{categoryName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Date</span>
                <span className="font-medium text-foreground">{format(new Date(transaction.transactionDate), 'PPP p')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Type</span>
                <span className="font-medium text-foreground">
                  {transaction.type === 0 ? 'Income' : transaction.type === 1 ? 'Expense' : 'Transfer'}
                </span>
              </div>
              {transaction.notes && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Notes</span>
                  <span className="font-medium text-foreground text-right max-w-[200px] truncate" title={transaction.notes}>
                    {transaction.notes}
                  </span>
                </div>
              )}
            </div>

            {isTransfer && (
              <div className="p-3 text-sm text-amber-600 bg-amber-50 rounded-md border border-amber-200">
                This transaction is part of a transfer. It cannot be edited directly. You can delete it, which will also delete the associated transfer and its counterpart.
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                disabled={isTransfer}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
