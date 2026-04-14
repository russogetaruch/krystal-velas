import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminDashboard from './AdminDashboard';
import AdminGallery from './AdminGallery';
import AdminTestimonials from './AdminTestimonials';
import AdminContent from './AdminContent';
import { LayoutDashboard, Images, MessageSquare, FileText, LogOut, Menu, X, Sun, Moon, ExternalLink } from 'lucide-react';

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'gallery',      label: 'Galeria',     icon: Images },
  { id: 'testimonials', label: 'Depoimentos', icon: MessageSquare },
  { id: 'content',      label: 'Conteúdo',    icon: FileText },
];

export default function AdminApp({ session, onLogout }) {
  const [active, setActive]       = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark]           = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem('kv_admin_dark');
    if (saved === 'true') setDark(true);
  }, []);

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

  const renderPage = () => {
    switch (active) {
      case 'dashboard':    return <AdminDashboard onNavigate={navigate} />;
      case 'gallery':      return <AdminGallery />;
      case 'testimonials': return <AdminTestimonials />;
      case 'content':      return <AdminContent />;
      default:             return <AdminDashboard onNavigate={navigate} />;
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="mb-10">
        <img src="/logo.png" alt="Krystal Velas" className="h-12 w-auto dark:brightness-0 dark:invert transition-all duration-300" />
        <p className="text-gray-400 dark:text-white/25 text-[9px] tracking-[0.35em] uppercase font-bold mt-2 pl-0.5">
          Painel Admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(item => {
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

      {/* Footer sidebar */}
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
        <p className="text-gray-400 dark:text-white/30 text-xs truncate px-1 py-1">{session?.user?.email}</p>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 text-gray-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <LogOut size={14} /> Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f7f5f2] dark:bg-[#0f0602] flex transition-colors duration-300">

      {/* ── Sidebar Desktop ── */}
      <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-[#1a0a05] border-r border-gray-200 dark:border-white/5 p-6 transition-colors duration-300 shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Header ── */}
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

      {/* ── Mobile Nav Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-[#1a0a05] z-40 pt-16 px-6 flex flex-col transition-colors overflow-y-auto">
          <SidebarContent />
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 md:p-10 p-4 pt-20 md:pt-10 overflow-auto min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 dark:text-white/30 text-xs mb-8 uppercase tracking-widest">
          <span>Admin</span>
          <span>/</span>
          <span className="text-orange-500 dark:text-orange-400">{NAV.find(n => n.id === active)?.label}</span>
        </div>

        {renderPage()}
      </main>
    </div>
  );
}
