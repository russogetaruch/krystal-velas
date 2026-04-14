import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_CONTENT = {
  hero_slogan: 'A luz que nos conduz',
  hero_subtitle: 'Da Fé ao Conforto do Lar',
  hero_description: 'De Ibiporã para todos os seus momentos. Seja para um instante de oração ou para iluminar um jantar especial, a Krystal Velas entrega a pureza que você exige.',
  fabrica_title: 'Estrutura Fabril em Ibiporã, Paraná',
  fabrica_description: 'Com maquinário focado em alta produção, a Krystal Velas atende demandas em grande escala para varejistas, atacadistas e distribuidores. Garantimos padronização de qualidade e suprimento constante para o seu estoque.',
  whatsapp_number: '5543998073376',
  whatsapp_message_atacado: 'Olá, queria acesso a tabela de Atacado para Lojista/Eventos.',
  whatsapp_message_contact: 'Olá! Estou no site da Krystal Velas e gostaria de falar com um Consultor Comercial.'
};

export function useSiteContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value');

        if (error) throw error;

        if (data && data.length > 0) {
          const map = { ...DEFAULT_CONTENT };
          data.forEach(item => {
            if (item.value) map[item.key] = item.value;
          });
          setContent(map);
        }
      } catch (err) {
        console.error('Error fetching site content:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  const getWhatsAppLink = (messageType = 'contact') => {
    const num = content.whatsapp_number.replace(/\D/g, '');
    const msg = messageType === 'atacado' 
      ? content.whatsapp_message_atacado 
      : content.whatsapp_message_contact;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };

  return { content, loading, getWhatsAppLink };
}
