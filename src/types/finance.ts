export type TransactionType = 'income' | 'expense';

export type FrequencyType = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string;
  isRecurring: boolean;
  frequency?: FrequencyType;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  type: 'fixed' | 'variable';
  amount: number;
  frequency: FrequencyType;
  startDate: string;
  active: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay?: number; // Only for fixed costs (day of month 1-31)
  dueDate?: string; // Full due date for non-fixed bills (YYYY-MM-DD)
  category: string;
  description?: string;
  isFixed: boolean;
  isPaid: boolean;
  paidDate?: string;
  paidMonth?: string;
  transactionId?: string; // Track the transaction created when paid
  createdAt: string;
  cancelledAt?: string;
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export interface UserPreferences {
  currency: string;
  theme: 'light' | 'dark';
  whatsappNumber?: string;
}

export interface FinancialData {
  transactions: Transaction[];
  categories: Category[];
  incomeSources: IncomeSource[];
  bills: Bill[];
  preferences: UserPreferences;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Salário', type: 'income', icon: 'Briefcase', color: 'primary' },
  { id: '2', name: 'Freelance', type: 'income', icon: 'Laptop', color: 'accent' },
  { id: '3', name: 'Investimentos', type: 'income', icon: 'TrendingUp', color: 'chart-4' },
  { id: '4', name: 'Outros', type: 'income', icon: 'Plus', color: 'chart-5' },
  { id: '5', name: 'Alimentação', type: 'expense', icon: 'Utensils', color: 'expense' },
  { id: '6', name: 'Transporte', type: 'expense', icon: 'Car', color: 'chart-3' },
  { id: '7', name: 'Moradia', type: 'expense', icon: 'Home', color: 'chart-4' },
  { id: '8', name: 'Saúde', type: 'expense', icon: 'Heart', color: 'destructive' },
  { id: '9', name: 'Educação', type: 'expense', icon: 'GraduationCap', color: 'chart-5' },
  { id: '10', name: 'Lazer', type: 'expense', icon: 'Gamepad2', color: 'warning' },
  { id: '11', name: 'Compras', type: 'expense', icon: 'ShoppingBag', color: 'accent' },
  { id: '12', name: 'Contas', type: 'expense', icon: 'Receipt', color: 'muted' },
];
