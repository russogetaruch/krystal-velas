import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ShoppingBag, CreditCard, Ticket, CheckCircle2, ChevronRight, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    zip: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('pix');
  const shippingPrice = 15.00; // Valor fictício conforme combinado
  const finalTotal = totalPrice + shippingPrice;

  // Se o carrinho estiver vazio e não houver sucesso, volta pra loja
  useEffect(() => {
    if (cart.length === 0 && !success) {
      window.location.href = '/loja';
    }
  }, [cart, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar o pedido na tabela 'orders'
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_document: formData.document,
          address_zip: formData.zip,
          address_street: formData.street,
          address_number: formData.number,
          address_complement: formData.complement,
          address_neighborhood: formData.neighborhood,
          address_city: formData.city,
          address_state: formData.state,
          total_items_price: totalPrice,
          shipping_price: shippingPrice,
          total_amount: finalTotal,
          payment_method: paymentMethod,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Criar os itens do pedido na tabela 'order_items'
      const itemsToInsert = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_purchase: item.price,
        image_url: item.images?.[0] || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Sucesso!
      setOrderId(order.id);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      alert('Houve um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="font-serif text-3xl text-brown mb-2">Pedido Recebido!</h1>
          <p className="text-gray-500 mb-8 font-light text-sm">
            Obrigado pela sua compra. Seu pedido foi registrado com sucesso em nosso sistema.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">ID do Pedido</p>
            <p className="text-xs font-mono text-gray-600 truncate">{orderId}</p>
          </div>
          <a 
            href="/"
            className="block w-full bg-brown text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brown/90 transition-all"
          >
            Voltar ao Início
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header Minimalista */}
      <header className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <a href="/loja" className="flex items-center gap-2 text-brown hover:text-orange-600 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Voltar à Loja</span>
          </a>
          <img src="/logo.png" alt="Krystal Velas" className="h-8 w-auto" />
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-12">
          
          {/* Coluna Dados (3/5) */}
          <div className="md:col-span-3 space-y-10">
            <section>
              <h2 className="font-serif text-2xl text-brown mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-brown text-white rounded-full flex items-center justify-center text-sm">1</span>
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="checkout-input" />
                <input required type="email" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="checkout-input" />
                <input required placeholder="WhatsApp / Telefone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="checkout-input" />
                <input required placeholder="CPF" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="checkout-input" />
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-brown mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-brown text-white rounded-full flex items-center justify-center text-sm">2</span>
                Endereço de Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required placeholder="CEP" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="checkout-input" />
                <input required placeholder="Rua / Avenida" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="checkout-input md:col-span-2" />
                <input required placeholder="Número" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="checkout-input" />
                <input placeholder="Complemento (Apto, bloco...)" value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} className="checkout-input md:col-span-2" />
                <input required placeholder="Bairro" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="checkout-input" />
                <input required placeholder="Cidade" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="checkout-input" />
                <input required placeholder="Estado (UF)" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="checkout-input" />
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-brown mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-brown text-white rounded-full flex items-center justify-center text-sm">3</span>
                Método de Pagamento
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'pix' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <Ticket className="mb-2 text-orange-600" />
                  <span className="font-bold text-sm text-brown">PIX</span>
                  <span className="text-[10px] text-green-600 mt-1 uppercase font-bold tracking-tighter">Confirmação Imediata</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'credit_card' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <CreditCard className="mb-2 text-blue-600" />
                  <span className="font-bold text-sm text-brown">CARTÃO</span>
                  <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Até 12x no Checkout</span>
                </button>
              </div>
            </section>
          </div>

          {/* Coluna Resumo (2/5) */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-8 sticky top-32">
              <h3 className="font-serif text-xl text-brown mb-6">Resumo do Pedido</h3>
              
              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-gray-600 font-medium">{item.quantity}x {item.name}</span>
                    </div>
                    <span className="font-bold text-brown">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-dashed border-gray-200 pt-6 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-600 font-medium">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Truck size={14} />
                    <span>Frete</span>
                    <span className="text-[10px] bg-stone-100 px-1.5 rounded uppercase font-bold tracking-tighter">Fixo</span>
                  </div>
                  <span className="text-gray-600 font-medium">R$ {shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-serif text-brown border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-[0.2em] text-xs py-5 rounded-2xl transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Finalizar Pedido'}
                <ChevronRight size={16} />
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-6 uppercase font-bold tracking-widest leading-relaxed">
                Ambiente de Pagamento Blindado <br /> 
                <span className="text-green-600">Conexão 256 bits via Vittalix Core</span>
              </p>
            </div>
          </div>
        </form>
      </main>

      <style jsx>{`
        .checkout-input {
          width: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .checkout-input:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
      `}</style>
    </div>
  );
}
