import { motion } from 'framer-motion';
import { Flame, Star, Home, BadgeCheck } from 'lucide-react';

const differentials = [
  { 
    id: 1, 
    icon: Flame, 
    title: 'Queima Premium', 
    desc: 'Formulação pura que não produz fumaça preta ou resíduos. Garantimos uma chama elegante, inodora e constante para iluminar os seus melhores momentos.' 
  },
  { 
    id: 2, 
    icon: Star, 
    title: 'Atmosfera e Cenografia', 
    desc: 'Desenvolvidos para protagonizar mesas de jantar luxuosas, casamentos e decorações de alto padrão. Beleza estética antes, durante e depois da queima.' 
  },
  { 
    id: 3, 
    icon: Home, 
    title: 'Lar e Aconchego', 
    desc: 'Velas modeladas para transformar a energia de qualquer cômodo. Leve paz, relaxamento e um toque sofisticado de design industrial para dentro de casa.' 
  },
  { 
    id: 4, 
    icon: BadgeCheck, 
    title: 'Qualidade Fabril', 
    desc: 'Compra simplificada com preço direto da nossa indústria no Paraná. Padronização absoluta para eventos, varejistas, atacadistas e paróquias.' 
  }
];

export default function Differentials() {
  return (
    <section id="diferenciais" className="py-24 bg-stone relative overflow-hidden">
      {/* Pattern Elegante Claro */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#5C1917 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brown/70 font-bold tracking-[0.3em] uppercase text-xs mb-4"
          >
            Nossas Assinaturas
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl text-wine mb-6"
          >
            A Luz Desenhada para Você
          </motion.h2>
          <div className="h-px bg-wine/10 w-24 mx-auto" />
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
                className="bg-white border border-wine/10 rounded-3xl p-8 hover:bg-cream hover:-translate-y-2 hover:border-gold/50 shadow-sm hover:shadow-xl hover:shadow-wine/5 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-stone rounded-2xl flex items-center justify-center mb-6 ring-1 ring-wine/10 group-hover:bg-wine group-hover:ring-wine/30 transition-colors">
                  <Icon className="text-wine group-hover:text-gold transition-colors" size={28} />
                </div>
                <h3 className="text-xl font-bold text-brown mb-4 tracking-wide group-hover:text-wine transition-colors">{diff.title}</h3>
                <p className="text-brown/70 font-light leading-relaxed text-sm">
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
