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
import { useCreateAccount } from '@/lib/api/finance/hooks';
import { AccountType } from '@/lib/api/finance/types';

const accountFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  type: z.coerce.number().min(0).max(5),
  currency: z.string().min(3).max(3),
  openingBalance: z.coerce.number(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function CreateAccountForm({ onSuccess }: { onSuccess?: () => void }) {
  const createAccount = useCreateAccount();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: 0,
      currency: 'VND',
      openingBalance: 0,
    },
  });

  function onSubmit(data: AccountFormValues) {
    createAccount.mutate(
      {
        name: data.name,
        type: data.type as AccountType,
        currency: data.currency,
        openingBalance: data.openingBalance,
      },
      {
        onSuccess: () => {
          toast.success('Account created successfully');
          form.reset();
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create account');
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Main Wallet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value?.toString() ?? ''}
                items={[
                  { value: '0', label: 'Cash' },
                  { value: '1', label: 'Bank' },
                  { value: '2', label: 'E-Wallet' },
                  { value: '3', label: 'Credit Card' },
                  { value: '4', label: 'Savings' },
                  { value: '5', label: 'Other' },
                ]}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Cash</SelectItem>
                  <SelectItem value="1">Bank</SelectItem>
                  <SelectItem value="2">E-Wallet</SelectItem>
                  <SelectItem value="3">Credit Card</SelectItem>
                  <SelectItem value="4">Savings</SelectItem>
                  <SelectItem value="5">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="openingBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Balance</FormLabel>
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
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input placeholder="VND" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={createAccount.isPending}>
          {createAccount.isPending ? 'Creating...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
