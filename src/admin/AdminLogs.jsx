import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Clock, Search, Filter, Trash2, Calendar, AlertTriangle } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'WARNING':  return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:         return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getEventIcon = (severity) => {
    if (severity === 'CRITICAL') return <ShieldAlert size={14} />;
    if (severity === 'WARNING')  return <AlertTriangle size={14} />;
    return <Clock size={14} />;
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.severity === filter;
  });

  // Agrupa os logs por data para facilitar a leitura (como pedido: dia, mês, ano)
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-gray-400">
      <Shield size={48} className="mb-4 opacity-20" />
      <p className="text-xs uppercase tracking-widest font-bold">Carregando Auditoria...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif text-brown dark:text-white">Auditoria de Segurança</h2>
          <p className="text-gray-500 dark:text-white/30 text-sm mt-1">Monitoramento em tempo real de tentativas de acesso.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${filter === 'ALL' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-brown'}`}
          >Todos</button>
          <button 
            onClick={() => setFilter('INFO')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${filter === 'INFO' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-brown'}`}
          >Info</button>
          <button 
            onClick={() => setFilter('WARNING')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${filter === 'WARNING' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-brown'}`}
          >Alertas</button>
          <button 
            onClick={() => setFilter('CRITICAL')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${filter === 'CRITICAL' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-brown'}`}
          >Críticos</button>
        </div>
      </div>

      {/* Logs Grouped by Date */}
      <div className="space-y-12">
        {Object.keys(groupedLogs).length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem]">
            <Shield size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm">Nenhum evento registrado nesta categoria.</p>
          </div>
        )}

        {Object.entries(groupedLogs).map(([date, items]) => (
          <div key={date} className="relative">
            {/* Sticky Date Header */}
            <div className="sticky top-20 z-10 mb-6">
              <span className="bg-stone dark:bg-[#1a0a05] text-brown dark:text-white px-6 py-2 rounded-full border border-gray-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                {date}
              </span>
            </div>

            <div className="bg-white dark:bg-[#1a0a05] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm divide-y divide-gray-50 dark:divide-white/5">
              {items.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50/[0.3] dark:hover:bg-white/[0.01] transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Event Tag */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-[10px] text-gray-400 dark:text-white/20 font-mono">
                        {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${getSeverityStyle(log.severity)}`}>
                        {getEventIcon(log.severity)}
                        {log.event.replace(/_/g, ' ')}
                      </div>
                    </div>

                    {/* Email/Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brown dark:text-white truncate">
                        {log.email || 'Sistema / Anon'}
                      </p>
                      <div className="text-[10px] text-gray-400 dark:text-white/30 truncate mt-0.5 font-light">
                        {JSON.stringify(log.details)}
                      </div>
                    </div>

                    {/* IP & Action */}
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono text-gray-400 dark:text-white/20">{log.ip}</span>
                        <span className="text-[9px] uppercase font-bold tracking-tighter text-blue-500/50">Brasil</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="p-6 bg-brown text-white/40 rounded-[2rem] text-[10px] uppercase tracking-widest font-bold flex items-center justify-between">
        <span>Retenção: 60 Dias</span>
        <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">Auto-Cleanup Active</span>
      </div>
    </motion.div>
  );
}
