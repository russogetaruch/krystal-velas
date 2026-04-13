import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-stone pb-0">
      {/* Background Claro e Limpo */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-stone mix-blend-overlay z-10" />
        <img src="/votive-candles.png" alt="Velas Feitas em Ibiporã" className="w-full h-full object-cover grayscale-[30%] opacity-80" />
      </div>

      <div className="relative z-10 px-4 max-w-5xl mx-auto flex flex-col items-center">
        {/* Antigravity Logo Floating */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: [0, -10, 0] }} 
          transition={{ 
            y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
            opacity: { duration: 1 }
          }} 
          className="flex flex-col items-center mb-8 bg-white/80 backdrop-blur-md px-12 py-8 rounded-[2rem] shadow-[0_20px_50px_rgba(45,20,7,0.05)] border border-wine/5"
        >
          <img src="/logo.png" alt="Logotipo Krystal" className="h-[90px] md:h-[110px] w-auto drop-shadow-sm mb-2" />
        </motion.div>

        {/* Slogan Híbrido */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2, duration: 0.8 }} 
            className="font-serif text-5xl md:text-7xl text-wine mb-4 tracking-tight drop-shadow-sm"
          >
            A luz que <span className="text-gold italic font-light">&nbsp;nos conduz</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4, duration: 1 }} 
            className="uppercase tracking-[0.3em] text-xs font-bold text-brown/60"
          >
            Da Fé ao Conforto do Lar
          </motion.p>
        </div>

        {/* Texto de Destaque exigido pelo QA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6, duration: 0.8 }} 
          className="max-w-3xl mx-auto mb-12 relative"
        >
          <div className="absolute -left-6 top-0 text-6xl text-gold/30 font-serif leading-none">"</div>
          <p className="text-xl md:text-2xl text-brown/90 font-light text-center leading-relaxed font-sans px-8">
            De Ibiporã para todos os seus momentos. Seja para um instante de oração ou para iluminar um jantar especial, a <strong className="font-semibold text-wine">Krystal Velas</strong> entrega a pureza que você exige.
          </p>
          <div className="absolute -right-2 -bottom-8 text-6xl text-gold/30 font-serif leading-none rotate-180">"</div>
        </motion.div>

        {/* Área de CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.8, duration: 0.6 }} 
          className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto"
        >
          <a href="https://wa.me/5543998073376?text=Ol%C3%A1%2C%20queria%20conhecer%20as%20linhas%20de%20velas%20da%20Krystal!" target="_blank" rel="noreferrer" className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-sm py-4 px-10 rounded-full shadow-2xl hover:-translate-y-1 hover:shadow-orange-500/30 transition-all flex justify-center items-center">
            Adquira Nossas Linhas
          </a>
          <a href="#produtos" className="bg-transparent border border-brown/20 text-brown hover:border-gold hover:text-brown hover:bg-gold/10 font-bold uppercase tracking-widest text-sm py-4 px-10 rounded-full transition-all flex justify-center items-center">
            Explorar Categorias
          </a>
        </motion.div>
      </div>

      {/* Gradiente de transição suave para a próxima seção escura */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-wine/60 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
