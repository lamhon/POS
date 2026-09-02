import apiClient from '../../api-client';
import { Account, Category, Transaction, Transfer, FinanceSummary, PaginatedResult } from './types';

// Accounts
export const getAccounts = async (): Promise<Account[]> => {
  const { data } = await apiClient.get<Account[]>('/accounts');
  return data;
};

export const createAccount = async (payload: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance' | 'isActive'>): Promise<Account> => {
  const { data } = await apiClient.post<Account>('/accounts', payload);
  return data;
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
};

export const createCategory = async (payload: Omit<Category, 'id' | 'isSystem' | 'isActive'>): Promise<Category> => {
  const { data } = await apiClient.post<Category>('/categories', payload);
  return data;
};

export const updateCategory = async (payload: Omit<Category, 'isSystem' | 'isActive'>): Promise<Category> => {
  const { data } = await apiClient.put<Category>(`/categories/${payload.id}`, payload);
  return data;
};

export const seedDefaultCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.post<Category[]>('/categories/seed-default');
  return data;
};

// Transactions
export const getTransactions = async (accountId?: string, startDate?: string, endDate?: string, pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedResult<Transaction>> => {
  const params: Record<string, string | number> = {};
  if (accountId) params.accountId = accountId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  params.pageNumber = pageNumber;
  params.pageSize = pageSize;
  const { data } = await apiClient.get<PaginatedResult<Transaction>>('/transactions', { params });
  return data;
};

export const createTransaction = async (payload: Omit<Transaction, 'id' | 'transferId'>): Promise<Transaction> => {
  const { data } = await apiClient.post<Transaction>('/transactions', payload);
  return data;
};

export const updateTransaction = async (payload: Omit<Transaction, 'transferId'>): Promise<Transaction> => {
  const { data } = await apiClient.put<Transaction>(`/transactions/${payload.id}`, payload);
  return data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await apiClient.delete(`/transactions/${id}`);
};

// Transfers
export const getTransfers = async (): Promise<Transfer[]> => {
  const { data } = await apiClient.get<Transfer[]>('/transfers');
  return data;
};

export const createTransfer = async (payload: Omit<Transfer, 'id'>): Promise<Transfer> => {
  const { data } = await apiClient.post<Transfer>('/transfers', payload);
  return data;
};

// Summary
export const getFinanceSummary = async (accountId?: string, startDate?: string, endDate?: string): Promise<FinanceSummary> => {
  const params: Record<string, string> = {};
  if (accountId) params.accountId = accountId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const { data } = await apiClient.get<FinanceSummary>('/finance-summary', { params });
  return data;
};
