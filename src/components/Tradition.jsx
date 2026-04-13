import { motion } from 'framer-motion';

export default function Tradition() {
  return (
    <section id="tradição" className="py-24 bg-cream relative overflow-hidden">
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
              <span className="uppercase tracking-widest text-gold text-sm font-bold">Nossa Raiz</span>
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl text-wine mb-8 leading-tight drop-shadow-sm">
              Excelência Artesanal em <br />Ibiporã, Paraná
            </h2>
            
            <p className="text-lg text-brown/80 mb-6 font-light leading-relaxed">
              A <strong className="font-bold text-wine">Krystal Velas</strong> dedica-se profundamente à arte de criar luz para os momentos de maior fé e contemplação. Trabalhamos em parceria com atacadistas e revendedores comerciais garantindo que nossa parafina seja da mais alta pureza disponível no Brasil.
            </p>
            
            <blockquote className="border-l-4 border-gold pl-6 py-2 my-8">
              <p className="font-serif italic text-2xl text-wine/90">
                "Qualidade rigorosa que acompanha a devoção de famílias todos os dias."
              </p>
            </blockquote>
            
            <div className="flex gap-10 mt-10">
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-gold">100%</span>
                <span className="text-xs font-bold uppercase tracking-widest text-brown/60 mt-1">Parafina Pura</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-gold">+10k</span>
                <span className="text-xs font-bold uppercase tracking-widest text-brown/60 mt-1">Entregas no PR</span>
              </div>
            </div>
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
              <img src="/hero-bg.png" alt="Tradição na confecção de velas litúrgicas" className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-1000" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
