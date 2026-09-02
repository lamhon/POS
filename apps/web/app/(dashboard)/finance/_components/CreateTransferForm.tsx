// @ts-nocheck
'use client';

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
import { useCreateTransfer, useAccounts } from '@/lib/api/finance/hooks';
import { Spinner } from '@/components/ui/spinner';

const transferSchema = z.object({
  sourceAccountId: z.string().min(1, { message: 'Source account is required' }),
  destinationAccountId: z.string().min(1, { message: 'Destination account is required' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0' }),
  fee: z.coerce.number().min(0).default(0),
  description: z.string().min(1, { message: 'Description is required' }),
}).refine(data => data.sourceAccountId !== data.destinationAccountId, {
  message: "Source and destination accounts must be different",
  path: ["destinationAccountId"],
});

type TransferFormValues = z.infer<typeof transferSchema>;

export function CreateTransferForm({ onSuccess }: { onSuccess?: () => void }) {
  const createTx = useCreateTransfer();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceAccountId: '',
      destinationAccountId: '',
      amount: 0,
      fee: 0,
      description: 'Transfer',
    },
  });

  function onSubmit(data: TransferFormValues) {
    // Validate currency matches
    const srcAccount = accounts?.find(a => a.id === data.sourceAccountId);
    const dstAccount = accounts?.find(a => a.id === data.destinationAccountId);

    if (srcAccount?.currency !== dstAccount?.currency) {
      toast.error('Cross-currency transfers are not supported yet.');
      return;
    }

    createTx.mutate(
      {
        sourceAccountId: data.sourceAccountId,
        destinationAccountId: data.destinationAccountId,
        amount: data.amount,
        fee: data.fee,
        currency: srcAccount?.currency || 'VND',
        description: data.description,
        transactionDate: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Transfer successful');
          form.reset();
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to transfer');
        },
      }
    );
  }

  if (accountsLoading) return <Spinner />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="sourceAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Account</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ''}
                items={accounts?.map((a) => ({ value: a.id, label: `${a.name} (${formatCurrency(a.currentBalance)})` }))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts && accounts.length > 0 ? (
                    accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name} ({formatCurrency(a.currentBalance)})</SelectItem>
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
          name="destinationAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Account</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ''}
                items={accounts?.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
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

        <div className="grid grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee (optional)</FormLabel>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Transfer description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createTx.isPending}>
          {createTx.isPending ? 'Transferring...' : 'Confirm Transfer'}
        </Button>
      </form>
    </Form>
  );
}

// Need to import formatCurrency
import { formatCurrency } from '@/lib/utils/format';
