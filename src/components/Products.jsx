import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const products = [
  { id: 1, name: 'Vela Votiva Branca 298g', title: 'Linha Sagrada', src: '/produtos/vela1.png' },
  { id: 5, name: 'Nossa Senhora', title: 'Linha Especial', src: '/produtos/vela5.png' },
  { id: 2, name: 'Maço Cilíndrico', title: 'Alta Duração', src: '/produtos/vela2.png' },
  { id: 3, name: 'Votivas Coloridas', title: 'Distribuição', src: '/produtos/vela3.png' },
  { id: 7, name: 'Caixas de Lote B2B', title: 'Logística', src: '/produtos/vela7.png' },
  { id: 6, name: 'Azul Premium', title: 'Atmosfera', src: '/produtos/vela6.png' },
  { id: 8, name: 'Pilação de Círios', title: 'Uso Contínuo', src: '/produtos/vela8.png' },
  { id: 9, name: 'Kit Caixa Fechada', title: 'Devocional', src: '/produtos/vela9.png' },
  { id: 10, name: 'Maços Vermelhos', title: 'Oferenda', src: '/produtos/vela10.png' },
  { id: 11, name: 'Coleção Completa', title: 'Cores', src: '/produtos/vela11.png' },
  { id: 12, name: 'Vela Anil', title: 'Litúrgica', src: '/produtos/vela12.png' },
  { id: 13, name: 'Rosa Devocional', title: 'Promessas', src: '/produtos/vela13.png' },
  { id: 14, name: 'Vela Verde', title: 'Cura', src: '/produtos/vela14.png' },
  { id: 15, name: 'Votiva Amarela', title: 'Iluminação', src: '/produtos/vela15.png' },
  { id: 16, name: 'Espectro Completo', title: 'Diversas', src: '/produtos/vela16.png' },
  { id: 4, name: 'Mística Naturista', title: 'Variedades', src: '/produtos/vela4.png' }
];

export default function Products() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Travar o scroll do site principal quando a galeria for aberta
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [lightboxOpen]);

  // Controles do Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentIndex]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Fotos de capa que vão aparecer soltas na página (apenas 6).
  const coverPhotos = products.slice(0, 6);
  const remainingCount = products.length - 6;

  return (
    <>
      <section id="produtos" className="py-24 bg-cream relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4"
            >
              Câmera Real da Fábrica
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-serif text-4xl md:text-5xl text-brown mb-6"
            >
              Nosso Estoque Bruto
            </motion.h2>
            <div className="h-px bg-wine/20 w-24 mx-auto" />
          </div>

          {/* Mini-Grid Clicável */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mx-auto">
            {coverPhotos.map((product, i) => {
              const isLastItem = i === 5;
              return (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  onClick={() => openLightbox(i)}
                  className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all bg-white border border-wine/10"
                >
                  <img 
                    src={product.src} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  
                  {isLastItem && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-[2px] transition-colors group-hover:bg-wine/80">
                      <Plus className="text-gold mb-2 h-8 w-8 md:h-12 md:w-12" strokeWidth={1.5} />
                      <span className="text-white font-bold text-sm md:text-xl tracking-widest uppercase">
                        {remainingCount} Fotos
                      </span>
                      <span className="text-white/60 text-[10px] md:text-xs mt-1 font-light tracking-widest uppercase">Ver Galeria Completa</span>
                    </div>
                  )}

                  {!isLastItem && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div>
                        <p className="text-gold text-[9px] md:text-xs uppercase font-bold tracking-wider">{product.title}</p>
                        <h3 className="text-white font-serif text-sm md:text-lg leading-tight mt-1">{product.name}</h3>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Banner CTA B2B (Inalterado) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mt-20 text-center max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-3xl p-10 md:p-16 shadow-[0_10px_40px_rgba(45,20,7,0.06)] border border-wine/5 relative overflow-hidden">
              <h3 className="font-serif text-3xl md:text-4xl text-brown mb-4 relative z-10">Solicite sua Carga por WhatsApp</h3>
              <p className="text-brown/70 max-w-2xl mx-auto mb-8 font-light text-lg md:text-xl leading-relaxed relative z-10">
                Atendimento direto da nossa frente tática para volumes de Atacado B2B e Distribuição em Ibiporã e região.
              </p>
              <a href="https://wa.me/5543998073376?text=Ol%C3%A1%2C%20acabei%20de%20ver%20a%20galeria%20de%20fotos%20no%20site%20e%20gostaria%20de%20consultar%20valores%20para%20atacado." target="_blank" rel="noreferrer" className="relative z-10 bg-gold hover:bg-yellow-500 text-wine font-bold uppercase tracking-widest text-sm py-4 px-12 rounded-full transition-all inline-block shadow-lg hover:-translate-y-1">
                Acessar Canal de Vendas
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* OVERLAY / LIGHTBOX DE TELA CHEIA */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm"
          >
            {/* Fechar */}
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 z-[110] text-white/50 hover:text-white bg-white/5 hover:bg-wine/50 p-3 rounded-full transition-all focus:outline-none"
            >
              <X size={32} />
            </button>

            {/* Contador */}
            <div className="absolute top-8 left-8 md:top-10 md:left-10 z-[110] text-white font-sans tracking-widest text-sm font-bold bg-black/50 px-4 py-2 rounded-lg border border-white/10">
              <span className="text-gold">{currentIndex + 1}</span> / {products.length}
            </div>

            {/* Setas Esquerda / Direita */}
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 z-[110] text-white/50 hover:text-gold bg-black/50 hover:bg-black/80 p-3 md:p-5 rounded-full transition-all focus:outline-none"
            >
              <ChevronLeft size={40} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 z-[110] text-white/50 hover:text-gold bg-black/50 hover:bg-black/80 p-3 md:p-5 rounded-full transition-all focus:outline-none"
            >
              <ChevronRight size={40} />
            </button>

            {/* Imagem em Si com Qualidade Absoluta e Escala Total */}
            <div className="w-full h-full max-w-6xl mx-auto px-6 md:px-16 py-20 md:py-24 flex flex-col items-center justify-center pointer-events-none">
              <motion.img 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.4 }}
                src={products[currentIndex].src}
                alt={products[currentIndex].name}
                className="w-full h-[60vh] md:h-[75vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-md border border-white/5 pointer-events-auto"
              />
              
              <motion.div 
                key={`desc-${currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-8 text-center"
              >
                <h3 className="text-white font-serif text-2xl md:text-4xl">{products[currentIndex].name}</h3>
                <p className="text-gold tracking-widest uppercase font-bold text-xs mt-3">{products[currentIndex].title}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
