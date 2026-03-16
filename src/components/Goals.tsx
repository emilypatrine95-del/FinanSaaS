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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Metas Financeiras</h2>
          <p className="text-slate-500">Planeje e acompanhe seus objetivos.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Nova Meta</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Ex: Viagem de Férias"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alvo</label>
                  <input 
                    type="number" 
                    required
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Atual</label>
                  <input 
                    type="number" 
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prazo</label>
                <input 
                  type="date" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:bg-slate-300"
              >
                {loading ? 'Salvando...' : 'Criar Meta'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Target size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleUpdateProgress(goal)}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    title="Adicionar progresso"
                  >
                    <Plus size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">{goal.title}</h3>
              <p className="text-sm text-slate-500 mb-6">Meta: {formatCurrency(goal.targetAmount)}</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600">{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-emerald-600">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={14} />
                  {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <TrendingUp size={14} />
                  {progress >= 100 ? 'Concluída!' : 'Em progresso'}
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500">Você ainda não tem metas definidas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
