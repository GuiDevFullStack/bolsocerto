import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Receipt, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Bill, Category } from '@/types/finance';
import { AddBillModal } from './AddBillModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BillsSectionProps {
  bills: Bill[];
  categories: Category[];
  currentMonth: string;
  onAddBill: (bill: Omit<Bill, 'id'>) => void;
  onUpdateBill: (id: string, updates: Partial<Bill>) => void;
  onDeleteBill: (id: string) => void;
  onMarkAsPaid: (bill: Bill, callback: (transactionId: string) => void) => void;
  onUnmarkAsPaid: (transactionId: string) => void;
}

export function BillsSection({
  bills,
  categories,
  currentMonth,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onMarkAsPaid,
  onUnmarkAsPaid,
}: BillsSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);

  // Get bills for current month (including active fixed bills)
  const monthBills = bills.filter(bill => {
    // If bill is cancelled and cancellation was before this month, don't show
    if (bill.cancelledAt) {
      const cancelledMonth = bill.cancelledAt.slice(0, 7);
      if (cancelledMonth <= currentMonth) return false;
    }
    
    // For fixed bills, show if created before or during current month
    if (bill.isFixed) {
      const createdMonth = bill.createdAt.slice(0, 7);
      return createdMonth <= currentMonth;
    }
    
    // For non-fixed bills, show only if created in current month
    const createdMonth = bill.createdAt.slice(0, 7);
    return createdMonth === currentMonth;
  });

  // Check if a bill is paid for the current month
  const isBillPaidForMonth = (bill: Bill) => {
    if (bill.isFixed) {
      return bill.paidMonth === currentMonth;
    }
    return bill.isPaid;
  };

  const handleTogglePaid = (bill: Bill) => {
    const isPaidNow = isBillPaidForMonth(bill);
    
    if (!isPaidNow) {
      // Mark as paid and create expense transaction
      onMarkAsPaid(bill, (transactionId: string) => {
        if (bill.isFixed) {
          onUpdateBill(bill.id, { 
            paidMonth: currentMonth,
            paidDate: new Date().toISOString(),
            transactionId
          });
        } else {
          onUpdateBill(bill.id, { 
            isPaid: true,
            paidDate: new Date().toISOString(),
            transactionId
          });
        }
      });
    } else {
      // Unmark as paid - remove the transaction
      if (bill.transactionId) {
        onUnmarkAsPaid(bill.transactionId);
      }
      if (bill.isFixed) {
        onUpdateBill(bill.id, { paidMonth: undefined, paidDate: undefined, transactionId: undefined });
      } else {
        onUpdateBill(bill.id, { isPaid: false, paidDate: undefined, transactionId: undefined });
      }
    }
  };

  const handleDeleteBill = (bill: Bill) => {
    if (bill.isFixed) {
      // For fixed bills, mark as cancelled instead of deleting
      onUpdateBill(bill.id, { cancelledAt: new Date().toISOString() });
    } else {
      onDeleteBill(bill.id);
    }
    setBillToDelete(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalPending = monthBills
    .filter(b => !isBillPaidForMonth(b))
    .reduce((sum, b) => sum + b.amount, 0);

  const totalPaid = monthBills
    .filter(b => isBillPaidForMonth(b))
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <>
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Contas do Mês</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pendente: {formatCurrency(totalPending)} | Pago: {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {monthBills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma conta cadastrada para este mês</p>
              <Button
                variant="link"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2"
              >
                Adicionar primeira conta
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {monthBills.map((bill) => {
                  const isPaid = isBillPaidForMonth(bill);
                  return (
                    <motion.div
                      key={bill.id + currentMonth}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isPaid 
                          ? 'bg-income/10 border-income/30' 
                          : 'bg-card border-border/50 hover:border-border'
                      }`}
                    >
                      <Checkbox
                        checked={isPaid}
                        onCheckedChange={() => handleTogglePaid(bill)}
                        className="data-[state=checked]:bg-income data-[state=checked]:border-income"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium truncate ${isPaid ? 'line-through text-muted-foreground' : ''}`}>
                            {bill.name}
                          </span>
                          {bill.isFixed && (
                            <Badge variant="secondary" className="text-xs">
                              Fixo
                            </Badge>
                          )}
                        </div>
                        {bill.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {bill.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold whitespace-nowrap ${isPaid ? 'text-income' : 'text-expense'}`}>
                          {formatCurrency(bill.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setBillToDelete(bill)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <AddBillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddBill}
        categories={categories}
      />

      <AlertDialog open={!!billToDelete} onOpenChange={() => setBillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              {billToDelete?.isFixed ? 'Cancelar Custo Fixo?' : 'Excluir Conta?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {billToDelete?.isFixed 
                ? `O custo fixo "${billToDelete?.name}" será cancelado e não aparecerá mais nos próximos meses.`
                : `A conta "${billToDelete?.name}" será removida permanentemente.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => billToDelete && handleDeleteBill(billToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {billToDelete?.isFixed ? 'Cancelar Custo' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
