import { motion } from 'framer-motion';

const stats = [
  { id: 1, number: '6', label: 'Anos de Tradição', suffix: '' },
  { id: 2, number: '+15', label: 'Mil Lojistas Abastecidos', suffix: 'k' },
  { id: 3, number: '100', label: 'Parafina Pura', suffix: '%' },
  { id: 4, number: '7', label: 'Dias Comprovados de Queima', suffix: '' }
];

export default function SocialProof() {
  return (
    <section className="bg-gradient-to-r from-wine to-brown py-16 relative border-t border-b border-gold/10 z-20 overflow-hidden">
      {/* Luzes Estéticas Atrás dos Números */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-gold/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-white/5">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="px-4 text-center group"
            >
              <div className="flex justify-center items-baseline mb-2">
                <span className="font-serif text-5xl md:text-6xl text-white group-hover:text-gold transition-colors duration-500 font-bold drop-shadow-md">
                  {stat.number}
                </span>
                <span className="font-sans text-xl md:text-2xl text-gold font-bold ml-1">
                  {stat.suffix}
                </span>
              </div>
              <p className="text-white/60 font-light text-xs md:text-sm uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Fade topo: cobre o corte abrupto vindo do Hero */}
      <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-wine to-transparent z-10 pointer-events-none" />
      {/* Fade base: prepara transição suave para a seção clara seguinte */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-cream to-transparent z-10 pointer-events-none" />
    </section>
  );
}
