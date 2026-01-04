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
      <Card variant="glass" className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[280px]">
          <p className="text-muted-foreground text-center">
            Nenhuma despesa registrada ainda
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
    >
      <Card variant="glass" className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-full lg:w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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
                          <div className="glass rounded-lg p-3 shadow-lg border border-border">
                            <p className="font-semibold">{data.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(data.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
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
            
            <div className="w-full lg:w-1/2 space-y-2">
              {chartData.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </motion.div>
              ))}
              
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
