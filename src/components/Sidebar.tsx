import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  Users, 
  Tags, 
  Target, 
  BrainCircuit, 
  Settings, 
  LogOut,
  Menu,
  X,
  Download
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onInstall?: () => void;
  showInstall?: boolean;
}

export function Sidebar({ activeTab, setActiveTab, onLogout, onInstall, showInstall }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const mainItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ArrowLeftRight },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  const manageItems = [
    { id: 'people', label: 'Pessoas', icon: Users },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'goals', label: 'Metas', icon: Target },
  ];

  const extraItems = [
    { id: 'ai', label: 'IA Financeira', icon: BrainCircuit },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none -translate-x-full",
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">FinanSaaS</h1>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-3">Principal</p>
                <nav className="space-y-1">
                  {mainItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                        activeTab === item.id 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-3">Gerenciar</p>
                <nav className="space-y-1">
                  {manageItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                        activeTab === item.id 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-3">Sistema</p>
                <nav className="space-y-1">
                  {extraItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                        activeTab === item.id 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-auto p-8 space-y-4">
            {showInstall && (
              <button 
                onClick={onInstall}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-sm font-black bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-100"
              >
                <Download size={20} />
                Instalar App
              </button>
            )}
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={20} />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay removed since we don't have a mobile sidebar anymore */}
    </>
  );
}
