import React from 'react';
import { Target, Plus, TrendingUp, Calendar, MoreHorizontal } from 'lucide-react';
import { Goal } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

interface GoalsProps {
  goals: Goal[];
}

export function Goals({ goals }: GoalsProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    category: 'Geral'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'goals'), {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        uid: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      setShowForm(false);
      setFormData({ title: '', targetAmount: '', currentAmount: '0', deadline: '', category: 'Geral' });
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.CREATE, 'goals');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.DELETE, `goals/${id}`);
      }
      console.error(error);
    }
  };

  const handleUpdateProgress = async (goal: Goal) => {
    const amount = prompt('Quanto você deseja adicionar à meta?', '0');
    if (amount === null) return;
    const newAmount = goal.currentAmount + parseFloat(amount);
    try {
      await updateDoc(doc(db, 'goals', goal.id), {
        currentAmount: newAmount
      });
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.UPDATE, `goals/${goal.id}`);
      }
      console.error(error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Metas Financeiras</h2>
          <p className="text-slate-500 font-medium">Transforme seus sonhos em objetivos alcançáveis.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nova Meta</h3>
              <button onClick={() => setShowForm(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título da Meta</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                  placeholder="Ex: Viagem de Férias"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Alvo</label>
                  <input 
                    type="number" 
                    required
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Atual</label>
                  <input 
                    type="number" 
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prazo Final</label>
                <input 
                  type="date" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:bg-slate-200"
              >
                {loading ? 'Salvando...' : 'Criar Meta'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map((goal) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all group">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 transition-transform group-hover:rotate-12">
                  <Target size={28} />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleUpdateProgress(goal)}
                    className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                    title="Adicionar progresso"
                  >
                    <TrendingUp size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(goal.id)}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{goal.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Meta: {formatCurrency(goal.targetAmount)}</p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Calendar size={14} />
                  {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full",
                  progress >= 100 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                )}>
                  {progress >= 100 ? 'Concluída!' : 'Em progresso'}
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Target size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-black text-xl tracking-tight">Você ainda não tem metas definidas.</p>
            <p className="text-slate-400 font-medium mt-2">Comece a planejar seu futuro hoje mesmo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
