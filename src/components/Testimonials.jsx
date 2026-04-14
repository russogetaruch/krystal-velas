import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const LOCAL_FALLBACK = [
  {
    id: 1,
    quote: "Há 4 anos migramos de fornecedores asiáticos para a Krystal Velas. A fidelidade da queima sem formar crateras escuras nos suportes reduziu nossos custos com manutenção dos ambientes.",
    author: "Antônio Siqueira",
    role: "Gestor de Rede Lojista",
    location: "Maringá - PR"
  },
  {
    id: 2,
    quote: "Vendemos no atacado pelo Brasil. A embalagem firme das caixas que vêm de Ibiporã significa que temos zero defeito e quebra durante o transbordo rodoviário.",
    author: "Tereza Campos",
    role: "Diretora de Compras Atacadista",
    location: "São Paulo - SP"
  },
  {
    id: 3,
    quote: "Impecável. Nossa senhora Aparecida tem a nitidez da gravura perfeita. O cliente final percebe na hora o peso da parafina maciça. Sai mais rápido que a concorrência.",
    author: "Carlos E. Fontana",
    role: "Lojista de Artigos Religiosos",
    location: "Curitiba - PR"
  }
];

export default function Testimonials() {
  const [list, setList] = useState(LOCAL_FALLBACK);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = right, -1 = left

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setList(data);
      }
    };
    fetchTestimonials();
  }, []);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setActiveIndex((prev) => (prev + newDirection + list.length) % list.length);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => paginate(1), 8000);
    return () => clearInterval(timer);
  }, [list.length]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    })
  };

  const item = list[activeIndex];

  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      {/* Decorative quotes background */}
      <div className="absolute top-10 left-10 text-[20rem] font-serif text-brown/5 leading-none select-none pointer-events-none font-bold">
        "
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4"
          >
            Aprovação Corporativa
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl text-brown mb-6"
          >
            O que Diz Quem Confia no Fogo
          </motion.h2>
          <div className="h-px bg-wine/20 w-24 mx-auto" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="min-h-[400px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 }
                }}
                className="w-full bg-white rounded-[2.5rem] p-8 md:p-14 shadow-[0_30px_60px_rgba(45,20,7,0.08)] border border-wine/5 relative"
              >
                {/* Estrelas Douradas */}
                <div className="flex gap-1 mb-8 justify-center md:justify-start">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} size={18} className="text-gold fill-gold" />
                  ))}
                </div>
                
                <p className="text-brown/90 font-serif text-xl md:text-2xl leading-relaxed italic mb-10 relative z-10 text-center md:text-left">
                  "{item.quote}"
                </p>
                
                <div className="pt-8 border-t border-wine/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-brown uppercase tracking-wider text-base">{item.author}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gold text-xs font-bold tracking-widest uppercase">{item.role}</p>
                      <span className="w-1 h-1 rounded-full bg-wine/20" />
                      <p className="text-brown/50 text-xs font-medium uppercase tracking-tighter">{item.location}</p>
                    </div>
                  </div>

                  {item.source && (
                    <div className="px-3 py-1 bg-cream rounded-full border border-wine/5 flex items-center gap-2 self-start md:self-center">
                      <span className="text-[10px] font-bold text-wine/40 uppercase tracking-widest">Via {item.source}</span>
                    </div>
                  )}
                </div>

                {/* Badge flutuante (opcional) */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gold flex items-center justify-center rounded-2xl shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                  <span className="text-white text-2xl font-serif">"</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-0 right-0 -mx-4 md:-mx-16 pointer-events-none">
            <button 
              onClick={() => paginate(-1)}
              className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-brown hover:bg-gold hover:text-white transition-all pointer-events-auto border border-wine/5"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-brown hover:bg-gold hover:text-white transition-all pointer-events-auto border border-wine/5"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-12">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > activeIndex ? 1 : -1);
                  setActiveIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-8 bg-gold" : "w-1.5 bg-wine/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Fade para o FAQ escuro */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-wine/40 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
