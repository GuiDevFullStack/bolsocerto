import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bill, Category } from '@/types/finance';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bill: Omit<Bill, 'id'>) => void;
  categories: Category[];
}

export function AddBillModal({ isOpen, onClose, onAdd, categories }: AddBillModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [isFixed, setIsFixed] = useState(false);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount || !category) return;

    const bill: Omit<Bill, 'id'> = {
      name: name.trim(),
      amount: parseFloat(amount),
      category,
      description: description.trim() || undefined,
      dueDay: dueDay ? parseInt(dueDay) : 1,
      isFixed,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };

    onAdd(bill);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('');
    setDescription('');
    setDueDay('');
    setIsFixed(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-warning" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">Nova Conta</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Aluguel, Internet, Luz..."
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Day */}
              <div className="space-y-2">
                <Label htmlFor="dueDay">Dia de Vencimento</Label>
                <Input
                  id="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="1-31"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                />
              </div>

              {/* Fixed Cost Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <Label htmlFor="isFixed" className="font-medium">Custo Fixo</Label>
                  <p className="text-xs text-muted-foreground">
                    Aparecerá automaticamente todos os meses
                  </p>
                </div>
                <Switch
                  id="isFixed"
                  checked={isFixed}
                  onCheckedChange={setIsFixed}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg">
                Adicionar Conta
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
