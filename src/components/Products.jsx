import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Fallback local — usado se o Supabase estiver offline
const FALLBACK_PRODUCTS = [
  { id: 1,   name: 'Vela Votiva Branca 298g', category: 'fe',     imgCategory: 'Linha Votiva',      src: '/produtos/vela1.png' },
  { id: 5,   name: 'Nossa Senhora',           category: 'fe',     imgCategory: 'Devocional',        src: '/produtos/vela5.png' },
  { id: 12,  name: 'Vela Anil',               category: 'fe',     imgCategory: 'Litúrgica',         src: '/produtos/vela12.png' },
  { id: 8,   name: 'Pilação de Círios',       category: 'fe',     imgCategory: 'Uso Contínuo',      src: '/produtos/vela8.png' },
  { id: 9,   name: 'Kit Promessas',           category: 'fe',     imgCategory: 'Pacote Família',    src: '/produtos/vela9.png' },
  { id: 13,  name: 'Rosa Devocional',         category: 'fe',     imgCategory: 'Promessas',         src: '/produtos/vela13.png' },
  { id: 4,   name: 'Mística Naturista',       category: 'casa',   imgCategory: 'Linha Decorativa',  src: '/produtos/vela4.png' },
  { id: 6,   name: 'Azul Premium',            category: 'casa',   imgCategory: 'Atmosfera',         src: '/produtos/vela6.png' },
  { id: 14,  name: 'Vela Verde',              category: 'casa',   imgCategory: 'Cura & Bem Estar',  src: '/produtos/vela14.png' },
  { id: 3,   name: 'Votivas Coloridas',       category: 'casa',   imgCategory: 'Design Interior',   src: '/produtos/vela3.png' },
  { id: 15,  name: 'Votiva Amarela',          category: 'casa',   imgCategory: 'Iluminação Quente', src: '/produtos/vela15.png' },
  { id: 161, name: 'Espectro de Cores',       category: 'casa',   imgCategory: 'Coleção Completa',  src: '/produtos/vela16.png' },
  { id: 7,   name: 'Caixas de Lote',          category: 'evento', imgCategory: 'Atacado B2B',       src: '/produtos/vela7.png' },
  { id: 2,   name: 'Maço Cilíndrico',         category: 'evento', imgCategory: 'Alta Duração',      src: '/produtos/vela2.png' },
  { id: 10,  name: 'Maços Vermelhos',         category: 'evento', imgCategory: 'Cenografia',        src: '/produtos/vela10.png' },
  { id: 11,  name: 'Coleção Cores',           category: 'evento', imgCategory: 'Decoração Eventos', src: '/produtos/vela11.png' },
  { id: 16,  name: 'Espectro Completo',       category: 'evento', imgCategory: 'Kits Corporativos', src: '/produtos/vela16.png' },
];

const tabs = [
  { id: 'casa',   title: 'Para sua Casa',       desc: 'Aconchego e design para seus ambientes.' },
  { id: 'evento', title: 'Suas Celebrações',    desc: 'Decoradores e cenografia para eventos.' },
  { id: 'fe',     title: 'Para sua Fé',         desc: 'Rituais, devoção e pureza litúrgica.' },
];

export default function Products() {
  const [activeTab, setActiveTab] = useState('casa');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  // Busca do Supabase, usa fallback se vazio/erro
  useEffect(() => {
    supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // Mapeia os campos do Supabase para o formato local
          setProducts(data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            imgCategory: item.img_category || '',
            src: item.src,
          })));
        }
        // Se erro ou vazio → mantém FALLBACK_PRODUCTS
      });
  }, []);

  const filteredProducts = products.filter(p => p.category === activeTab);

  // Bloqueia scroll quando lightbox aberto
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [lightboxOpen]);

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

          {/* Abas */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-wine text-white shadow-lg shadow-wine/30'
                    : 'bg-white text-brown/60 border border-wine/10 hover:bg-stone hover:text-wine'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <motion.div key={`desc-${activeTab}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 text-brown/70 font-light"
          >
            {tabs.find(t => t.id === activeTab)?.desc}
          </motion.div>

          {/* Grid */}
          <motion.div
            key={`grid-${activeTab}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mx-auto"
          >
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }}
                className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all bg-white border border-wine/5"
              >
                <img
                  src={product.src}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div>
                    <p className="text-gold text-[9px] md:text-xs uppercase font-bold tracking-wider">{product.imgCategory}</p>
                    <h3 className="text-white font-serif text-sm md:text-lg leading-tight mt-1">{product.name}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

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
                href="https://wa.me/5543998073376?text=Ol%C3%A1%2C%20queria%20acesso%20a%20tabela%20de%20Atacado%20para%20Lojista/Eventos."
                target="_blank" rel="noopener noreferrer"
                className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-sm py-4 px-12 rounded-full transition-all inline-block shadow-xl shadow-orange-500/20 hover:-translate-y-1"
              >
                Falar com Vendas (Atacado)
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
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
            <div className="w-full h-full max-w-6xl mx-auto px-6 md:px-16 py-20 md:py-24 flex flex-col items-center justify-center pointer-events-none">
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.4 }}
                src={filteredProducts[currentIndex].src}
                alt={filteredProducts[currentIndex].name}
                className="w-full h-[60vh] md:h-[75vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-md border border-white/5 pointer-events-auto"
              />
              <motion.div
                key={`desc-${currentIndex}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-8 text-center bg-black/40 px-6 py-3 rounded-full backdrop-blur-md"
              >
                <h3 className="text-white font-serif text-xl md:text-3xl">{filteredProducts[currentIndex].name}</h3>
                <p className="text-gold tracking-widest uppercase font-bold text-[10px] mt-2">{filteredProducts[currentIndex].imgCategory}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
