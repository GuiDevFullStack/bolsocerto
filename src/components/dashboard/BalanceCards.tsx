import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/exportToExcel';

interface BalanceCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export function BalanceCards({ totalIncome, totalExpenses, balance, savingsRate }: BalanceCardsProps) {
  const cards = [
    {
      title: 'Receitas',
      value: totalIncome,
      icon: TrendingUp,
      variant: 'income' as const,
      iconColor: 'text-income',
      delay: 0,
    },
    {
      title: 'Despesas',
      value: totalExpenses,
      icon: TrendingDown,
      variant: 'expense' as const,
      iconColor: 'text-expense',
      delay: 0.1,
    },
    {
      title: 'Saldo',
      value: balance,
      icon: Wallet,
      variant: balance >= 0 ? 'income' as const : 'expense' as const,
      iconColor: balance >= 0 ? 'text-income' : 'text-expense',
      delay: 0.2,
    },
    {
      title: 'Poupança',
      value: savingsRate,
      icon: PiggyBank,
      variant: savingsRate >= 20 ? 'income' as const : 'default' as const,
      iconColor: savingsRate >= 20 ? 'text-income' : 'text-muted-foreground',
      isPercentage: true,
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay, duration: 0.4, ease: 'easeOut' }}
        >
          <Card variant={card.variant} className="relative overflow-hidden group hover:scale-[1.02] transition-transform p-3 sm:p-4 md:p-6">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-8 -top-8 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-current blur-3xl" />
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">
                  {card.title}
                </span>
                <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${card.iconColor}`} />
              </div>
              
              <div className="text-base sm:text-lg md:text-2xl font-bold truncate">
                {card.isPercentage 
                  ? `${card.value.toFixed(1)}%`
                  : formatCurrency(card.value)
                }
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
