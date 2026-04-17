import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isNFeConfigured, emitirNFe } from '../lib/nfeService';
import {
  FileText, Download, CheckCircle2, Clock, XCircle,
  AlertCircle, ExternalLink, RefreshCw, Zap
} from 'lucide-react';
import { logAudit } from './adminUtils';

const STATUS_CONFIG = {
  aguardando  : { label: 'Aguardando',   color: 'text-gray-500 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10',            icon: Clock },
  processando : { label: 'Processando',  color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',      icon: RefreshCw },
  autorizada  : { label: 'Autorizada',   color: 'text-green-600 bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20', icon: CheckCircle2 },
  rejeitada   : { label: 'Rejeitada',    color: 'text-red-600 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',           icon: XCircle },
  cancelada   : { label: 'Cancelada',    color: 'text-gray-400 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10',             icon: XCircle },
};

export default function AdminInvoices({ session }) {
  const [invoices,     setInvoices]     = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]); // pedidos pagos sem NF-e
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [emitting,     setEmitting]     = useState(null);
  const [error,        setError]        = useState(null);

  const nfeReady = isNFeConfigured();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [invRes, ordRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, orders(customer_name, total_amount, customer_document, customer_email)')
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('status', 'paid')
          .order('created_at', { ascending: false }),
      ]);

      const invoiceOrderIds = new Set((invRes.data || []).map(i => i.order_id));
      setInvoices(invRes.data || []);
      setPendingOrders((ordRes.data || []).filter(o => !invoiceOrderIds.has(o.id)));
    } catch (err) {
      setError('Erro ao carregar notas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmitNFe(order) {
    setEmitting(order.id);
    setError(null);

    // 1. Cria registro como "processando"
    const { error: insErr } = await supabase.from('invoices').insert({
      order_id : order.id,
      status   : nfeReady ? 'processando' : 'aguardando',
    });

    if (insErr) {
      setError('Erro ao criar registro de NF-e: ' + insErr.message);
      setEmitting(null);
      return;
    }

    if (nfeReady) {
      // 2. Chama a API do emissor fiscal
      const result = await emitirNFe(order, order.order_items || []);

      const updatePayload = result.success
        ? {
            status       : 'autorizada',
            nfe_ref      : result.nfe_ref,
            numero_nota  : result.numero_nota,
            chave_acesso : result.chave_acesso,
            danfe_url    : result.danfe_url,
            xml_url      : result.xml_url,
            emitted_at   : new Date().toISOString(),
          }
        : { status: 'rejeitada', error_message: result.error };

      await supabase.from('invoices').update(updatePayload).eq('order_id', order.id);
      await logAudit(session, 'NFE_EMIT', { order_id: order.id, success: result.success });
    }

    setEmitting(null);
    fetchData();
  }

  const filtered = invoices.filter(i => filterStatus === 'all' || i.status === filterStatus);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Notas Fiscais (NF-e)</h2>
        <p className="text-gray-500 dark:text-white/40 text-sm">Emissão e gestão vinculada aos pedidos faturados.</p>
      </div>

      {/* Banner de status da integração */}
      <div className={`flex items-start gap-4 p-5 rounded-2xl border ${
        nfeReady
          ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
          : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
      }`}>
        <Zap className={`mt-0.5 flex-shrink-0 ${nfeReady ? 'text-green-500' : 'text-amber-500'}`} size={20} />
        <div>
          <p className={`font-bold text-sm ${nfeReady ? 'text-green-800 dark:text-green-400' : 'text-amber-800 dark:text-amber-400'}`}>
            {nfeReady ? 'Emissor Fiscal Conectado ✓' : 'Integração com Emissor Fiscal Pendente'}
          </p>
          <p className={`text-xs mt-1 ${nfeReady ? 'text-green-700/70 dark:text-green-400/60' : 'text-amber-700/70 dark:text-amber-400/60'}`}>
            {nfeReady
              ? 'A emissão automática está ativa. Clique em "Emitir NF-e" para processar.'
              : <>Configure <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded text-[11px]">VITE_NFE_API_URL</code> e <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded text-[11px]">VITE_NFE_API_TOKEN</code> no <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded text-[11px]">.env</code> para ativar.</>
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Pedidos Pagos Pendentes de Emissão */}
      {pendingOrders.length > 0 && (
        <div className="bg-white dark:bg-white/5 border border-orange-100 dark:border-orange-500/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-orange-100 dark:border-orange-500/20 bg-orange-50/60 dark:bg-orange-500/5">
            <h3 className="font-bold text-orange-700 dark:text-orange-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {pendingOrders.length} pedido{pendingOrders.length > 1 ? 's' : ''} pago{pendingOrders.length > 1 ? 's' : ''} aguardando NF-e
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {pendingOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{order.customer_name}</p>
                  <p className="text-[10px] text-orange-500 font-mono">
                    #{order.id.slice(0, 8)} · R$ {order.total_amount.toFixed(2)} · {order.order_items?.length || 0} item(s)
                  </p>
                </div>
                <button
                  onClick={() => handleEmitNFe(order)}
                  disabled={emitting === order.id}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {emitting === order.id
                    ? <RefreshCw size={14} className="animate-spin" />
                    : <FileText size={14} />
                  }
                  {emitting === order.id ? 'Emitindo...' : 'Emitir NF-e'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtro de Status */}
      <div className="flex gap-3 flex-wrap">
        {['all', ...Object.keys(STATUS_CONFIG)].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${
              filterStatus === s
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:border-orange-300'
            }`}
          >
            {s === 'all' ? 'Todas' : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* Tabela de Notas Fiscais */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                {['Pedido', 'Cliente', 'Nº Nota', 'Status', 'Emitida em', 'Documentos'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center text-gray-400 animate-pulse">Carregando notas fiscais...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <FileText size={40} className="mx-auto mb-3 text-gray-200 dark:text-white/10" />
                    <p className="text-gray-400 dark:text-white/20">Nenhuma nota fiscal emitida.</p>
                  </td>
                </tr>
              ) : filtered.map(inv => {
                const cfg  = STATUS_CONFIG[inv.status] || STATUS_CONFIG.aguardando;
                const Icon = cfg.icon;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-orange-500 font-bold">#{inv.order_id?.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{inv.orders?.customer_name || '—'}</p>
                      <p className="text-[10px] text-gray-400">R$ {inv.orders?.total_amount?.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                        {inv.numero_nota ? `${inv.serie || '1'}/${inv.numero_nota}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>
                        <Icon size={10} className={inv.status === 'processando' ? 'animate-spin' : ''} />
                        {cfg.label}
                      </span>
                      {inv.error_message && (
                        <p className="text-[9px] text-red-400 mt-1 max-w-[180px] truncate">{inv.error_message}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 dark:text-white/30 text-xs">
                        {inv.emitted_at ? new Date(inv.emitted_at).toLocaleString('pt-BR') : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {inv.danfe_url ? (
                          <a href={inv.danfe_url} target="_blank" rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-orange-500 transition-colors" title="Baixar DANFE (PDF)">
                            <Download size={16} />
                          </a>
                        ) : null}
                        {inv.xml_url ? (
                          <a href={inv.xml_url} target="_blank" rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Baixar XML">
                            <ExternalLink size={16} />
                          </a>
                        ) : null}
                        {!inv.danfe_url && !inv.xml_url && (
                          <span className="text-gray-200 dark:text-white/10 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
