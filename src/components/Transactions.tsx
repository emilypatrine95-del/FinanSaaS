import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Tag,
  User
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Transaction, Person } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  people: Person[];
}

export function Transactions({ transactions, people }: TransactionsProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getPersonName = (id?: string) => {
    if (!id) return '-';
    return people.find(p => p.id === id)?.name || '-';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
      }
      console.error(error);
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Relatório de Transações', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

    const tableColumn = ["Data", "Descrição", "Categoria", "Pessoa", "Valor", "Tipo"];
    const tableRows = filteredTransactions.map(t => [
      format(new Date(t.date), 'dd/MM/yyyy'),
      t.description,
      t.category,
      getPersonName(t.personId),
      formatCurrency(t.amount),
      t.type === 'income' ? 'Entrada' : 'Saída'
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 40 },
    });

    doc.save(`transacoes_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Transações</h2>
          <p className="text-slate-500 font-medium">Gerencie suas entradas e saídas com precisão.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={20} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 appearance-none min-w-[180px]"
              >
                <option value="all">Todos os Tipos</option>
                <option value="income">Entradas</option>
                <option value="expense">Saídas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pessoa</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="group hover:scale-[1.01] transition-all">
                  <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-slate-50 first:rounded-l-2xl last:rounded-r-2xl border-y border-transparent group-hover:border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <Calendar size={16} className="text-slate-400" />
                      {format(new Date(t.date), 'dd MMM, yyyy', { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                        t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      )}>
                        {t.type === 'income' ? (
                          <ArrowUpCircle size={20} />
                        ) : (
                          <ArrowDownCircle size={20} />
                        )}
                      </div>
                      <span className="text-sm font-black text-slate-900">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-100">
                    <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <User size={16} className="text-slate-400" />
                      {getPersonName(t.personId)}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-100 text-right">
                    <span className={cn(
                      "text-base font-black tracking-tight",
                      t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-5 bg-slate-50/50 group-hover:bg-slate-50 first:rounded-l-2xl last:rounded-r-2xl border-y border-transparent group-hover:border-slate-100 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold">Nenhuma transação encontrada.</p>
              <p className="text-slate-400 text-sm">Tente ajustar seus filtros ou busca.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
