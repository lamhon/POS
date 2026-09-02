export type AccountType = 0 | 1 | 2 | 3 | 4 | 5; // Matches enum AccountType

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CategoryType = 0 | 1; // 0 = Income, 1 = Expense

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  parentId?: string;
  isSystem: boolean;
  isActive: boolean;
}

export type TransactionType = 0 | 1 | 2; // 0 = Income, 1 = Expense, 2 = Transfer

export interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  notes?: string;
  transactionDate: string;
  transferId?: string;
}

export interface Transfer {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  fee: number;
  transactionDate: string;
  description: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
}

export interface FinanceSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  categoryBreakdowns: CategoryBreakdown[];
  dailySummaries: DailySummary[];
}
