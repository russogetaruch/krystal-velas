import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    quote: "Há 4 anos migramos de fornecedores asiáticos para a Krystal Velas. A fidelidade da queima sem formar crateras escuras nos suportes reduziu nossos custos com manutenção dos ambientes.",
    author: "Antônio Siqueira",
    role: "Gestor de Rede Lojista",
    location: "Maringá - PR"
  },
  {
    id: 2,
    quote: "Vendemos no atacado pelo Brasil. A embalagem firme das caixas que vêm de Ibiporã significa que temos zero defeito e quebra durante o transbordo rodoviário.",
    author: "Tereza Campos",
    role: "Diretora de Compras Atacadista",
    location: "São Paulo - SP"
  },
  {
    id: 3,
    quote: "Impecável. Nossa senhora Aparecida tem a nitidez da gravura perfeita. O cliente final percebe na hora o peso da parafina maciça. Sai mais rápido que a concorrência.",
    author: "Carlos E. Fontana",
    role: "Lojista de Artigos Religiosos",
    location: "Curitiba - PR"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      {/* Decorative quotes background */}
      <div className="absolute top-10 left-10 text-[20rem] font-serif text-brown/5 leading-none select-none pointer-events-none font-bold">
        "
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4"
          >
            Aprovação Corporativa
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl text-brown mb-6"
          >
            O que Diz Quem Confia no Fogo
          </motion.h2>
          <div className="h-px bg-wine/20 w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white rounded-[2rem] p-10 shadow-[0_20px_40px_rgba(45,20,7,0.05)] border border-wine/5 relative group hover:shadow-[0_20px_50px_rgba(45,20,7,0.1)] transition-shadow duration-300"
            >
              {/* Estrelas Douradas */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, index) => (
                  <svg key={index} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-brown/80 font-serif text-lg leading-relaxed italic mb-8 relative z-10">
                "{item.quote}"
              </p>
              
              <div className="pt-6 border-t border-wine/10">
                <h4 className="font-bold text-brown uppercase tracking-wider text-sm">{item.author}</h4>
                <p className="text-gold text-xs font-bold tracking-widest mt-1 uppercase">{item.role}</p>
                <p className="text-brown/50 text-xs font-light mt-1">{item.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
