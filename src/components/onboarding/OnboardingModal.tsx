import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Plus, Receipt, PieChart, Download, ChevronLeft, ChevronRight, Coffee, ShoppingBag, Zap, Home, Droplets, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
const ONBOARDING_KEY = 'bolsocerto_onboarding_dismissed';
interface SlideProps {
  children: React.ReactNode;
}
function Slide({
  children
}: SlideProps) {
  return <div className="w-full flex-shrink-0 px-1">
      {children}
    </div>;
}
export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;
  useEffect(() => {
    const dismissed = localStorage.getItem(ONBOARDING_KEY);
    if (!dismissed) {
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
  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  const slides = [
  // Slide 1 - Welcome
  {
    content: <div className="text-center py-4">
          <motion.div initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} transition={{
        delay: 0.2,
        type: 'spring'
      }} className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-3">Bem-vindo ao BolsoCerto!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Seu app de controle de finanças pessoais
          </p>
          <p className="text-sm text-foreground/80">
            Vamos te mostrar como usar cada função do app para organizar suas finanças de forma simples e eficiente.
          </p>
        </div>
  },
  // Slide 2 - Balance Cards
  {
    content: <div className="py-4">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-center mb-3">Controle seu Saldo</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Na tela principal você visualiza:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-income/10 border border-income/20">
              <div className="w-3 h-3 rounded-full bg-income" />
              <span className="text-sm font-medium">Entradas do mês</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-expense/10 border border-expense/20">
              <div className="w-3 h-3 rounded-full bg-expense" />
              <span className="text-sm font-medium">Saídas do mês</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm font-medium">Saldo restante</span>
            </div>
          </div>
        </div>
  },
  // Slide 3 - Transactions (daily expenses)
  {
    content: <div className="py-4">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-income/10 flex items-center justify-center">
            <Plus className="w-7 h-7 text-income" />
          </div>
          <h3 className="text-xl font-bold text-center mb-2">Adicionar Transações</h3>
          <p className="text-xs text-primary font-medium text-center mb-3 bg-primary/10 rounded-full py-1 px-3 inline-block w-full">💡 Para Salário usar o (+Entradas) e gastos do dia a dia (-Saídas)</p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Use o botão <span className="text-primary font-bold">+</span> no canto da tela para registrar:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
              <Coffee className="w-4 h-4 text-warning" />
              <span className="text-xs">Lanche</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span className="text-xs">Roupas</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
              <span className="text-sm">🎮</span>
              <span className="text-xs">Lazer</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/50">
              <span className="text-sm">🛒</span>
              <span className="text-xs">Mercado</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Transações são gastos que acontecem no momento, sem data prevista.
          </p>
        </div>
  },
  // Slide 4 - Bills (recurring/planned)
  {
    content: <div className="py-4">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-warning/10 flex items-center justify-center">
            <Receipt className="w-7 h-7 text-warning" />
          </div>
          <h3 className="text-xl font-bold text-center mb-2">Gerenciar Contas</h3>
          <p className="text-xs text-warning font-medium text-center mb-3 bg-warning/10 rounded-full py-1 px-3 inline-block w-full">
            📅 Contas previstas e recorrentes
          </p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Cadastre suas contas fixas e acompanhe os pagamentos:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Conta de Luz</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Conta de Água</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
              <Home className="w-4 h-4 text-primary" />
              <span className="text-sm">Aluguel</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Marque como pago com um clique e a despesa é registrada automaticamente!
          </p>
        </div>
  },
  // Slide 5 - Charts & Export
  {
    content: <div className="py-4">
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-accent" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Download className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-center mb-3">Análise e Exportação</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <PieChart className="w-4 h-4 text-accent" />
                <span className="font-medium text-sm">Gráficos por Categoria</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Visualize seus gastos organizados por categoria para entender seus hábitos.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Exportar para Excel</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Baixe suas transações em CSV para análise externa ou backup.
              </p>
            </div>
          </div>
        </div>
  }];
  return <AnimatePresence>
      {isOpen && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <motion.div initial={{
        opacity: 0,
        scale: 0.9,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.9,
        y: 20
      }} transition={{
        type: 'spring',
        duration: 0.5
      }} className="relative w-full max-w-md glass rounded-2xl border border-border shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative p-4 pb-0 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {currentSlide + 1} de {totalSlides}
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Slides Container */}
            <div className="overflow-hidden">
              <motion.div className="flex" animate={{
            x: `-${currentSlide * 100}%`
          }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}>
                {slides.map((slide, index) => <Slide key={index}>{slide.content}</Slide>)}
              </motion.div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 py-3">
              {slides.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} />)}
            </div>

            {/* Footer */}
            <div className="p-4 pt-2 space-y-3 border-t border-border">
              {/* Navigation Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={prevSlide} disabled={currentSlide === 0} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                {currentSlide < totalSlides - 1 ? <Button onClick={nextSlide} className="flex-1">
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button> : <Button onClick={handleClose} className="flex-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Começar
                  </Button>}
              </div>

              {/* Don't show again */}
              <div className="flex items-center justify-center gap-2">
                <Checkbox id="dontShowAgain" checked={dontShowAgain} onCheckedChange={checked => setDontShowAgain(checked === true)} />
                <Label htmlFor="dontShowAgain" className="text-xs text-muted-foreground cursor-pointer">
                  Não mostrar novamente
                </Label>
              </div>
            </div>
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}