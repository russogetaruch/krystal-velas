import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Images, MessageSquare, FileText, ExternalLink, TrendingUp, CheckCircle, Eye, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ gallery: 0, testimonials: 0, activeTestimonials: 0, content: 0 });
  const [loading, setLoading] = useState(true);
  const [recentGallery, setRecentGallery] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [g, t, c] = await Promise.all([
        supabase.from('gallery').select('*', { count: 'exact' }).limit(4).order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*', { count: 'exact' }),
        supabase.from('site_content').select('*', { count: 'exact' }),
      ]);
      setStats({
        gallery: g.count || 0,
        testimonials: t.count || 0,
        activeTestimonials: (t.data || []).filter(i => i.active).length,
        content: c.count || 0,
      });
      setRecentGallery(g.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
    <button onClick={onClick}
      className={`bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 text-left w-full hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-gray-400 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      {loading
        ? <div className="bg-gray-200 dark:bg-white/10 animate-pulse h-8 w-16 rounded-lg" />
        : <p className="text-gray-900 dark:text-white text-3xl font-bold">{value}</p>
      }
      {sub && <p className="text-gray-400 dark:text-white/30 text-xs mt-1">{sub}</p>}
      <p className={`text-xs font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity ${color.replace('bg-', 'text-').split(' ')[0]}`}>
        Gerenciar →
      </p>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-1">Visão Geral</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm">Resumo do painel administrativo da Krystal Velas.</p>
        </div>
        <a href="https://krystalvelas.vittalix.com.br" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-gray-600 dark:text-white/60 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors">
          <ExternalLink size={13} /> Ver site ao vivo
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={Images} label="Fotos na Vitrine" value={stats.gallery}
          sub="produtos publicados" color="bg-orange-500"
          onClick={() => onNavigate('gallery')}
        />
        <StatCard
          icon={MessageSquare} label="Depoimentos" value={stats.testimonials}
          sub={`${stats.activeTestimonials} ativos no site`} color="bg-blue-500"
          onClick={() => onNavigate('testimonials')}
        />
        <StatCard
          icon={FileText} label="Textos Gerenciados" value={stats.content}
          sub="campos de conteúdo" color="bg-emerald-500"
          onClick={() => onNavigate('content')}
        />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Últimas fotos */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white font-bold text-sm flex items-center gap-2">
              <Images size={15} className="text-orange-500" /> Últimas fotos adicionadas
            </h3>
            <button onClick={() => onNavigate('gallery')}
              className="text-gray-400 hover:text-orange-500 text-xs font-bold transition-colors">
              Ver todas →
            </button>
          </div>
          {loading
            ? <div className="grid grid-cols-4 gap-2">{[1,2,3,4].map(i => <div key={i} className="bg-gray-100 dark:bg-white/10 animate-pulse rounded-xl h-16" />)}</div>
            : recentGallery.length > 0
              ? <div className="grid grid-cols-4 gap-2">
                  {recentGallery.map(item => (
                    <div key={item.id} className="rounded-xl overflow-hidden aspect-square border border-gray-100 dark:border-white/10">
                      <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              : <p className="text-gray-400 text-sm">Nenhuma foto ainda.</p>
          }
        </div>

        {/* Ações rápidas */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-800 dark:text-white font-bold text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-orange-500" /> Ações Rápidas
          </h3>
          <div className="space-y-2">
            <button onClick={() => onNavigate('gallery')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold text-sm hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors text-left">
              <Images size={16} /> Adicionar nova foto à galeria
            </button>
            <button onClick={() => onNavigate('testimonials')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-left">
              <MessageSquare size={16} /> Publicar novo depoimento
            </button>
            <button onClick={() => onNavigate('content')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-left">
              <FileText size={16} /> Editar textos e WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
        <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <p className="text-emerald-800 dark:text-emerald-300 font-bold text-sm">Site está no ar e operacional</p>
          <p className="text-emerald-600 dark:text-emerald-500 text-xs mt-0.5">
            Supabase conectado · Galeria dinâmica ativa · Auth seguro
          </p>
        </div>
        <a href="https://krystalvelas.vittalix.com.br" target="_blank" rel="noopener noreferrer"
          className="ml-auto shrink-0 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:underline">
          <Eye size={13} /> Visualizar
        </a>
      </div>
    </div>
  );
}
