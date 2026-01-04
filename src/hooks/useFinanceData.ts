import { useState, useEffect, useCallback } from 'react';
import { 
  Transaction, 
  Category, 
  IncomeSource, 
  Bill, 
  UserPreferences, 
  FinancialData,
  DEFAULT_CATEGORIES 
} from '@/types/finance';

const STORAGE_KEY = 'finance_app_data';

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: 'BRL',
  theme: 'dark',
};

const getInitialData = (): FinancialData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    incomeSources: [],
    bills: [],
    preferences: DEFAULT_PREFERENCES,
  };
};

export function useFinanceData() {
  const [data, setData] = useState<FinancialData>(getInitialData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoading]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    return newCategory;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  }, []);

  const addIncomeSource = useCallback((source: Omit<IncomeSource, 'id'>) => {
    const newSource: IncomeSource = {
      ...source,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      incomeSources: [...prev.incomeSources, newSource],
    }));
    return newSource;
  }, []);

  const updateIncomeSource = useCallback((id: string, updates: Partial<IncomeSource>) => {
    setData(prev => ({
      ...prev,
      incomeSources: prev.incomeSources.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const deleteIncomeSource = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      incomeSources: prev.incomeSources.filter(s => s.id !== id),
    }));
  }, []);

  const addBill = useCallback((bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...bill,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      bills: [...prev.bills, newBill],
    }));
    return newBill;
  }, []);

  const updateBill = useCallback((id: string, updates: Partial<Bill>) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => 
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  }, []);

  const deleteBill = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== id),
    }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
    }));
  }, []);

  const getMonthlyStats = useCallback((month?: string) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const monthTransactions = data.transactions.filter(t => 
      t.date.startsWith(targetMonth)
    );

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

    return {
      month: targetMonth,
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      transactionCount: monthTransactions.length,
    };
  }, [data.transactions]);

  const getCategoryBreakdown = useCallback((type: 'income' | 'expense', month?: string) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const monthTransactions = data.transactions.filter(t => 
      t.date.startsWith(targetMonth) && t.type === type
    );

    const breakdown: Record<string, number> = {};
    monthTransactions.forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });

    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [data.transactions]);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData) as FinancialData;
      setData(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setData({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      incomeSources: [],
      bills: [],
      preferences: DEFAULT_PREFERENCES,
    });
  }, []);

  return {
    ...data,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    addBill,
    updateBill,
    deleteBill,
    updatePreferences,
    getMonthlyStats,
    getCategoryBreakdown,
    exportData,
    importData,
    clearAllData,
  };
}
