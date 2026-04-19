import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Calculator, X, Plus, Trash2, Info, Package, 
  TrendingUp, TrendingDown, DollarSign, Percent, Scale, Droplet, 
  ArrowRight, Save, RefreshCw, BarChart3, PieChart
} from 'lucide-react';

const EMPTY_EXTRAS = { packaging: '', labor: '', labels: '', others: '' };
const EMPTY_FINANCIALS = { taxesPercent: '', sellingPrice: '', desiredMargin: '' };

export default function AdminProductionCalculator({ session, onClose }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [compositions, setCompositions] = useState([]);
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [items, setItems] = useState([{ material_id: '', quantity: '' }]);
  const [extras, setExtras] = useState(EMPTY_EXTRAS);
  const [financials, setFinancials] = useState(EMPTY_FINANCIALS);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [pRes, mRes, cRes] = await Promise.all([
        supabase.from('products').select('id, name, unit_cost').order('name'),
        supabase.from('raw_materials').select('id, name, unit, unit_cost').order('name'),
        supabase.from('product_composition').select('*')
      ]);
      setProducts(pRes.data || []);
      setMaterials(mRes.data || []);
      setCompositions(cRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados para calculadora:', err);
    } finally {
      setLoading(false);
    }
  }

  const loadRecipe = (prodId) => {
    setSelectedProductId(prodId);
    if (!prodId) {
      setItems([{ material_id: '', quantity: '' }]);
      return;
    }
    const recipe = compositions.filter(c => c.product_id === prodId);
    if (recipe.length > 0) {
      setItems(recipe.map(r => ({ material_id: r.raw_material_id, quantity: r.quantity })));
    } else {
      setItems([{ material_id: '', quantity: '' }]);
    }
  };

  const addItem = () => setItems([...items, { material_id: '', quantity: '' }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const handleNumericFocus = (e) => e.target.select();

  // ── Cálculos ───────────────────────────────────────────────────
  const materialCost = items.reduce((acc, item) => {
    const mat = materials.find(m => m.id === item.material_id);
    const qty = parseFloat(item.quantity) || 0;
    return acc + (qty * (mat?.unit_cost || 0));
  }, 0);

  const extraTotal = Object.values(extras).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  const totalCost = materialCost + extraTotal;
  
  const sellingPrice = parseFloat(financials.sellingPrice) || 0;
  const taxesPercent = parseFloat(financials.taxesPercent) || 0;
  const taxesAmount  = sellingPrice * (taxesPercent / 100);
  const netRevenue   = sellingPrice - taxesAmount;
  const profit       = netRevenue - totalCost;
  const margin       = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const markup       = totalCost > 0 ? (sellingPrice / totalCost) : 0;

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f0704] rounded-[3rem] w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-white/5">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-orange-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Calculator size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-brown dark:text-white">Calculadora de Viabilidade</h3>
              <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mt-1">Simulação de Custos, Impostos e Lucro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl text-gray-400 transition-all">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Coluna de Configuração (Esquerda) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Receita Base */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                    <RefreshCw size={14} /> 1. Carregar Receita Base (Opcional)
                  </h4>
                </div>
                <select 
                  value={selectedProductId}
                  onChange={(e) => loadRecipe(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-6 py-4 text-sm dark:text-white outline-none cursor-pointer"
                >
                  <option value="">Simulação Manual (Do Zero)</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Tabela de Insumos */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                  <PieChart size={14} /> 2. Matérias-Primas e Quantidades
                </h4>
                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const mat = materials.find(m => m.id === item.material_id);
                    const itemCost = (parseFloat(item.quantity) || 0) * (mat?.unit_cost || 0);
                    return (
                      <div key={idx} className="flex gap-3 items-end group animate-in slide-in-from-left duration-300">
                        <div className="flex-1">
                          <select 
                            value={item.material_id} 
                            onChange={e => updateItem(idx, 'material_id', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none"
                          >
                            <option value="">Selecionar Insumo...</option>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.name} (R$ {m.unit_cost}/{m.unit})</option>)}
                          </select>
                        </div>
                        <div className="w-32 relative">
                          <input 
                            type="number" step="0.001" placeholder="Qtd"
                            onFocus={handleNumericFocus}
                            value={item.quantity} 
                            onChange={e => updateItem(idx, 'quantity', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none font-mono pr-12"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-500/50 uppercase select-none">{mat?.unit || '—'}</span>
                        </div>
                        <div className="w-32 py-4 px-2 text-right hidden md:block">
                           <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Subtotal</p>
                           <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">R$ {itemCost.toFixed(2)}</p>
                        </div>
                        <button onClick={() => removeItem(idx)} className="p-4 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors"><Trash2 size={18} /></button>
                      </div>
                    );
                  })}
                  <button onClick={addItem} className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-2">
                    <Plus size={16} /> Adicionar outro item
                  </button>
                </div>
              </div>

              {/* Custos Extras */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                  <Package size={14} /> 3. Outros Custos (Unidade)
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   {[
                     { key: 'packaging', label: 'Embalagem', icon: Package },
                     { key: 'labels', label: 'Etiqueta/Memo', icon: Info },
                     { key: 'labor', label: 'Mão de Obra', icon: ArrowRight },
                     { key: 'others', label: 'Diversos', icon: Plus }
                   ].map(cost => (
                     <div key={cost.key} className="space-y-2">
                       <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block px-1">{cost.label}</label>
                       <div className="relative group">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-mono text-xs">R$</span>
                         <input 
                           type="number" step="0.01" value={extras[cost.key]}
                           onFocus={handleNumericFocus}
                           onChange={e => setExtras({...extras, [cost.key]: e.target.value})}
                           className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl pl-8 pr-3 py-3 text-sm dark:text-white outline-none font-mono"
                         />
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            {/* Coluna de Resultados (Direita) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Financial Inputs */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-8 space-y-6 border border-gray-100 dark:border-white/5">
                <h4 className="text-xs font-bold text-brown dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={16} /> Parâmetros Financeiros
                </h4>
                
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2 px-1">Preço de Venda Pretendido (R$)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brown dark:text-white font-serif text-2xl opacity-30">R$</span>
                      <input 
                        type="number" step="0.01" value={financials.sellingPrice}
                        onFocus={handleNumericFocus}
                        onChange={e => setFinancials({...financials, sellingPrice: e.target.value})}
                        className="w-full bg-white dark:bg-[#1a0a05] border border-transparent focus:border-orange-500 rounded-[1.5rem] pl-16 pr-6 py-6 text-4xl font-serif text-brown dark:text-white outline-none font-mono shadow-sm transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block px-1">Impostos (Simples/DAS %)</label>
                      <div className="relative group">
                         <input 
                          type="number" step="0.1" value={financials.taxesPercent}
                          onFocus={handleNumericFocus}
                          onChange={e => setFinancials({...financials, taxesPercent: e.target.value})}
                          className="w-full bg-white dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-4 py-4 text-sm dark:text-white outline-none pr-10 font-mono shadow-sm transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"><Percent size={14} /></span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-white/10 rounded-2xl flex flex-col justify-center border border-transparent">
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Custo Total Prod.</p>
                       <p className="text-xl font-mono font-bold text-gray-700 dark:text-gray-200">
                         <span className="text-xs opacity-40 mr-1">R$</span>{totalCost.toFixed(2)}
                       </p>
                    </div>
                  </div>
                </div>

                {/* Scoreboard de Resultados - Refined */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-6 rounded-[2rem] flex flex-col justify-between min-h-[140px] transition-all duration-500 ${profit > 0 ? 'bg-green-600 shadow-xl shadow-green-600/20 text-white' : (profit < 0 ? 'bg-red-600 shadow-xl shadow-red-600/20 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400')}`}>
                    <div className="flex justify-between items-start">
                       <div className="space-y-0.5">
                         <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Lucro Líquido</p>
                         <p className="text-[8px] font-bold uppercase opacity-60">por unidade</p>
                       </div>
                       {profit > 0 ? <TrendingUp size={20} className="opacity-40" /> : <TrendingDown size={20} className="opacity-40" />}
                    </div>
                    <div className="flex items-baseline gap-1">
                       <span className="text-lg font-serif opacity-70">R$</span>
                       <p className="text-4xl font-serif leading-none tracking-tight">
                         {Math.abs(profit).toFixed(2)}
                       </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1a0a05] p-6 rounded-[2rem] flex flex-col justify-between min-h-[140px] border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex justify-between items-start">
                       <div className="space-y-0.5">
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Margem Bruta</p>
                         <p className="text-[8px] text-gray-400 font-bold uppercase opacity-60">Rentabilidade</p>
                       </div>
                       <PieChart size={20} className="text-orange-500 opacity-30" />
                    </div>
                    <div className="flex items-baseline gap-0.5 text-brown dark:text-white">
                       <p className="text-4xl font-serif leading-none tracking-tight">{margin.toFixed(1)}</p>
                       <span className="text-2xl font-serif opacity-30">%</span>
                    </div>
                  </div>
                </div>

                {/* Detalhes de Impostos e Markup */}
                <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-gray-400 uppercase tracking-widest">Imposto sobre venda:</span>
                    <span className="text-red-500 font-mono">- R$ {taxesAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-gray-400 uppercase tracking-widest">Markup (Índice):</span>
                    <span className="text-brown dark:text-white font-mono bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full">{markup.toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              {/* Dica / Info */}
              <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-[2rem] border border-blue-100 dark:border-blue-500/20 flex gap-4">
                 <Info className="text-blue-500 shrink-0" size={20} />
                 <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed font-semibold">
                   O **Preço Sugerido** para manter um Markup saudável de 2.5x seria de <span className="text-lg font-serif">R$ {(totalCost * 2.5).toFixed(2)}</span>. Lembre-se que o lucro líquido real deve cobrir seus custos fixos rateados.
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all">Fechar</button>
          <button 
            type="button"
            onClick={() => window.print()}
            className="px-8 py-4 bg-brown text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl"
          >
            <ArrowRight size={16} /> Exportar PDF / Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
