import { useContent } from '../context/ContentContext';

/**
 * useSiteContent Hook
 * Agora consome o ContentContext global para evitar requisições redundantes
 * e garantir que todos os componentes usem o mesmo estado de conteúdo.
 */
export function useSiteContent() {
  const { content, loading, getWhatsAppLink } = useContent();
  
  return { 
    content, 
    loading, 
    getWhatsAppLink 
  };
}
