import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { content } = useContent();

  const handleCheckout = () => {
    const phone = content.whatsapp_number || '5543998073376';
    const itemsList = cart.map(item => `- ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})`).join('\n');
    const message = `Olá! Gostaria de fazer um pedido:\n\n${itemsList}\n\n*Total: R$ ${totalPrice.toFixed(2)}*`;
    
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-stone">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wine text-white rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-brown">Seu Carrinho</h3>
                  <p className="text-[10px] text-brown/50 uppercase font-bold tracking-widest">{cart.length} itens selecionados</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white rounded-full text-brown/40 hover:text-brown transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <ShoppingBag size={64} />
                  <p className="font-serif text-xl">Seu carrinho está vazio</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs uppercase font-bold tracking-widest text-orange-500"
                  >
                    Voltar às compras
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-brown text-sm leading-tight">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">R$ {item.price.toFixed(2)} / un</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-orange-500 transition-colors"><Minus size={12} /></button>
                          <span className="w-8 text-center text-xs font-bold text-brown">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-orange-500 transition-colors"><Plus size={12} /></button>
                        </div>
                        <span className="text-sm font-bold text-brown">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 border-t border-gray-100 bg-gray-50 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Subtotal</span>
                  <div className="text-right">
                    <p className="text-2xl font-serif text-brown">R$ {totalPrice.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">* Frete a combinar no WhatsApp</p>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1"
                >
                  Continuar com o Pedido
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
