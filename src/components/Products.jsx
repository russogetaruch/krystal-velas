import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Plus, Minus, Search, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useSiteContent } from '../hooks/useSiteContent';

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { addToCart } = useCart();
  const { getWhatsAppLink } = useSiteContent();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*, categories(slug)').eq('is_active', true).order('created_at', { ascending: false })
      ]);

      if (catRes.data) {
        setCategories(catRes.data);
      }
      if (prodRes.data) setProducts(prodRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeTab === 'all' || p.category_id === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Bloqueia scroll quando lightbox aberto
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [lightboxOpen]);

  // Teclas de atalho para lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev + 1) % filteredProducts.length);
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, filteredProducts.length]);

  return (
    <>
      <section id="produtos" className="py-24 bg-cream relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4"
            >
              Nossa Vitrine
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-serif text-4xl md:text-5xl text-brown mb-6"
            >
              Qual o seu Momento?
            </motion.h2>
          </div>

          {/* Search Bar Premium */}
          <div className="max-w-xl mx-auto mb-12 relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-brown/30 group-focus-within:text-orange-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="O que você está procurando hoje?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-wine/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm text-brown placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 shadow-sm transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-5 flex items-center text-brown/20 hover:text-brown transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Abas Dinâmicas */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16 px-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-8 py-3 rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 border-2 ${
                activeTab === 'all'
                  ? 'bg-brown border-brown text-white shadow-2xl shadow-brown/20'
                  : 'bg-white border-transparent text-brown/40 hover:text-brown hover:bg-stone/30'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 border-2 ${
                  activeTab === cat.id
                    ? 'bg-brown border-brown text-white shadow-2xl shadow-brown/20'
                    : 'bg-white border-transparent text-brown/40 hover:text-brown hover:bg-stone/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[4/5] bg-gray-200 rounded-[2rem]" />
              ))}
            </div>
          ) : (
            <motion.div
              key={`grid-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mx-auto"
            >
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center text-brown/40 italic">Nenhum produto nesta categoria no momento.</div>
              ) : (
                filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(45,20,7,0.15)] transition-all duration-500 bg-white border border-wine/5"
                  >
                    <div className="absolute inset-0 z-0 overflow-hidden cursor-pointer" onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }}>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                          <ShoppingBag size={48} />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#0f0602]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 pointer-events-none">
                      <p className="text-gold text-[10px] uppercase font-bold tracking-[0.2em] mb-1">R$ {product.price.toFixed(2)}</p>
                      <h3 className="text-white font-serif text-lg leading-tight mb-4">{product.name}</h3>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="pointer-events-auto w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>

                    {/* Featured Badge */}
                    {product.is_featured && (
                      <div className="absolute top-4 left-4 z-20 bg-orange-500 text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
                        <Star size={10} className="fill-white" />
                        Destaque
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Banner B2B */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mt-24 text-center max-w-4xl mx-auto"
          >
            <div className="bg-stone rounded-3xl p-10 md:p-16 shadow-[0_10px_40px_rgba(45,20,7,0.06)] border border-wine/5 relative overflow-hidden">
              <h3 className="font-serif text-3xl md:text-4xl text-brown mb-4 relative z-10">Precisa de Lote Atacadista?</h3>
              <p className="text-brown/70 max-w-2xl mx-auto mb-8 font-light text-lg md:text-xl leading-relaxed relative z-10">
                Lojistas, paróquias organizadas e empresas de eventos têm acesso direto à nossa tabela de faturamento fabril.
              </p>
              <a
                href={getWhatsAppLink('atacado')}
                target="_blank" rel="noopener noreferrer"
                className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-sm py-4 px-12 rounded-full transition-all inline-block shadow-xl shadow-orange-500/20 hover:-translate-y-1"
              >
                Falar com Vendas (Atacado)
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Refatorado */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm"
          >
            <button onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 z-[110] text-white/50 hover:text-white bg-white/5 hover:bg-wine/50 p-3 rounded-full transition-all">
              <X size={32} />
            </button>
            <div className="absolute top-8 left-8 md:top-10 md:left-10 z-[110] text-white font-sans tracking-widest text-sm font-bold bg-black/50 px-4 py-2 rounded-lg border border-white/10">
              <span className="text-gold">{currentIndex + 1}</span> / {filteredProducts.length}
            </div>
            
            <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length); }}
              className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 z-[110] text-white/50 hover:text-gold bg-black/50 hover:bg-black/80 p-3 md:p-5 rounded-full transition-all">
              <ChevronLeft size={40} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev + 1) % filteredProducts.length); }}
              className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 z-[110] text-white/50 hover:text-gold bg-black/50 hover:bg-black/80 p-3 md:p-5 rounded-full transition-all">
              <ChevronRight size={40} />
            </button>

            <div className="w-full h-full max-w-6xl mx-auto px-6 md:px-16 py-20 md:py-24 flex flex-col md:flex-row items-center justify-center gap-12">
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full md:w-1/2 h-[50vh] md:h-[70vh] flex items-center justify-center"
              >
                <img
                  src={filteredProducts[currentIndex].images?.[0]}
                  alt={filteredProducts[currentIndex].name}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                />
              </motion.div>

              <div className="w-full md:w-1/3 text-center md:text-left space-y-6">
                <div>
                  <p className="text-gold tracking-[0.3em] uppercase font-bold text-[10px] mb-2">Detalhes do Produto</p>
                  <h3 className="text-white font-serif text-3xl md:text-5xl mb-4">{filteredProducts[currentIndex].name}</h3>
                  <p className="text-white/60 text-lg font-light leading-relaxed">{filteredProducts[currentIndex].description}</p>
                </div>
                
                <div className="pt-6 border-t border-white/10 flex flex-col items-center md:items-start gap-6">
                  <div className="text-4xl font-sans font-bold text-white">R$ {filteredProducts[currentIndex].price.toFixed(2)}</div>
                  <button 
                    onClick={() => { addToCart(filteredProducts[currentIndex]); setLightboxOpen(false); }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-xs py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 pointer-events-auto"
                  >
                    <ShoppingBag size={18} /> Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
