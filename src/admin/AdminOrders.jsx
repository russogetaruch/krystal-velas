import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Package, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle,
  ChevronDown,
  User,
  MapPin,
  Calendar,
  Mail,
  Phone,
  FileText,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logAudit, deductStock } from './adminUtils';

export default function AdminOrders({ session }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [pipelineRunning, setPipelineRunning] = useState(null); // order_id em processamento

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setError('Erro ao carregar vendas. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrderItems(orderId) {
    setItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Erro ao buscar itens do pedido:', err);
    } finally {
      setItemsLoading(false);
    }
  }

  /**
   * Pipeline de Pagamento: executado quando status muda para 'paid'
   * 1. Baixa automática de estoque (deductStock)
   * 2. Cria registro NF-e em 'aguardando'
   */
  async function paymentPipeline(orderId, orderItems) {
    setPipelineRunning(orderId);
    try {
      // 1. Baixa de estoque
      if (orderItems && orderItems.length > 0) {
        await deductStock(session, orderId, orderItems);
      }

      // 2. Cria registro de NF-e (status 'aguardando' — emissão manual na aba NF-e)
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (!existingInvoice) {
        await supabase.from('invoices').insert({
          order_id : orderId,
          status   : 'aguardando',
        });
      }
    } catch (err) {
      console.error('[paymentPipeline] Erro:', err);
    } finally {
      setPipelineRunning(null);
    }
  }

  async function updateStatus(orderId, newStatus) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Atualiza localmente
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      
      await logAudit(session, 'ORDER_STATUS_CHANGE', { order_id: orderId, status: newStatus });

      // 🔥 Pipeline de Pagamento — Baixa Automática + NF-e
      if (newStatus === 'paid') {
        const order = orders.find(o => o.id === orderId);
        await paymentPipeline(orderId, order?.order_items || []);
      }

    } catch (err) {
      alert('Erro ao atualizar status');
    }
  }

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.id || '').includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    
    // Filtro de Data
    let matchesDate = true;
    if (o.created_at) {
      const orderDate = new Date(o.created_at);
      const now = new Date();
      if (filterDate === 'today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (filterDate === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= weekAgo;
      } else if (filterDate === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':   return { label: 'Pendente', icon: Clock, color: 'text-orange-500 bg-orange-50 border-orange-100' };
      case 'paid':      return { label: 'Pago', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-100' };
      case 'shipped':   return { label: 'Enviado', icon: Truck, color: 'text-blue-600 bg-blue-50 border-blue-100' };
      case 'cancelled': return { label: 'Cancelado', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-100' };
      default:          return { label: status, icon: Clock, color: 'text-gray-500 bg-gray-50 border-gray-100' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl text-sm dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm dark:text-gray-200"
          >
            <option value="all">Todos Status</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagos</option>
            <option value="shipped">Enviados</option>
            <option value="cancelled">Cancelados</option>
          </select>

          <select 
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm dark:text-gray-200"
          >
            <option value="all">Qualquer Data</option>
            <option value="today">Hoje</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Últimos 30 dias</option>
          </select>
          <button 
            onClick={fetchOrders}
            className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <Clock size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-xs flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchOrders} className="underline font-bold uppercase">Tentar novamente</button>
        </div>
      )}

      {/* Lista de Pedidos */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest text-[10px]">Pedido</th>
                <th className="px-6 py-4 font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest text-[10px]">Cliente</th>
                <th className="px-6 py-4 font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest text-[10px]">Data</th>
                <th className="px-6 py-4 font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest text-[10px]">Valor</th>
                <th className="px-6 py-4 font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest text-[10px] text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400 animate-pulse">Carregando pedidos...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400">Nenhum pedido encontrado.</td></tr>
              ) : (
                filteredOrders.map(order => {
                  const s = getStatusInfo(order.status);
                  const Icon = s.icon;
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        fetchOrderItems(order.id);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group/id">
                          <span className="font-mono text-xs text-orange-500 font-bold uppercase tracking-tighter">
                            #{order.id.slice(0, 8)}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(order.id); }}
                            className="opacity-0 group-hover/id:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                          >
                            {copiedId === order.id ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-gray-400" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{order.customer_name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-white/20 lowercase">{order.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-500 dark:text-white/40 text-xs">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 dark:text-white">R$ {order.total_amount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${s.color}`}>
                          <Icon size={12} />
                          {s.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Pedido */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#1a0a05] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Modal */}
              <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif text-brown dark:text-white flex items-center gap-3">
                    Pedido <span className="text-orange-500 font-mono text-sm">#{selectedOrder.id.slice(0, 8)}</span>
                  </h2>
                  <p className="text-[10px] text-gray-400 dark:text-white/20 uppercase font-bold tracking-widest mt-1">
                    Realizado em {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>

              {/* Corpo Modal */}
              <div className="flex-1 overflow-y-auto p-8 grid md:grid-cols-2 gap-10">
                {/* Coluna Esquerda: Itens e Totais */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                      <Package size={14} /> Itens do Pedido
                    </h3>
                    <div className="space-y-4">
                      {itemsLoading ? (
                        <p className="text-sm text-gray-400 animate-pulse">Carregando itens...</p>
                      ) : (
                        items.map(item => (
                          <div key={item.id} className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                            <div className="w-12 h-12 bg-white dark:bg-[#0f0602] rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 flex-shrink-0">
                              {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-brown dark:text-white leading-tight">{item.product_name}</p>
                              <p className="text-xs text-gray-400">{item.quantity}x R$ {item.price_at_purchase.toFixed(2)}</p>
                            </div>
                            <p className="font-bold text-brown dark:text-white text-sm">R$ {(item.quantity * item.price_at_purchase).toFixed(2)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="bg-orange-50 dark:bg-orange-500/10 p-6 rounded-2xl space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-800/60 dark:text-orange-400/60 font-bold uppercase">Subtotal</span>
                      <span className="text-orange-800 dark:text-orange-400 font-bold">R$ {selectedOrder.total_items_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-800/60 dark:text-orange-400/60 font-bold uppercase">Frete</span>
                      <span className="text-orange-800 dark:text-orange-400 font-bold">R$ {selectedOrder.shipping_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-serif pt-2 border-t border-orange-200 dark:border-orange-500/20">
                      <span className="text-orange-900 dark:text-white">Total</span>
                      <span className="text-orange-900 dark:text-white">R$ {selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </section>
                </div>

                {/* Coluna Direita: Cliente, Endereço e Status */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                       <User size={14} /> Dados do Cliente
                    </h3>
                    <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail size={14} className="text-gray-400" />
                        <span className="dark:text-white">{selectedOrder.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={14} className="text-gray-400" />
                        <span className="dark:text-white">{selectedOrder.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <FileText size={14} className="text-gray-400" />
                        <span className="dark:text-white">Docs: {selectedOrder.customer_document}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                       <MapPin size={14} /> Entrega
                    </h3>
                    <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl text-sm dark:text-white leading-relaxed">
                      <p className="font-bold">{selectedOrder.address_street}, {selectedOrder.address_number}</p>
                      {selectedOrder.address_complement && <p className="text-gray-500">{selectedOrder.address_complement}</p>}
                      <p className="text-gray-500">{selectedOrder.address_neighborhood}</p>
                      <p>{selectedOrder.address_city} - {selectedOrder.address_state}</p>
                      <p className="text-orange-500 font-bold mt-2">CEP: {selectedOrder.address_zip}</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                       Ações de Status
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'paid')}
                        className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedOrder.status === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-green-600'}`}
                      >
                        Marcar como Pago
                      </button>
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'shipped')}
                        className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedOrder.status === 'shipped' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-blue-600'}`}
                      >
                        Marcar como Enviado
                      </button>
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                        className="px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all col-span-2"
                      >
                        Cancelar Pedido
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
