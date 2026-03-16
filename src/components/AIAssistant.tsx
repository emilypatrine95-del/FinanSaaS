import React from 'react';
import { BrainCircuit, Sparkles, TrendingUp, Lightbulb, BarChart } from 'lucide-react';
import { Transaction, AIAnalysis } from '../types';
import { analyzeFinances } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  transactions: Transaction[];
}

export function AIAssistant({ transactions }: AIAssistantProps) {
  const [analysis, setAnalysis] = React.useState<AIAnalysis | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeFinances(transactions);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">IA Financeira</h2>
          <p className="text-slate-500">Análise inteligente dos seus dados financeiros.</p>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={loading || transactions.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <BrainCircuit size={20} />
          )}
          {loading ? 'Analisando...' : 'Gerar Nova Análise'}
        </button>
      </div>

      {!analysis && !loading && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Pronto para insights inteligentes?</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Nossa IA analisa seus padrões de gastos, sugere economias e prevê seu futuro financeiro com base nas suas transações.
          </p>
          {transactions.length === 0 && (
            <p className="text-amber-600 text-sm font-medium bg-amber-50 px-4 py-2 rounded-lg inline-block">
              Adicione algumas transações primeiro para que a IA possa analisar.
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          <div className="h-48 bg-slate-100 animate-pulse rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
            <div className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
          </div>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <BarChart size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Resumo da Situação</h3>
              </div>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{analysis.summary}</ReactMarkdown>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Padrões Identificados</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">{analysis.patterns}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl shadow-emerald-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Lightbulb size={20} />
                </div>
                <h3 className="text-xl font-bold">Dicas de Economia</h3>
              </div>
              <ul className="space-y-4">
                {analysis.savingsTips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-emerald-50">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-300 rounded-full flex-shrink-0" />
                    <span className="text-sm font-medium">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Previsão</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{analysis.forecast}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
