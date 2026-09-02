import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as financeService from './service';

export const financeKeys = {
  all: ['finance'] as const,
  accounts: () => [...financeKeys.all, 'accounts'] as const,
  categories: () => [...financeKeys.all, 'categories'] as const,
  transactions: (accountId?: string, startDate?: string, endDate?: string, pageNumber: number = 1, pageSize: number = 10) => [...financeKeys.all, 'transactions', { accountId, startDate, endDate, pageNumber, pageSize }] as const,
  transfers: () => [...financeKeys.all, 'transfers'] as const,
  summary: (accountId?: string, startDate?: string, endDate?: string) => [...financeKeys.all, 'summary', { accountId, startDate, endDate }] as const,
};

// Accounts
export const useAccounts = () => {
  return useQuery({
    queryKey: financeKeys.accounts(),
    queryFn: financeService.getAccounts,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary() });
    },
  });
};

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: financeKeys.categories(),
    queryFn: financeService.getCategories,
  });
};

export const useSeedDefaultCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.seedDefaultCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.categories() });
    },
  });
};

// Transactions
export const useTransactions = (accountId?: string, startDate?: string, endDate?: string, pageNumber: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: financeKeys.transactions(accountId, startDate, endDate, pageNumber, pageSize),
    queryFn: () => financeService.getTransactions(accountId, startDate, endDate, pageNumber, pageSize),
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary() });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary() });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary() });
    },
  });
};

// Transfers
export const useTransfers = () => {
  return useQuery({
    queryKey: financeKeys.transfers(),
    queryFn: financeService.getTransfers,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeService.createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.transfers() });
      queryClient.invalidateQueries({ queryKey: financeKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: financeKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary() });
    },
  });
};

// Summary
export const useFinanceSummary = (accountId?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: financeKeys.summary(accountId, startDate, endDate),
    queryFn: () => financeService.getFinanceSummary(accountId, startDate, endDate),
  });
};
