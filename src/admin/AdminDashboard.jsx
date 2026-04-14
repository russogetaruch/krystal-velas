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
  const [recentLogs, setRecentLogs]       = useState([]);

  // Maintenance state
  const [maintenanceOn, setMaintenanceOn]       = useState(false);
  const [maintenanceUntil, setMaintenanceUntil] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [togglingMaint, setTogglingMaint]       = useState(false);

  const countdown = useCountdown(maintenanceOn ? maintenanceUntil : null);
  const pad = n => String(n).padStart(2, '0');

  // Load stats + maintenance status + logs
  useEffect(() => {
    const load = async () => {
      const [g, t, c, sc, al] = await Promise.all([
        supabase.from('gallery').select('*', { count: 'exact' }).limit(4).order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*', { count: 'exact' }),
        supabase.from('site_content').select('*', { count: 'exact' }),
        supabase.from('site_content').select('key, value').in('key', ['maintenance_mode', 'maintenance_until']),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(3),
      ]);

      setStats({
        gallery:             g.count || 0,
        testimonials:        t.count || 0,
        activeTestimonials:  (t.data || []).filter(i => i.active).length,
        content:             c.count || 0,
      });
      setRecentGallery(g.data || []);
      setRecentLogs(al.data || []);

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
      className="relative bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 text-left w-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1 group overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${color}`} />
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="relative z-10">
        <p className="text-gray-400 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
          {loading
            ? <div className="bg-gray-200 dark:bg-white/10 animate-pulse h-10 w-20 rounded-xl" />
            : <p className="text-gray-900 dark:text-white text-4xl font-serif">{value}</p>
          }
          {sub && <p className="text-gray-400 dark:text-white/20 text-xs font-light tracking-wide">{sub}</p>}
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
        <span>Gerenciar Módulo</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
            <span className="w-8 h-[1px] bg-orange-500/30" />
            <span>Sistema Blindado</span>
          </div>
          <h2 className="text-4xl font-serif text-gray-900 dark:text-white">Escritório Central</h2>
        </div>

        {/* Security Alert Badge */}
        {recentLogs.some(l => l.severity === 'CRITICAL') && (
          <button onClick={() => onNavigate('logs')} className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-4 py-2 rounded-xl animate-bounce">
            <AlertTriangle className="text-red-500" size={16} />
            <span className="text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest">Alerta de Segurança! Ver Logs</span>
          </button>
        )}

        <a href="https://krystalvelas.vittalix.com.br" target="_blank" rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-white dark:bg-white/5 hover:bg-brown dark:hover:bg-white text-gray-600 dark:text-white/60 hover:text-white dark:hover:text-[#0f0602] text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-full border border-gray-100 dark:border-white/10 transition-all duration-300 shadow-sm hover:shadow-xl">
          <ExternalLink size={14} className="group-hover:rotate-12 transition-transform" /> 
          Portfólio Vivo
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Images}        label="Vitrine Digital"     value={stats.gallery}       sub="itens"              color="bg-orange-500" onClick={() => onNavigate('gallery')} />
        <StatCard icon={MessageSquare} label="Voz do Cliente"      value={stats.testimonials}  sub="depoimentos" color="bg-orange-600"   onClick={() => onNavigate('testimonials')} />
        <StatCard icon={FileText}      label="Interface"           value={stats.content}       sub="chaves"               color="bg-stone" onClick={() => onNavigate('content')} />
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
          {maintenanceOn && countdown && (
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl px-4 py-2">
              <Clock size={14} className="text-yellow-700 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-300 font-mono font-bold text-sm">{pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}</span>
              <span className="text-yellow-600 dark:text-yellow-500 text-xs">restantes</span>
            </div>
          )}
        </div>
        {!maintenanceOn && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div>
              <label className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest block mb-1.5"><Clock size={12} className="inline mr-1" /> Duração</label>
              <select value={selectedDuration} onChange={e => setSelectedDuration(Number(e.target.value))}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                {DURATION_OPTIONS.map(opt => <option key={opt.minutes} value={opt.minutes}>{opt.label}</option>)}
              </select>
            </div>
            <button onClick={enableMaintenance} disabled={togglingMaint}
              className="self-end flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest px-5 py-2.5 rounded-xl transition-colors">
              <Wrench size={15} /> {togglingMaint ? 'Ativando...' : 'Colocar em Manutenção'}
            </button>
          </div>
        )}
        {maintenanceOn && (
          <div className="mt-5">
            <button onClick={disableMaintenance} disabled={togglingMaint}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest px-5 py-2.5 rounded-xl transition-colors">
              <X size={15} /> {togglingMaint ? 'Encerrando...' : 'Encerrar Manutenção'}
            </button>
          </div>
        )}
      </div>

      {/* Quick actions + recent gallery */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white font-bold text-sm flex items-center gap-2"><Images size={15} className="text-orange-500" /> Últimas fotos</h3>
            <button onClick={() => onNavigate('gallery')} className="text-gray-400 hover:text-orange-500 text-xs font-bold transition-colors">Ver todas →</button>
          </div>
          {loading
            ? <div className="grid grid-cols-4 gap-2">{[1,2,3,4].map(i => <div key={i} className="bg-gray-100 dark:bg-white/10 animate-pulse rounded-xl h-16" />)}</div>
            : recentGallery.length > 0
              ? <div className="grid grid-cols-4 gap-2">{recentGallery.map(item => (<div key={item.id} className="rounded-xl overflow-hidden aspect-square border border-gray-100 dark:border-white/10"><img src={item.src} className="w-full h-full object-cover" /></div>))}</div>
              : <p className="text-gray-400 text-sm">Nenhuma foto ainda.</p>
          }
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-800 dark:text-white font-bold text-sm mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-orange-500" /> Ações Rápidas</h3>
          <div className="space-y-2">
            <button onClick={() => onNavigate('gallery')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold text-sm hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors text-left"><Images size={16} /> Adicionar nova foto</button>
            <button onClick={() => onNavigate('testimonials')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-left"><MessageSquare size={16} /> Novo depoimento</button>
            <button onClick={() => onNavigate('content')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-left"><FileText size={16} /> Editar textos/WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  );
}
