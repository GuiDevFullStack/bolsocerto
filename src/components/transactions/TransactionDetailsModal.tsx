import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownRight, Calendar, Tag, FileText, Repeat, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/exportToExcel';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass rounded-2xl border border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isIncome ? 'bg-income/20' : 'bg-expense/20'
                }`}>
                  {isIncome ? (
                    <ArrowUpRight className="w-5 h-5 text-income" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-expense" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Detalhes da Transação</h2>
                  <Badge variant={isIncome ? 'default' : 'destructive'} className="mt-1">
                    {isIncome ? 'Receita' : 'Despesa'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Amount */}
              <div className="text-center py-4">
                <p className={`text-3xl font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {/* Category */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <p className="font-medium">{transaction.category}</p>
                  </div>
                </div>

                {/* Payment Date */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Pagamento</p>
                    <p className="font-medium">{formatDate(transaction.date)}</p>
                  </div>
                </div>

                {/* Due Date (if available) */}
                {transaction.dueDate && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                      <p className="font-medium">{formatDate(transaction.dueDate)}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {transaction.description && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Descrição</p>
                      <p className="font-medium">{transaction.description}</p>
                    </div>
                  </div>
                )}

                {/* Recurring */}
                {transaction.isRecurring && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Repeat className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Recorrência</p>
                      <p className="font-medium">
                        {transaction.frequency === 'monthly' && 'Mensal'}
                        {transaction.frequency === 'weekly' && 'Semanal'}
                        {transaction.frequency === 'yearly' && 'Anual'}
                        {transaction.frequency === 'daily' && 'Diário'}
                        {transaction.frequency === 'biweekly' && 'Quinzenal'}
                        {!transaction.frequency && 'Recorrente'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <Button onClick={onClose} variant="outline" className="w-full" size="lg">
                Fechar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}