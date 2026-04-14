import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_CONTENT = {
  hero_slogan: 'A luz que nos conduz',
  hero_subtitle: 'Da Fé ao Conforto do Lar',
  hero_description: 'De Ibiporã para todos os seus momentos. Seja para um instante de oração ou para iluminar um jantar especial, a Krystal Velas entrega a pureza que você exige.',
  fabrica_title: 'Estrutura Fabril em Ibiporã, Paraná',
  fabrica_description: 'Com maquinário focado em alta produção, a Krystal Velas atende demandas em grande escala para varejistas, atacadistas e distribuidores. Garantimos padronização de qualidade e suprimento constante para o seu estoque.',
  whatsapp_number: '5543998073376',
  whatsapp_message_atacado: 'Olá, queria acesso a tabela de Atacado para Lojista/Eventos.',
  whatsapp_message_contact: 'Olá! Estou no site da Krystal Velas e gostaria de falar com um Consultor Comercial.',
  maintenance_mode: 'false',
  maintenance_until: null
};

const ContentContext = createContext();

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('site_content')
        .select('key, value');

      if (sbError) throw sbError;

      if (data && data.length > 0) {
        const map = { ...DEFAULT_CONTENT };
        data.forEach(item => {
          if (item.value !== null && item.value !== undefined) {
            map[item.key] = item.value;
          }
        });
        setContent(map);
      }
    } catch (err) {
      console.error('ContentProvider Error:', err);
      setError(err);
      // Fallback is already in state (DEFAULT_CONTENT)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getWhatsAppLink = useCallback((messageType = 'contact') => {
    const num = (content.whatsapp_number || DEFAULT_CONTENT.whatsapp_number).replace(/\D/g, '');
    const msg = messageType === 'atacado' 
      ? content.whatsapp_message_atacado 
      : content.whatsapp_message_contact;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg || '')}`;
  }, [content]);

  const value = {
    content,
    loading,
    error,
    getWhatsAppLink,
    refresh: fetchContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
