import { motion } from 'framer-motion';
import { useSiteContent } from '../hooks/useSiteContent';

export default function Hero() {
  const { content, getWhatsAppLink } = useSiteContent();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center justify-center pt-20 overflow-hidden bg-[#0f0602] pb-0">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Main Image with subtle scale animation */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.45 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src="/votive-candles.png"
            alt="Velas Feitas em Ibiporã"
            className="w-full h-full object-cover"
            fetchpriority="high"
          />
        </motion.div>
        
        {/* Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0602] via-transparent to-[#0f0602]/90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0602]/60 via-transparent to-[#0f0602]/60 z-10" />
        <div className="absolute inset-0 ring-inset ring-1 ring-white/5 z-20" />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-30 px-6 max-w-5xl mx-auto flex flex-col items-center text-center"
      >
        {/* Logo Badge */}
        <motion.div
          variants={item}
          className="mb-12 relative group"
        >
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 group-hover:bg-white/30 transition-colors duration-700" />
          <div className="relative bg-white/95 backdrop-blur-md px-10 py-7 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] border border-white/20">
            <img src="/logo.png" alt="Logotipo Krystal" className="h-16 md:h-20 w-auto" fetchpriority="high" />
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div variants={item} className="space-y-4 mb-10">
          <p className="uppercase tracking-[0.4em] text-[10px] md:text-xs font-bold text-orange-400 drop-shadow-sm">
            {content.hero_subtitle}
          </p>
          <h1 className="font-serif text-5xl md:text-8xl text-white leading-[0.9] tracking-tight">
            {content.hero_slogan}
          </h1>
        </motion.div>

        <motion.div variants={item} className="max-w-2xl mx-auto mb-14">
          <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed font-sans px-4">
            {content.hero_description}
          </p>
        </motion.div>

        {/* Global CTAs */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto"
        >
          <a 
            href={getWhatsAppLink('contact')} 
            target="_blank" 
            rel="noreferrer" 
            className="group relative bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-[0.15em] text-xs py-5 px-12 rounded-full overflow-hidden transition-all shadow-2xl shadow-orange-950/20"
          >
            <span className="relative z-10">Solicitar Tabela Atacado</span>
            <motion.div 
              className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
            />
          </a>
          <a 
            href="#produtos" 
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md font-bold uppercase tracking-[0.15em] text-xs py-5 px-12 rounded-full transition-all flex justify-center items-center"
          >
            Ver Coleções
          </a>
        </motion.div>
      </motion.div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-wine/40 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 opacity-20 hidden md:block">
        <motion.div 
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-white"
        />
      </div>
    </section>
  );
}

