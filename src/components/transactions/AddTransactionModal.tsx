import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category, TransactionType } from '@/types/finance';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatDateToISO } from '@/lib/exportToExcel';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: {
    type: TransactionType;
    category: string;
    amount: number;
    date: string;
    description: string;
    isRecurring: boolean;
  }) => void;
  categories: Category[];
}

export function AddTransactionModal({ isOpen, onClose, onAdd, categories }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  });
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    onAdd({
      type,
      category,
      amount: parseFloat(amount),
      date: formatDateToISO(date),
      description,
      isRecurring,
    });

    // Reset form
    setCategory('');
    setAmount('');
    setDescription('');
    setIsRecurring(false);
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setAmount(value);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="glass rounded-2xl p-4 sm:p-6 shadow-2xl border border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">Nova Transação</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2 mb-4 sm:mb-6">
              <Button
                type="button"
                variant={type === 'income' ? 'income' : 'ghost'}
                className="flex-1 text-xs sm:text-sm"
                onClick={() => setType('income')}
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                Receita
              </Button>
              <Button
                type="button"
                variant={type === 'expense' ? 'expense' : 'ghost'}
                className="flex-1 text-xs sm:text-sm"
                onClick={() => setType('expense')}
              >
                <Minus className="w-4 h-4 mr-1 sm:mr-2" />
                Despesa
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">
                    R$
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={handleAmountChange}
                    className="pl-10 sm:pl-12 text-lg sm:text-xl font-bold h-12 sm:h-14"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="h-10 sm:h-11">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-10 sm:h-11 justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDay) => {
                        if (selectedDay) {
                          // Use the date components directly to avoid any timezone issues
                          const year = selectedDay.getFullYear();
                          const month = selectedDay.getMonth();
                          const day = selectedDay.getDate();
                          const newDate = new Date(year, month, day, 12, 0, 0);
                          console.log('Selected:', selectedDay, 'Adjusted:', newDate, 'Day:', day);
                          setDate(newDate);
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ex: Supermercado, Uber, etc."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="h-10 sm:h-11"
                />
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <Label htmlFor="recurring" className="cursor-pointer text-sm">
                  Transação recorrente
                </Label>
                <button
                  id="recurring"
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors flex-shrink-0
                    ${isRecurring ? 'bg-primary' : 'bg-muted'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform
                      ${isRecurring ? 'left-6' : 'left-1'}
                    `}
                  />
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant={type === 'income' ? 'income' : 'expense'}
                className="w-full h-11 sm:h-12"
                disabled={!category || !amount}
              >
                Adicionar {type === 'income' ? 'Receita' : 'Despesa'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
