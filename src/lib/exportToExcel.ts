import { Transaction } from '@/types/finance';

export function exportToExcel(
  transactions: Transaction[],
  filename: string = 'extrato_financeiro'
) {
  // Create CSV content (Excel compatible)
  const headers = ['Data', 'Tipo', 'Categoria', 'Valor', 'Descrição', 'Recorrente', 'Tags'];
  
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString('pt-BR'),
    t.type === 'income' ? 'Entrada' : 'Saída',
    t.category,
    t.amount.toFixed(2).replace('.', ','),
    t.description,
    t.isRecurring ? 'Sim' : 'Não',
    t.tags?.join(', ') || '',
  ]);

  // Add summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  rows.push([]);
  rows.push(['RESUMO', '', '', '', '', '', '']);
  rows.push(['Total Entradas', '', '', totalIncome.toFixed(2).replace('.', ','), '', '', '']);
  rows.push(['Total Saídas', '', '', totalExpenses.toFixed(2).replace('.', ','), '', '', '']);
  rows.push(['Saldo', '', '', (totalIncome - totalExpenses).toFixed(2).replace('.', ','), '', '', '']);

  // Convert to CSV with BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvContent = BOM + [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatDate(dateString: string): string {
  // Parse the date and adjust for Brazil timezone (UTC-3)
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  // Parse the date and adjust for Brazil timezone (UTC-3)
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatDateToISO(date: Date): string {
  // Format date to YYYY-MM-DD in local timezone (Brazil)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
