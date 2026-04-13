import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background com velas reais e proteção de contraste obscuro */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-brown/70 z-10" />
        <img src="/votive-candles.png" alt="Velas Feitas em Ibiporã" className="w-full h-full object-cover scale-105" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        {/* Antigravity Logo Entrando */}
        <motion.div 
          initial={{ opacity: 0, y: -40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, ease: 'easeOut' }} 
          className="flex flex-col items-center mb-8 bg-white/95 px-10 py-8 rounded-[2rem] shadow-[0_10px_30px_rgba(255,255,255,0.05)] ring-4 ring-white/10"
        >
          <img src="/logo.png" alt="Logotipo Krystal" className="h-[90px] md:h-[110px] w-auto drop-shadow-sm mb-2" />
        </motion.div>

        {/* Slogan Rigoroso */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.4, duration: 0.8 }} 
          className="font-serif text-5xl md:text-7xl text-white mb-6 tracking-wide drop-shadow-xl"
        >
          A luz que <span className="text-gold italic font-light">&nbsp;nos conduz</span>
        </motion.h1>

        {/* Copy Focada */}
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.8, duration: 1 }} 
          className="text-lg md:text-2xl text-cream/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
        >
          Fabricantes de velas religiosas e votivas corporativas. <br className="hidden md:block" />Tradição em pureza operando do coração de Ibiporã-PR.
        </motion.p>

        {/* Área de CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 1, duration: 0.6 }} 
          className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto"
        >
          <a href="https://wa.me/5543998073376?text=Ol%C3%A1%2C%20acessei%20o%20site%20da%20Krystal%20Velas%20e%20gostaria%20de%20fazer%20um%20or%C3%A7amento%20no%20atacado." target="_blank" rel="noreferrer" className="bg-gradient-to-r from-gold to-orange-600 text-white font-bold uppercase tracking-widest text-sm py-4 px-10 rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(245,158,11,0.6)] transition-all flex justify-center items-center">
            Orçamento no Atacado
          </a>
          <a href="#produtos" className="bg-transparent border border-white/40 text-white hover:border-gold hover:text-gold hover:bg-white/5 font-bold uppercase tracking-widest text-sm py-4 px-10 rounded-full transition-all flex justify-center items-center">
            Explorar Linhas
          </a>
        </motion.div>
      </div>

      {/* Gradiente sutil unificador com a próxima seção */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cream to-transparent z-10" />
    </section>
  );
}
