import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, PieChart, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportsProps {
  transactions: Transaction[];
}

export function Reports({ transactions }: ReportsProps) {
  const [period, setPeriod] = React.useState('6m');

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const mTransactions = transactions.filter(t => 
      format(new Date(t.date), 'MM/yyyy') === format(date, 'MM/yyyy')
    );
    return {
      name: format(date, 'MMM', { locale: ptBR }),
      income: mTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
      expense: mTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    };
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Relatório Financeiro Detalhado', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Período selecionado: ${period === '1m' ? 'Último Mês' : period === '3m' ? 'Últimos 3 Meses' : period === '6m' ? 'Últimos 6 Meses' : 'Último Ano'}`, 14, 30);
    doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 35);

    // Summary Section
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Resumo Geral', 14, 50);
    
    doc.setFontSize(11);
    doc.text(`Total de Entradas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}`, 14, 60);
    doc.text(`Total de Saídas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}`, 14, 67);
    doc.text(`Saldo Final: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}`, 14, 74);

    // Categories Table
    doc.setFontSize(14);
    doc.text('Gastos por Categoria', 14, 90);
    
    autoTable(doc, {
      head: [['Categoria', 'Valor Total']],
      body: categoryData.map(c => [c.name, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.value)]),
      startY: 95,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Monthly Comparison Table
    doc.setFontSize(14);
    doc.text('Comparativo Mensal', 14, (doc as any).lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      head: [['Mês', 'Entradas', 'Saídas', 'Resultado']],
      body: monthlyData.map(m => [
        m.name, 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.income),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.expense),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.income - m.expense)
      ]),
      startY: (doc as any).lastAutoTable.finalY + 20,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Relatórios Detalhados</h2>
          <p className="text-slate-500 font-medium">Analise seu desempenho financeiro em profundidade.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none min-w-[200px]"
          >
            <option value="1m">Último Mês</option>
            <option value="3m">Últimos 3 Meses</option>
            <option value="6m">Últimos 6 Meses</option>
            <option value="1y">Último Ano</option>
          </select>
          <button 
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group"
          >
            <FileText size={20} className="group-hover:-translate-y-1 transition-transform" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <PieChart size={24} />
              </div>
              Distribuição de Gastos
            </h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '16px 24px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    fontSize: '12px',
                    letterSpacing: '1px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{value}</span>}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <BarChart3 size={24} />
              </div>
              Comparativo Mensal
            </h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '16px 24px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    fontSize: '12px',
                    letterSpacing: '1px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{value}</span>}
                />
                <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[12, 12, 0, 0]} />
                <Bar dataKey="expense" name="Saídas" fill="#f43f5e" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
