import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Pencil,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, Category } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/exportToExcel';
import { TransactionDetailsModal } from '@/components/transactions/TransactionDetailsModal';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction?: (id: string) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
}

export function RecentTransactions({ 
  transactions, 
  categories,
  onDeleteTransaction,
  onUpdateTransaction 
}: RecentTransactionsProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  
  const recentTransactions = transactions.slice(0, 8);

  if (recentTransactions.length === 0) {
    return (
      <Card variant="glass" className="h-full min-h-[300px]">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] sm:h-[280px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-2 text-sm">
              Nenhuma transação ainda
            </p>
            <p className="text-xs text-muted-foreground">
              Adicione sua primeira transação para começar!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEditSave = (id: string, updates: Partial<Transaction>) => {
    if (onUpdateTransaction) {
      onUpdateTransaction(id, updates);
    }
    setTransactionToEdit(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="h-full"
      >
        <Card variant="glass" className="h-full">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.5 sm:space-y-1">
            {recentTransactions.map((transaction, index) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0
                      ${isIncome ? 'bg-income/10' : 'bg-expense/10'}
                    `}>
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-income" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-expense" />
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{transaction.category}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {transaction.description || formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold text-xs sm:text-sm ${isIncome ? 'text-income' : 'text-expense'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransaction(transaction);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      
                      {onUpdateTransaction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransactionToEdit(transaction);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                      
                      {onDeleteTransaction && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-expense"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTransaction(transaction.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />

      <EditTransactionModal
        isOpen={!!transactionToEdit}
        onClose={() => setTransactionToEdit(null)}
        onSave={handleEditSave}
        transaction={transactionToEdit}
        categories={categories}
      />
    </>
  );
}