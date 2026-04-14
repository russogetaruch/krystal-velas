import { motion } from 'framer-motion';
import { useSiteContent } from '../hooks/useSiteContent';

export default function Tradition() {
  const { content, getWhatsAppLink } = useSiteContent();

  return (
    <section id="fabrica" className="py-24 bg-cream relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gold" />
              <span className="uppercase tracking-widest text-gold text-sm font-bold">Direto da Indústria</span>
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl text-wine mb-8 leading-tight drop-shadow-sm">
              {content.fabrica_title}
            </h2>
            
            <p className="text-lg text-brown/80 mb-6 font-light leading-relaxed">
              {content.fabrica_description}
            </p>
            
            <blockquote className="border-l-4 border-gold pl-6 py-2 my-8">
              <p className="font-serif italic text-xl text-wine/90">
                "Nosso compromisso é entregar o melhor custo-benefício com matéria-prima pura, para que seu cliente volte sempre a comprar."
              </p>
            </blockquote>
            
            <div className="flex gap-10 mt-8 mb-10">
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-gold">100%</span>
                <span className="text-xs font-bold uppercase tracking-widest text-brown/60 mt-1">Parafina Pura</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-gold">Alta</span>
                <span className="text-xs font-bold uppercase tracking-widest text-brown/60 mt-1">Escalabilidade</span>
              </div>
            </div>

            <a 
              href={getWhatsAppLink('contact')} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-orange-500/20 uppercase tracking-widest text-sm"
            >
              Falar com um Consultor
            </a>

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full max-w-md lg:max-w-none mx-auto"
          >
            <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-brown/20 relative">
              <div className="absolute inset-0 bg-wine/10 z-10 mix-blend-overlay" />
              <img src="/hero-bg.png" alt="Estrutura de Fábrica Krystal Velas" loading="lazy" decoding="async" className="w-full h-auto object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
