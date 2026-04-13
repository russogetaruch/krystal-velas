import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    id: 1,
    q: "Qual é a capacidade de pedido mínimo para atacado?",
    a: "Trabalhamos com faturamento direto da fábrica em Ibiporã-PR. O pedido mínimo varia conforme a linha, entre em contato via WhatsApp com nosso quadro comercial para a tabela corporativa e volumes em caixa."
  },
  {
    id: 2,
    q: "A parafina machuca as paredes e estruturas com manchas pretas?",
    a: "Zero Fumaça Preta! Nossa engenharia química garante parafina estritamente 100% pura, que resulta em uma combustão cristalina que preserva a pintura e a infraestrutura do local ao seu redor."
  },
  {
    id: 3,
    q: "A empresa distribui para fora do estado do Paraná?",
    a: "Sim. Nossas caixas B2B possuem embalagem estruturada reforçada feita para resistir aos impactos das malhas viárias, enviando carregamentos para lojistas e distribuidores de todo o território nacional."
  },
  {
    id: 4,
    q: "Posso criar uma linha personalizada com a logo da minha marca?",
    a: "Nossa linha possui adesivação controlada (como os Santos e Virgem Maria). Entre em contato diretamente para consultar moldes industriais sob medida e contratos de longo prazo."
  }
];

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    if (openId === id) setOpenId(null);
    else setOpenId(id);
  };

  return (
    <section id="duvidas" className="py-24 bg-wine relative overflow-hidden">
      <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
      {/* Fade de entrada vindo do Testimonials */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-wine to-transparent z-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4"
          >
            Fale Direto com a Fonte
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl text-white mb-6"
          >
            Dúvidas Comerciais Frequentes
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`bg-white/5 border ${openId === faq.id ? 'border-gold/50 bg-white/10' : 'border-white/10'} hover:bg-white/10 rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <button 
                onClick={() => toggle(faq.id)}
                className="w-full px-8 py-6 text-left flex justify-between items-center outline-none focus:ring-0 group"
              >
                <span className={`font-bold tracking-wide pr-8 group-hover:text-gold transition-colors ${openId === faq.id ? 'text-gold' : 'text-white'}`}>
                  {faq.q}
                </span>
                <ChevronDown 
                  className={`text-gold shrink-0 transition-transform duration-500 ${openId === faq.id ? '-rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-6 text-white/90 font-light leading-relaxed text-base">
                      <div className="h-px bg-white/20 w-full mb-6" />
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Fade de saída para o Footer escuro */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-brown to-transparent z-10 pointer-events-none" />
    </section>
  );
}
