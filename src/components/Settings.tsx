import React from 'react';
import { User, Bell, Shield, Globe, Save, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsProps {
  userProfile: UserProfile | null;
}

export function Settings({ userProfile }: SettingsProps) {
  const [activeSection, setActiveSection] = React.useState<'profile' | 'notifications' | 'security'>('profile');
  const [fullName, setFullName] = React.useState(userProfile?.fullName || '');
  const [photoURL, setPhotoURL] = React.useState(userProfile?.photoURL || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName);
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB for base64 storage in Firestore)
    if (file.size > 1024 * 1024) {
      setSaveMessage({ type: 'error', text: 'A imagem deve ter menos de 1MB.' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const userRef = doc(db, 'users', userProfile.id);
      await updateDoc(userRef, {
        fullName: fullName,
        photoURL: photoURL,
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
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Preferências de Notificação</h3>
              <p className="text-slate-500 text-sm">Escolha como você quer ser avisado sobre suas finanças.</p>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-emerald-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                    <Bell size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Alertas de Gastos</p>
                    <p className="text-sm text-slate-500">Receba avisos quando ultrapassar 80% do seu orçamento.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-emerald-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                    <Globe size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Relatórios Semanais</p>
                    <p className="text-sm text-slate-500">Resumo semanal do seu desempenho financeiro por e-mail.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Segurança da Conta</h3>
              <p className="text-slate-500 text-sm">Proteja seus dados e gerencie o acesso à sua conta.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <Shield size={28} />
                  </div>
                  <p className="font-bold text-slate-900 text-lg">Autenticação em Duas Etapas</p>
                  <p className="text-sm text-slate-500 mt-2">Adicione uma camada extra de segurança à sua conta.</p>
                </div>
                <button className="w-full py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all">
                  Configurar 2FA
                </button>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                <div className="mb-6">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                    <Globe size={28} />
                  </div>
                  <p className="font-bold text-slate-900 text-lg">Alterar Senha</p>
                  <p className="text-sm text-slate-500 mt-2">Recomendamos trocar sua senha a cada 3 meses.</p>
                </div>
                <button 
                  onClick={handleResetPassword}
                  className="w-full py-3 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-white hover:border-emerald-500 hover:text-emerald-600 transition-all"
                >
                  Redefinir Senha
                </button>
              </div>
            </div>

            <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="font-black text-red-900 text-xl mb-1">Zona de Perigo</p>
                  <p className="text-sm text-red-600 max-w-md">Ao excluir sua conta, todos os seus dados financeiros serão permanentemente removidos. Esta ação não pode ser desfeita.</p>
                </div>
                <button className="px-8 py-4 bg-red-600 text-white rounded-2xl text-sm font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                  Excluir Minha Conta
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-1 flex flex-col items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 border-4 border-white shadow-xl overflow-hidden group relative cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                  ) : photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <User size={48} />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Alterar</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <input 
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="user"
                    className="hidden"
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors py-2 bg-emerald-50 rounded-xl"
                  >
                    Galeria
                  </button>
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors py-2 bg-blue-50 rounded-xl"
                  >
                    Tirar Foto
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email"
                      disabled
                      defaultValue={userProfile?.email}
                      className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-[1.5rem] text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moeda</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none">
                      <option value="BRL">Real (BRL)</option>
                      <option value="USD">Dólar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Idioma</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none">
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  {saveMessage && (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "text-sm font-black uppercase tracking-widest",
                        saveMessage.type === 'success' ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {saveMessage.text}
                    </motion.p>
                  )}
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving || (fullName === userProfile?.fullName && photoURL === userProfile?.photoURL)}
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-200"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Salvar Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h2>
          <p className="text-slate-500 font-medium">Personalize sua experiência no FinanSaaS.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
          <button 
            onClick={() => setActiveSection('profile')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all text-sm font-bold",
              activeSection === 'profile' 
                ? "bg-white text-emerald-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <User size={18} />
            <span className="hidden md:inline">Perfil</span>
          </button>
          <button 
            onClick={() => setActiveSection('notifications')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all text-sm font-bold",
              activeSection === 'notifications' 
                ? "bg-white text-emerald-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <Bell size={18} />
            <span className="hidden md:inline">Notificações</span>
          </button>
          <button 
            onClick={() => setActiveSection('security')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all text-sm font-bold",
              activeSection === 'security' 
                ? "bg-white text-emerald-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <Shield size={18} />
            <span className="hidden md:inline">Segurança</span>
          </button>
        </div>

        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
