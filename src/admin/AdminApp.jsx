import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import AdminDashboard from './AdminDashboard';
import AdminGallery from './AdminGallery';
import AdminTestimonials from './AdminTestimonials';
import AdminContent from './AdminContent';
import AdminUsers from './AdminUsers';
import AdminLogs from './AdminLogs';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import { LayoutDashboard, Images, MessageSquare, FileText, LogOut, Menu, X, Sun, Moon, ExternalLink, Shield, UserCog, Lock, Activity, ShoppingBag, Tag, ShoppingCart, ShieldAlert } from 'lucide-react';

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'orders',       label: 'Vendas',       icon: ShoppingCart },
  { id: 'products',     label: 'Produtos',     icon: ShoppingBag },
  { id: 'categories',   label: 'Categorias',   icon: Tag },
  { id: 'gallery',      label: 'Fotos Vitrine', icon: Images },
  { id: 'testimonials', label: 'Depoimentos',  icon: MessageSquare },
  { id: 'content',      label: 'Conteúdo',     icon: FileText },
  { id: 'logs',         label: 'Logs',         icon: Activity, superOnly: true },
  { id: 'users',        label: 'Usuários',     icon: UserCog, superOnly: true },
];

export default function AdminApp({ session, onLogout }) {
  const [active, setActive]       = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark]           = useState(false);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem('kv_admin_dark');
    if (saved === 'true') setDark(true);
  }, []);

  useEffect(() => {
    async function getProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar perfil:', error);
          // Se não existir perfil, cria um como pendente
          if (error.code === 'PGRST116') {
             const { data: newProfile } = await supabase
               .from('profiles')
               .insert({ id: session.user.id, email: session.user.email, role: 'pending' })
               .select()
               .single();
             setProfile(newProfile);
          }
        } else {
           setProfile(data);
        }
      } catch (err) {
        console.error('Crash ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, [session]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('kv_admin_dark', String(next));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const navigate = (id) => {
    setActive(id);
    setMobileOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone dark:bg-[#0f0602] flex flex-col items-center justify-center p-10 text-center transition-colors">
        <img src="/logo.png" alt="Krystal Velas" className="h-14 w-auto mb-6 dark:brightness-0 dark:invert opacity-20 animate-pulse" />
        <p className="text-gray-400 dark:text-white/20 text-xs tracking-widest uppercase animate-pulse">Autenticando Permissões...</p>
      </div>
    );
  }

  const isSuper = profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'admin' || isSuper;

  // Tela de bloqueio se não for admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-xl font-serif text-brown dark:text-white">Painel Administrativo v2</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Sua conta (<span className="font-bold text-brown">{session.user.email}</span>) está cadastrada, mas ainda não possui permissões administrativas.
          </p>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-orange-700 text-xs mb-8">
            Solicite ao seu supervisor para liberar seu acesso no menu <strong>Administradores</strong>.
          </div>
          <button onClick={handleLogout} className="w-full bg-brown text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-wine transition-colors">
            Sair e Tentar Outra Conta
          </button>
        </div>
      </div>
    );
  }

  const filteredNav = NAV.filter(item => !item.superOnly || isSuper);

  const renderPage = () => {
    switch (active) {
      case 'dashboard':    return <AdminDashboard onNavigate={navigate} session={session} />;
      case 'gallery':      return <AdminGallery session={session} />;
      case 'testimonials': return <AdminTestimonials session={session} />;
      case 'content':      return <AdminContent session={session} />;
      case 'products':     return <AdminProducts session={session} />;
      case 'categories':   return <AdminCategories session={session} />;
      case 'orders':       return <AdminOrders session={session} />;
      case 'users':        return <AdminUsers currentUser={profile} session={session} />;
      case 'logs':         return <AdminLogs session={session} />;
      default:             return <AdminDashboard onNavigate={navigate} session={session} />;
    }
  };

  const safeRender = () => {
    try {
      return renderPage();
    } catch (err) {
      console.error('Erro na aba ativa:', err);
      return (
        <div className="bg-red-50 p-10 rounded-3xl border border-red-100 text-center">
          <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-red-700 font-serif text-xl mb-2">Erro ao carregar esta aba</h2>
          <p className="text-red-600/60 text-sm mb-6">Ocorreu um erro interno. Tente recarregar ou mudar de aba.</p>
          <button onClick={() => window.location.reload()} className="bg-red-500 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase">Recarregar</button>
        </div>
      );
    }
  };

  const SidebarContent = () => (
    <>
      <div className="mb-10">
        <img src="/logo.png" alt="Krystal Velas" className="h-12 w-auto dark:brightness-0 dark:invert transition-all duration-300" />
        <p className="text-gray-400 dark:text-white/25 text-[9px] tracking-[0.35em] uppercase font-bold mt-2 pl-0.5">
          Painel Admin {isSuper && <span className="text-orange-500 ml-1">· Super</span>}
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredNav.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}>
              <Icon size={18} />
              {item.label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 dark:border-white/5 pt-4 mt-4 space-y-1">
        <a href="https://krystalvelas.vittalix.com.br" target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center gap-2 text-gray-400 dark:text-white/30 hover:text-orange-500 dark:hover:text-orange-400 text-xs font-bold uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
          <ExternalLink size={13} /> Ver site
        </a>
        <button onClick={toggleDark}
          className="w-full flex items-center gap-2 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          {dark ? 'Modo Claro' : 'Modo Escuro'}
        </button>
        <div className="px-3 py-2 flex items-center gap-2 text-gray-400 dark:text-white/20 select-none">
          <Shield size={12} className={isSuper ? 'text-orange-500' : 'text-green-500'} />
          <span className="text-[10px] font-bold uppercase tracking-tighter truncate">{session?.user?.email}</span>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 text-gray-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <LogOut size={14} /> Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f7f5f2] dark:bg-[#0f0602] flex transition-colors duration-300">
      <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-[#1a0a05] border-r border-gray-200 dark:border-white/5 p-6 transition-colors duration-300 shrink-0">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#1a0a05] border-b border-gray-200 dark:border-white/5 z-50 px-4 py-3 flex items-center justify-between transition-colors duration-300">
        <img src="/logo.png" alt="Krystal Velas" className="h-8 w-auto dark:brightness-0 dark:invert transition-all duration-300" />
        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="p-2 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600 dark:text-white/60">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-[#1a0a05] z-40 pt-16 px-6 flex flex-col transition-colors overflow-y-auto">
          <SidebarContent />
        </div>
      )}

      <main className="flex-1 md:p-10 p-4 pt-20 md:pt-10 overflow-auto min-w-0">
        <div className="flex items-center gap-2 text-gray-400 dark:text-white/30 text-xs mb-8 uppercase tracking-widest">
          <span>Admin</span>
          <span>/</span>
          <span className="text-orange-500 dark:text-orange-400">
            {active === 'users' ? 'Usuários' : NAV.find(n => n.id === active)?.label}
          </span>
        </div>

        {safeRender()}
      </main>
    </div>
  );
}
