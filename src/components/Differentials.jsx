import { motion } from 'framer-motion';
import { Flame, ShieldCheck, Truck, BadgeCheck } from 'lucide-react';

const differentials = [
  { 
    id: 1, 
    icon: Flame, 
    title: 'Parafina 100% Pura', 
    desc: 'Não produz fumaça preta corrosiva. Formulação química importada que garante chama constante e preserva as paredes do ambiente.' 
  },
  { 
    id: 2, 
    icon: Truck, 
    title: 'Logística de Alta Baixa', 
    desc: 'Frota terceirizada adaptada. Suportamos envio de toneladas semanais sem risco de derretimento da carga durante o trajeto.' 
  },
  { 
    id: 3, 
    icon: BadgeCheck, 
    title: 'Garantia de 7 Dias', 
    desc: 'Nossa engenharia votiva garante a queima calculada de exatos 7 dias nos cilindros 298g em ambientes controlados.' 
  },
  { 
    id: 4, 
    icon: ShieldCheck, 
    title: 'Zero Terceiros', 
    desc: 'Preço enxuto. Você compra diretamente de nosso pavilhão de maquinário em Ibiporã-PR, pagando a métrica exata da fábrica.' 
  }
];

export default function Differentials() {
  return (
    <section id="diferenciais" className="py-24 bg-brown relative overflow-hidden">
      {/* Pattern Elegante */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4"
          >
            A Engenharia da Marca
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl text-white mb-6"
          >
            Ninguém no Paraná Faz Dessa Forma
          </motion.h2>
          <div className="h-px bg-white/10 w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {differentials.map((diff, i) => {
            const Icon = diff.icon;
            return (
              <motion.div 
                key={diff.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:-translate-y-2 hover:border-gold/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-wine/50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:bg-gold group-hover:ring-gold/50 transition-colors">
                  <Icon className="text-gold group-hover:text-brown transition-colors" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-wide group-hover:text-gold transition-colors">{diff.title}</h3>
                <p className="text-white/60 font-light leading-relaxed text-sm">
                  {diff.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
