import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  BrainCircuit, 
  Settings,
  User
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserProfile } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile | null;
}

export function MobileNav({ activeTab, setActiveTab, userProfile }: MobileNavProps) {
  const items = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ArrowLeftRight },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'ai', label: 'IA', icon: BrainCircuit },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-between h-20">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 transition-all",
              activeTab === item.id ? "text-emerald-600" : "text-slate-400"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all flex items-center justify-center overflow-hidden",
              activeTab === item.id ? "bg-emerald-50" : "bg-transparent"
            )}>
              {item.id === 'settings' && userProfile?.photoURL ? (
                <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200">
                  <img 
                    src={userProfile.photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
