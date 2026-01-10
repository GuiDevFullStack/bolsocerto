import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Receipt, Pencil, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Bill, Category } from '@/types/finance';
import { AddBillModal } from './AddBillModal';
import { EditBillModal } from './EditBillModal';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [billToEdit, setBillToEdit] = useState<Bill | null>(null);
  const [billToConfirmPaid, setBillToConfirmPaid] = useState<Bill | null>(null);

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

  const handleCheckboxChange = (bill: Bill) => {
    const isPaidNow = isBillPaidForMonth(bill);
    
    if (!isPaidNow) {
      // Show confirmation dialog before marking as paid
      setBillToConfirmPaid(bill);
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

  const handleConfirmPaid = () => {
    if (!billToConfirmPaid) return;
    
    const bill = billToConfirmPaid;
    
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
    
    setBillToConfirmPaid(null);
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

  const handleEditBill = (id: string, updates: Partial<Bill>) => {
    onUpdateBill(id, updates);
    setBillToEdit(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDueDate = (bill: Bill) => {
    if (bill.isFixed && bill.dueDay) {
      return `Dia ${bill.dueDay}`;
    }
    if (bill.dueDate) {
      // Add T12:00:00 to prevent UTC timezone shift
      return format(new Date(bill.dueDate + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR });
    }
    return null;
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
                  const dueDateLabel = formatDueDate(bill);
                  return (
                    <motion.div
                      key={bill.id + currentMonth}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg border transition-all ${
                        isPaid 
                          ? 'bg-income/10 border-income/30' 
                          : 'bg-card border-border/50 hover:border-border'
                      }`}
                    >
                      {/* Top row: checkbox, name, badge */}
                      <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
                        <Checkbox
                          checked={isPaid}
                          onCheckedChange={() => handleCheckboxChange(bill)}
                          className="data-[state=checked]:bg-income data-[state=checked]:border-income flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium text-sm sm:text-base ${isPaid ? 'line-through text-muted-foreground' : ''}`}>
                              {bill.name}
                            </span>
                            {bill.isFixed && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                Fixo
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            {bill.description && (
                              <span className="truncate max-w-[150px] sm:max-w-none">{bill.description}</span>
                            )}
                            {dueDateLabel && (
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <Calendar className="w-3 h-3" />
                                Venc: {dueDateLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom row on mobile / Right side on desktop: value and actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 pl-9 sm:pl-0">
                        <span className={`font-semibold text-sm sm:text-base whitespace-nowrap ${isPaid ? 'text-income' : 'text-expense'}`}>
                          {formatCurrency(bill.amount)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setBillToEdit(bill)}
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setBillToDelete(bill)}
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
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

      <EditBillModal
        isOpen={!!billToEdit}
        onClose={() => setBillToEdit(null)}
        onSave={handleEditBill}
        bill={billToEdit}
        categories={categories}
      />

      {/* Confirm Payment Dialog */}
      <AlertDialog open={!!billToConfirmPaid} onOpenChange={() => setBillToConfirmPaid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-income" />
              Confirmar Pagamento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja marcar a conta "{billToConfirmPaid?.name}" como paga?
              <br />
              <span className="font-medium">Valor: {billToConfirmPaid && formatCurrency(billToConfirmPaid.amount)}</span>
              <br />
              <span className="text-xs text-muted-foreground">
                Isso irá adicionar uma despesa às transações do mês.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPaid}
              className="bg-income hover:bg-income/90"
            >
              Sim, marcar como paga
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bill Dialog */}
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