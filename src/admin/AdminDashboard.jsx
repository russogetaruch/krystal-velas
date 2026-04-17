import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Images, MessageSquare, FileText, ExternalLink, TrendingUp, CheckCircle, AlertTriangle, Wrench, Clock, X, ShoppingCart, ShoppingBag, Package, DollarSign, TrendingDown, BarChart3 } from 'lucide-react';
import { logAudit } from './adminUtils';

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

export default function AdminDashboard({ onNavigate, session }) {
  const [stats, setStats]       = useState({ gallery: 0, testimonials: 0, activeTestimonials: 0, content: 0 });
  const [salesStats, setSalesStats] = useState({ revenue: 0, totalOrders: 0, pendingOrders: 0, avgTicket: 0 });
  const [financial, setFinancial] = useState({ cmv: 0, grossProfit: 0, grossMargin: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [recentGallery, setRecentGallery] = useState([]);
  const [recentLogs, setRecentLogs]       = useState([]);
  const [recentOrders, setRecentOrders]   = useState([]);

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
      try {
        const [g, t, c, sc, al, ords, invLogs] = await Promise.all([
          supabase.from('gallery').select('*', { count: 'exact' }).limit(4).order('created_at', { ascending: false }),
          supabase.from('testimonials').select('*', { count: 'exact' }),
          supabase.from('site_content').select('*', { count: 'exact' }),
          supabase.from('site_content').select('key, value').in('key', ['maintenance_mode', 'maintenance_until']),
          supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('inventory_logs').select('quantity, unit_cost').eq('type', 'saida'),
        ]);

        setStats({
          gallery:             g.count || 0,
          testimonials:        t.count || 0,
          activeTestimonials:  (t.data || []).filter(i => i.active).length,
          content:             c.count || 0,
        });

        const ordersData = ords.data || [];
        const revenue = ordersData.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.total_amount : acc, 0);
        setSalesStats({
          revenue,
          totalOrders: ordersData.length,
          pendingOrders: ordersData.filter(o => o.status === 'pending').length,
          avgTicket: ordersData.length > 0 ? revenue / ordersData.length : 0
        });

        // ── Métricas Financeiras (CMV + Lucro) ─────────────────────
        const cmv = (invLogs.data || []).reduce(
          (sum, l) => sum + Math.abs(l.quantity) * (l.unit_cost || 0), 0
        );
        const grossProfit = revenue - cmv;
        const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
        setFinancial({ cmv, grossProfit, grossMargin });

        setRecentGallery(g.data || []);
        setRecentLogs(al.data || []);
        setRecentOrders(ordersData.slice(0, 3));

        const map = {};
        (sc.data || []).forEach(row => { map[row.key] = row.value; });
        const isOn    = map['maintenance_mode'] === 'true';
        const until   = map['maintenance_until'] || null;
        const expired = until && new Date(until).getTime() < Date.now();
        setMaintenanceOn(isOn && !expired);
        setMaintenanceUntil(until);

        // 3. Top Produtos
        const { data: topData } = await supabase
          .from('order_items')
          .select('product_name, quantity')
          .order('quantity', { ascending: false })
          .limit(5);

        if (topData && Array.isArray(topData)) {
          const grouped = topData.reduce((acc, item) => {
            acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity;
            return acc;
          }, {});
          const sorted = Object.entries(grouped)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a,b) => b.qty - a.qty);
          setTopProducts(sorted);
        }

        // 4. Low stock
        const { data: stockData } = await supabase.from('products').select('name, stock').lt('stock', 5).eq('is_active', true);
        setLowStockProducts(stockData || []);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
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
    await logAudit(session, 'MAINTENANCE_ENABLE', { until });
    setTogglingMaint(false);
  };

  const disableMaintenance = async () => {
    setTogglingMaint(true);
    await upsert('maintenance_mode', 'false');
    setMaintenanceOn(false);
    setMaintenanceUntil(null);
    await logAudit(session, 'MAINTENANCE_DISABLE');
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
        <StatCard icon={Package}       label="Inventário"          value={loading ? '...' : (lowStockProducts.length > 0 ? lowStockProducts.length : '0')} sub={lowStockProducts.length > 0 ? 'em alerta' : 'saudável'} color={lowStockProducts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-stone'} onClick={() => onNavigate('products')} />
      </div>

      {/* ─── Métricas de Vendas ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Receita Total</p>
          <p className="text-2xl font-serif text-brown dark:text-white">R$ {(salesStats?.revenue || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Pedidos</p>
          <p className="text-2xl font-serif text-brown dark:text-white">{salesStats?.totalOrders || 0}</p>
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Pendentes</p>
          <p className="text-2xl font-serif text-orange-500">{salesStats?.pendingOrders || 0}</p>
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Ticket Médio</p>
          <p className="text-2xl font-serif text-brown dark:text-white">R$ {(salesStats?.avgTicket || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* ─── Inteligência Financeira (CMV + Lucro) ───────────────── */}
      <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center">
            <BarChart3 size={18} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-serif text-xl text-brown dark:text-white">Inteligência Financeira</h3>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Baseado em movimentações de estoque</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CMV */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={14} className="text-red-400" />
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">CMV (Custo da Mercadoria)</p>
            </div>
            <p className="text-3xl font-serif text-red-500">R$ {financial.cmv.toFixed(2)}</p>
            <p className="text-[10px] text-gray-400 mt-2">
              {salesStats.revenue > 0 ? ((financial.cmv / salesStats.revenue) * 100).toFixed(1) : '0'}% da receita bruta
            </p>
          </div>
          {/* Lucro Bruto */}
          <div className={`rounded-2xl p-6 border ${
            financial.grossProfit >= 0
              ? 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20'
              : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={14} className={financial.grossProfit >= 0 ? 'text-green-500' : 'text-red-500'} />
              <p className="text-[9px] text-gray-500 dark:text-white/40 font-bold uppercase tracking-[0.2em]">Lucro Bruto</p>
            </div>
            <p className={`text-3xl font-serif ${financial.grossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              R$ {financial.grossProfit.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-400 mt-2">Receita − CMV</p>
          </div>
          {/* Margem Bruta */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-orange-500" />
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Margem Bruta</p>
            </div>
            <p className="text-3xl font-serif text-orange-500">{financial.grossMargin.toFixed(1)}%</p>
            <div className="mt-3 h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  financial.grossMargin >= 50 ? 'bg-green-500'
                  : financial.grossMargin >= 30 ? 'bg-orange-500'
                  : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, financial.grossMargin))}%` }}
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-2 uppercase font-bold">
              {financial.grossMargin >= 50 ? '✓ Margem Saudável' : financial.grossMargin >= 30 ? '⚠ Margem Moderada' : '▼ Margem Crítica'}
            </p>
          </div>
        </div>
        {financial.cmv === 0 && (
          <p className="text-center text-gray-300 dark:text-white/10 text-xs mt-6 uppercase font-bold tracking-wider">
            Defina o custo unitário (R$) nos produtos e registre entradas de estoque para ativar o CMV.
          </p>
        )}
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

      {/* Inteligência de Vendas */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gráfico de Vendas (Simulado com Tailwind) */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-xl text-brown dark:text-white">Performance Semanal</h3>
            <span className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">+12% vs ontem</span>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  style={{ height: `${h}%` }} 
                  className="w-full bg-orange-100 dark:bg-orange-500/10 rounded-t-xl group-hover:bg-orange-500 transition-all duration-500 relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brown text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    R$ {h * 12}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{['S','T','Q','Q','S','S','D'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Produtos */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="font-serif text-xl text-brown dark:text-white mb-8">Top Produtos (Qtd)</h3>
          <div className="space-y-6">
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-serif text-gray-200 group-hover:text-orange-500 transition-colors">0{i+1}</span>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${topProducts[0]?.qty > 0 ? (p.qty / topProducts[0].qty) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">{p.qty} un.</span>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-sm italic py-10 text-center">Aguardando as primeiras vendas...</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions + recent gallery */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Últimas Vendas */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white font-bold text-sm flex items-center gap-2"><ShoppingCart size={15} className="text-orange-500" /> Vendas Recentes</h3>
            <button onClick={() => onNavigate('orders')} className="text-gray-400 hover:text-orange-500 text-xs font-bold transition-colors">Tudo →</button>
          </div>
          <div className="space-y-3">
             {loading ? <div className="animate-pulse space-y-2"><div className="h-10 bg-gray-100 dark:bg-white/10 rounded-xl" /><div className="h-10 bg-gray-100 dark:bg-white/10 rounded-xl" /></div> : 
              recentOrders.length > 0 ? recentOrders.map(o => (
                <div key={o.id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{o.customer_name}</p>
                    <p className="text-[10px] text-gray-400">#{o.id.slice(0,8)}</p>
                  </div>
                  <span className="font-bold text-brown dark:text-orange-400">R$ {o.total_amount.toFixed(2)}</span>
                </div>
              )) : <p className="text-gray-400 text-[10px] uppercase font-bold text-center py-4">Sem vendas ainda.</p>
             }
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 dark:text-white font-bold text-sm flex items-center gap-2"><Images size={15} className="text-orange-500" /> Últimas fotos</h3>
            <button onClick={() => onNavigate('gallery')} className="text-gray-400 hover:text-orange-500 text-xs font-bold transition-colors">Ver todas →</button>
          </div>
          {loading
            ? <div className="grid grid-cols-4 gap-2">{[1,2,3,4].map(i => <div key={i} className="bg-gray-100 dark:bg-white/10 animate-pulse rounded-xl h-16" />)}</div>
            : recentGallery.length > 0
              ? <div className="grid grid-cols-4 gap-2">{recentGallery.map(item => (<div key={item.id} className="rounded-xl overflow-hidden aspect-square border border-gray-100 dark:border-white/10"><img src={item.src} className="w-full h-full object-cover" /></div>))}</div>
              : <p className="text-gray-400 text-sm italic">Nenhuma foto ainda.</p>
          }
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-800 dark:text-white font-bold text-sm mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-orange-500" /> Ações Rápidas</h3>
          <div className="space-y-2">
            <button onClick={() => onNavigate('orders')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold text-sm hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors text-left"><ShoppingCart size={16} /> Gerenciar Pedidos</button>
            <button onClick={() => onNavigate('products')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-left"><ShoppingBag size={16} /> Novo Produto</button>
            <button onClick={() => onNavigate('content')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-left"><FileText size={16} /> Editar Textos</button>
          </div>
        </div>
      </div>
    </div>
  );
}
