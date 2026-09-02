// @ts-nocheck
'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTransaction, useUpdateTransaction, useAccounts, useCategories } from '@/lib/api/finance/hooks';
import { Spinner } from '@/components/ui/spinner';
import { TransactionType, Category, Transaction } from '@/lib/api/finance/types';
import { Plus, Pencil } from 'lucide-react';
import { AddEditCategoryDialog } from './AddEditCategoryDialog';
import { getCategoryIconComponent } from '@/components/ui/icon-picker';
import { useEffect } from 'react';

const getLocalDateTimeString = (dateInput?: string | Date) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const transactionSchema = z.object({
  accountId: z.string().min(1, { message: 'Account is required' }),
  categoryId: z.string().optional(),
  type: z.coerce.number().min(0).max(1),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0' }),
  currency: z.string().min(3).max(3),
  description: z.string().min(1, { message: 'Description is required' }),
  transactionDate: z.string().min(1, { message: 'Date and time is required' }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function CreateTransactionForm({ 
  onSuccess,
  transactionToEdit
}: { 
  onSuccess?: () => void;
  transactionToEdit?: Transaction | null;
}) {
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const isEdit = !!transactionToEdit;

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEditId, setCategoryToEditId] = useState<string | null>(null);

  const categoryToEdit = categories?.find(c => c.id === categoryToEditId) || null;

  const handleEditCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentCatId = form.getValues('categoryId');
    if (currentCatId) {
      setCategoryToEditId(currentCatId);
      setIsCategoryModalOpen(true);
    }
  };

  const handleAddCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    setCategoryToEditId(null);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySaved = (id: string) => {
    form.setValue('categoryId', id);
  };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: '',
      categoryId: '',
      type: 1, // Default Expense
      amount: 0,
      currency: 'VND',
      description: '',
      transactionDate: getLocalDateTimeString(),
    },
  });

  useEffect(() => {
    if (isEdit && transactionToEdit) {
      form.reset({
        accountId: transactionToEdit.accountId,
        categoryId: transactionToEdit.categoryId || '',
        type: transactionToEdit.type,
        amount: transactionToEdit.amount,
        currency: transactionToEdit.currency,
        description: transactionToEdit.description,
        transactionDate: getLocalDateTimeString(transactionToEdit.transactionDate),
      });
    }
  }, [isEdit, transactionToEdit, form]);

  const txType = form.watch('type');

  function onSubmit(data: TransactionFormValues) {
    if (isEdit && transactionToEdit) {
      updateTx.mutate(
        {
          id: transactionToEdit.id,
          accountId: data.accountId,
          categoryId: data.categoryId || undefined,
          type: data.type as TransactionType,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          transactionDate: new Date(data.transactionDate).toISOString(),
        },
        {
          onSuccess: () => {
            toast.success('Transaction updated successfully');
            if (onSuccess) onSuccess();
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to update transaction');
          },
        }
      );
    } else {
      createTx.mutate(
        {
          accountId: data.accountId,
          categoryId: data.categoryId || undefined,
          type: data.type as TransactionType,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          transactionDate: new Date(data.transactionDate).toISOString(),
        },
        {
          onSuccess: () => {
            toast.success('Transaction added successfully');
            form.reset();
            if (onSuccess) onSuccess();
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to add transaction');
          },
        }
      );
    }
  }

  const isPending = createTx.isPending || updateTx.isPending;

  if (accountsLoading || categoriesLoading) return <Spinner />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString() ?? ''}
                  items={[
                    { value: '0', label: 'Income' },
                    { value: '1', label: 'Expense' },
                  ]}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Income</SelectItem>
                    <SelectItem value="1">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <NumericInput 
                    placeholder="0.00" 
                    {...field} 
                    onFocus={(e) => e.target.select()} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ''}
                items={accounts?.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts && accounts.length > 0 ? (
                    accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency})</SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="_empty" className="text-muted-foreground justify-center py-2 text-center text-xs">No accounts found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-1.5">
                <FormLabel>Category</FormLabel>
                <div className="flex items-center space-x-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
                    onClick={handleAddCategory}
                    title="Add new category"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-foreground"
                      onClick={handleEditCategory}
                      title="Edit selected category"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ''}
                items={[
                  { value: '', label: 'None' },
                  ...(categories?.filter(c => c.type === Number(txType)).map((c) => ({ value: c.id, label: c.name })) || [])
                ]}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories && categories.filter(c => c.type === Number(txType)).length > 0 ? (
                    categories.filter(c => c.type === Number(txType)).map((c) => {
                      const IconComp = getCategoryIconComponent(c.icon);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            {IconComp ? (
                              <IconComp className="h-4 w-4 shrink-0" style={{ color: c.color || undefined }} />
                            ) : c.color ? (
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            ) : null}
                            <span>{c.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem disabled value="_empty" className="text-muted-foreground justify-center py-2 text-center text-xs">No categories found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="What was this for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Transaction' : 'Add Transaction')}
        </Button>
      </form>
      <AddEditCategoryDialog
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        categoryToEdit={categoryToEdit}
        onSuccess={handleCategorySaved}
        defaultType={Number(txType)}
      />
    </Form>
  );
}
