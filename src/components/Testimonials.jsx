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
    location: "Maringá - PR",
    avatar_url: null
  },
  {
    id: 2,
    quote: "Vendemos no atacado pelo Brasil. A embalagem firme das caixas que vêm de Ibiporã significa que temos zero defeito e quebra durante o transbordo rodoviário.",
    author: "Tereza Campos",
    role: "Diretora de Compras Atacadista",
    location: "São Paulo - SP",
    avatar_url: null
  },
  {
    id: 3,
    quote: "Impecável. Nossa senhora Aparecida tem a nitidez da gravura perfeita. O cliente final percebe na hora o peso da parafina maciça. Sai mais rápido que a concorrência.",
    author: "Carlos E. Fontana",
    role: "Lojista de Artigos Religiosos",
    location: "Curitiba - PR",
    avatar_url: null
  }
];

export default function Testimonials() {
  const [list, setList] = useState(LOCAL_FALLBACK);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 10000);
    return () => clearInterval(timer);
  }, [list.length]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      filter: 'blur(10px)'
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: 'blur(0px)'
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      filter: 'blur(10px)'
    })
  };

  const item = list[activeIndex];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <section className="py-24 bg-[#FAF9F6] relative overflow-hidden">
      {/* Decorative Branding - Flame Icon Large */}
      <div className="absolute top-10 left-10 text-gold/5 pointer-events-none select-none">
        <svg viewBox="0 0 24 24" className="w-[30rem] h-[30rem] fill-current">
          <path d="M12 2C12 2 7 7 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 7 12 2 12 2Z" />
        </svg>
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

        <div className="relative max-w-4xl mx-auto w-[95%] md:w-full">
          <div className="min-h-[420px] md:min-h-[400px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  opacity: { duration: 0.8, ease: "easeInOut" },
                  x: { type: "spring", stiffness: 100, damping: 20 },
                  filter: { duration: 0.6 }
                }}
                className="w-full bg-white rounded-[2.5rem] p-6 md:p-14 shadow-[0_40px_80px_rgba(45,20,7,0.06)] border border-wine/5 relative"
              >
                {/* Estrelas Douradas */}
                <div className="flex gap-1 mb-8 justify-center md:justify-start">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} size={16} className="text-gold fill-gold" />
                  ))}
                </div>
                
                <p className="text-brown font-serif text-lg md:text-2xl leading-relaxed italic mb-10 relative z-10 text-center md:text-left">
                  "{item.quote}"
                </p>
                
                <div className="pt-8 border-t border-wine/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar Slot */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 bg-cream border border-wine/5 flex items-center justify-center shadow-inner">
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt={item.author} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gold font-serif text-xl font-bold">{getInitials(item.author)}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-brown uppercase tracking-wider text-base">{item.author}</h4>
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mt-0.5">
                        <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase">{item.role}</p>
                        <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-wine/15" />
                        <p className="text-brown/70 text-[10px] md:text-xs font-medium uppercase tracking-widest">{item.location}</p>
                      </div>
                    </div>
                  </div>

                  {item.source && (
                    <div className="px-4 py-1.5 bg-cream/50 rounded-full border border-wine/5 flex items-center gap-2 self-start md:self-center">
                      <span className="text-[10px] font-bold text-wine/40 uppercase tracking-widest">Via {item.source}</span>
                    </div>
                  )}
                </div>

                {/* Flame Icon (Branding replace quotes) */}
                <div className="absolute -top-5 -right-5 w-14 h-14 bg-orange-500 flex items-center justify-center rounded-2xl shadow-xl rotate-12 group-hover:rotate-0 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <path d="M12 2C12 2 8 7 8 11C8 13.2091 9.79086 15 12 15C14.2091 15 16 13.2091 16 11C16 7 12 2 12 2Z" fill="white"/>
                  </svg>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-0 right-0 -mx-3 md:-mx-16 pointer-events-none">
            <button 
              onClick={() => paginate(-1)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-brown hover:bg-gold hover:text-white transition-all pointer-events-auto border border-wine/5"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-brown hover:bg-gold hover:text-white transition-all pointer-events-auto border border-wine/5"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > activeIndex ? 1 : -1);
                  setActiveIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeIndex ? "w-10 bg-gold" : "w-1.5 bg-wine/10 hover:bg-wine/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Separator */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-wine/10 to-transparent" />
    </section>
  );
}
