import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Transaction, Category } from '@/types/finance';
import { exportToExcel } from '@/lib/exportToExcel';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
}

export function ExportModal({ isOpen, onClose, transactions, categories }: ExportModalProps) {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories.map(c => c.name)
  );
  const [includeIncome, setIncludeIncome] = useState(true);
  const [includeExpenses, setIncludeExpenses] = useState(true);

  const handleExport = () => {
    const filtered = transactions.filter(t => {
      const dateMatch = t.date >= startDate && t.date <= endDate;
      const categoryMatch = selectedCategories.includes(t.category);
      const typeMatch = 
        (t.type === 'income' && includeIncome) || 
        (t.type === 'expense' && includeExpenses);
      return dateMatch && categoryMatch && typeMatch;
    });

    exportToExcel(filtered, 'extrato_financeiro');
    onClose();
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(categories.map(c => c.name));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="export-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          key="export-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <div className="glass rounded-2xl p-4 sm:p-6 shadow-2xl border border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">Exportar para Excel</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Date Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Período
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs sm:text-sm">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs sm:text-sm">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Type Filters */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  Tipos de Transação
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={includeIncome}
                      onCheckedChange={(checked) => setIncludeIncome(checked as boolean)}
                    />
                    <span className="text-sm">Entradas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={includeExpenses}
                      onCheckedChange={(checked) => setIncludeExpenses(checked as boolean)}
                    />
                    <span className="text-sm">Saídas</span>
                  </label>
                </div>
              </div>

              {/* Category Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Categorias
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAllCategories} className="text-xs h-8 px-2">
                      Todas
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAllCategories} className="text-xs h-8 px-2">
                      Nenhuma
                    </Button>
                  </div>
                </div>

                {includeIncome && incomeCategories.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-income font-medium">Entradas</span>
                    <div className="grid grid-cols-2 gap-2">
                      {incomeCategories.map(cat => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                        >
                          <Checkbox
                            checked={selectedCategories.includes(cat.name)}
                            onCheckedChange={() => toggleCategory(cat.name)}
                          />
                          <span className="text-xs sm:text-sm truncate">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {includeExpenses && expenseCategories.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-expense font-medium">Saídas</span>
                    <div className="grid grid-cols-2 gap-2">
                      {expenseCategories.map(cat => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                        >
                          <Checkbox
                            checked={selectedCategories.includes(cat.name)}
                            onCheckedChange={() => toggleCategory(cat.name)}
                          />
                          <span className="text-xs sm:text-sm truncate">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <Button
                onClick={handleExport}
                className="w-full h-11 sm:h-12"
                disabled={
                  selectedCategories.length === 0 || 
                  (!includeIncome && !includeExpenses)
                }
              >
                Exportar para Excel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
