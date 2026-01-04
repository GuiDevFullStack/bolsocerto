import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Briefcase, 
  Laptop, 
  TrendingUp, 
  Plus,
  Utensils,
  Car,
  Home,
  Heart,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/exportToExcel';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Laptop,
  TrendingUp,
  Plus,
  Utensils,
  Car,
  Home,
  Heart,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Receipt,
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 8);

  if (recentTransactions.length === 0) {
    return (
      <Card variant="glass" className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[280px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Nenhuma transação ainda
            </p>
            <p className="text-sm text-muted-foreground">
              Adicione sua primeira transação para começar!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <Card variant="glass" className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {recentTransactions.map((transaction, index) => {
            const isIncome = transaction.type === 'income';
            
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${isIncome ? 'bg-income/10' : 'bg-expense/10'}
                  `}>
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5 text-income" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-expense" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm">{transaction.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.description || formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
