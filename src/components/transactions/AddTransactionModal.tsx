import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category, TransactionType } from '@/types/finance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
      date,
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="glass rounded-2xl p-6 mx-4 shadow-2xl border border-border">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Nova Transação</h2>
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
              <div className="flex gap-2 mb-6">
                <Button
                  type="button"
                  variant={type === 'income' ? 'income' : 'ghost'}
                  className="flex-1"
                  onClick={() => setType('income')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Receita
                </Button>
                <Button
                  type="button"
                  variant={type === 'expense' ? 'expense' : 'ghost'}
                  className="flex-1"
                  onClick={() => setType('expense')}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Despesa
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-12 text-xl font-bold h-14"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
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
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
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
                  />
                </div>

                {/* Recurring Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <Label htmlFor="recurring" className="cursor-pointer">
                    Transação recorrente
                  </Label>
                  <button
                    id="recurring"
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${isRecurring ? 'bg-primary' : 'bg-muted'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform
                        ${isRecurring ? 'left-7' : 'left-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant={type === 'income' ? 'income' : 'expense'}
                  className="w-full h-12"
                  disabled={!category || !amount}
                >
                  Adicionar {type === 'income' ? 'Receita' : 'Despesa'}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
