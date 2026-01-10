import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Wallet, 
  Plus, 
  Receipt, 
  PieChart, 
  Download,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ONBOARDING_KEY = 'bolsocerto_onboarding_dismissed';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(ONBOARDING_KEY);
    if (!dismissed) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    }
    setIsOpen(false);
  };

  const features = [
    {
      icon: Wallet,
      title: 'Controle seu Saldo',
      description: 'Visualize receitas, despesas e seu saldo mensal de forma clara.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Plus,
      title: 'Adicione Transações',
      description: 'Registre receitas e despesas usando o botão + no canto da tela.',
      color: 'text-income',
      bgColor: 'bg-income/10',
    },
    {
      icon: Receipt,
      title: 'Gerencie Contas',
      description: 'Cadastre contas do mês e marque como pagas com um clique.',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: PieChart,
      title: 'Analise seus Gastos',
      description: 'Veja gráficos de despesas por categoria para entender seus hábitos.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Download,
      title: 'Exporte para Excel',
      description: 'Baixe suas transações em formato CSV para análise externa.',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-lg glass rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 text-center border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow"
              >
                <Wallet className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-1">Bem-vindo ao BolsoCerto!</h2>
              <p className="text-muted-foreground text-sm">
                Seu app de controle de finanças pessoais
              </p>
            </div>

            {/* Features */}
            <div className="p-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Veja o que você pode fazer:
              </p>
              
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 pt-2 space-y-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                />
                <Label htmlFor="dontShowAgain" className="text-sm text-muted-foreground cursor-pointer">
                  Não mostrar novamente
                </Label>
              </div>
              
              <Button onClick={handleClose} className="w-full" size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Começar a usar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}