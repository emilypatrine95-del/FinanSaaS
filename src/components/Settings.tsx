import React from 'react';
import { User, Bell, Shield, Globe, Save, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface SettingsProps {
  userProfile: UserProfile | null;
}

export function Settings({ userProfile }: SettingsProps) {
  const [activeSection, setActiveSection] = React.useState<'profile' | 'notifications' | 'security'>('profile');
  const [fullName, setFullName] = React.useState(userProfile?.fullName || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

  React.useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName);
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const userRef = doc(db, 'users', userProfile.id);
      await updateDoc(userRef, {
        fullName: fullName,
        updatedAt: new Date().toISOString()
      });
      setSaveMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.id}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleResetPassword = async () => {
    if (!userProfile?.email) return;
    try {
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      const auth = getAuth();
      await sendPasswordResetEmail(auth, userProfile.email);
      setSaveMessage({ type: 'success', text: 'E-mail de redefinição enviado!' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Erro ao enviar e-mail de redefinição.' });
    } finally {
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Preferências de Notificação</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-900">Alertas de Gastos</p>
                    <p className="text-sm text-slate-500">Receba avisos quando ultrapassar 80% do seu orçamento.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-900">Relatórios Semanais</p>
                    <p className="text-sm text-slate-500">Resumo semanal do seu desempenho financeiro por e-mail.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-900">Novidades e Dicas</p>
                    <p className="text-sm text-slate-500">Dicas de economia e novas funcionalidades da IA.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Segurança da Conta</h3>
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Autenticação em Duas Etapas (2FA)</p>
                      <p className="text-sm text-slate-500">Adicione uma camada extra de segurança à sua conta.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                    Configurar 2FA
                  </button>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Alterar Senha</p>
                      <p className="text-sm text-slate-500">Recomendamos trocar sua senha a cada 3 meses.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleResetPassword}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-white transition-all"
                  >
                    Redefinir Senha
                  </button>
                </div>

                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                  <p className="font-bold text-red-900 mb-1">Zona de Perigo</p>
                  <p className="text-sm text-red-600 mb-4">Ao excluir sua conta, todos os seus dados financeiros serão permanentemente removidos.</p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all">
                    Excluir Minha Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Informações Pessoais</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                    Alterar Foto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                    <input 
                      type="email"
                      disabled
                      defaultValue={userProfile?.email}
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {saveMessage && (
                    <p className={cn(
                      "text-sm font-medium",
                      saveMessage.type === 'success' ? "text-emerald-600" : "text-red-600"
                    )}>
                      {saveMessage.text}
                    </p>
                  )}
                  <div className="flex-1" />
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving || fullName === userProfile?.fullName}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Preferências</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Moeda</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                    <option value="BRL">Real (BRL)</option>
                    <option value="USD">Dólar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Idioma</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500">Gerencie sua conta e preferências do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          <button 
            onClick={() => setActiveSection('profile')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
              activeSection === 'profile' 
                ? "bg-white text-emerald-600 font-bold shadow-sm border border-slate-200" 
                : "text-slate-600 font-medium hover:bg-white"
            )}
          >
            <User size={18} />
            Perfil
          </button>
          <button 
            onClick={() => setActiveSection('notifications')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
              activeSection === 'notifications' 
                ? "bg-white text-emerald-600 font-bold shadow-sm border border-slate-200" 
                : "text-slate-600 font-medium hover:bg-white"
            )}
          >
            <Bell size={18} />
            Notificações
          </button>
          <button 
            onClick={() => setActiveSection('security')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
              activeSection === 'security' 
                ? "bg-white text-emerald-600 font-bold shadow-sm border border-slate-200" 
                : "text-slate-600 font-medium hover:bg-white"
            )}
          >
            <Shield size={18} />
            Segurança
          </button>
        </div>

        <div className="md:col-span-3">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
