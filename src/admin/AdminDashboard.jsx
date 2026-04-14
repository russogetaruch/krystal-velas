import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Images, MessageSquare, FileText, ExternalLink, TrendingUp, CheckCircle, AlertTriangle, Wrench, Clock, X } from 'lucide-react';

const DURATION_OPTIONS = [
  { label: '30 minutos', minutes: 30 },
  { label: '1 hora',     minutes: 60 },
  { label: '2 horas',    minutes: 120 },
  { label: '4 horas',    minutes: 240 },
  { label: '8 horas',    minutes: 480 },
  { label: '24 horas',   minutes: 1440 },
];

function useCountdown(until) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!until) { setTimeLeft(null); return; }
    const end = new Date(until).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);

  return timeLeft;
}

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats]       = useState({ gallery: 0, testimonials: 0, activeTestimonials: 0, content: 0 });
  const [loading, setLoading]   = useState(true);
  const [recentGallery, setRecentGallery] = useState([]);

  // Maintenance state
  const [maintenanceOn, setMaintenanceOn]       = useState(false);
  const [maintenanceUntil, setMaintenanceUntil] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [togglingMaint, setTogglingMaint]       = useState(false);

  const countdown = useCountdown(maintenanceOn ? maintenanceUntil : null);
  const pad = n => String(n).padStart(2, '0');

  // Load stats + maintenance status
  useEffect(() => {
    const load = async () => {
      const [g, t, c, sc] = await Promise.all([
        supabase.from('gallery').select('*', { count: 'exact' }).limit(4).order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*', { count: 'exact' }),
        supabase.from('site_content').select('*', { count: 'exact' }),
        supabase.from('site_content').select('key, value').in('key', ['maintenance_mode', 'maintenance_until']),
      ]);

      setStats({
        gallery:             g.count || 0,
        testimonials:        t.count || 0,
        activeTestimonials:  (t.data || []).filter(i => i.active).length,
        content:             c.count || 0,
      });
      setRecentGallery(g.data || []);

      const map = {};
      (sc.data || []).forEach(row => { map[row.key] = row.value; });
      const isOn    = map['maintenance_mode'] === 'true';
      const until   = map['maintenance_until'] || null;
      const expired = until && new Date(until).getTime() < Date.now();
      setMaintenanceOn(isOn && !expired);
      setMaintenanceUntil(until);
      setLoading(false);
    };
    load();
  }, []);

  const upsert = (key, value) =>
    supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  const enableMaintenance = async () => {
    setTogglingMaint(true);
    const until = new Date(Date.now() + selectedDuration * 60 * 1000).toISOString();
    await Promise.all([
      upsert('maintenance_mode', 'true'),
      upsert('maintenance_until', until),
    ]);
    setMaintenanceOn(true);
    setMaintenanceUntil(until);
    setTogglingMaint(false);
  };

  const disableMaintenance = async () => {
    setTogglingMaint(true);
    await upsert('maintenance_mode', 'false');
    setMaintenanceOn(false);
    setMaintenanceUntil(null);
    setTogglingMaint(false);
  };

  const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
    <button onClick={onClick}
      className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 text-left w-full hover:shadow-md transition-all hover:-translate-y-0.5 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-gray-400 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      {loading
        ? <div className="bg-gray-200 dark:bg-white/10 animate-pulse h-8 w-16 rounded-lg" />
        : <p className="text-gray-900 dark:text-white text-3xl font-bold">{value}</p>
      }
      {sub && <p className="text-gray-400 dark:text-white/30 text-xs mt-1">{sub}</p>}
      <p className={`text-xs font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500`}>
        Gerenciar →
      </p>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
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
        <StatCard icon={Images}        label="Fotos na Vitrine"     value={stats.gallery}       sub="produtos publicados"              color="bg-orange-500" onClick={() => onNavigate('gallery')} />
        <StatCard icon={MessageSquare} label="Depoimentos"          value={stats.testimonials}  sub={`${stats.activeTestimonials} ativos`} color="bg-blue-500"   onClick={() => onNavigate('testimonials')} />
        <StatCard icon={FileText}      label="Textos Gerenciados"   value={stats.content}       sub="campos de conteúdo"               color="bg-emerald-500" onClick={() => onNavigate('content')} />
      </div>

      {/* ─── Modo Manutenção ─────────────────────────────────────── */}
      <div className={`rounded-2xl border-2 p-6 transition-all ${
        maintenanceOn
          ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/30'
          : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'
      }`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${maintenanceOn ? 'bg-yellow-400 animate-pulse' : 'bg-gray-200 dark:bg-white/10'}`}>
              <Wrench size={18} className={maintenanceOn ? 'text-yellow-900' : 'text-gray-500 dark:text-white/40'} />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm">
                {maintenanceOn ? '🔧 Modo Manutenção ATIVO' : '🟢 Site no ar — Manutenção Desativada'}
              </h3>
              <p className="text-gray-500 dark:text-white/40 text-xs mt-0.5">
                {maintenanceOn
                  ? 'O site está exibindo a página de manutenção para visitantes.'
                  : 'Ative para exibir uma página temporária enquanto faz atualizações.'}
              </p>
            </div>
          </div>

          {/* Status + Countdown */}
          {maintenanceOn && countdown && (
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl px-4 py-2">
              <Clock size={14} className="text-yellow-700 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-300 font-mono font-bold text-sm">
                {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
              </span>
              <span className="text-yellow-600 dark:text-yellow-500 text-xs">restantes</span>
            </div>
          )}
        </div>

        {/* Controls — só aparece quando desligado */}
        {!maintenanceOn && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest block mb-1.5">
                <Clock size={12} className="inline mr-1" /> Duração
              </label>
              <select value={selectedDuration} onChange={e => setSelectedDuration(Number(e.target.value))}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                {DURATION_OPTIONS.map(opt => (
                  <option key={opt.minutes} value={opt.minutes}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button onClick={enableMaintenance} disabled={togglingMaint}
              className="self-end flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest px-5 py-2.5 rounded-xl transition-colors">
              <Wrench size={15} />
              {togglingMaint ? 'Ativando...' : 'Colocar em Manutenção'}
            </button>
          </div>
        )}

        {/* Desligar */}
        {maintenanceOn && (
          <div className="mt-5">
            <button onClick={disableMaintenance} disabled={togglingMaint}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest px-5 py-2.5 rounded-xl transition-colors">
              <X size={15} />
              {togglingMaint ? 'Encerrando...' : 'Encerrar Manutenção — Colocar Site no Ar'}
            </button>
            <p className="text-yellow-600 dark:text-yellow-500 text-xs mt-2">
              ⚠ Visitantes estão vendo a página de manutenção neste momento.
            </p>
          </div>
        )}
      </div>

      {/* Quick actions + recent gallery */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white font-bold text-sm flex items-center gap-2">
              <Images size={15} className="text-orange-500" /> Últimas fotos
            </h3>
            <button onClick={() => onNavigate('gallery')} className="text-gray-400 hover:text-orange-500 text-xs font-bold transition-colors">Ver todas →</button>
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

      {/* Status bar */}
      <div className={`rounded-2xl p-5 flex items-center gap-4 ${
        maintenanceOn
          ? 'bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20'
          : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
      }`}>
        {maintenanceOn
          ? <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
          : <CheckCircle   size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        }
        <div>
          <p className={`font-bold text-sm ${maintenanceOn ? 'text-yellow-800 dark:text-yellow-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
            {maintenanceOn ? 'Site em manutenção — visitantes veem a página de espera' : 'Site está no ar e operacional'}
          </p>
          <p className={`text-xs mt-0.5 ${maintenanceOn ? 'text-yellow-600 dark:text-yellow-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
            {maintenanceOn ? 'Clique em "Encerrar Manutenção" para restaurar o acesso.' : 'Supabase conectado · Galeria dinâmica ativa · Auth seguro'}
          </p>
        </div>
      </div>
    </div>
  );
}
