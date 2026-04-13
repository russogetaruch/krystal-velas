import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminGallery from './AdminGallery';
import AdminTestimonials from './AdminTestimonials';
import AdminContent from './AdminContent';
import { Images, MessageSquare, FileText, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

const NAV = [
  { id: 'gallery', label: 'Galeria', icon: Images },
  { id: 'testimonials', label: 'Depoimentos', icon: MessageSquare },
  { id: 'content', label: 'Conteúdo', icon: FileText },
];

export default function AdminApp({ session, onLogout }) {
  const [active, setActive] = useState('gallery');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // Aplica dark mode na tag <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Restaura preferência salva
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

  const Page = active === 'gallery' ? AdminGallery : active === 'testimonials' ? AdminTestimonials : AdminContent;

  return (
    <div className="min-h-screen bg-stone dark:bg-[#0f0602] flex transition-colors duration-300">

      {/* ── Sidebar Desktop ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#1a0a05] border-r border-gray-200 dark:border-white/5 p-6 transition-colors duration-300">

        {/* Logo — sem caixa no light, invertida no dark */}
        <div className="mb-10">
          <img
            src="/logo.png"
            alt="Krystal Velas"
            className="h-12 w-auto dark:brightness-0 dark:invert transition-all duration-300"
          />
          <p className="text-gray-400 dark:text-white/25 text-[9px] tracking-[0.35em] uppercase font-bold mt-2 pl-0.5">
            Painel Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active === item.id
                    ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20'
                    : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="border-t border-gray-200 dark:border-white/5 pt-4 mt-4 space-y-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-2 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white text-xs font-bold uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Modo Claro' : 'Modo Escuro'}
          </button>

          <p className="text-gray-400 dark:text-white/30 text-xs truncate px-1">{session?.user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-gray-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#1a0a05] border-b border-gray-200 dark:border-white/5 z-50 px-4 py-3 flex items-center justify-between transition-colors duration-300">
        <img
          src="/logo.png"
          alt="Krystal Velas"
          className="h-8 w-auto dark:brightness-0 dark:invert transition-all duration-300"
        />
        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="p-2 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-600 dark:text-white/60">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Nav Overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-[#1a0a05] z-40 pt-16 px-4 transition-colors">
          <nav className="space-y-2">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActive(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold ${
                    active === item.id
                      ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-600 dark:text-white/60'
                  }`}
                >
                  <Icon size={20} /> {item.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold text-red-500"
            >
              <LogOut size={20} /> Sair
            </button>
          </nav>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 md:p-10 p-4 pt-20 md:pt-10 overflow-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 dark:text-white/30 text-xs mb-8 uppercase tracking-widest">
          <span>Admin</span>
          <span>/</span>
          <span className="text-orange-500 dark:text-orange-400">{NAV.find(n => n.id === active)?.label}</span>
        </div>

        <Page />
      </main>
    </div>
  );
}
