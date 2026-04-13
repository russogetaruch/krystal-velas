import { useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminGallery from './AdminGallery';
import AdminTestimonials from './AdminTestimonials';
import AdminContent from './AdminContent';
import { Images, MessageSquare, FileText, LogOut, Menu, X } from 'lucide-react';

const NAV = [
  { id: 'gallery', label: 'Galeria', icon: Images },
  { id: 'testimonials', label: 'Depoimentos', icon: MessageSquare },
  { id: 'content', label: 'Conteúdo', icon: FileText },
];

export default function AdminApp({ session, onLogout }) {
  const [active, setActive] = useState('gallery');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const Page = active === 'gallery' ? AdminGallery : active === 'testimonials' ? AdminTestimonials : AdminContent;

  return (
    <div className="min-h-screen bg-[#0f0602] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1a0a05] border-r border-white/5 p-6">
        {/* Logo */}
        <div className="flex flex-col items-start gap-2 mb-10">
          <div className="bg-white/95 px-4 py-2.5 rounded-xl shadow-lg shadow-black/30">
            <img src="/logo.png" alt="Krystal Velas" className="h-10 w-auto" />
          </div>
          <p className="text-white/25 text-[9px] tracking-[0.35em] uppercase font-bold pl-1">Painel Admin</p>
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
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <p className="text-white/30 text-xs truncate mb-3">{session?.user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white/40 hover:text-red-400 text-xs font-bold uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#1a0a05] border-b border-white/5 z-50 px-4 py-3 flex items-center justify-between">
        <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md">
          <img src="/logo.png" alt="Krystal Velas" className="h-8 w-auto" />
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-[#1a0a05] z-40 pt-16 px-4">
          <nav className="space-y-2">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => { setActive(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold ${active === item.id ? 'bg-orange-500/20 text-orange-400' : 'text-white/60'}`}>
                  <Icon size={20} /> {item.label}
                </button>
              );
            })}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-bold text-red-400">
              <LogOut size={20} /> Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:p-10 p-4 pt-20 md:pt-10 overflow-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/30 text-xs mb-8 uppercase tracking-widest">
          <span>Admin</span>
          <span>/</span>
          <span className="text-orange-400">{NAV.find(n => n.id === active)?.label}</span>
        </div>

        <Page />
      </main>
    </div>
  );
}
