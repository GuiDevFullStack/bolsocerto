import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BalanceCards } from '@/components/dashboard/BalanceCards';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { BillsSection } from '@/components/bills/BillsSection';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { ExportModal } from '@/components/transactions/ExportModal';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useToast } from '@/hooks/use-toast';
import { Bill } from '@/types/finance';

const Index = () => {
  const { toast } = useToast();
  const finance = useFinanceData();
  
  const [currentMonth, setCurrentMonth] = useState(() => 
    new Date().toISOString().slice(0, 7)
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const monthlyStats = finance.getMonthlyStats(currentMonth);
  const expenseBreakdown = finance.getCategoryBreakdown('expense', currentMonth);

  const monthTransactions = finance.transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + (direction === 'next' ? 1 : -1), 1);
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  const formatMonthYear = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const handleAddTransaction = (transaction: Parameters<typeof finance.addTransaction>[0]) => {
    finance.addTransaction(transaction);
    toast({
      title: transaction.type === 'income' ? 'Receita adicionada!' : 'Despesa adicionada!',
      description: `${transaction.category}: R$ ${transaction.amount.toFixed(2)}`,
    });
  };

  const handleAddBill = (bill: Omit<Bill, 'id'>) => {
    finance.addBill(bill);
    toast({
      title: 'Conta adicionada!',
      description: `${bill.name}: R$ ${bill.amount.toFixed(2)}`,
    });
  };

  const handleMarkBillAsPaid = (bill: Bill, callback: (transactionId: string) => void) => {
    // Create an expense transaction when bill is marked as paid
    const [year, month] = currentMonth.split('-').map(Number);
    const transactionDate = new Date(year, month - 1, bill.dueDay || 1);
    
    const newTransaction = finance.addTransaction({
      type: 'expense',
      category: bill.category,
      amount: bill.amount,
      date: transactionDate.toISOString().split('T')[0],
      description: `${bill.name}${bill.description ? ' - ' + bill.description : ''}`,
      isRecurring: bill.isFixed,
    });
    
    // Pass the transaction ID back to update the bill
    callback(newTransaction.id);
    
    toast({
      title: 'Conta marcada como paga!',
      description: `${bill.name} foi adicionada às despesas do mês.`,
    });
  };

  const handleUnmarkBillAsPaid = (transactionId: string) => {
    finance.deleteTransaction(transactionId);
    toast({
      title: 'Pagamento removido',
      description: 'A transação foi removida das despesas.',
    });
  };

  if (finance.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold hidden sm:block">BolsoCerto</span>
                <p className="text-xs text-muted-foreground hidden sm:block">Seu app de controle de finanças</p>
              </div>
            </motion.div>

            {/* Month Navigator */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-sm sm:text-base font-semibold min-w-[140px] text-center capitalize">
                {formatMonthYear(currentMonth)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Desktop Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-2"
            >
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="default"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-4 flex flex-col gap-2"
            >
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setIsExportModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar para Excel
              </Button>
              <Button
                variant="default"
                className="w-full justify-start"
                onClick={() => {
                  setIsAddModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Cards */}
        <BalanceCards
          totalIncome={monthlyStats.totalIncome}
          totalExpenses={monthlyStats.totalExpenses}
          balance={monthlyStats.balance}
          savingsRate={monthlyStats.savingsRate}
        />

        {/* Bills Section */}
        <BillsSection
          bills={finance.bills}
          categories={finance.categories}
          currentMonth={currentMonth}
          onAddBill={handleAddBill}
          onUpdateBill={finance.updateBill}
          onDeleteBill={finance.deleteBill}
          onMarkAsPaid={handleMarkBillAsPaid}
          onUnmarkAsPaid={handleUnmarkBillAsPaid}
        />

        {/* Charts and Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart data={expenseBreakdown} />
          <RecentTransactions 
            transactions={monthTransactions}
            categories={finance.categories}
            onDeleteTransaction={(id) => {
              finance.deleteTransaction(id);
              toast({
                title: 'Transação excluída',
                description: 'O valor foi removido do balanço.',
              });
            }}
            onUpdateTransaction={(id, updates) => {
              finance.updateTransaction(id, updates);
              toast({
                title: 'Transação atualizada',
                description: 'As alterações foram salvas.',
              });
            }}
          />
        </div>

        {/* Empty State */}
        {finance.transactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao FinanceApp!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Comece a controlar suas finanças adicionando sua primeira transação. 
              Todos os dados são armazenados localmente no seu dispositivo.
            </p>
            <Button
              size="lg"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Primeira Transação
            </Button>
          </motion.div>
        )}
      </main>

      {/* Floating Action Button (Mobile) - Peek from edge */}
      <motion.div
        initial={{ x: 40 }}
        animate={{ x: 40 }}
        whileHover={{ x: 0 }}
        whileTap={{ x: 0 }}
        drag="x"
        dragConstraints={{ left: 0, right: 40 }}
        dragElastic={0.1}
        className="fixed bottom-6 right-0 md:hidden z-50"
      >
        <Button
          size="xl"
          className="rounded-l-full rounded-r-none w-16 h-14 shadow-glow pr-6"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
        categories={finance.categories}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={finance.transactions}
        categories={finance.categories}
      />
    </div>
  );
};

export default Index;
