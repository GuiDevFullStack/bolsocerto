import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/exportToExcel';

interface CategoryData {
  category: string;
  amount: number;
}

interface ExpenseChartProps {
  data: CategoryData[];
}

const COLORS = [
  'hsl(12, 76%, 61%)',    // expense
  'hsl(38, 92%, 50%)',    // warning
  'hsl(217, 91%, 60%)',   // chart-4
  'hsl(280, 65%, 60%)',   // chart-5
  'hsl(160, 84%, 39%)',   // primary
  'hsl(180, 70%, 35%)',   // accent variant
];

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    return data.slice(0, 6).map((item, index) => ({
      ...item,
      percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0,
      fill: COLORS[index % COLORS.length],
    }));
  }, [data]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (data.length === 0) {
    return (
      <Card variant="glass" className="h-full min-h-[300px]">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Saídas por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] sm:h-[280px]">
          <p className="text-muted-foreground text-center text-sm">
            Nenhuma saída registrada ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="h-full"
    >
      <Card variant="glass" className="h-full">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Saídas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="w-full h-[160px] sm:h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card rounded-lg p-2 sm:p-3 shadow-lg border border-border">
                            <p className="font-semibold text-sm">{data.category}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(data.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {data.percentage}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full space-y-1 sm:space-y-2">
              {chartData.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs sm:text-sm font-medium truncate">{item.category}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-semibold">{formatCurrency(item.amount)}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </motion.div>
              ))}
              
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total</span>
                  <span className="text-sm sm:text-base font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
