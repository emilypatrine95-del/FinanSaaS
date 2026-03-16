import React from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc,
  orderBy
} from 'firebase/firestore';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Reports } from './components/Reports';
import { People } from './components/People';
import { Categories } from './components/Categories';
import { Goals } from './components/Goals';
import { AIAssistant } from './components/AIAssistant';
import { Settings } from './components/Settings';
import { MobileNav } from './components/MobileNav';
import { TransactionForm } from './components/TransactionForm';
import { UserProfile, Transaction, Person, Category, Goal } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCcw, Download, X } from 'lucide-react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = `Erro de Permissão: ${parsed.error}`;
      } catch (e) {}

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado</h2>
            <p className="text-slate-500 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold mx-auto hover:bg-slate-800 transition-all"
            >
              <RefreshCcw size={18} />
              Recarregar App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = React.useState<any>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = React.useState(false);

  // Data states
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [people, setPeople] = React.useState<Person[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  React.useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        unsubProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
          }
        }, (error) => {
          console.error("User profile snapshot error:", error);
        });
      } else {
        setUserProfile(null);
        if (unsubProfile) unsubProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  React.useEffect(() => {
    if (!user) return;

    const qTransactions = query(
      collection(db, 'transactions'), 
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );
    const qPeople = query(collection(db, 'people'), where('uid', '==', user.uid));
    const qCategories = query(collection(db, 'categories'), where('uid', '==', user.uid));
    const qGoals = query(collection(db, 'goals'), where('uid', '==', user.uid));

    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (error) => {
      console.error("Transactions snapshot error:", error);
    });

    const unsubPeople = onSnapshot(qPeople, (snapshot) => {
      setPeople(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person)));
    }, (error) => {
      console.error("People snapshot error:", error);
    });

    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      console.error("Categories snapshot error:", error);
    });

    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    }, (error) => {
      console.error("Goals snapshot error:", error);
    });

    return () => {
      unsubTransactions();
      unsubPeople();
      unsubCategories();
      unsubGoals();
    };
  }, [user]);

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Carregando FinanSaaS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} onAddTransaction={() => setShowTransactionForm(true)} />;
      case 'transactions':
        return <Transactions transactions={transactions} people={people} />;
      case 'reports':
        return <Reports transactions={transactions} />;
      case 'people':
        return <People people={people} />;
      case 'categories':
        return <Categories categories={categories} />;
      case 'goals':
        return <Goals goals={goals} />;
      case 'ai':
        return <AIAssistant transactions={transactions} />;
      case 'settings':
        return <Settings userProfile={userProfile} />;
      default:
        return <Dashboard transactions={transactions} onAddTransaction={() => setShowTransactionForm(true)} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
          onInstall={handleInstallClick}
          showInstall={!!deferredPrompt}
        />

        <main className="lg:ml-64 min-h-screen p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {showTransactionForm && (
          <TransactionForm 
            onClose={() => setShowTransactionForm(false)} 
            people={people}
          />
        )}

        <AnimatePresence>
          {showInstallBanner && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
            >
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Download size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Instalar FinanSaaS</p>
                    <p className="text-xs text-slate-400">Acesse mais rápido pelo seu celular.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleInstallClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Instalar
                  </button>
                  <button 
                    onClick={() => setShowInstallBanner(false)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
