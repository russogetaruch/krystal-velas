import { motion } from 'framer-motion';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contato" className="bg-brown pt-24 pb-8 text-white relative overflow-hidden">
      {/* Separador Brilho de Chama - Efeito Elite */}
      <div className="absolute top-0 left-0 w-full h-[3px] z-20" style={{background: 'linear-gradient(to right, transparent 0%, #EA580C 20%, #F59E0B 50%, #EA580C 80%, transparent 100%)'}} />
      <div className="absolute top-0 left-0 w-full h-16 z-10 pointer-events-none" style={{background: 'linear-gradient(to bottom, rgba(234,88,12,0.15) 0%, transparent 100%)'}} />
      <div className="absolute inset-0 bg-wine/5 z-0 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 mb-16">
          
          {/* Pilar 1: Marca e Identidade */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center md:items-start"
          >
            <div className="mb-6 hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="Logo Krystal Velas" className="h-[75px] w-auto drop-shadow-lg" />
            </div>
            <h4 className="font-serif text-3xl text-white mb-2 tracking-wide text-center md:text-left drop-shadow-md">
              A luz que nos conduz
            </h4>
            <p className="text-white/60 font-light text-sm max-w-[250px] text-center md:text-left leading-relaxed">
              Tradição, excelência artesanal e respeito sagrado em cada chama. Referência litúrgica no coração do Paraná.
            </p>
          </motion.div>

          {/* Pilar 2: Contatos Reais */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center md:items-start"
          >
            <h5 className="font-bold uppercase tracking-widest text-gold text-sm mb-6">Central de Vendas</h5>
            <ul className="flex flex-col gap-5 text-white/80 font-light">
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
                <MapPin className="text-gold" size={20} />
                <span className="text-sm">R. Gen. Carneiro, 52 - Semprebom<br />Ibiporã - PR, 86200-000, Brasil</span>
              </li>
              <li>
                <a href="https://wa.me/5543998073376?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Krystal%20Velas%20e%20gostaria%20de%20falar%20com%20o%20comercial." target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white transition-colors group">
                  <Phone className="text-gold group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-sm font-bold">(43) 99807-3376</span>
                </a>
              </li>
              <li>
                <a href="mailto:krystalvelasibipora@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors group">
                  <Mail className="text-gold group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-sm">krystalvelasibipora@gmail.com</span>
                </a>
              </li>
            </ul>
            
            <div className="flex gap-4 mt-8">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-white/5 p-3 rounded-full hover:bg-gold hover:text-brown transition-all ring-1 ring-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="bg-white/5 p-3 rounded-full hover:bg-gold hover:text-brown transition-all ring-1 ring-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </motion.div>

          {/* Pilar 3: Elemento Geográfico Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full flex-col items-center md:items-start flex"
          >
            <h5 className="font-bold uppercase tracking-widest text-gold text-sm mb-6 w-full text-center md:text-left">Como Chegar</h5>
            <div className="w-full h-56 md:h-full min-h-[180px] rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-2xl relative bg-wine/20">
              <iframe 
                src="https://www.google.com/maps?q=R.+Gen.+Carneiro,+52+-+Semprebom,+Ibiporã+-+PR,+86200-000&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale"
              />
            </div>
          </motion.div>
          
        </div>

        {/* Integração Vittalix.com.br */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-white/50 text-xs tracking-wider gap-6">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Krystal Velas. Indústria e Comércio.</p>
          
          <a 
            href="https://www.vittalix.com.br" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-3 group hover:opacity-100 opacity-80 transition-opacity"
          >
            <span className="tracking-[0.1em] font-light text-[10px] uppercase text-white/40">Desenvolvido por</span>
            <div className="flex items-center gap-2 bg-gradient-to-r from-black/40 to-black/20 px-3 py-1.5 rounded-lg border border-white/5 shadow-md group-hover:border-[#9333EA]/40 group-hover:bg-[#9333EA]/10 transition-all duration-300">
              <img src="https://www.vittalix.com.br/favicon.svg" alt="Vittalix Ícone" className="h-[14px] w-auto group-hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.8)] filter brightness-200 contrast-200 transition-all" />
              <span className="font-sans font-bold tracking-tight text-white/90 text-[13px] lowercase">vittalix</span>
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}
